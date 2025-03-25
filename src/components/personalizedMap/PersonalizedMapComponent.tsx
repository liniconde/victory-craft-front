import { useEffect, useRef, useState } from "react";
import mapboxgl, { LngLatLike, MapMouseEvent } from "mapbox-gl";
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

const PersonalizedMapComponent: React.FC<Props> = ({
  selectedLocation,
  setSelectedLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [center] = useState(INITIAL_CENTER);
  const [zoom] = useState(INITIAL_ZOOM);

  console.log("MapToken ->", mapboxgl.accessToken, mapboxToken);

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

      // 📌 Escuchar clics en el mapa y actualizar la ubicación
      mapRef.current.on("click", (e: MapMouseEvent) => {
        const newLocation = {
          lat: e.lngLat.lat,
          long: e.lngLat.lng,
          name: "Campo nueva",
        };
        setSelectedLocation(newLocation);

        // 📌 Mueve el marcador a la nueva ubicación
        if (markerRef.current) {
          markerRef.current.setLngLat([newLocation.long, newLocation.lat]);
        } else {
          markerRef.current = new mapboxgl.Marker({ color: "red" })
            .setLngLat([newLocation.long, newLocation.lat])
            .setPopup(new mapboxgl.Popup().setText(newLocation.name))
            .addTo(mapRef.current!);
        }

        // 📌 Hacer zoom hacia la nueva ubicación
        mapRef.current?.flyTo({
          center: [newLocation.long, newLocation.lat],
          zoom: 15,
        });
      });
    }
  }, []);

  // 📌 Si `selectedLocation` cambia, actualizar el marcador
  useEffect(() => {
    if (
      !mapRef.current ||
      !selectedLocation ||
      !selectedLocation.lat ||
      !selectedLocation.long
    )
      return;

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ color: "red" })
        .setLngLat([selectedLocation.long, selectedLocation.lat])
        .setPopup(new mapboxgl.Popup().setText(selectedLocation.name))
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat([
        selectedLocation.long,
        selectedLocation.lat,
      ]);
      markerRef.current.getPopup()?.setText(selectedLocation.name);
    }

    mapRef.current?.flyTo({
      center: [selectedLocation.long, selectedLocation.lat],
      zoom: 15,
      essential: true,
    });
  }, [selectedLocation]);

  return (
    <div className="map-container">
      <div ref={mapContainerRef} className="mapbox-map" />
    </div>
  );
};

export default PersonalizedMapComponent;
