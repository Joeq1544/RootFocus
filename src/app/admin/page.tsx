import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function fmt(d: Date | null): string {
  return d ? d.toISOString().replace('T', ' ').slice(0, 16) : '—'
}

const TH = 'border border-black/30 px-2 py-1 text-left align-top'
const TD = 'border border-black/20 px-2 py-1 align-top'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { tasks: true, plots: true, focusSessions: true } },
      streaks: true,
    },
  })

  return (
    <section>
      <h1 className="mb-2 text-lg font-bold">Users ({users.length})</h1>
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs">
          <thead>
            <tr className="bg-black/10">
              <th className={TH}>#</th>
              <th className={TH}>id</th>
              <th className={TH}>name</th>
              <th className={TH}>username</th>
              <th className={TH}>email</th>
              <th className={TH}>avatar</th>
              <th className={TH}>tasks</th>
              <th className={TH}>plots</th>
              <th className={TH}>sessions</th>
              <th className={TH}>streak (cur/best)</th>
              <th className={TH}>username changed</th>
              <th className={TH}>created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const streak = u.streaks[0]
              return (
                <tr key={u.id}>
                  <td className={TD}>{i + 1}</td>
                  <td className={`${TD} font-mono`}>{u.id}</td>
                  <td className={TD}>{u.name ?? '—'}</td>
                  <td className={TD}>@{u.username}</td>
                  <td className={TD}>{u.email}</td>
                  <td className={TD}>{u.avatar ?? '(initial)'}</td>
                  <td className={TD}>{u._count.tasks}</td>
                  <td className={TD}>{u._count.plots}</td>
                  <td className={TD}>{u._count.focusSessions}</td>
                  <td className={TD}>
                    {streak ? `${streak.currentStreak}/${streak.longestStreak}` : '—'}
                  </td>
                  <td className={TD}>{fmt(u.usernameChangedAt)}</td>
                  <td className={TD}>{fmt(u.createdAt)}</td>
                </tr>
              )
            })}
            {users.length === 0 && (
              <tr>
                <td className={TD} colSpan={12}>No users.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
