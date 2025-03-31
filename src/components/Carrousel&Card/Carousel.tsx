import React from "react";
import CardItem from "./CardItem";

interface CarouselProps {
  groupedItems: {
    title: string;
    images: string[];
  }[];
}

const Carousel: React.FC<CarouselProps> = ({ groupedItems }) => {
  return (
    <div className="w-full px-20 overflow-hidden">
      <h2 className="text-2xl text-black font-semibold mb-8 text-center">
        Explora nuestro mundo deportivo
      </h2>

      <div className="flex justify-center gap-6">
        {groupedItems.map((group, index) => (
          <CardItem key={index} imageUrls={group.images} title={group.title} />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
