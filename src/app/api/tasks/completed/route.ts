import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { serializeTaskWithSubtasks } from '@/lib/task-serializer'
import { serializePlot } from '@/lib/plot-serializer'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rows = await prisma.task.findMany({
      where: { userId: auth.userId, parentTaskId: null, status: 'COMPLETED' },
      orderBy: [{ completedAt: 'desc' }, { updatedAt: 'desc' }],
      include: { subtasks: true, plot: true },
    })

    const trophies = rows.map((row) => ({
      task: serializeTaskWithSubtasks(row),
      plot: row.plot ? serializePlot(row.plot) : null,
    }))

    return NextResponse.json({ trophies })
  } catch (err) {
    console.error('[GET /api/tasks/completed]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deletedCount = await prisma.$transaction(async (tx) => {
      const completed = await tx.task.findMany({
        where: { userId: auth.userId, status: 'COMPLETED' },
        select: { id: true },
      })
      const ids = completed.map((t) => t.id)
      if (ids.length === 0) return 0

      // Detach non-completed subtasks so FK constraint isn't violated
      await tx.task.updateMany({
        where: { parentTaskId: { in: ids }, status: { not: 'COMPLETED' } },
        data: { parentTaskId: null },
      })

      await tx.focusSession.deleteMany({ where: { taskId: { in: ids } } })
      await tx.task.deleteMany({ where: { id: { in: ids } } })

      return ids.length
    })

    return NextResponse.json({ deletedCount })
  } catch (err) {
    console.error('[DELETE /api/tasks/completed]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
