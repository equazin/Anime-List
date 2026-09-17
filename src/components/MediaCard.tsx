import type { SearchResult } from '../lib/types'
import { useAddModal } from '../store/modal'

const KIND_LABEL: Record<SearchResult['kind'], string> = {
  anime: 'Anime',
  movie: 'Película',
  tv: 'Serie',
}

export function MediaCard({ item }: { item: SearchResult }) {
  const open = useAddModal((s) => s.open)

  return (
    <button
      onClick={() => open(item)}
      className="flex flex-col overflow-hidden rounded-lg bg-white text-left ring-1 ring-neutral-200 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-100">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-black text-neutral-300">
            {item.title[0]}
          </div>
        )}
        <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
          {KIND_LABEL[item.kind]}
        </span>
        {item.score !== null && (
          <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-bold text-white">
            {item.score.toFixed(0)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="line-clamp-2 text-sm font-semibold text-neutral-900">{item.title}</p>
        <p className="text-xs text-neutral-400">{item.year ?? 'Año desconocido'}</p>
      </div>
    </button>
  )
}
