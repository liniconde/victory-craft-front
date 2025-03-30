import React, { useEffect, useState } from "react";
import "./home.css";
import Imagen1 from "../../assets/03.V.jpg";
import Imagen2 from "../../assets/00.jpg";
import Carousel from "../../components/Carrousel&Card/Carousel";
import Fútbol1 from "../../assets/F02.jpg";
import fútbol2 from "../../assets/F03.jpg";
import fútbol3 from "../../assets/F05.jpg";
import fútbol4 from "../../assets/F06.jpg";
import tennis from "../../assets/T01.jpg";
import tennis1 from "../../assets/T02.jpg";
import padel from "../../assets/p1.jpg";
import padel1 from "../../assets/p2.jpg";
import padel2 from "../../assets/p3.jpg";
import padel3 from "../../assets/p4.jpg";

const Home: React.FC = () => {
  const INTERVAL_TIME_IMAGE = 10000;
  const [imageIndex, setImageIndex] = useState(0);
  const images = [Imagen1, Imagen2];

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, INTERVAL_TIME_IMAGE);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // ✅ Aplica fondo negro al body solo cuando se monta el Home
    document.body.style.backgroundColor = "#000";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  const cardItems = [
    {
      url: Fútbol1,
      title: "Campo de fútbol",
    },
    {
      url: fútbol2,
      title: "Nuestras campos",
    },
    {
      url: fútbol3,
      title: "Entrenamiento",
    },
    {
      url: fútbol4,
      title: "jugadas",
    },
    {
      url: tennis,
      title: "Tennis",
    },
    {
      url: tennis1,
      title: "Tennis",
    },
    {
      url: padel,
      title: "Padel",
    },
    {
      url: padel1,
      title: "Jugadores",
    },
    {
      url: padel2,
      title: "Padel",
    },
    {
      url: padel3,
      title: "Nuestras campos",
    },
  ];

  return (
    <>
      {/* 🌄 HERO SOLO CON FONDO EN ESTE DIV */}
      <div
        className="home-container"
        style={{
          backgroundImage: `url(${images[imageIndex]})`,
        }}
      >
        <div className="overlay"></div>
        <h1 className="animated-text">Bienvenido a Victory Craft</h1>
        <p className="animated-text">
          En Victory Craft, puedes reservar
          <br /> las mejores campos de <br />
          fútbol y pádel de la ciudad.
        </p>
      </div>

      {/* 🎯 CARRUSEL SEPARADO */}
      <div className="bg-white py-16 px-4">
        <Carousel items={cardItems} />

        <p className="text-center text-2xl font-medium mt-10">
          En Victory Craft te conectamos con las mejores campos de pádel, tenis
          y fútbol de la ciudad. <br />
          Elige, agenda y juega: sin complicaciones, sin llamadas, sin esperas.
        </p>
      </div>
    </>
  );
};

export default Home;
