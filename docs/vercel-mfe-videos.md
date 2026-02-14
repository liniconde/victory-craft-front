# Microfrontend de Videos en Vercel

## Arquitectura recomendada
- `shell` (este proyecto): layout, auth y rutas.
- `videos-mfe` (proyecto separado): bundle JS que expone `window.VictoryVideosMfe.mount`.

El shell carga el script remoto con `VITE_VIDEOS_MFE_SCRIPT_URL`.  
Si el script falla o no existe, muestra error de carga del microfrontend.

## Contrato de integración (shell -> mfe)
El shell llama:

```ts
window.VictoryVideosMfe.mount(container, {
  mode: "list" | "create" | "edit",
  path,
  search,
  params,
  token,
  apiBaseUrl,
  feedback: { showLoading, hideLoading, showError, isLoading }
});
```

El `mount` puede devolver:
- `void`
- `() => void`
- `{ unmount: () => void }`

## Configuración en este shell
1. Agrega en Vercel (Project Settings -> Environment Variables):
- `VITE_VIDEOS_MFE_SCRIPT_URL=https://TU-MFE-VIDEOS.vercel.app/mfe-videos.js`
- `VITE_API_URL=https://TU-BACKEND`

2. Redeploy del shell.

## Crear el proyecto `videos-mfe` en Vercel
1. Crea repo/proyecto independiente para `videos-mfe`.
2. Si usas este mismo monorepo, define `Root Directory` en Vercel:
- `apps/videos-mfe`
3. Build command sugerido:
- `npm run build`
4. Output directory:
- `dist`
5. Asegura que el build genere un archivo estable:
- `dist/mfe-videos.js`
 - `dist/mfe-videos.css`
6. Ese archivo debe registrar en `window`:
- `window.VictoryVideosMfe = { mount }`

## Flujo de despliegue independiente
1. Deploy de `videos-mfe` (no toca shell).
2. Si cambió dominio/URL, actualiza `VITE_VIDEOS_MFE_SCRIPT_URL` del shell.
3. Redeploy shell solo si cambió la URL o el contrato.

## Compatibilidad entre versiones
- Mantén backward compatible el contrato `mount`.
- Si haces cambios breaking, publica versión nueva del script (ej: `/v2/mfe-videos.js`) y migra shells gradualmente.

## Fallback y resiliencia
- Si el script remoto falla, el shell muestra error controlado en la ruta de videos.
- Puedes implementar un fallback alternativo (otra URL/version) sin reintroducir acoplamiento al shell.
