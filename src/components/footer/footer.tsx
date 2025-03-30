import React from "react";
import {
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";

const footer: React.FC = () => {
  return (
    <footer className="bg-[#50BB73] text-white py-6 px-4 ">
      <div className="max-w-7xl mx-auto flex flex-col justify-between items-center gap-4">
        {/*Iconos*/}
        <div className="flex space-x-4 text-xl">
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaYoutube className="hover: text-black transition duration-300" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram className="hover: text-black transition duration-300" />
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTiktok className="hover:text-black transition duration-300" />
          </a>
          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp className="hover:text-black transition duration-300" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin className="hover:text-black transition duration-300" />
          </a>
        </div>

        {/* Derechos reservados */}
        <div className="text-sm text-center md:text-right text-white">
          © {new Date().getFullYear()} Victory Craft. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
};

export default footer;
