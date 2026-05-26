import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { serializeTaskWithSubtasks } from '@/lib/task-serializer'
import { calculatePlantHealth } from '@/lib/plant-health'
import { TaskStatus } from '@/types'
import type { TaskStatus as PrismaTaskStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await prisma.focusSession.findMany({
      where: { userId: auth.userId },
      orderBy: { completedAt: 'desc' },
      take: 20,
    })

    const serialized = sessions.map((s) => ({
      ...s,
      completedAt: s.completedAt.toISOString(),
    }))

    return NextResponse.json({ sessions: serialized })
  } catch (err) {
    console.error('[GET /api/sessions]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const input = body as Record<string, unknown>
    const { taskId, durationMinutes, notes } = input

    if (typeof taskId !== 'string' || taskId.trim().length === 0) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
    }
    if (typeof durationMinutes !== 'number' || !Number.isInteger(durationMinutes) || durationMinutes < 1) {
      return NextResponse.json({ error: 'durationMinutes must be a positive integer' }, { status: 400 })
    }
    const notesValue = notes === undefined || notes === null ? null : typeof notes === 'string' ? notes : null

    const existing = await prisma.task.findUnique({ where: { id: taskId } })
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    if (existing.userId !== auth.userId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 403 })
    }

    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)

    // Compute new task status from projected values
    const newTotalFocusMinutes = existing.totalFocusMinutes + durationMinutes
    const projectedTask = {
      id: existing.id,
      userId: existing.userId,
      title: existing.title,
      description: existing.description,
      category: existing.category,
      plotId: existing.plotId,
      isPot: existing.isPot,
      priority: existing.priority,
      status: existing.status as TaskStatus,
      parentTaskId: existing.parentTaskId,
      totalFocusMinutes: newTotalFocusMinutes,
      lastWateredAt: new Date().toISOString(),
      dueDate: existing.dueDate ? existing.dueDate.toISOString() : null,
      createdAt: existing.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const newHealth = calculatePlantHealth(projectedTask)
    const newStatus: PrismaTaskStatus =
      existing.status === 'COMPLETED' ? 'COMPLETED' : (newHealth.status as PrismaTaskStatus)

    const { session, updatedTask, streak } = await prisma.$transaction(async (tx) => {
      const newSession = await tx.focusSession.create({
        data: {
          userId: auth.userId,
          taskId,
          durationMinutes,
          completedAt: new Date(),
          notes: notesValue,
        },
      })

      const task = await tx.task.update({
        where: { id: taskId },
        data: {
          totalFocusMinutes: newTotalFocusMinutes,
          lastWateredAt: new Date(),
          status: newStatus,
        },
        include: { subtasks: true },
      })

      // Upsert streak
      const existingStreak = await tx.wateringStreak.findFirst({ where: { userId: auth.userId } })
      let currentStreak: number
      let longestStreak: number

      const lastDateStr = existingStreak?.lastWateredDate instanceof Date
        ? existingStreak.lastWateredDate.toISOString().slice(0, 10)
        : (existingStreak?.lastWateredDate as string | null | undefined) ?? null

      if (!existingStreak) {
        currentStreak = 1
        longestStreak = 1
      } else if (lastDateStr === today) {
        currentStreak = existingStreak.currentStreak
        longestStreak = existingStreak.longestStreak
      } else if (lastDateStr === yesterday) {
        currentStreak = existingStreak.currentStreak + 1
        longestStreak = Math.max(existingStreak.longestStreak, currentStreak)
      } else {
        currentStreak = 1
        longestStreak = existingStreak.longestStreak
      }

      const newStreak = existingStreak
        ? await tx.wateringStreak.update({
            where: { id: existingStreak.id },
            data: { currentStreak, longestStreak, lastWateredDate: today },
          })
        : await tx.wateringStreak.create({
            data: { userId: auth.userId, currentStreak, longestStreak, lastWateredDate: today },
          })

      return { session: newSession, updatedTask: task, streak: newStreak }
    })

    const serializedSession = {
      ...session,
      completedAt: session.completedAt.toISOString(),
    }
    const serializedStreak = {
      id: streak.id,
      userId: streak.userId,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastWateredDate: streak.lastWateredDate instanceof Date
        ? streak.lastWateredDate.toISOString().slice(0, 10)
        : (streak.lastWateredDate as string | null) ?? null,
    }

    return NextResponse.json(
      { session: serializedSession, task: serializeTaskWithSubtasks(updatedTask), streak: serializedStreak },
      { status: 201 },
    )
  } catch (err) {
    console.error('[POST /api/sessions]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
