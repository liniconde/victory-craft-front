import React from "react";
import { FaFire, FaSnowflake } from "react-icons/fa";

interface RecruiterVoteButtonsProps {
  upvotes: number;
  downvotes: number;
  myVote?: -1 | 1 | null;
  onVote: (value: -1 | 0 | 1) => void;
  compact?: boolean;
  className?: string;
  pendingVote?: -1 | 0 | 1 | null;
  isPending?: boolean;
}

const RecruiterVoteButtons: React.FC<RecruiterVoteButtonsProps> = ({
  upvotes,
  downvotes,
  myVote = null,
  onVote,
  compact = false,
  className = "",
  pendingVote = null,
  isPending = false,
}) => {
  const visualVote =
    pendingVote === 1 || pendingVote === -1 ? pendingVote : pendingVote === 0 ? null : myVote;

  return (
    <div
      className={`recruiter-vote-buttons ${
        compact ? "recruiter-vote-buttons--compact" : ""
      } ${isPending ? "is-pending" : ""} ${className}`.trim()}
    >
      <button
        type="button"
        className={`recruiter-vote-buttons__action recruiter-vote-buttons__action--fire ${
          visualVote === 1 ? "is-active" : ""
        } ${isPending && pendingVote === 1 ? "is-pending" : ""}`.trim()}
        disabled={isPending}
        onClick={(event) => {
          event.stopPropagation();
          onVote(1);
        }}
        aria-label="Subir calificación"
        title="Subir calificación"
      >
        <FaFire aria-hidden="true" />
        <span>{upvotes}</span>
      </button>

      <button
        type="button"
        className={`recruiter-vote-buttons__action recruiter-vote-buttons__action--ice ${
          visualVote === -1 ? "is-active" : ""
        } ${isPending && pendingVote === -1 ? "is-pending" : ""}`.trim()}
        disabled={isPending}
        onClick={(event) => {
          event.stopPropagation();
          onVote(-1);
        }}
        aria-label="Bajar calificación"
        title="Bajar calificación"
      >
        <FaSnowflake aria-hidden="true" />
        <span>{downvotes}</span>
      </button>

      <button
        type="button"
        className={`recruiter-vote-buttons__reset ${
          isPending && pendingVote === 0 ? "is-pending" : ""
        }`.trim()}
        disabled={isPending}
        onClick={(event) => {
          event.stopPropagation();
          onVote(0);
        }}
      >
        {isPending && pendingVote === 0 ? "Ajustando..." : "Neutralizar"}
      </button>
    </div>
  );
};

export default RecruiterVoteButtons;
