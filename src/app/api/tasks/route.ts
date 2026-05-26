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

  const { title, description, category, priority, dueDate, parentTaskId } =
    body as Record<string, unknown>

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

  let parentId: string | null = null
  if (parentTaskId !== undefined && parentTaskId !== null && parentTaskId !== '') {
    if (typeof parentTaskId !== 'string') {
      return NextResponse.json({ error: 'Invalid parentTaskId' }, { status: 400 })
    }
    const parent = await prisma.task.findUnique({ where: { id: parentTaskId } })
    if (!parent || parent.userId !== auth.userId) {
      return NextResponse.json({ error: 'Parent task not found' }, { status: 403 })
    }
    parentId = parentTaskId
  }

  let dueDateValue: Date | null = null
  if (typeof dueDate === 'string' && dueDate.length > 0) {
    const parsed = new Date(dueDate)
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: 'Invalid dueDate' }, { status: 400 })
    }
    dueDateValue = parsed
  }

  try {
    const task = await prisma.task.create({
      data: {
        userId: auth.userId,
        title: title.trim(),
        description: typeof description === 'string' && description.length > 0 ? description : null,
        category: typeof category === 'string' && category.trim().length > 0 ? category.trim() : null,
        priority: priorityValue,
        dueDate: dueDateValue,
        parentTaskId: parentId,
        status: 'SEED',
        totalFocusMinutes: 0,
      },
    })

    return NextResponse.json({ task: serializeTask(task) }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/tasks]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
