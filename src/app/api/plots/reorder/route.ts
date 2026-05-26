import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let body: unknown
    try { body = await request.json() } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { plotIds } = body as Record<string, unknown>
    if (!Array.isArray(plotIds) || plotIds.some((id) => typeof id !== 'string')) {
      return NextResponse.json({ error: 'plotIds must be an array of strings' }, { status: 400 })
    }

    // Verify all plots belong to user
    const owned = await prisma.plot.findMany({
      where: { id: { in: plotIds as string[] }, userId: auth.userId },
      select: { id: true },
    })
    if (owned.length !== plotIds.length) {
      return NextResponse.json({ error: 'One or more plots not found' }, { status: 404 })
    }

    await prisma.$transaction(
      (plotIds as string[]).map((id, index) =>
        prisma.plot.update({ where: { id }, data: { order: index } }),
      ),
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PATCH /api/plots/reorder]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
