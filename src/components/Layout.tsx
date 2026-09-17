import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/search', label: 'Buscar' },
  { to: '/library', label: 'Mi lista' },
]

export function Layout() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <span className="text-lg font-bold tracking-tight text-fuchsia-400">
            OtakuTrack
          </span>
          <nav className="flex gap-4 text-sm">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-md px-2 py-1 transition ${
                    isActive
                      ? 'bg-fuchsia-500/15 text-fuchsia-300'
                      : 'text-neutral-400 hover:text-neutral-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
