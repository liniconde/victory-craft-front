import React, { useState, useEffect } from "react";
import Fondo from "../../assets/pexels-todd-trapani-488382-2339377.jpg";
import Fondo1 from "../../assets/pexels-pixabay-274506.jpg";
import "./Background.css"; // asegúrate que la ruta sea correcta

const BackgroundComponent: React.FC = () => {
  const backgrounds = [Fondo, Fondo1];
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentBackground = backgrounds[currentIndex];

  useEffect(() => {
    // ⛔️ Prevenir scroll
    document.body.style.overflow = "hidden";
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);

    return () => {
      document.body.style.overflow = "auto";
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Fondo animado que cubre toda la pantalla */}
      <div
        className="background-image"
        style={{
          backgroundImage: `url(${currentBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 1s ease-in-out",
        }}
      />
    </>
  );
};

export default BackgroundComponent;
