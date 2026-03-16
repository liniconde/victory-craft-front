import React from "react";
import { Link } from "react-router-dom";
import type {
  MatchFilters,
  TournamentCreateRequest,
  TournamentFilters,
  TournamentMatchCreateRequest,
  TournamentTeamCreateRequest,
} from "../../../features/tournaments/types";
import {
  formatDateTime,
  humanizeLabel,
  toInputDate,
  toInputDateTime,
  useTournamentsDashboardData,
} from "../context/TournamentsDashboardDataContext";

export const SectionNotice: React.FC<{ type: "error" | "success"; message: string }> = ({
  type,
  message,
}) => <div className={`tournaments-notice tournaments-notice--${type}`}>{message}</div>;

export const DashboardOverviewSection: React.FC = () => {
  const { tournaments, teams, players, matches, matchStats } = useTournamentsDashboardData();
  const activeTournaments = tournaments.filter((item) => item.status === "in_progress").length;
  const registrationOpenTournaments = tournaments.filter(
    (item) => item.status === "registration_open"
  ).length;
  const totalAssets = teams.length + players.length + matches.length + matchStats.length;
  const upcomingMatch = [...matches]
    .filter((item) => item.scheduledAt && new Date(item.scheduledAt).getTime() >= Date.now())
    .sort(
      (first, second) =>
        new Date(first.scheduledAt || "").getTime() - new Date(second.scheduledAt || "").getTime()
    )[0];

  const cards = [
    {
      title: "Torneos",
      value: tournaments.length,
      description: "Visión general de todas las competiciones cargadas.",
      to: "/tournaments/subpages/tournaments",
    },
    {
      title: "Equipos",
      value: teams.length,
      description: "Plantillas y participantes asociados a cada torneo.",
      to: "/tournaments/subpages/teams",
    },
    {
      title: "Jugadores",
      value: players.length,
      description: "Jugadores registrados y listos para competir.",
      to: "/tournaments/subpages/players",
    },
    {
      title: "Partidos",
      value: matches.length,
      description: "Agenda competitiva, cruces y seguimiento del fixture.",
      to: "/tournaments/subpages/matches",
    },
    {
      title: "Estadísticas",
      value: matchStats.length,
      description: "Eventos y métricas guardadas por partido.",
      to: "/tournaments/subpages/match-stats",
    },
  ];

  return (
    <div className="tournaments-dashboard">
      <div className="tournaments-hero">
        <div className="tournaments-hero__copy">
          <h1>Centro de torneos</h1>
          <p>
            Organiza el calendario competitivo, prepara equipos, registra jugadores
            y sigue la actividad del módulo desde una única vista de control.
          </p>
          <div className="tournaments-hero__actions">
            <Link to="/tournaments/subpages/tournaments" className="tournaments-hero__action">
              Ver gestión de torneos
            </Link>
            <Link to="/tournaments/subpages/matches" className="tournaments-hero__action tournaments-hero__action--ghost">
              Revisar partidos
            </Link>
          </div>
        </div>

        <div className="tournaments-hero__highlights">
          <article className="tournaments-highlight-card">
            <span>Actividad actual</span>
            <strong>{activeTournaments}</strong>
            <p>
              {activeTournaments > 0
                ? "torneos se están disputando ahora mismo."
                : "No hay torneos en curso en este momento."}
            </p>
          </article>
          <article className="tournaments-highlight-card tournaments-highlight-card--accent">
            <span>Registro abierto</span>
            <strong>{registrationOpenTournaments}</strong>
            <p>
              {registrationOpenTournaments > 0
                ? "torneos admiten nuevos participantes."
                : "No hay inscripciones abiertas actualmente."}
            </p>
          </article>
        </div>
      </div>

      <section className="tournaments-overview-grid">
        {cards.map((card) => (
          <Link key={card.title} to={card.to} className="tournaments-overview-card">
            <strong>{card.value}</strong>
            <span>{card.title}</span>
            <p>{card.description}</p>
          </Link>
        ))}
      </section>

      <section className="tournaments-insights-grid">
        <article className="tournaments-insight-card">
          <span className="tournaments-insight-card__label">Próximo hito</span>
          <strong>
            {upcomingMatch?.scheduledAt
              ? formatDateTime(upcomingMatch.scheduledAt)
              : "Sin partidos programados"}
          </strong>
          <p>
            {upcomingMatch?.scheduledAt
              ? "El siguiente partido agendado marca el próximo punto operativo del módulo."
              : "Cuando registres o generes nuevos cruces, aparecerán aquí los próximos encuentros."}
          </p>
        </article>

        <article className="tournaments-insight-card">
          <span className="tournaments-insight-card__label">Cobertura del módulo</span>
          <strong>{totalAssets} registros vinculados</strong>
          <p>
            Equipos, jugadores, partidos y estadísticas reflejan el nivel de detalle
            con el que ya se está gestionando la competición.
          </p>
        </article>

        <article className="tournaments-insight-card tournaments-insight-card--feature">
          <span className="tournaments-insight-card__label">Qué puedes hacer aquí</span>
          <strong>Preparar, operar y analizar</strong>
          <p>
            Crea torneos, arma el fixture, completa plantillas y mantén la operación
            competitiva ordenada antes, durante y después de cada jornada.
          </p>
        </article>
      </section>
    </div>
  );
};

