import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { serializePlot } from '@/lib/plot-serializer'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const existing = await prisma.plot.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== auth.userId) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 })
    }

    let body: unknown
    try { body = await request.json() } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const input = body as Record<string, unknown>
    const data: Record<string, unknown> = {}

    if (typeof input.name === 'string' && input.name.trim().length > 0) data.name = input.name.trim()
    if (typeof input.color === 'string' && input.color.length > 0) data.color = input.color
    if (typeof input.icon === 'string' && input.icon.length > 0) data.icon = input.icon
    if (typeof input.order === 'number') data.order = Math.round(input.order)
    if (typeof input.gridSnap === 'boolean') data.gridSnap = input.gridSnap

    const plot = await prisma.plot.update({ where: { id: params.id }, data })
    return NextResponse.json({ plot: serializePlot(plot) })
  } catch (err) {
    console.error('[PATCH /api/plots/:id]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const existing = await prisma.plot.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== auth.userId) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 })
    }

    const strategy = request.nextUrl.searchParams.get('strategy') === 'delete' ? 'delete' : 'move'

    if (strategy === 'delete') {
      // Cascade: delete focus sessions for tasks in this plot, then tasks, then plot
      const tasks = await prisma.task.findMany({
        where: { plotId: params.id },
        select: { id: true },
      })
      const ids = tasks.map((t) => t.id)
      await prisma.$transaction(async (tx) => {
        if (ids.length > 0) {
          await tx.focusSession.deleteMany({ where: { taskId: { in: ids } } })
          // detach any subtask references (subtasks live in same plot, all deleted together)
          await tx.task.deleteMany({ where: { id: { in: ids } } })
        }
        await tx.plot.delete({ where: { id: params.id } })
      })
      return new Response(null, { status: 204 })
    }

    // Move strategy: reassign tasks to an "Uncategorized" plot (auto-create if needed) then delete
    await prisma.$transaction(async (tx) => {
      let fallback = await tx.plot.findFirst({
        where: { userId: auth.userId, name: 'Uncategorized', id: { not: params.id } },
      })
      if (!fallback) {
        const maxOrder = await tx.plot.findFirst({
          where: { userId: auth.userId },
          orderBy: { order: 'desc' },
          select: { order: true },
        })
        fallback = await tx.plot.create({
          data: {
            userId: auth.userId,
            name: 'Uncategorized',
            order: (maxOrder?.order ?? -1) + 1,
          },
        })
      }
      await tx.task.updateMany({
        where: { plotId: params.id },
        data: { plotId: fallback.id },
      })
      await tx.plot.delete({ where: { id: params.id } })
    })

    return new Response(null, { status: 204 })
  } catch (err) {
    console.error('[DELETE /api/plots/:id]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
