import { useContext } from "react";
import { VideosModuleContext } from "../features/videos/VideosModuleContext";

export const useVideosModule = () => useContext(VideosModuleContext);
