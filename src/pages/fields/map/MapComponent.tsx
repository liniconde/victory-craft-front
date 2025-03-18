import { useEffect, useRef, useState } from "react";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./MapComponent.css";
import { Field } from "../../../interfaces/FieldInterfaces";

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = mapboxToken || "";
const INITIAL_CENTER: LngLatLike = [2.1734, 41.3851];
const INITIAL_ZOOM = 10;

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

  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current?.forEach((marker) => marker.remove());
    markersRef.current = [];

    fields.forEach((field) => {
      if (!field.location || !field.location.lat || !field.location.long) {
        console.warn(`Ubicación inválida para ${field.name}`);
        return;
      }

      if (!mapRef.current) return;
      const marker = new mapboxgl.Marker({ color: "red" })
        .setLngLat([field.location?.long, field.location?.lat])
        .setPopup(new mapboxgl.Popup().setText(field.name))
        ?.addTo(mapRef.current);

      markersRef.current?.push(marker);
    });
  }, [fields]);

  // Mover el mapa si se selecciona un concierto
  useEffect(() => {
    if (!mapRef.current || !selectedField) return;
    mapRef.current?.flyTo({
      center: [selectedField.location.long, selectedField.location.lat],
      zoom: 15,
      essential: true,
    });
  }, [selectedField]);

  return (
    <div className="map-container">
      <div ref={mapContainerRef} className="mapbox-map" />
    </div>
  );
};

export default MapComponent;
