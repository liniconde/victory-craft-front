import React from "react";

interface CardItemProps {
  imageUrl: string;
  title?: string;
}

const CardItem: React.FC<CardItemProps> = ({ imageUrl, title }) => {
  return (
    <div className="w-[400px] h-[250px] mx-4 rounded-xl overflow-hidden shadow-xl relative flex-shrink-0 transform transition-transform duration-300 ease-in-out hover:scale-105">
      <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      {title && (
        <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-base text-center py-2">
          {title}
        </div>
      )}
    </div>
  );
};

export default CardItem;
