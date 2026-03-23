export type NavigationRole = "guest" | "user" | "admin" | "recruiter";

export type NavigationItem = {
  label: string;
  path: string;
  activePath?: string;
  allowedRoles: NavigationRole[];
};

export const NAV_ITEMS: NavigationItem[] = [
  {
    label: "Scouting",
    path: "/scouting/subpages/dashboard",
    activePath: "/scouting",
    allowedRoles: ["user", "admin", "recruiter"],
  },
  {
    label: "Videos",
    path: "/videos",
    activePath: "/videos",
    allowedRoles: ["user", "admin", "recruiter"],
  },
  {
    label: "Campos",
    path: "/fields",
    allowedRoles: ["guest", "admin", "recruiter"],
  },
  {
    label: "Reservas",
    path: "/reservations",
    allowedRoles: ["admin", "recruiter"],
  },
  {
    label: "Partidos",
    path: "/slots",
    allowedRoles: ["admin", "recruiter"],
  },
  {
    label: "Torneos",
    path: "/tournaments",
    allowedRoles: ["admin", "recruiter"],
  },
  {
    label: "Usuarios",
    path: "/users",
    allowedRoles: ["guest"],
  },
];

export const normalizeNavigationRole = (
  isAuthenticated: boolean,
  role: string | null
): NavigationRole => {
  if (!isAuthenticated) return "guest";
  if (role === "admin" || role === "recruiter") return role;
  return "user";
};

export const getVisibleNavItems = (
  role: NavigationRole
): NavigationItem[] => NAV_ITEMS.filter((item) => item.allowedRoles.includes(role));