export const TournamentsSection: React.FC = () => {
  const data = useTournamentsDashboardData();
  const {
    tournaments,
    tournamentFilters,
    setTournamentFilters,
    tournamentFeedback,
    tournamentForm,
    setTournamentForm,
    tournamentErrors,
    editingTournament,
    setEditingTournament,
    resetTournamentForm,
    handleTournamentSubmit,
    handleGenerateMatches,
    deleteWithConfirmation,
    api,
    userId,
    TOURNAMENT_STATUS_OPTIONS,
    loadTournaments,
    loadTeams,
    loadPlayers,
    loadMatches,
    loadMatchStats,
    loadTeamCatalog,
    loadMatchCatalog,
  } = data;

  return (
    <article className="tournaments-section-card">
      <div className="tournaments-section-card__header">
        <div>
          <h2>Torneos</h2>
          <p>CRUD principal y generacion de fixture.</p>
        </div>
      </div>
      <div className="tournaments-filters">
        <input
          className="tournaments-input"
          placeholder="Filtrar por deporte"
          value={tournamentFilters.sport || ""}
          onChange={(event) =>
            setTournamentFilters((current: TournamentFilters) => ({ ...current, sport: event.target.value }))
          }
        />
        <select
          className="tournaments-input"
          value={tournamentFilters.status || ""}
          onChange={(event) =>
            setTournamentFilters((current: TournamentFilters) => ({
              ...current,
              status: event.target.value as TournamentFilters["status"],
            }))
          }
        >
          <option value="">Todos los estados</option>
          {TOURNAMENT_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {humanizeLabel(status)}
            </option>
          ))}
        </select>
      </div>
      {tournamentFeedback.error && <SectionNotice type="error" message={tournamentFeedback.error} />}
      {tournamentFeedback.success && <SectionNotice type="success" message={tournamentFeedback.success} />}
      <div className="tournaments-table-shell">
        <table className="tournaments-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Deporte</th>
              <th>Estado</th>
              <th>Fechas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.sport}</td>
                <td>{humanizeLabel(item.status)}</td>
                <td>
                  {formatDateTime(item.startsAt)}
                  <br />
                  {formatDateTime(item.endsAt)}
                </td>
                <td>
                  <div className="tournaments-actions">
                    <button
                      className="tournaments-button tournaments-button--ghost"
                      onClick={() => {
                        setEditingTournament(item);
                        setTournamentForm({
                          name: item.name,
                          sport: item.sport,
                          description: item.description || "",
                          ownerId: item.ownerId || userId || "",
                          status: item.status || "draft",
                          startsAt: toInputDateTime(item.startsAt),
                          endsAt: toInputDateTime(item.endsAt),
                        });
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="tournaments-button tournaments-button--secondary"
                      onClick={() => handleGenerateMatches(item._id)}
                    >
                      Generar partidos
                    </button>
                    <button
                      className="tournaments-button tournaments-button--danger"
                      onClick={() =>
                        deleteWithConfirmation(`el torneo ${item.name}`, async () => {
                          await api.deleteTournament(item._id);
                          await Promise.all([
                            loadTournaments(),
                            loadTeams(),
                            loadPlayers(),
                            loadMatches(),
                            loadMatchStats(),
                            loadTeamCatalog(),
                            loadMatchCatalog(),
                          ]);
                        })
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!tournamentFeedback.loading && tournaments.length === 0 && (
          <div className="tournaments-empty">No hay torneos para los filtros actuales.</div>
        )}
      </div>

      <form id="tournament-form" className="tournaments-form" onSubmit={handleTournamentSubmit}>
        <div className="tournaments-form__header">
          <h3>{editingTournament ? "Editar torneo" : "Crear torneo"}</h3>
          {editingTournament && (
            <button type="button" className="tournaments-link-button" onClick={resetTournamentForm}>
              Cancelar edicion
            </button>
          )}
        </div>
        <div className="tournaments-form-grid">
          <label>
            <span>Nombre</span>
            <input className="tournaments-input" value={tournamentForm.name} onChange={(event) => setTournamentForm((current: TournamentCreateRequest) => ({ ...current, name: event.target.value }))} />
            {tournamentErrors.name && <small>{tournamentErrors.name}</small>}
          </label>
          <label>
            <span>Deporte</span>
            <input className="tournaments-input" value={tournamentForm.sport} onChange={(event) => setTournamentForm((current: TournamentCreateRequest) => ({ ...current, sport: event.target.value }))} />
            {tournamentErrors.sport && <small>{tournamentErrors.sport}</small>}
          </label>
          <label>
            <span>Estado</span>
            <select className="tournaments-input" value={tournamentForm.status || "draft"} onChange={(event) => setTournamentForm((current: TournamentCreateRequest) => ({ ...current, status: event.target.value as TournamentCreateRequest["status"] }))}>
              {TOURNAMENT_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{humanizeLabel(status)}</option>)}
            </select>
          </label>
          <label>
            <span>Owner ID</span>
            <input className="tournaments-input" value={tournamentForm.ownerId || ""} onChange={(event) => setTournamentForm((current: TournamentCreateRequest) => ({ ...current, ownerId: event.target.value }))} />
          </label>
          <label>
            <span>Inicio</span>
            <input type="datetime-local" className="tournaments-input" value={tournamentForm.startsAt || ""} onChange={(event) => setTournamentForm((current: TournamentCreateRequest) => ({ ...current, startsAt: event.target.value }))} />
          </label>
          <label>
            <span>Fin</span>
            <input type="datetime-local" className="tournaments-input" value={tournamentForm.endsAt || ""} onChange={(event) => setTournamentForm((current: TournamentCreateRequest) => ({ ...current, endsAt: event.target.value }))} />
            {tournamentErrors.endsAt && <small>{tournamentErrors.endsAt}</small>}
          </label>
          <label className="tournaments-form-grid__full">
            <span>Descripcion</span>
            <textarea className="tournaments-input tournaments-textarea" value={tournamentForm.description || ""} onChange={(event) => setTournamentForm((current: TournamentCreateRequest) => ({ ...current, description: event.target.value }))} />
          </label>
        </div>
        <div className="tournaments-actions tournaments-actions--end">
          <button className="tournaments-button" type="submit">{editingTournament ? "Guardar torneo" : "Crear torneo"}</button>
        </div>
      </form>
    </article>
  );
};

