import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAgent } from "../../agent-mfe";
import { tournamentsApi } from "../features/tournaments/api/client";
import type { AgentAction } from "../../agent-mfe";

const normalizeHashPath = (path: string) => path.replace(/\/+$/, "");

export const TournamentsAgentActions = () => {
  const { registerActions } = useAgent();
  const { userId } = useAuth();

  useEffect(() => {
    const actions: AgentAction[] = [
      {
        name: "tournaments.open_registration",
        description: "Open the tournaments dashboard and focus the creation form.",
        parameters: [],
        returns: [
          {
            name: "message",
            type: "string",
            description: "Confirms that the tournament form is open.",
          },
        ],
        tags: ["tournaments", "navigation"],
        handler: ({ navigation }) => {
          navigation.navigate("/tournaments/subpages/dashboard#tournament-form");

          return {
            actionName: "tournaments.open_registration",
            success: true,
            message: "Tournament registration form opened.",
          };
        },
      },
      {
        name: "tournaments.create_tournament",
        description: "Create a tournament using the tournaments frontend API.",
        parameters: [
          {
            name: "name",
            type: "string",
            description: "Tournament name.",
            required: true,
          },
          {
            name: "sport",
            type: "string",
            description: "Tournament sport.",
            required: true,
          },
          {
            name: "description",
            type: "string",
            description: "Optional description.",
          },
          {
            name: "status",
            type: "string",
            description: "Tournament status.",
            enum: ["draft", "registration_open", "in_progress", "completed", "cancelled"],
          },
          {
            name: "startsAt",
            type: "string",
            description: "Start date in ISO format.",
          },
          {
            name: "endsAt",
            type: "string",
            description: "End date in ISO format.",
          },
        ],
        returns: [
          {
            name: "message",
            type: "string",
            description: "Creation confirmation.",
          },
          {
            name: "data",
            type: "object",
            description: "Created tournament payload.",
          },
        ],
        tags: ["tournaments", "mutation"],
        handler: async ({ navigation }, params) => {
          const name = typeof params.name === "string" ? params.name.trim() : "";
          const sport = typeof params.sport === "string" ? params.sport.trim() : "";

          if (!name || !sport) {
            navigation.navigate(
              `${normalizeHashPath("/tournaments/subpages/dashboard")}#tournament-form`
            );

            return {
              actionName: "tournaments.create_tournament",
              success: false,
              message: "Missing fields. Navigated to the tournament form to complete them.",
            };
          }

          const tournament = await tournamentsApi.createTournament({
            name,
            sport,
            description:
              typeof params.description === "string" ? params.description.trim() : undefined,
            status:
              typeof params.status === "string"
                ? (params.status as
                    | "draft"
                    | "registration_open"
                    | "in_progress"
                    | "completed"
                    | "cancelled")
                : "draft",
            startsAt: typeof params.startsAt === "string" ? params.startsAt : undefined,
            endsAt: typeof params.endsAt === "string" ? params.endsAt : undefined,
            ownerId: userId || undefined,
          });

          navigation.navigate("/tournaments/subpages/dashboard");

          return {
            actionName: "tournaments.create_tournament",
            success: true,
            message: `Tournament ${tournament.name} created successfully.`,
            data: tournament,
          };
        },
      },
    ];

    return registerActions(actions);
  }, [registerActions, userId]);

  return null;
};
