import React, { useEffect, useRef, useState } from "react";
import RecruitersVideoPlayer from "../../../components/RecruitersVideoPlayer";
import RecruiterVoteButtons from "../../../components/RecruiterVoteButtons";
import type { RecruiterRankingItem } from "../../../features/recruiters/types";
import { getDisplayName } from "./RecruiterRankingsSections";

interface RecruiterRankingsInteractiveVideoCardProps {
  item: RecruiterRankingItem;
  playableUrl: string;
  isActive?: boolean;
  playbackState?: boolean | null;
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
  playbackState = null,
  pendingVote = null,
  onVote,
  onSelect,
}) => {
  const title = item.scoutingProfile?.title || item.video.s3Key || "Untitled clip";
  const displayName = getDisplayName(item);
  const playerName =
    item.playerProfile?.fullName && item.playerProfile.fullName.trim()
      ? item.playerProfile.fullName.trim()
      : displayName;
  const showPlayerName =
    playerName.trim().length > 0 &&
    playerName.trim().toLowerCase() !== title.trim().toLowerCase();
  const cardRef = useRef<HTMLElement | null>(null);
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return;
    }

    const root = card.closest(".recruiters-board-interactive__feed-list");
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInViewport(entry.isIntersecting && entry.intersectionRatio >= 0.65);
      },
      {
        root: root instanceof Element ? root : null,
        threshold: [0.25, 0.5, 0.65, 0.8],
      }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const isPlaybackActive = playbackState ?? isInViewport;

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
      ref={cardRef}
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
            autoPlay={isPlaybackActive}
            controls={isPlaybackActive}
            isActive={isPlaybackActive}
            muted
            loop
            preload={isPlaybackActive ? "metadata" : "none"}
          />
        ) : (
          <div className="recruiters-board-interactive__video-empty">Sin preview</div>
        )}
      </div>

      <div className="recruiters-board-interactive__video-meta">
        <div className="recruiters-board-interactive__video-copy">
          <strong>{title}</strong>
          {showPlayerName ? <span>{playerName}</span> : null}
        </div>

        <div className="recruiters-board-interactive__video-actions">
          <div className="recruiters-board-interactive__video-score" aria-label="Puntaje del video">
            <strong>{item.ranking.score}</strong>
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
      </div>
    </article>
  );
};

export default RecruiterRankingsInteractiveVideoCard;
