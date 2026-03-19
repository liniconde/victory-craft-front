import React from "react";
import { FaFire, FaSnowflake } from "react-icons/fa";

interface RecruiterVoteButtonsProps {
  upvotes: number;
  downvotes: number;
  myVote?: -1 | 1 | null;
  onVote: (value: -1 | 0 | 1) => void;
  compact?: boolean;
  className?: string;
}

const RecruiterVoteButtons: React.FC<RecruiterVoteButtonsProps> = ({
  upvotes,
  downvotes,
  myVote = null,
  onVote,
  compact = false,
  className = "",
}) => (
  <div
    className={`recruiter-vote-buttons ${
      compact ? "recruiter-vote-buttons--compact" : ""
    } ${className}`.trim()}
    >
      <button
        type="button"
      className={`recruiter-vote-buttons__action recruiter-vote-buttons__action--fire ${
        myVote === 1 ? "is-active" : ""
      }`.trim()}
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
        myVote === -1 ? "is-active" : ""
      }`.trim()}
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
      className="recruiter-vote-buttons__reset"
      onClick={(event) => {
        event.stopPropagation();
        onVote(0);
      }}
    >
      Neutralizar
    </button>
  </div>
);

export default RecruiterVoteButtons;
