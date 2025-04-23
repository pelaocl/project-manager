import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// @ts-ignore
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import iconUrl from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Configurar icono por defecto globalmente
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Props futuras: geometry (punto/polígono), readOnly, etc.
interface ProjectMapProps {
    // Por ahora sin props específicas
    // position?: L.LatLngExpression; // Ejemplo futuro
    // polygon?: L.LatLngExpression[]; // Ejemplo futuro
}

const ProjectMap: React.FC<ProjectMapProps> = ({ /* props futuras aquí */ }) => {
    // Coordenadas aproximadas de Concepción Centro
    const defaultPosition: L.LatLngExpression = [-36.827, -73.050]; // Lat, Lon
    const mapCenter = defaultPosition; // Usar default por ahora
    const zoomLevel = 14;

    // NOTA: Este mapa es un placeholder. Cuando los campos de geometría
    // se restauren en la base de datos y la API, se deberán pasar las props
    // 'position' o 'polygon' a este componente para mostrar la ubicación real
    // del proyecto y centrar el mapa adecuadamente.

    return (
        <MapContainer center={mapCenter} zoom={zoomLevel} scrollWheelZoom={false} style={{ height: '400px', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/*
            // Lógica futura para mostrar marcador o polígono:
            {position && (
                <Marker position={position}>
                    <Popup>Ubicación del Proyecto</Popup>
                </Marker>
            )}
            {polygon && (
                <Polygon positions={polygon} pathOptions={{ color: 'blue' }} />
            )}
            */}
        </MapContainer>
    );
};

export default ProjectMap;