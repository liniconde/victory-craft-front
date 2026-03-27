import React from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiArrowRight,
  FiCalendar,
  FiClipboard,
  FiGrid,
  FiPlayCircle,
  FiShield,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import {
  formatDateTime,
  humanizeLabel,
  useTournamentsDashboardData,
} from "../context/TournamentsDashboardDataContext";
import "./TournamentsDashboardPage.css";

const TournamentsDashboardPage: React.FC = () => {
  const { tournaments, teams, players, matches, matchStats, teamMap, tournamentMap } =
    useTournamentsDashboardData();

  const now = Date.now();
  const activeTournaments = tournaments.filter((item) => item.status === "in_progress");
  const registrationOpen = tournaments.filter((item) => item.status === "registration_open");
  const scheduledMatches = [...matches]
    .filter((item) => item.scheduledAt && new Date(item.scheduledAt).getTime() >= now)
    .sort(
      (first, second) =>
        new Date(first.scheduledAt || "").getTime() - new Date(second.scheduledAt || "").getTime()
    );
  const completedMatches = matches.filter((item) => item.status === "finished");
  const latestMatches = [...matches]
    .sort(
      (first, second) =>
        new Date(second.scheduledAt || second.createdAt || 0).getTime() -
        new Date(first.scheduledAt || first.createdAt || 0).getTime()
    )
    .slice(0, 4);

  const featuredMatch = scheduledMatches[0] || matches[0];
  const featuredHomeTeam = featuredMatch ? teamMap.get(featuredMatch.homeTeamId) : null;
  const featuredAwayTeam = featuredMatch ? teamMap.get(featuredMatch.awayTeamId) : null;
  const featuredTournament = featuredMatch
    ? tournamentMap.get(featuredHomeTeam?.tournamentId || featuredAwayTeam?.tournamentId || "")
    : null;

  const heroMetrics = [
    {
      label: "Torneos activos",
      value: activeTournaments.length,
      detail:
        activeTournaments.length > 0
          ? "competiciones están en juego ahora mismo."
          : "No hay competiciones activas en este momento.",
    },
    {
      label: "Inscripciones abiertas",
      value: registrationOpen.length,
      detail:
        registrationOpen.length > 0
          ? "torneos aceptan nuevas plantillas."
          : "No hay cupos abiertos ahora mismo.",
    },
    {
      label: "Cobertura operativa",
      value: teams.length + players.length + matchStats.length,
      detail: "registros entre equipos, jugadores y estadísticas del módulo.",
    },
  ];

  const quickLinks = [
    {
      title: "Torneos",
      copy: "Crea calendarios, configura fases y ordena cada competencia.",
      to: "/tournaments/subpages/tournaments",
      icon: FiGrid,
    },
    {
      title: "Equipos",
      copy: "Gestiona plantillas, escudos, coaches y vínculos por torneo.",
      to: "/tournaments/subpages/teams",
      icon: FiShield,
    },
    {
      title: "Jugadores",
      copy: "Centraliza la nómina y mantén lista cada convocatoria.",
      to: "/tournaments/subpages/players",
      icon: FiUsers,
    },
  ];

  const summaryCards = [
    {
      label: "Fixture listo",
      value: matches.length,
      accent: "fixture",
      description: "partidos creados entre cruces programados y jornadas activas.",
    },
    {
      label: "Partidos cerrados",
      value: completedMatches.length,
      accent: "results",
      description: "encuentros ya reportados con resultado definitivo.",
    },
    {
      label: "Estadísticas",
      value: matchStats.length,
      accent: "intel",
      description: "bloques de métricas disponibles para seguimiento y análisis.",
    },
  ];

  const getMatchLabel = (homeTeamId: string, awayTeamId: string) =>
    `${teamMap.get(homeTeamId)?.name || "Equipo local"} vs ${
      teamMap.get(awayTeamId)?.name || "Equipo visitante"
    }`;

  return (
    <div className="tournaments-dashboard-v2">
      <section className="tournaments-dashboard-v2__hero">
        <div className="tournaments-dashboard-v2__hero-panel">
          <div className="tournaments-dashboard-v2__eyebrow">Victory Craft competition control</div>
          <h1>Dashboard de torneos con una vista más táctica y operativa</h1>
          <p>
            Supervisa el estado competitivo del módulo, entra a los flujos principales y
            mantén visible la próxima acción crítica sin salir del dashboard.
          </p>
          <div className="tournaments-dashboard-v2__actions">
            <Link to="/tournaments/subpages/tournaments" className="tournaments-dashboard-v2__button">
              Gestionar torneos
            </Link>
            <Link
              to="/tournaments/subpages/matches"
              className="tournaments-dashboard-v2__button tournaments-dashboard-v2__button--ghost"
            >
              Ver partidos
            </Link>
          </div>
        </div>

        <div className="tournaments-dashboard-v2__hero-stack">
          {heroMetrics.map((metric) => (
            <article key={metric.label} className="tournaments-dashboard-v2__metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tournaments-dashboard-v2__grid">
        <article className="tournaments-dashboard-v2__spotlight">
          <div className="tournaments-dashboard-v2__spotlight-veil" />
          <div className="tournaments-dashboard-v2__spotlight-content">
            <span className="tournaments-dashboard-v2__badge">
              {featuredMatch?.status ? humanizeLabel(featuredMatch.status) : "Sin agenda activa"}
            </span>
            <h2>
              {featuredMatch
                ? getMatchLabel(featuredMatch.homeTeamId, featuredMatch.awayTeamId)
                : "Prepara el próximo cruce del calendario"}
            </h2>
            <p>
              {featuredMatch
                ? `Siguiente foco operativo${featuredTournament ? ` en ${featuredTournament.name}` : ""}.`
                : "Cuando programes nuevos partidos, aquí aparecerá el encuentro más próximo a disputarse."}
            </p>

            <div className="tournaments-dashboard-v2__spotlight-meta">
              <div>
                <span>Programado</span>
                <strong>{featuredMatch?.scheduledAt ? formatDateTime(featuredMatch.scheduledAt) : "-"}</strong>
              </div>
              <div>
                <span>Ronda</span>
                <strong>{featuredMatch?.round || "Pendiente"}</strong>
              </div>
              <div>
                <span>Sede</span>
                <strong>{featuredMatch?.venue || "Por definir"}</strong>
              </div>
            </div>

            <div className="tournaments-dashboard-v2__spotlight-actions">
              <Link to="/tournaments/subpages/matches" className="tournaments-dashboard-v2__cta">
                <FiPlayCircle />
                Abrir operación de partidos
              </Link>
            </div>
          </div>
        </article>

        <aside className="tournaments-dashboard-v2__rail">
          <article className="tournaments-dashboard-v2__trend-card">
            <div className="tournaments-dashboard-v2__trend-icon">
              <FiTrendingUp />
            </div>
            <span>Ritmo competitivo</span>
            <strong>{scheduledMatches.length} cruces próximos</strong>
            <p>La agenda inmediata ya muestra el siguiente bloque de partidos por ejecutar.</p>
          </article>

          <div className="tournaments-dashboard-v2__summary-list">
            {summaryCards.map((card) => (
              <article
                key={card.label}
                className={`tournaments-dashboard-v2__summary-card tournaments-dashboard-v2__summary-card--${card.accent}`}
              >
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="tournaments-dashboard-v2__quick-links">
        {quickLinks.map(({ title, copy, to, icon: Icon }) => (
          <Link key={title} to={to} className="tournaments-dashboard-v2__quick-card">
            <div className="tournaments-dashboard-v2__quick-icon">
              <Icon />
            </div>
            <h3>{title}</h3>
            <p>{copy}</p>
            <span>
              Abrir <FiArrowRight />
            </span>
          </Link>
        ))}
      </section>

      <section className="tournaments-dashboard-v2__bottom-grid">
        <article className="tournaments-dashboard-v2__panel">
          <div className="tournaments-dashboard-v2__panel-header">
            <div>
              <span className="tournaments-dashboard-v2__kicker">
                <FiActivity />
                Top actual
              </span>
              <h3>Actividad reciente del fixture</h3>
            </div>
            <Link to="/tournaments/subpages/matches" className="tournaments-dashboard-v2__text-link">
              Ir a partidos
            </Link>
          </div>

          <div className="tournaments-dashboard-v2__table-shell">
            <table className="tournaments-dashboard-v2__table">
              <thead>
                <tr>
                  <th>Partido</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Resultado</th>
                  <th>Ronda</th>
                </tr>
              </thead>
              <tbody>
                {latestMatches.length > 0 ? (
                  latestMatches.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="tournaments-dashboard-v2__table-title">
                          <strong>{getMatchLabel(item.homeTeamId, item.awayTeamId)}</strong>
                          <span>
                            {tournamentMap.get(
                              teamMap.get(item.homeTeamId)?.tournamentId ||
                                teamMap.get(item.awayTeamId)?.tournamentId ||
                                ""
                            )?.name || "Sin torneo asociado"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="tournaments-dashboard-v2__status-pill">
                          {humanizeLabel(item.status || "scheduled")}
                        </span>
                      </td>
                      <td>{item.scheduledAt ? formatDateTime(item.scheduledAt) : "-"}</td>
                      <td>{item.score ? `${item.score.home} - ${item.score.away}` : "Pendiente"}</td>
                      <td>{item.round || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="tournaments-dashboard-v2__empty">
                      Todavía no hay partidos cargados para mostrar en el dashboard.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="tournaments-dashboard-v2__panel tournaments-dashboard-v2__panel--compact">
          <div className="tournaments-dashboard-v2__panel-header">
            <div>
              <span className="tournaments-dashboard-v2__kicker">
                <FiCalendar />
                Focus board
              </span>
              <h3>Lectura rápida del módulo</h3>
            </div>
          </div>

          <div className="tournaments-dashboard-v2__focus-list">
            <div className="tournaments-dashboard-v2__focus-item">
              <FiGrid />
              <div>
                <strong>{tournaments.length} torneos registrados</strong>
                <p>Base competitiva disponible para organizar nuevas fases y temporadas.</p>
              </div>
            </div>
            <div className="tournaments-dashboard-v2__focus-item">
              <FiUsers />
              <div>
                <strong>{players.length} jugadores en nómina</strong>
                <p>La cobertura de participantes ya permite seguimiento por equipos y cruces.</p>
              </div>
            </div>
            <div className="tournaments-dashboard-v2__focus-item">
              <FiClipboard />
              <div>
                <strong>{matchStats.length} registros de estadísticas</strong>
                <p>Los datos postpartido ya se pueden consolidar para análisis y reportes.</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};

export default TournamentsDashboardPage;
