import React from "react";
import "./RecruitersWorkspaceButton.css";

interface RecruitersWorkspaceButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: "gold" | "dark" | "ghost";
  size?: "sm" | "md";
  caption?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const RecruitersWorkspaceButton: React.FC<RecruitersWorkspaceButtonProps> = ({
  type = "button",
  variant = "gold",
  size = "md",
  caption,
  icon,
  className = "",
  onClick,
  children,
}) => {
  return (
    <button
      type={type}
      className={`recruiters-workspace-button recruiters-workspace-button--${variant} recruiters-workspace-button--${size} ${className}`.trim()}
      onClick={onClick}
    >
      <span className="recruiters-workspace-button__copy">
        <strong>{children}</strong>
        {caption ? <small>{caption}</small> : null}
      </span>
      {icon ? <span className="recruiters-workspace-button__icon">{icon}</span> : null}
    </button>
  );
};

export default RecruitersWorkspaceButton;