export const TeamsSection: React.FC = () => {
  const data = useTournamentsDashboardData();
  const { teams, tournamentMap, tournamentOptions, teamFilters, setTeamFilters, teamFeedback, editingTeam, setEditingTeam, teamForm, setTeamForm, teamErrors, resetTeamForm, handleTeamSubmit, deleteWithConfirmation, api, loadTeams, loadTeamCatalog, loadPlayers, loadMatches, loadMatchCatalog, loadMatchStats } = data;

  return (
    <article className="tournaments-section-card">
      <div className="tournaments-section-card__header"><div><h2>Equipos</h2><p>Equipos asociados a cada torneo.</p></div></div>
      <div className="tournaments-filters">
        <select className="tournaments-input" value={teamFilters.tournamentId || ""} onChange={(event) => setTeamFilters({ tournamentId: event.target.value })}>
          <option value="">Todos los torneos</option>
          {tournamentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>
      {teamFeedback.error && <SectionNotice type="error" message={teamFeedback.error} />}
      {teamFeedback.success && <SectionNotice type="success" message={teamFeedback.success} />}
      <div className="tournaments-table-shell"><table className="tournaments-table"><thead><tr><th>Equipo</th><th>Torneo</th><th>Coach</th><th>Acciones</th></tr></thead><tbody>{teams.map((item)=><tr key={item._id}><td>{item.name}{item.shortName ? ` (${item.shortName})` : ""}</td><td>{tournamentMap.get(item.tournamentId)?.name || item.tournamentId}</td><td>{item.coachName || "-"}</td><td><div className="tournaments-actions"><button className="tournaments-button tournaments-button--ghost" onClick={()=>{setEditingTeam(item);setTeamForm({tournamentId:item.tournamentId,name:item.name,shortName:item.shortName||"",logoUrl:item.logoUrl||"",coachName:item.coachName||""});}}>Editar</button><button className="tournaments-button tournaments-button--danger" onClick={()=>deleteWithConfirmation(`el equipo ${item.name}`, async()=>{await api.deleteTeam(item._id);await Promise.all([loadTeams(), loadTeamCatalog(), loadPlayers(), loadMatches(), loadMatchCatalog(), loadMatchStats()]);})}>Eliminar</button></div></td></tr>)}</tbody></table>{!teamFeedback.loading && teams.length===0 && <div className="tournaments-empty">No hay equipos para el filtro actual.</div>}</div>
      <form className="tournaments-form" onSubmit={handleTeamSubmit}><div className="tournaments-form__header"><h3>{editingTeam ? "Editar equipo" : "Crear equipo"}</h3>{editingTeam && <button type="button" className="tournaments-link-button" onClick={resetTeamForm}>Cancelar edicion</button>}</div><div className="tournaments-form-grid"><label><span>Torneo</span><select className="tournaments-input" value={teamForm.tournamentId} onChange={(event)=>setTeamForm((current: TournamentTeamCreateRequest)=>({...current,tournamentId:event.target.value}))}><option value="">Selecciona un torneo</option>{tournamentOptions.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select>{teamErrors.tournamentId && <small>{teamErrors.tournamentId}</small>}</label><label><span>Nombre</span><input className="tournaments-input" value={teamForm.name} onChange={(event)=>setTeamForm((current: TournamentTeamCreateRequest)=>({...current,name:event.target.value}))} />{teamErrors.name && <small>{teamErrors.name}</small>}</label><label><span>Nombre corto</span><input className="tournaments-input" value={teamForm.shortName || ""} onChange={(event)=>setTeamForm((current: TournamentTeamCreateRequest)=>({...current,shortName:event.target.value}))} /></label><label><span>Coach</span><input className="tournaments-input" value={teamForm.coachName || ""} onChange={(event)=>setTeamForm((current: TournamentTeamCreateRequest)=>({...current,coachName:event.target.value}))} /></label><label className="tournaments-form-grid__full"><span>Logo URL</span><input className="tournaments-input" value={teamForm.logoUrl || ""} onChange={(event)=>setTeamForm((current: TournamentTeamCreateRequest)=>({...current,logoUrl:event.target.value}))} /></label></div><div className="tournaments-actions tournaments-actions--end"><button className="tournaments-button" type="submit">{editingTeam ? "Guardar equipo" : "Crear equipo"}</button></div></form>
    </article>
  );
};

export const PlayersSection: React.FC = () => {
  const data = useTournamentsDashboardData();
  const { players, teamMap, tournamentOptions, playerTeamOptions, playerFilters, setPlayerFilters, playerFeedback, editingPlayer, setEditingPlayer, playerForm, setPlayerForm, playerErrors, resetPlayerForm, handlePlayerSubmit, deleteWithConfirmation, api, loadPlayers } = data;
  return (
    <article className="tournaments-section-card">
      <div className="tournaments-section-card__header"><div><h2>Jugadores</h2><p>Plantillas por equipo.</p></div></div>
      <div className="tournaments-filters"><select className="tournaments-input" value={playerFilters.tournamentId} onChange={(event)=>setPlayerFilters((current)=>({...current,tournamentId:event.target.value,teamId:""}))}><option value="">Todos los torneos</option>{tournamentOptions.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select><select className="tournaments-input" value={playerFilters.teamId} onChange={(event)=>setPlayerFilters((current)=>({...current,teamId:event.target.value}))}><option value="">Todos los equipos</option>{playerTeamOptions.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
      {playerFeedback.error && <SectionNotice type="error" message={playerFeedback.error} />}
      {playerFeedback.success && <SectionNotice type="success" message={playerFeedback.success} />}
      <div className="tournaments-table-shell"><table className="tournaments-table"><thead><tr><th>Jugador</th><th>Equipo</th><th>Posicion</th><th>Acciones</th></tr></thead><tbody>{players.map((item)=><tr key={item._id}><td>{item.firstName} {item.lastName} {item.jerseyNumber ? `#${item.jerseyNumber}` : ""}</td><td>{teamMap.get(item.teamId)?.name || item.teamId}</td><td>{item.position || "-"}</td><td><div className="tournaments-actions"><button className="tournaments-button tournaments-button--ghost" onClick={()=>{setEditingPlayer(item);setPlayerForm({teamId:item.teamId,firstName:item.firstName,lastName:item.lastName,jerseyNumber:item.jerseyNumber,position:item.position||"",birthDate:toInputDate(item.birthDate)});}}>Editar</button><button className="tournaments-button tournaments-button--danger" onClick={()=>deleteWithConfirmation(`al jugador ${item.firstName} ${item.lastName}`, async()=>{await api.deletePlayer(item._id);await loadPlayers();})}>Eliminar</button></div></td></tr>)}</tbody></table>{!playerFeedback.loading && players.length===0 && <div className="tournaments-empty">No hay jugadores para los filtros actuales.</div>}</div>
      <form className="tournaments-form" onSubmit={handlePlayerSubmit}><div className="tournaments-form__header"><h3>{editingPlayer ? "Editar jugador" : "Crear jugador"}</h3>{editingPlayer && <button type="button" className="tournaments-link-button" onClick={resetPlayerForm}>Cancelar edicion</button>}</div><div className="tournaments-form-grid"><label><span>Equipo</span><select className="tournaments-input" value={playerForm.teamId} onChange={(event)=>setPlayerForm((current)=>({...current,teamId:event.target.value}))}><option value="">Selecciona un equipo</option>{playerTeamOptions.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select>{playerErrors.teamId && <small>{playerErrors.teamId}</small>}</label><label><span>Nombre</span><input className="tournaments-input" value={playerForm.firstName} onChange={(event)=>setPlayerForm((current)=>({...current,firstName:event.target.value}))} />{playerErrors.firstName && <small>{playerErrors.firstName}</small>}</label><label><span>Apellido</span><input className="tournaments-input" value={playerForm.lastName} onChange={(event)=>setPlayerForm((current)=>({...current,lastName:event.target.value}))} />{playerErrors.lastName && <small>{playerErrors.lastName}</small>}</label><label><span>Dorsal</span><input type="number" className="tournaments-input" value={playerForm.jerseyNumber ?? ""} onChange={(event)=>setPlayerForm((current)=>({...current,jerseyNumber:event.target.value ? Number(event.target.value) : undefined}))} />{playerErrors.jerseyNumber && <small>{playerErrors.jerseyNumber}</small>}</label><label><span>Posicion</span><input className="tournaments-input" value={playerForm.position || ""} onChange={(event)=>setPlayerForm((current)=>({...current,position:event.target.value}))} /></label><label><span>Fecha de nacimiento</span><input type="date" className="tournaments-input" value={playerForm.birthDate || ""} onChange={(event)=>setPlayerForm((current)=>({...current,birthDate:event.target.value}))} /></label></div><div className="tournaments-actions tournaments-actions--end"><button className="tournaments-button" type="submit">{editingPlayer ? "Guardar jugador" : "Crear jugador"}</button></div></form>
    </article>
  );
};

export const MatchesSection: React.FC = () => {
  const data = useTournamentsDashboardData();
  const {
    matches,
    teamMap,
    fieldMap,
    tournamentOptions,
    matchTeamOptions,
    fieldOptions,
    matchFilters,
    setMatchFilters,
    matchFeedback,
    editingMatch,
    setEditingMatch,
    matchForm,
    setMatchForm,
    matchFormScoreHome,
    setMatchFormScoreHome,
    matchFormScoreAway,
    setMatchFormScoreAway,
    matchFormWinnerTeamId,
    setMatchFormWinnerTeamId,
    matchErrors,
    resetMatchForm,
    handleMatchSubmit,
    deleteWithConfirmation,
    api,
    MATCH_STATUS_OPTIONS,
    loadMatches,
    loadMatchCatalog,
    loadMatchStats,
  } = data;

  const syncVenueFromField = (fieldId: string, currentVenue?: string) =>
    fieldId ? fieldMap.get(fieldId)?.name || currentVenue || "" : currentVenue || "";

  const buildMatchLabel = (homeTeamId: string, awayTeamId: string) =>
    `${teamMap.get(homeTeamId)?.name || homeTeamId} vs ${teamMap.get(awayTeamId)?.name || awayTeamId}`;

  const openMatchSessionTimeline = (matchSessionId: string) => {
    const url = `/fields/videos/subpages/streaming/timeline?matchSessionId=${encodeURIComponent(matchSessionId)}`;
    window.location.assign(url);
  };

  const openRecordingSetup = (matchId: string, homeTeamId: string, awayTeamId: string) => {
    const matchLabel = buildMatchLabel(homeTeamId, awayTeamId);
    const params = new URLSearchParams({
      tournamentMatchId: matchId,
      title: matchLabel,
      autoCreateSession: "1",
    });
    window.location.assign(`/fields/videos/subpages/streaming/recording?${params.toString()}`);
  };

  return (
    <article className="tournaments-section-card">
      <div className="tournaments-section-card__header">
        <div>
          <h2>Partidos</h2>
          <p>Programacion, session streaming, cancha y marcador.</p>
        </div>
      </div>

      <div className="tournaments-filters tournaments-filters--three">
        <select
          className="tournaments-input"
          value={matchFilters.tournamentId || ""}
          onChange={(event) =>
            setMatchFilters((current: MatchFilters) => ({
              ...current,
              tournamentId: event.target.value,
              teamId: "",
            }))
          }
        >
          <option value="">Todos los torneos</option>
          {tournamentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className="tournaments-input"
          value={matchFilters.teamId || ""}
          onChange={(event) =>
            setMatchFilters((current: MatchFilters) => ({
              ...current,
              teamId: event.target.value,
            }))
          }
        >
          <option value="">Todos los equipos</option>
          {matchTeamOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className="tournaments-input"
          value={matchFilters.status || ""}
          onChange={(event) =>
            setMatchFilters((current: MatchFilters) => ({
              ...current,
              status: event.target.value as MatchFilters["status"],
            }))
          }
        >
          <option value="">Todos los estados</option>
          {MATCH_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {humanizeLabel(status)}
            </option>
          ))}
        </select>
      </div>

      {matchFeedback.error && <SectionNotice type="error" message={matchFeedback.error} />}
      {matchFeedback.success && <SectionNotice type="success" message={matchFeedback.success} />}

      <div className="tournaments-table-shell">
        <table className="tournaments-table">
          <thead>
            <tr>
              <th>Partido</th>
              <th>Cancha</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Streaming</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((item) => (
              <tr key={item._id}>
                <td>
                  {teamMap.get(item.homeTeamId)?.name || item.homeTeamId} vs{" "}
                  {teamMap.get(item.awayTeamId)?.name || item.awayTeamId}
                </td>
                <td>{item.fieldId ? fieldMap.get(item.fieldId)?.name || item.fieldId : "Sin cancha"}</td>
                <td>{formatDateTime(item.scheduledAt)}</td>
                <td>{humanizeLabel(item.status)}</td>
                <td>
                  {item.matchSessionId ? (
                    <button
                      type="button"
                      className="tournaments-button tournaments-button--secondary"
                      onClick={() => openMatchSessionTimeline(item.matchSessionId as string)}
                    >
                      Ir al match session
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="tournaments-button"
                      onClick={() =>
                        openRecordingSetup(item._id, item.homeTeamId, item.awayTeamId)
                      }
                    >
                      Crear match session
                    </button>
                  )}
                </td>
                <td>
                  <div className="tournaments-actions">
                    <button
                      className="tournaments-button tournaments-button--ghost"
                      onClick={() => {
                        setEditingMatch(item);
                        setMatchForm({
                          homeTeamId: item.homeTeamId,
                          awayTeamId: item.awayTeamId,
                          fieldId: item.fieldId || undefined,
                          scheduledAt: toInputDateTime(item.scheduledAt),
                          venue: item.venue || "",
                          round: item.round || "",
                          status: item.status || "scheduled",
                        });
                        setMatchFormScoreHome(item.score?.home || 0);
                        setMatchFormScoreAway(item.score?.away || 0);
                        setMatchFormWinnerTeamId(item.winnerTeamId || "");
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="tournaments-button tournaments-button--danger"
                      onClick={() =>
                        deleteWithConfirmation("el partido", async () => {
                          await api.deleteMatch(item._id);
                          await Promise.all([loadMatches(), loadMatchCatalog(), loadMatchStats()]);
                        })
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!matchFeedback.loading && matches.length === 0 && (
          <div className="tournaments-empty">No hay partidos para los filtros actuales.</div>
        )}
      </div>

      <form className="tournaments-form" onSubmit={handleMatchSubmit}>
        <div className="tournaments-form__header">
          <h3>{editingMatch ? "Editar partido" : "Crear partido"}</h3>
          {editingMatch && (
            <button type="button" className="tournaments-link-button" onClick={resetMatchForm}>
              Cancelar edicion
            </button>
          )}
        </div>

        <div className="tournaments-form-grid">
          <label>
            <span>Equipo local</span>
            <select
              className="tournaments-input"
              value={matchForm.homeTeamId}
              onChange={(event) =>
                setMatchForm((current: TournamentMatchCreateRequest) => ({
                  ...current,
                  homeTeamId: event.target.value,
                }))
              }
            >
              <option value="">Selecciona equipo</option>
              {matchTeamOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {matchErrors.homeTeamId && <small>{matchErrors.homeTeamId}</small>}
          </label>

          <label>
            <span>Equipo visitante</span>
            <select
              className="tournaments-input"
              value={matchForm.awayTeamId}
              onChange={(event) =>
                setMatchForm((current: TournamentMatchCreateRequest) => ({
                  ...current,
                  awayTeamId: event.target.value,
                }))
              }
            >
              <option value="">Selecciona equipo</option>
              {matchTeamOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {matchErrors.awayTeamId && <small>{matchErrors.awayTeamId}</small>}
          </label>

          <label>
            <span>Cancha</span>
            <select
              className="tournaments-input"
              value={matchForm.fieldId || ""}
              onChange={(event) =>
                setMatchForm((current: TournamentMatchCreateRequest) => ({
                  ...current,
                  fieldId: event.target.value || undefined,
                  venue: syncVenueFromField(event.target.value, current.venue),
                }))
              }
            >
              <option value="">Sin cancha asignada</option>
              {fieldOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {matchErrors.fieldId && <small>{matchErrors.fieldId}</small>}
          </label>

          <label>
            <span>Programado para</span>
            <input
              type="datetime-local"
              className="tournaments-input"
              value={matchForm.scheduledAt || ""}
              onChange={(event) =>
                setMatchForm((current: TournamentMatchCreateRequest) => ({
                  ...current,
                  scheduledAt: event.target.value,
                }))
              }
            />
          </label>

          <label>
            <span>Estado</span>
            <select
              className="tournaments-input"
              value={matchForm.status || "scheduled"}
              onChange={(event) =>
                setMatchForm((current: TournamentMatchCreateRequest) => ({
                  ...current,
                  status: event.target.value as TournamentMatchCreateRequest["status"],
                }))
              }
            >
              {MATCH_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {humanizeLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Ronda</span>
            <input
              className="tournaments-input"
              value={matchForm.round || ""}
              onChange={(event) =>
                setMatchForm((current: TournamentMatchCreateRequest) => ({
                  ...current,
                  round: event.target.value,
                }))
              }
            />
          </label>

          <label>
            <span>Venue</span>
            <input
              className="tournaments-input"
              value={matchForm.venue || ""}
              onChange={(event) =>
                setMatchForm((current: TournamentMatchCreateRequest) => ({
                  ...current,
                  venue: event.target.value,
                }))
              }
            />
          </label>

          {editingMatch && (
            <>
              <label className="tournaments-form-grid__full">
                <span>Streaming del partido</span>
                <div className="tournaments-actions">
                  {editingMatch.matchSessionId ? (
                    <button
                      type="button"
                      className="tournaments-button tournaments-button--secondary"
                      onClick={() => openMatchSessionTimeline(editingMatch.matchSessionId as string)}
                    >
                      Ir al match session
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="tournaments-button"
                      onClick={() =>
                        openRecordingSetup(
                          editingMatch._id,
                          editingMatch.homeTeamId,
                          editingMatch.awayTeamId
                        )
                      }
                    >
                      Crear match session
                    </button>
                  )}
                </div>
              </label>

              <label>
                <span>Marcador local</span>
                <input
                  type="number"
                  className="tournaments-input"
                  value={matchFormScoreHome}
                  onChange={(event) => setMatchFormScoreHome(Number(event.target.value) || 0)}
                />
              </label>

              <label>
                <span>Marcador visitante</span>
                <input
                  type="number"
                  className="tournaments-input"
                  value={matchFormScoreAway}
                  onChange={(event) => setMatchFormScoreAway(Number(event.target.value) || 0)}
                />
              </label>

              <label>
                <span>Ganador</span>
                <select
                  className="tournaments-input"
                  value={matchFormWinnerTeamId}
                  onChange={(event) => setMatchFormWinnerTeamId(event.target.value)}
                >
                  <option value="">Sin ganador</option>
                  {matchTeamOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>

        <div className="tournaments-actions tournaments-actions--end">
          <button className="tournaments-button" type="submit">
            {editingMatch ? "Guardar partido" : "Crear partido"}
          </button>
        </div>
      </form>
    </article>
  );
};

export const MatchStatsSection: React.FC = () => {
  const data = useTournamentsDashboardData();
  const { matchStats, tournamentOptions, statMatchOptions, matchStatFilters, setMatchStatFilters, matchStatFeedback, editingMatchStat, setEditingMatchStat, matchStatForm, setMatchStatForm, matchStatsJsonText, setMatchStatsJsonText, matchStatErrors, resetMatchStatForm, handleMatchStatSubmit, deleteWithConfirmation, api, loadMatchStats } = data;
  return (
    <article className="tournaments-section-card"><div className="tournaments-section-card__header"><div><h2>Estadisticas</h2><p>Metrics y resumenes asociados a cada partido.</p></div></div><div className="tournaments-filters"><select className="tournaments-input" value={matchStatFilters.tournamentId || ""} onChange={(event)=>setMatchStatFilters({ tournamentId: event.target.value, matchId: "" })}><option value="">Todos los torneos</option>{tournamentOptions.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select><select className="tournaments-input" value={matchStatFilters.matchId || ""} onChange={(event)=>setMatchStatFilters((current)=>({...current,matchId:event.target.value}))}><option value="">Todos los partidos</option>{statMatchOptions.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select></div>{matchStatFeedback.error && <SectionNotice type="error" message={matchStatFeedback.error} />}{matchStatFeedback.success && <SectionNotice type="success" message={matchStatFeedback.success} />}<div className="tournaments-table-shell"><table className="tournaments-table"><thead><tr><th>Partido</th><th>Sport</th><th>Stats</th><th>Acciones</th></tr></thead><tbody>{matchStats.map((item)=><tr key={item._id}><td>{statMatchOptions.find((option)=>option.value===item.matchId)?.label || item.matchId}</td><td>{item.sport || "-"}</td><td><pre className="tournaments-json-preview">{JSON.stringify(item.stats, null, 2)}</pre></td><td><div className="tournaments-actions"><button className="tournaments-button tournaments-button--ghost" onClick={()=>{setEditingMatchStat(item);setMatchStatForm({matchId:item.matchId,sport:item.sport||"",stats:item.stats||{}});setMatchStatsJsonText(JSON.stringify(item.stats || {}, null, 2));}}>Editar</button><button className="tournaments-button tournaments-button--danger" onClick={()=>deleteWithConfirmation("la estadistica", async()=>{await api.deleteMatchStat(item._id);await loadMatchStats();})}>Eliminar</button></div></td></tr>)}</tbody></table>{!matchStatFeedback.loading && matchStats.length===0 && <div className="tournaments-empty">No hay estadisticas para los filtros actuales.</div>}</div><form className="tournaments-form" onSubmit={handleMatchStatSubmit}><div className="tournaments-form__header"><h3>{editingMatchStat ? "Editar estadistica" : "Crear estadistica"}</h3>{editingMatchStat && <button type="button" className="tournaments-link-button" onClick={resetMatchStatForm}>Cancelar edicion</button>}</div><div className="tournaments-form-grid"><label><span>Partido</span><select className="tournaments-input" value={matchStatForm.matchId} onChange={(event)=>setMatchStatForm((current)=>({...current,matchId:event.target.value}))}><option value="">Selecciona partido</option>{statMatchOptions.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select>{matchStatErrors.matchId && <small>{matchStatErrors.matchId}</small>}</label><label><span>Sport</span><input className="tournaments-input" value={matchStatForm.sport || ""} onChange={(event)=>setMatchStatForm((current)=>({...current,sport:event.target.value}))} /></label><label className="tournaments-form-grid__full"><span>Stats JSON</span><textarea className="tournaments-input tournaments-textarea tournaments-textarea--code" value={matchStatsJsonText} onChange={(event)=>setMatchStatsJsonText(event.target.value)} />{matchStatErrors.stats && <small>{matchStatErrors.stats}</small>}</label></div><div className="tournaments-actions tournaments-actions--end"><button className="tournaments-button" type="submit">{editingMatchStat ? "Guardar estadistica" : "Crear estadistica"}</button></div></form></article>
  );
};
