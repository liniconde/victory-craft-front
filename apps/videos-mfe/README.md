# Videos MFE Starter

Este starter genera un bundle remoto para cargar desde el shell:

- Salida: `dist/mfe-videos.js`
- Exposición global: `window.VictoryVideosMfe.mount(container, props)`

## Contrato `mount`

```ts
mount(container, {
  mode: "list" | "create" | "edit",
  path: string,
  search: string,
  params: Record<string, string | undefined>,
  token: string | null,
  apiBaseUrl: string,
  feedback: {
    showLoading: (message?: string) => void,
    hideLoading: () => void,
    showError: (message: string) => void,
    isLoading: boolean
  }
});
```

## Build local

Desde la raíz del repo:

```bash
npm run build:mfe-videos
npm run preview:mfe-videos
```

O desde esta carpeta:

```bash
npm install
npm run build
npm run preview
```

## Tailwind en el MFE

Este microfrontend ya incluye configuración local de Tailwind (`tailwind.config.js`, `postcss.config.js`, `src/index.css`), por lo que puedes usar clases utilitarias en JSX y `@apply` en CSS.

## Deploy en Vercel

1. Crea un proyecto Vercel apuntando a `apps/videos-mfe`.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Verifica URL final del archivo:
- `https://TU-PROYECTO.vercel.app/mfe-videos.js`
