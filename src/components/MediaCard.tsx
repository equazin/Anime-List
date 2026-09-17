import { Link } from 'react-router-dom'
import type { SearchResult } from '../lib/types'

const KIND_LABEL: Record<SearchResult['kind'], string> = {
  anime: 'Anime',
  movie: 'Película',
  tv: 'Serie',
}

const KIND_COLOR: Record<SearchResult['kind'], string> = {
  anime: 'bg-fuchsia-500/20 text-fuchsia-300',
  movie: 'bg-sky-500/20 text-sky-300',
  tv: 'bg-amber-500/20 text-amber-300',
}

export function MediaCard({ item }: { item: SearchResult }) {
  return (
    <Link
      to={`/title/${item.kind}/${item.externalId}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-neutral-900 ring-1 ring-neutral-800 transition hover:ring-fuchsia-500/60"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-800">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            Sin imagen
          </div>
        )}
        <span
          className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[11px] font-medium ${KIND_COLOR[item.kind]}`}
        >
          {KIND_LABEL[item.kind]}
        </span>
        {item.score !== null && (
          <span className="absolute right-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-yellow-300">
            ★ {item.score.toFixed(1)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="line-clamp-2 text-sm font-medium text-neutral-100">{item.title}</p>
        <p className="text-xs text-neutral-500">{item.year ?? 'Año desconocido'}</p>
      </div>
    </Link>
  )
}
