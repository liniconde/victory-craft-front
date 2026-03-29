export const buildPublicPlayerProfilePath = (publicSlug: string) =>
  `/public/player-profiles/${publicSlug}`;

export const resolvePublicPlayerProfilePath = (
  publicProfile?:
    | {
        publicSlug?: string | null;
        publicPath?: string | null;
      }
    | null
) => {
  if (publicProfile?.publicPath?.trim()) return publicProfile.publicPath.trim();
  if (publicProfile?.publicSlug?.trim()) return buildPublicPlayerProfilePath(publicProfile.publicSlug.trim());
  return "";
};
