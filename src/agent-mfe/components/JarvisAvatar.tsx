import React from "react";

interface JarvisAvatarProps {
  className?: string;
}

export const JarvisAvatar: React.FC<JarvisAvatarProps> = ({ className = "" }) => (
  <div className={`jarvis-avatar ${className}`.trim()} aria-hidden="true">
    <svg viewBox="0 0 24 24" className="jarvis-avatar__icon">
      <path
        d="M12 2a1 1 0 0 1 1 1v2.126A7.002 7.002 0 0 1 19 12v4a3 3 0 0 1-3 3h-1.268l.58 1.45a1 1 0 1 1-1.856.742L12.732 19h-1.464l-.724 2.192a1 1 0 1 1-1.856-.742l.58-1.45H8a3 3 0 0 1-3-3v-4a7.002 7.002 0 0 1 6-6.874V3a1 1 0 0 1 1-1Zm0 5a5 5 0 0 0-5 5v4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-4a5 5 0 0 0-5-5Zm-2 4a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 10 11Zm4 0a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 14 11Zm-4.5 4h5a1 1 0 1 1 0 2h-5a1 1 0 1 1 0-2Z"
        fill="currentColor"
      />
    </svg>
  </div>
);
