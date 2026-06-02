import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { serializeTask, serializeTaskWithSubtasks } from '@/lib/task-serializer'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: auth.userId, parentTaskId: null },
      include: { subtasks: true },
    })

    const serialized = tasks
      .map(serializeTaskWithSubtasks)
      .sort((a, b) => b.health.urgencyScore - a.health.urgencyScore)

    return NextResponse.json({ tasks: serialized })
  } catch (err) {
    console.error('[GET /api/tasks]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const {
    title,
    description,
    priority,
    dueDate,
    parentTaskId,
    plotId,
    isPot,
    progressType,
    estimatedMinutes,
    targetReps,
    completedReps,
  } = body as Record<string, unknown>

  if (typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  let priorityValue = 5
  if (priority !== undefined) {
    if (typeof priority !== 'number' || priority < 1 || priority > 10) {
      return NextResponse.json({ error: 'Priority must be between 1 and 10' }, { status: 400 })
    }
    priorityValue = Math.round(priority)
  }

  // Parent task: subtask inherits plotId from parent
  let parentId: string | null = null
  let inheritedPlotId: string | null = null
  if (parentTaskId !== undefined && parentTaskId !== null && parentTaskId !== '') {
    if (typeof parentTaskId !== 'string') {
      return NextResponse.json({ error: 'Invalid parentTaskId' }, { status: 400 })
    }
    const parent = await prisma.task.findUnique({ where: { id: parentTaskId } })
    if (!parent || parent.userId !== auth.userId) {
      return NextResponse.json({ error: 'Parent task not found' }, { status: 403 })
    }
    parentId = parentTaskId
    inheritedPlotId = parent.plotId
  }

  // Plot id: top-level tasks need a valid plot; subtasks inherit from parent
  let finalPlotId: string | null = inheritedPlotId
  if (parentId === null) {
    if (typeof plotId !== 'string' || plotId.length === 0) {
      return NextResponse.json({ error: 'plotId is required for top-level tasks' }, { status: 400 })
    }
    const plot = await prisma.plot.findUnique({ where: { id: plotId } })
    if (!plot || plot.userId !== auth.userId) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 403 })
    }
    finalPlotId = plotId
  }

  let dueDateValue: Date | null = null
  if (typeof dueDate === 'string' && dueDate.length > 0) {
    const parsed = new Date(dueDate)
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: 'Invalid dueDate' }, { status: 400 })
    }
    dueDateValue = parsed
  }

  const isPotValue = isPot === true

  // Progress type fields — only meaningful for non-pot tasks
  let progressTypeValue: 'TIME' | 'REPS' = 'TIME'
  let estimatedMinutesValue: number | null = null
  let targetRepsValue: number | null = null
  let completedRepsValue = 0

  if (!isPotValue) {
    if (progressType === 'REPS' || progressType === 'TIME') {
      progressTypeValue = progressType
    }

    if (estimatedMinutes !== undefined && estimatedMinutes !== null) {
      if (typeof estimatedMinutes !== 'number' || estimatedMinutes < 1 || !Number.isFinite(estimatedMinutes)) {
        return NextResponse.json({ error: 'estimatedMinutes must be a positive number' }, { status: 400 })
      }
      estimatedMinutesValue = Math.round(estimatedMinutes)
    }

    if (progressTypeValue === 'REPS') {
      if (typeof targetReps !== 'number' || !Number.isInteger(targetReps) || targetReps < 1) {
        return NextResponse.json({ error: 'targetReps must be a positive integer' }, { status: 400 })
      }
      targetRepsValue = targetReps

      if (completedReps !== undefined && completedReps !== null) {
        if (typeof completedReps !== 'number' || !Number.isInteger(completedReps) || completedReps < 0) {
          return NextResponse.json({ error: 'completedReps must be a non-negative integer' }, { status: 400 })
        }
        if (completedReps > targetRepsValue) {
          return NextResponse.json({ error: 'completedReps cannot exceed targetReps' }, { status: 400 })
        }
        completedRepsValue = completedReps
      }
    }
  }

  try {
    const task = await prisma.task.create({
      data: {
        userId: auth.userId,
        title: title.trim(),
        description: typeof description === 'string' && description.length > 0 ? description : null,
        plotId: finalPlotId,
        isPot: isPotValue,
        priority: priorityValue,
        dueDate: dueDateValue,
        parentTaskId: parentId,
        status: 'SEED',
        totalFocusMinutes: 0,
        progressType: progressTypeValue,
        estimatedMinutes: estimatedMinutesValue,
        targetReps: targetRepsValue,
        completedReps: completedRepsValue,
      },
    })

    return NextResponse.json({ task: serializeTask(task) }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/tasks]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
