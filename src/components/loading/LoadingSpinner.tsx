import React, { useMemo } from "react";
import { FaFutbol } from "react-icons/fa";
import { GiTennisBall } from "react-icons/gi";

const LoadingSpinner: React.FC<{ message?: string }> = ({
  message = "Cargando...",
}) => {
  const Icon = useMemo(() => {
    const icons = [FaFutbol, GiTennisBall];
    return icons[Math.floor(Math.random() * icons.length)];
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="animate-spin text-white text-5xl mb-4">
        <Icon className="text-green-400" />
      </div>
      <p className="text-white text-lg font-semibold animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;
