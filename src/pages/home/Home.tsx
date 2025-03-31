import React, { useEffect, useState } from "react";
import "./home.css";
import BottomCarousel from "../home/Carousel/BottonCarousel";
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

  const groupedImages = [
    {
      title: "Fútbol",
      images: [Fútbol1, fútbol2, fútbol3, fútbol4],
    },
    {
      title: "Tenis",
      images: [tennis, tennis1],
    },
    {
      title: "Pádel",
      images: [padel, padel1, padel2, padel3],
    },
  ];

  return (
    <>
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
        <Carousel groupedItems={groupedImages} />

        <p className="text-center text-2xl font-medium mt-10">
          En Victory Craft te conectamos con las mejores campos de pádel, tenis
          y fútbol de la ciudad. <br />
          Elige, agenda y juega: sin complicaciones, sin llamadas, sin esperas.
        </p>
      </div>

      <section className="bg-white py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-[#50bb73] mb-8 font-poppins">
          ¿Cómo funciona?
        </h2>

        <div className="flex flex-wrap justify-center gap-6 max-w-12xl mx-auto">
          {/* Paso 1 */}
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg w-[350px] text-left shadow-sm hover:shadow-lg transition">
            <span className="block text-3xl font-bold text-[#50bb73] mb-2">
              1
            </span>
            <h3 className="text-base font-semibold mb-2 text-gray-900">
              Crea tu cuenta
            </h3>
            <p className="text-sm text-gray-600">
              Regístrate fácilmente en segundos para acceder a todos los
              servicios.
            </p>
          </div>

          {/* Paso 2 */}
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg w-[350px] text-left shadow-sm hover:shadow-lg transition">
            <span className="block text-3xl font-bold text-[#50bb73] mb-2">
              2
            </span>
            <h3 className="text-base font-semibold mb-2 text-gray-900">
              Explora campos
            </h3>
            <p className="text-sm text-gray-600">
              Busca campos de fútbol, pádel o tenis disponibles cerca de ti.
            </p>
          </div>

          {/* Paso 3 */}
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg w-[350px] text-left shadow-sm hover:shadow-lg transition">
            <span className="block text-3xl font-bold text-[#50bb73] mb-2">
              3
            </span>
            <h3 className="text-base font-semibold mb-2 text-gray-900">
              Reserva y juega
            </h3>
            <p className="text-sm text-gray-600">
              Elige el horario que te convenga, reserva y ¡a jugar!
            </p>
          </div>
        </div>
      </section>

      <div>
        <BottomCarousel />
      </div>
    </>
  );
};

export default Home;
