import React, { useEffect, useRef, useState } from "react";
import CardItem from "./CardItem";

interface CarouselProps {
  items: { url: string; title?: string }[];
}

const Carousel: React.FC<CarouselProps> = ({ items }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const duplicatedItems = [...items, ...items]; // 🔁 duplicamos para loop visual
  const cardWidth = 400;
  const gap = 32;
  const totalWidth = (cardWidth + gap) * duplicatedItems.length;

  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isHovering) {
      interval = setInterval(() => {
        setTranslateX((prev) => (prev >= totalWidth / 2 ? 0 : prev + 1));
      }, 16); // ➡ velocidad del scroll (ajustable)
    }

    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <div className="w-full px-6 overflow-hidden">
      <h2 className="text-2xl text-black font-semibold mb-8 text-center">
        Explora nuestro mundo deportivo
      </h2>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div
          className="flex"
          style={{
            width: `${totalWidth}px`,
            transform: `translateX(-${translateX}px)`,
            transition: "transform 0.05s linear",
          }}
        >
          {duplicatedItems.map((item, index) => (
            <CardItem key={index} imageUrl={item.url} title={item.title} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
