import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './InteractiveMap.css';

const areaCoordinates = {
  'الرمال': [31.524, 34.456],
  'النصر': [31.526, 34.469],
  'الشاطئ': [31.535, 34.452],
  'الشيخ رضوان': [31.535, 34.484],
  'الجلاء': [31.517, 34.469],
};

// إنشاء أيقونة مخصصة للتكية بحسب حالتها التشغيلية
function createKitchenIcon(status) {
  const colorMap = {
    open: '#26734D',
    closed: '#992B2B',
    paused: '#94651F',
    unknown: '#666666',
  };

  const color = colorMap[status] || colorMap.unknown;

  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #FFFFFF;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">🍲</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

function MapController({ selectedArea, kitchens }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedArea) return;

    // محاولة الطيران لأول تكية في هذه المنطقة
    const targetKitchen = kitchens?.find(
      (k) =>
        k.area_name === selectedArea &&
        k.latitude !== null &&
        k.longitude !== null &&
        !isNaN(Number(k.latitude)) &&
        !isNaN(Number(k.longitude))
    );

    if (targetKitchen) {
      map.flyTo([Number(targetKitchen.latitude), Number(targetKitchen.longitude)], 15, {
        duration: 1.5,
      });
    } else if (areaCoordinates[selectedArea]) {
      map.flyTo(areaCoordinates[selectedArea], 14, {
        duration: 1.5,
      });
    }
  }, [selectedArea, kitchens, map]);

  return null;
}

export default function InteractiveMap({ selectedArea, kitchens = [] }) {
  // تصفية وقائية للتكيات ذات الإحداثيات الصالحة فقط لحماية Leaflet من الانهيار
  const validKitchens = kitchens.filter(
    (k) =>
      k.latitude !== null &&
      k.longitude !== null &&
      k.latitude !== '' &&
      k.longitude !== '' &&
      !isNaN(Number(k.latitude)) &&
      !isNaN(Number(k.longitude))
  );

  return (
    <div className="interactive-map-wrapper">
      <MapContainer
        center={[31.52, 34.46]}
        zoom={12}
        scrollWheelZoom={false}
        className="interactive-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController selectedArea={selectedArea} kitchens={validKitchens} />

        {validKitchens.map((kitchen) => (
          <Marker
            key={kitchen.id}
            position={[Number(kitchen.latitude), Number(kitchen.longitude)]}
            icon={createKitchenIcon(kitchen.status)}
          >
            <Popup className="kitchen-popup" dir="rtl">
              <div className="map-popup-card">
                <h4>{kitchen.name}</h4>
                <span className="map-popup-area">📍 {kitchen.area_name}</span>

                {kitchen.address && (
                  <p className="map-popup-address">
                    <strong>العنوان:</strong> {kitchen.address}
                  </p>
                )}

                {kitchen.description && (
                  <p className="map-popup-desc">{kitchen.description}</p>
                )}

                {kitchen.phone && (
                  <p className="map-popup-phone">
                    <strong>الاتصال:</strong>{' '}
                    <a href={`tel:${kitchen.phone}`} dir="ltr">
                      {kitchen.phone} 📞
                    </a>
                  </p>
                )}

                <div className="map-popup-footer">
                  <span className={`kitchen-status ${kitchen.status || 'unknown'}`}>
                    {kitchen.status === 'open'
                      ? 'مفتوحة الآن'
                      : kitchen.status === 'closed'
                      ? 'مغلقة'
                      : kitchen.status === 'paused'
                      ? 'متوقفة مؤقتًا'
                      : 'الحالة غير محددة'}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
