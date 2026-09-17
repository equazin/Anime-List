# Anime List

Tracker de anime, películas y series al estilo MyAnimeList: busca títulos,
márcalos como viendo / pendiente / completado / en pausa / abandonado, anótales
puntaje y progreso de episodios. No necesitas cargar datos a mano: la
información (títulos, imágenes, sinopsis, episodios) viene de APIs públicas.

## Fuentes de datos

- **Anime**: [Jikan API](https://docs.api.jikan.moe/) — API no oficial de
  MyAnimeList, gratuita y sin API key.
- **Películas y series**: [TMDB](https://www.themoviedb.org/documentation/api)
  — requiere una API key gratuita.

Tu lista personal (estado, puntaje, progreso, notas) se guarda en el
`localStorage` del navegador; no hay backend ni cuenta de usuario.

## Cómo correrlo

```bash
npm install
cp .env.example .env   # y pega tu API key de TMDB en VITE_TMDB_API_KEY
npm run dev
```

Sin la key de TMDB la app funciona igual, pero solo con datos de anime
(Jikan/MyAnimeList); la sección de películas/series queda deshabilitada
hasta que la configures.

Consigue tu API key gratis en
https://www.themoviedb.org/settings/api (requiere crear una cuenta).

## Stack

Vite + React + TypeScript + Tailwind CSS v4 + React Router + Zustand
(persistencia en localStorage).
