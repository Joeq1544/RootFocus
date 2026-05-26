/**
 * One-time migration: assign every Task to a Plot.
 *
 * For each user:
 *   1. Collect distinct task.category values (treat null as "Uncategorized")
 *   2. Create a Plot for each distinct category (skip if user already has any plots)
 *   3. Update each task to point at the matching plot via plotId
 *
 * Idempotent — users who already have plots are skipped entirely.
 *
 * Run with:
 *   npx tsx scripts/migrate-plots.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true } })

  for (const user of users) {
    const existingPlots = await prisma.plot.count({ where: { userId: user.id } })
    if (existingPlots > 0) {
      console.log(`[skip] ${user.email} already has ${existingPlots} plot(s)`)
      continue
    }

    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      select: { id: true, category: true },
    })

    if (tasks.length === 0) {
      console.log(`[skip] ${user.email} has no tasks — nothing to migrate`)
      continue
    }

    // Collect unique categories (null → "Uncategorized")
    const uniqueCategories = Array.from(
      new Set(tasks.map((t) => (t.category && t.category.trim().length > 0 ? t.category.trim() : 'Uncategorized'))),
    ).sort()

    // Create plots
    const categoryToPlotId = new Map<string, string>()
    for (let i = 0; i < uniqueCategories.length; i++) {
      const name = uniqueCategories[i]
      const plot = await prisma.plot.create({
        data: { userId: user.id, name, order: i },
      })
      categoryToPlotId.set(name, plot.id)
    }

    // Assign tasks
    let updated = 0
    for (const task of tasks) {
      const categoryKey =
        task.category && task.category.trim().length > 0 ? task.category.trim() : 'Uncategorized'
      const plotId = categoryToPlotId.get(categoryKey)
      if (plotId) {
        await prisma.task.update({ where: { id: task.id }, data: { plotId } })
        updated++
      }
    }

    console.log(
      `[ok]   ${user.email}: created ${uniqueCategories.length} plot(s), assigned ${updated} task(s)`,
    )
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
