import { NextRequest, NextResponse } from 'next/server'
import { TaskStatus as PrismaTaskStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { serializeTaskWithSubtasks } from '@/lib/task-serializer'
import { TaskStatus } from '@/types'

export async function GET() {
  return NextResponse.json({ message: 'not implemented' }, { status: 501 })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.task.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== auth.userId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const input = body as Record<string, unknown>
    const data: Record<string, unknown> = {}

    if (typeof input.title === 'string' && input.title.trim().length > 0) {
      data.title = input.title.trim()
    }
    if (input.description === null || typeof input.description === 'string') {
      data.description = input.description
    }
    if (input.category === null || typeof input.category === 'string') {
      data.category = typeof input.category === 'string' ? input.category.trim() || null : null
    }
    if (typeof input.priority === 'number') {
      if (input.priority < 1 || input.priority > 10) {
        return NextResponse.json({ error: 'Priority must be between 1 and 10' }, { status: 400 })
      }
      data.priority = Math.round(input.priority)
    }
    if (typeof input.totalFocusMinutes === 'number' && input.totalFocusMinutes >= 0) {
      data.totalFocusMinutes = Math.round(input.totalFocusMinutes)
    }
    if (typeof input.status === 'string' && input.status in TaskStatus) {
      data.status = input.status as PrismaTaskStatus
      // Stamp completedAt on the transition into COMPLETED; clear it on transition away
      if (input.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
        data.completedAt = new Date()
      } else if (input.status !== 'COMPLETED' && existing.status === 'COMPLETED') {
        data.completedAt = null
      }
    }
    if (input.dueDate === null) {
      data.dueDate = null
    } else if (typeof input.dueDate === 'string' && input.dueDate.length > 0) {
      const parsed = new Date(input.dueDate)
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: 'Invalid dueDate' }, { status: 400 })
      }
      data.dueDate = parsed
    }
    if (input.lastWateredAt === null) {
      data.lastWateredAt = null
    } else if (typeof input.lastWateredAt === 'string') {
      const parsed = new Date(input.lastWateredAt)
      if (!Number.isNaN(parsed.getTime())) data.lastWateredAt = parsed
    }
    if (input.parentTaskId === null) {
      data.parentTaskId = null
    } else if (typeof input.parentTaskId === 'string' && input.parentTaskId.length > 0) {
      if (input.parentTaskId === params.id) {
        return NextResponse.json({ error: 'A task cannot be its own parent' }, { status: 400 })
      }
      const parent = await prisma.task.findUnique({ where: { id: input.parentTaskId } })
      if (!parent || parent.userId !== auth.userId) {
        return NextResponse.json({ error: 'Parent task not found' }, { status: 403 })
      }
      data.parentTaskId = input.parentTaskId
    }

    // Plot move (top-level tasks only)
    if (typeof input.plotId === 'string' && input.plotId.length > 0) {
      if (existing.parentTaskId !== null) {
        return NextResponse.json({ error: 'Subtasks inherit their parent\'s plot and cannot be moved directly' }, { status: 400 })
      }
      const plot = await prisma.plot.findUnique({ where: { id: input.plotId } })
      if (!plot || plot.userId !== auth.userId) {
        return NextResponse.json({ error: 'Plot not found' }, { status: 403 })
      }
      data.plotId = input.plotId
      // Cascade plot move to subtasks so they stay grouped with their pot
      await prisma.task.updateMany({
        where: { parentTaskId: params.id },
        data: { plotId: input.plotId },
      })
    }

    // Progress type + related fields
    if (input.progressType === 'TIME' || input.progressType === 'REPS') {
      data.progressType = input.progressType
    }
    if (input.estimatedMinutes === null) {
      data.estimatedMinutes = null
    } else if (typeof input.estimatedMinutes === 'number') {
      if (input.estimatedMinutes < 1 || !Number.isFinite(input.estimatedMinutes)) {
        return NextResponse.json({ error: 'estimatedMinutes must be a positive number' }, { status: 400 })
      }
      data.estimatedMinutes = Math.round(input.estimatedMinutes)
    }
    if (input.targetReps === null) {
      data.targetReps = null
    } else if (typeof input.targetReps === 'number') {
      if (!Number.isInteger(input.targetReps) || input.targetReps < 1) {
        return NextResponse.json({ error: 'targetReps must be a positive integer' }, { status: 400 })
      }
      data.targetReps = input.targetReps
    }
    if (typeof input.completedReps === 'number') {
      if (!Number.isInteger(input.completedReps) || input.completedReps < 0) {
        return NextResponse.json({ error: 'completedReps must be a non-negative integer' }, { status: 400 })
      }
      data.completedReps = input.completedReps
    }

    // Canvas position (fractions 0..1; null resets to flow layout)
    if (input.posX === null) {
      data.posX = null
    } else if (typeof input.posX === 'number' && Number.isFinite(input.posX)) {
      data.posX = Math.min(1, Math.max(0, input.posX))
    }
    if (input.posY === null) {
      data.posY = null
    } else if (typeof input.posY === 'number' && Number.isFinite(input.posY)) {
      data.posY = Math.min(1, Math.max(0, input.posY))
    }

    // Pot conversion
    if (typeof input.isPot === 'boolean') {
      if (input.isPot === false) {
        // Demoting pot → plant: only allowed if no subtasks
        const subCount = await prisma.task.count({ where: { parentTaskId: params.id } })
        if (subCount > 0) {
          return NextResponse.json(
            { error: 'Cannot demote a pot that still has plants inside it' },
            { status: 400 },
          )
        }
      }
      data.isPot = input.isPot
    }

    // If this is a Pot being harvested, cascade COMPLETED + completedAt to subtasks
    const cascadingHarvest =
      existing.isPot && input.status === 'COMPLETED' && existing.status !== 'COMPLETED'
    const completedAtForCascade = data.completedAt instanceof Date ? data.completedAt : new Date()

    await prisma.$transaction(async (tx) => {
      await tx.task.update({ where: { id: params.id }, data })
      if (cascadingHarvest) {
        await tx.task.updateMany({
          where: { parentTaskId: params.id, status: { not: 'COMPLETED' } },
          data: { status: 'COMPLETED', completedAt: completedAtForCascade },
        })
      }
    })
    const updated = await prisma.task.findUnique({
      where: { id: params.id },
      include: { subtasks: true },
    })
    if (!updated) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json({ task: serializeTaskWithSubtasks(updated) })
  } catch (err) {
    console.error('[PATCH /api/tasks/:id]', err)
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
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.task.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== auth.userId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.focusSession.deleteMany({
        where: {
          OR: [
            { taskId: params.id },
            { task: { parentTaskId: params.id } },
          ],
        },
      }),
      prisma.task.deleteMany({ where: { parentTaskId: params.id } }),
      prisma.task.delete({ where: { id: params.id } }),
    ])
    return new Response(null, { status: 204 })
  } catch (err) {
    console.error('[DELETE /api/tasks/:id]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
