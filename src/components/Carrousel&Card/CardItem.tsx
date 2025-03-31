// CardItem.tsx
import React, { useEffect, useState } from "react";

interface CardItemProps {
  imageUrls: string[];
  title: string;
}

const CardItem: React.FC<CardItemProps> = ({ imageUrls, title }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % imageUrls.length);
    }, 3000); // cambia cada 3 segundos

    return () => clearInterval(interval);
  }, [imageUrls]);

  return (
    <div className="w-[500px] h-[300px] mx-4 rounded-xl overflow-hidden shadow-xl relative flex-shrink-0 border-4 border-[#50BB73] transition-transform duration-300 ease-in-out hover:scale-105">
      <img
        src={imageUrls[index]}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-lg text-center py-2 font-semibold">
        {title}
      </div>
    </div>
  );
};

export default CardItem;
