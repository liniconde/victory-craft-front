import { useEffect, useRef, useState } from "react";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./PersonalizedMapComponent.css";
import { FieldLocation } from "../../interfaces/FieldInterfaces";

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = mapboxToken || "";
const INITIAL_CENTER: LngLatLike = [2.1734, 41.3851];
const INITIAL_ZOOM = 10;

interface Props {
  selectedLocation: FieldLocation;
  setSelectedLocation: React.Dispatch<React.SetStateAction<FieldLocation>>;
}

const PersonalizedMapComponent: React.FC<Props> = ({ selectedLocation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]); // Almacenar marcadores para limpiarlos luego

  const [center, setCenter] = useState(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  console.log("MapToken ->", mapboxgl.accessToken, mapboxToken);

  console.log("MapToken -> fields", mapboxgl.accessToken);

  // Inicializar el mapa solo una vez
  useEffect(() => {
    if (!mapboxToken) {
      console.error("Mapbox token missing.");
      return;
    }

    console.log("Creating map...");

    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/mapbox/streets-v11",
        center: center,
        zoom: zoom,
      });
    }

    mapRef.current?.on("move", () => {
      // get the current center coordinates and zoom level from the map
      const mapCenter = mapRef.current?.getCenter();
      const mapZoom = mapRef.current?.getZoom();

      // console.log("Map moved", mapCenter, mapZoom);

      // update state
      if (mapCenter && mapZoom) {
        setCenter([mapCenter.lng, mapCenter.lat]);
        setZoom(mapZoom);

        if (mapCenter && mapZoom) {
          setCenter([mapCenter.lng, mapCenter.lat]);
          setZoom(mapZoom);
        }
      }
    });

    /* new mapboxgl.Marker().setLngLat([2.15899, 41.38879]).addTo(mapRef.current);

    new mapboxgl.Marker({ color: "black", rotation: 45 })
      .setLngLat([2.1734, 41.3851])
      .addTo(mapRef.current);*/
  }, []);

  // Actualizar marcadores cuando cambian los conciertos

  useEffect(() => {
    if (!mapRef.current) return;

    // Eliminar marcadores anteriores
    markersRef.current?.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (
      !selectedLocation ||
      !selectedLocation?.lat ||
      !selectedLocation?.long
    ) {
      console.warn(`Ubicación inválida para ${selectedLocation?.name}`);
      return;
    }

    if (!mapRef.current) return;
    const marker = new mapboxgl.Marker({ color: "red" })
      .setLngLat([selectedLocation?.lat, selectedLocation?.long])
      .setPopup(new mapboxgl.Popup().setText(selectedLocation.name))
      ?.addTo(mapRef.current);

    markersRef.current?.push(marker);
  }, [selectedLocation]);

  // Mover el mapa si se selecciona un concierto
  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return;

    // const long = selectedFieldState ? selectedFieldState.location.longitude : INITIAL_CENTER[0];
    // const lat = selectedFieldState ? selectedFieldState.location.latitude : INITIAL_CENTER[1]

    mapRef.current?.flyTo({
      center: [selectedLocation.lat, selectedLocation.long],
      zoom: 15,
      essential: true,
    });
  }, [selectedLocation]);

  return (
    <div className="map-container">
      {/* 📌 Contenedor del Mapa */}
      <div ref={mapContainerRef} className="mapbox-map" />
    </div>
  );
};

export default PersonalizedMapComponent;
