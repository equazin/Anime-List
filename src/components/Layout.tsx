import { NavLink, Outlet } from 'react-router-dom'
import { AddToListModal } from './AddToListModal'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/search', label: 'Buscar' },
  { to: '/library', label: 'Mi lista' },
]

export function Layout() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-[#FAFAF7]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-['Archivo_Black'] text-xl text-neutral-900">Anime List</span>
          <nav className="flex gap-7 text-sm font-semibold">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `border-b-2 pb-1 transition ${
                    isActive
                      ? 'border-[#2F6FED] text-neutral-900'
                      : 'border-transparent text-neutral-400 hover:text-neutral-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
      <AddToListModal />
    </div>
  )
}
