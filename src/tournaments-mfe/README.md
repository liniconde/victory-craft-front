# Tournaments MFE (local-first)

Modulo de torneos desarrollado dentro del repo principal pero estructurado para futura extraccion a un microfrontend independiente.

## Rutas actuales

- `/tournaments`
- `/tournaments/subpages/dashboard`

## Incluye

- CRUD de torneos
- CRUD de equipos
- CRUD de jugadores
- CRUD de partidos
- CRUD de estadisticas por partido
- accion `Generar partidos`
- filtros por `tournamentId`, `teamId`, `matchId`, `status`
- edicion de `matchSessionId` en partidos

## Estructura

- `features/tournaments`: tipos, cliente API, validaciones y contexto
- `subpages/layout`: layout preparado para futura extraccion
- `subpages/dashboard`: dashboard principal del modulo

## Nota

El modulo se apoya en `src/utils/api.ts` y `useAppFeedback` del repo principal. Si se separa a otro repositorio, esas piezas deben copiarse o adaptarse en el nuevo MFE.
