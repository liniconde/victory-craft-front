import { useEffect, useRef, useState } from "react";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./MapComponent.css";
import FieldCards from "./../map/FieldCards";

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = mapboxToken || "";
const INITIAL_CENTER: LngLatLike = [2.1734, 41.3851];
const INITIAL_ZOOM = 10;

interface Field {
  _id: string;
  name: string;
  location: { latitude: number; longitude: number; venue: string };
  pricePerHour: number;
  imageUrl: string;
}

interface Props {
  fields: Field[];
  selectedField: Field | null;
}

const MapComponent: React.FC<Props> = ({ fields, selectedField }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]); // Almacenar marcadores para limpiarlos luego

  const [center, setCenter] = useState(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [_, setSelectedFieldState] = useState<Field | null>(null);

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

    fields.forEach((field) => {
      if (
        !field.location ||
        !field.location.latitude ||
        !field.location.longitude
      ) {
        console.warn(`Ubicación inválida para ${field.name}`);
        return;
      }

      if (!mapRef.current) return;
      const marker = new mapboxgl.Marker({ color: "red" })
        .setLngLat([field.location?.longitude, field.location?.latitude])
        .setPopup(new mapboxgl.Popup().setText(field.name))
        ?.addTo(mapRef.current);

      markersRef.current?.push(marker);
    });
  }, [fields]);

  // Mover el mapa si se selecciona un concierto
  useEffect(() => {
    if (!mapRef.current) return;

    // const long = selectedFieldState ? selectedFieldState.location.longitude : INITIAL_CENTER[0];
    // const lat = selectedFieldState ? selectedFieldState.location.latitude : INITIAL_CENTER[1]

    mapRef.current?.flyTo({
      center: [INITIAL_CENTER[0], INITIAL_CENTER[1]],
      zoom: 15,
      essential: true,
    });
  }, [selectedField]);

  return (
    <div className="map-container">
      {/* 📌 Contenedor del Mapa */}
      <div ref={mapContainerRef} className="mapbox-map" />

      {/* 📌 Tarjetas de las canchas */}
      <FieldCards fields={fields} onSelectField={setSelectedFieldState} />
    </div>
  );
};

export default MapComponent;
