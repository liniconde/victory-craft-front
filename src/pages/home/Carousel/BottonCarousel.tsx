import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Carousel/BottonCarousel.css";

import img1 from "../../../assets/F05.jpg";
import img2 from "../../../assets/p2.jpg";
import img3 from "../../../assets/T01.jpg";

const images = [img1, img2, img3];

const BottomCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bottom-carousel-container">
      {images.map((img, i) => (
        <div
          key={i}
          className={`bottom-carousel-slide ${
            i === index ? "active" : "inactive"
          }`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}

      <button
        className="bottom-carousel-button"
        onClick={() => navigate("/register")}
      >
        Únete Ahora
      </button>
    </div>
  );
};

export default BottomCarousel;
