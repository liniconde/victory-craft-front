import React from "react";
import RecruitersVideoPlayer from "../../../components/RecruitersVideoPlayer";
import RecruiterVoteButtons from "../../../components/RecruiterVoteButtons";
import type { RecruiterRankingItem } from "../../../features/recruiters/types";
import { getDisplayName } from "./RecruiterRankingsSections";

interface RecruiterRankingsInteractiveVideoCardProps {
  item: RecruiterRankingItem;
  playableUrl: string;
  isActive?: boolean;
  pendingVote?: -1 | 0 | 1 | null;
  onVote: (videoId: string, value: -1 | 0 | 1) => void;
  onSelect?: (videoId: string) => void;
}

const RecruiterRankingsInteractiveVideoCard: React.FC<
  RecruiterRankingsInteractiveVideoCardProps
> = ({
  item,
  playableUrl,
  isActive = false,
  pendingVote = null,
  onVote,
  onSelect,
}) => {
  const title = item.scoutingProfile?.title || item.video.s3Key || "Untitled clip";
  const playerName = getDisplayName(item);

  const forwardWheelToFeed = (event: React.WheelEvent<HTMLElement>) => {
    const feedList = event.currentTarget.closest(
      ".recruiters-board-interactive__feed-list"
    ) as HTMLElement | null;

    if (!feedList) return;

    feedList.scrollBy({
      top: event.deltaY,
      left: event.deltaX,
      behavior: "auto",
    });
    event.preventDefault();
  };

  return (
    <article
      className={`recruiters-board-interactive__video-card ${
        isActive ? "is-active" : ""
      }`}
      onClick={() => onSelect?.(item.video._id)}
      onWheelCapture={forwardWheelToFeed}
    >
      <div
        className="recruiters-board-interactive__video-shell"
        onClick={(event) => event.stopPropagation()}
      >
        {playableUrl ? (
          <RecruitersVideoPlayer
            key={`${item.video._id}-${playableUrl}`}
            src={playableUrl}
            message="Los sticks están preparando el clip interactivo."
            controls
            muted
            loop
            preload="metadata"
          />
        ) : (
          <div className="recruiters-board-interactive__video-empty">Sin preview</div>
        )}
      </div>

      <div className="recruiters-board-interactive__video-meta">
        <div className="recruiters-board-interactive__video-copy">
          <strong>{title}</strong>
          <span>{playerName}</span>
        </div>

        <RecruiterVoteButtons
          upvotes={item.ranking.upvotes}
          downvotes={item.ranking.downvotes}
          myVote={item.myVote}
          pendingVote={pendingVote}
          isPending={pendingVote !== null && pendingVote !== undefined}
          onVote={(value) => onVote(item.video._id, value)}
          className="recruiters-board-interactive__video-votes"
        />
      </div>
    </article>
  );
};

export default RecruiterRankingsInteractiveVideoCard;
