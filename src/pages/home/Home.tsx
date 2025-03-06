import React, { useEffect, useState } from "react";
import "./home.css"; // ✅ Mantiene los estilos en un archivo separado
import Imagen1 from "../../assets/03.V.jpg";
import Imagen2 from "../../assets/04.V.jpg";

const Home: React.FC = () => {
  const INTERVAL_TIME_IMAGE = 10000; // ✅ Cambia la imagen cada 5 segundos
  const [imageIndex, setImageIndex] = useState(0);
  const images = [Imagen1, Imagen2];

  const clearBackgound = () => {
    document.body.style.backgroundImage = "";
    document.body.style.height = "";
    document.body.style.overflow = "";
  };

  const setBackgound = () => {
    document.body.style.backgroundImage = `url(${images[imageIndex]})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.height = "100vh";
    document.body.style.overflow = "hidden";
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, INTERVAL_TIME_IMAGE);

    return () => {
      clearInterval(interval);
      clearBackgound();
    };
  }, []);

  useEffect(() => {
    setBackgound();
  }, [imageIndex]);

  return (
    <div className="home-container">
      <div className="overlay"></div>{" "}
      {/* ✅ Capa oscura para mejorar el contraste del texto */}
      <h1 className="animated-text">Bienvenido a Victory Craft</h1>
      <p className="animated-text">
        En Victory Craft, puedes reservar las mejores canchas de fútbol y pádel
        de la ciudad.
      </p>
    </div>
  );
};

export default Home;
