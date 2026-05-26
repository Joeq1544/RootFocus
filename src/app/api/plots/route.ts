import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { serializePlot } from '@/lib/plot-serializer'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const plots = await prisma.plot.findMany({
      where: { userId: auth.userId },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ plots: plots.map(serializePlot) })
  } catch (err) {
    console.error('[GET /api/plots]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let body: unknown
    try { body = await request.json() } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { name, color, icon, gridSnap } = body as Record<string, unknown>
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const maxOrderRow = await prisma.plot.findFirst({
      where: { userId: auth.userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    const nextOrder = (maxOrderRow?.order ?? -1) + 1

    const plot = await prisma.plot.create({
      data: {
        userId: auth.userId,
        name: name.trim(),
        color: typeof color === 'string' && color.length > 0 ? color : 'forest',
        icon: typeof icon === 'string' && icon.length > 0 ? icon : 'leaf',
        gridSnap: typeof gridSnap === 'boolean' ? gridSnap : false,
        order: nextOrder,
      },
    })

    return NextResponse.json({ plot: serializePlot(plot) }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/plots]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
