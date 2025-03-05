import React, { useEffect, useState } from "react";
import "./home.css"; // ✅ Mantiene los estilos en un archivo separado
import Imagen1 from "../../assets/03.V.jpg";
import Imagen2 from "../../assets/04.V.jpg";

const Home: React.FC = () => {
  const [imageIndex, setImageIndex] = useState(0);

  // 📌 Definir las imágenes dentro del componente
  const images = [Imagen1, Imagen2];

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Cambia la imagen cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="home-container"
      style={{ backgroundImage: `url(${images[imageIndex]})` }}
    >
      <h1 className="animated-text">Bienvenido a Victory Craft</h1>
      <p className="animated-text">
        En Victory Craft, puedes reservar las mejores canchas de fútbol y pádel
        de la ciudad.
      </p>
    </div>
  );
};

export default Home;
