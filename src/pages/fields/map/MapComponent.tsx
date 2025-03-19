import { useEffect, useRef, useState, useCallback } from "react";
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
  const markersRef = useRef<mapboxgl.Marker[]>([]); // Almacena los marcadores para limpiar después

  const [center, setCenter] = useState(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  // Inicializar el mapa solo una vez
  useEffect(() => {
    if (!mapboxToken) {
      console.error("Mapbox token missing.");
      return;
    }

    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/mapbox/streets-v11",
        center: center,
        zoom: zoom,
      });

      mapRef.current.on("move", () => {
        const mapCenter = mapRef.current?.getCenter();
        const mapZoom = mapRef.current?.getZoom();

        if (mapCenter && mapZoom) {
          setCenter([mapCenter.lng, mapCenter.lat]);
          setZoom(mapZoom);
        }
      });
    }
  }, []);

  // Función para agregar marcadores, memoizada para evitar repintados innecesarios
  const updateMarkers = useCallback(() => {
    if (!mapRef.current) return;

    // Eliminar marcadores existentes
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Agregar nuevos marcadores
    fields.forEach((field) => {
      if (!field.location || !field.location.lat || !field.location.long)
        return;

      const marker = new mapboxgl.Marker({ color: "red" })
        .setLngLat([field.location.long, field.location.lat])
        .setPopup(new mapboxgl.Popup().setText(field.name))
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [fields]);

  // Llamamos a `updateMarkers` solo cuando `fields` cambia
  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  // Mover el mapa si se selecciona una cancha
  useEffect(() => {
    if (mapRef.current && selectedField) {
      mapRef.current.flyTo({
        center: [selectedField.location.long, selectedField.location.lat],
        zoom: 15,
        essential: true,
      });
    }
  }, [selectedField]);

  return (
    <div className="map-container">
      <div ref={mapContainerRef} className="mapbox-map" />
    </div>
  );
};

export default MapComponent;
