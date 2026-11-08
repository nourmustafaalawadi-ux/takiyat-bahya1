import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import './InteractiveMap.css';

const areaCoordinates = {
  'الرمال': [31.524, 34.456],
  'النصر': [31.526, 34.469],
  'الشاطئ': [31.535, 34.452],
  'الشيخ رضوان': [31.535, 34.484],
  'الجلاء': [31.517, 34.469],
};

function MapController({ selectedArea }) {
  const map = useMap();

  useEffect(() => {
    if (selectedArea && areaCoordinates[selectedArea]) {
      map.flyTo(areaCoordinates[selectedArea], 14, {
        duration: 1.5,
      });
    }
  }, [selectedArea, map]);

  return null;
}

export default function InteractiveMap({ selectedArea }) {
  return (
    <div className="interactive-map-wrapper">
      <MapContainer
        center={[31.5, 34.47]}
        zoom={12}
        scrollWheelZoom={true}
        className="interactive-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController selectedArea={selectedArea} />
      </MapContainer>
    </div>
  );
}