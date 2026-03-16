import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Governorate centers (lat, lng) and data layers – Oman
const GOVERNORATES = [
  { name: 'Muscat', lat: 23.588, lng: 58.383, pop: 1.45, gdp: 10.84, employed: 612, literacy: 98.2 },
  { name: 'Dhofar', lat: 17.015, lng: 54.092, pop: 0.42, gdp: 2.82, employed: 178, literacy: 94.8 },
  { name: 'Al Batinah North', lat: 24.347, lng: 56.708, pop: 0.73, gdp: 4.26, employed: 318, literacy: 96.1 },
  { name: 'Al Batinah South', lat: 23.9, lng: 57.4, pop: 0.52, gdp: 2.82, employed: 228, literacy: 95.2 },
  { name: 'Al Sharqiyah North', lat: 22.5, lng: 58.5, pop: 0.28, gdp: 1.58, employed: 128, literacy: 93.4 },
  { name: 'Al Sharqiyah South', lat: 22.0, lng: 59.2, pop: 0.22, gdp: 1.1, employed: 96, literacy: 91.2 },
  { name: 'Al Dakhiliyah', lat: 22.933, lng: 57.533, pop: 0.42, gdp: 2.46, employed: 188, literacy: 95.8 },
  { name: 'Al Dhahirah', lat: 23.2, lng: 56.5, pop: 0.21, gdp: 1.24, employed: 96, literacy: 94.1 },
  { name: 'Musandam', lat: 26.2, lng: 56.24, pop: 0.05, gdp: 0.26, employed: 22, literacy: 89.4 },
  { name: 'Al Buraimi', lat: 24.25, lng: 55.79, pop: 0.12, gdp: 0.66, employed: 52, literacy: 92.6 },
];

const OMAN_CENTER = [21.4735, 55.9754];
const DEFAULT_ZOOM = 6;

const DATA_LAYERS = [
  { id: 'pop', label: 'Population', key: 'pop', unit: 'M', format: (v) => `${v}M` },
  { id: 'gdp', label: 'GDP', key: 'gdp', unit: 'B OMR', format: (v) => `${v}B` },
  { id: 'employed', label: 'Employed', key: 'employed', unit: 'k', format: (v) => `${v}k` },
  { id: 'literacy', label: 'Literacy %', key: 'literacy', unit: '%', format: (v) => `${v}%` },
];

export default function OmanMap({ regions = GOVERNORATES, title, summary, className = '', interactive = true, onRegionClick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedLayer, setSelectedLayer] = useState('pop');
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const hasMultipleLayers = regions.some((r) => r.gdp != null || r.employed != null || r.literacy != null);
  const layerConfig = DATA_LAYERS.find((l) => l.id === selectedLayer) || DATA_LAYERS[0];
  const displayRegions = regions.map((r) => ({
    ...r,
    value: r[layerConfig.key] ?? r.pop,
  }));

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: OMAN_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© NCSI Smart Portal',
    }).addTo(map);

    const icon = L.divIcon({
      className: 'om-marker',
      html: `<span class="om-marker-dot"></span>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const markers = displayRegions.map((r) => {
      const m = L.marker([r.lat, r.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:system-ui;min-width:160px;">
            <div style="font-weight:600;color:#161616;margin-bottom:6px;">${r.name}</div>
            <div style="font-size:12px;color:#64748b;">${layerConfig.label}: <strong>${layerConfig.format(r.value)}</strong></div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Click for details · NCSI data</div>
          </div>`
        );
      if (interactive) {
        m.on('click', () => {
          setSelectedRegion(r);
          onRegionClick?.(r);
        });
        m.on('mouseover', () => setHoveredRegion(r.name));
        m.on('mouseout', () => setHoveredRegion(null));
      }
      return m;
    });
    markersRef.current = markers;
    mapRef.current = map;

    return () => {
      markers.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update popup content when layer changes
  useEffect(() => {
    if (!mapRef.current || !markersRef.current.length) return;
    displayRegions.forEach((r, i) => {
      const m = markersRef.current[i];
      if (m) {
        m.setPopupContent(
          `<div style="font-family:system-ui;min-width:160px;">
            <div style="font-weight:600;color:#161616;margin-bottom:6px;">${r.name}</div>
            <div style="font-size:12px;color:#64748b;">${layerConfig.label}: <strong>${layerConfig.format(r.value)}</strong></div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Click for details · NCSI data</div>
          </div>`
        );
      }
    });
  }, [selectedLayer, layerConfig, displayRegions]);

  return (
    <div className={`space-y-3 ${className}`}>
      {title && <p className="font-display text-base font-semibold text-[#161616]">{title}</p>}
      {interactive && hasMultipleLayers && (
        <div className="flex flex-wrap gap-2">
          {DATA_LAYERS.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => setSelectedLayer(layer.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedLayer === layer.id
                  ? 'bg-portal-blue text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-portal-blue/50 hover:bg-portal-ai-bg/50 hover:text-portal-blue'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      )}
      <div className="rounded-xl border border-portal-border/80 overflow-hidden bg-white shadow-sm">
        <div ref={containerRef} className="h-[300px] w-full min-w-[320px]" />
      </div>
      <div className="rounded-lg border border-portal-border/60 bg-portal-bg-section/50 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-portal-gray mb-1.5">
          {layerConfig.label} by governorate ({layerConfig.unit})
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#161616]">
          {displayRegions.map((r) => (
            <span
              key={r.name}
              className={`transition-colors ${
                hoveredRegion === r.name || selectedRegion?.name === r.name ? 'text-portal-blue font-semibold' : ''
              }`}
            >
              <strong>{r.name}</strong> {layerConfig.format(r.value)}
            </span>
          ))}
        </div>
      </div>
      {selectedRegion && interactive && (
        <div className="rounded-xl border border-portal-blue/30 bg-portal-ai-bg/50 p-3">
          <p className="text-xs font-semibold text-portal-blue">Selected: {selectedRegion.name}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
            {DATA_LAYERS.map((l) => (
              <span key={l.id}>
                {l.label}: <strong>{l.format(selectedRegion[l.key] ?? selectedRegion.pop)}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
      {summary && <p className="text-sm text-portal-gray-muted">{summary}</p>}
      <style>{`
        .om-marker { background: none !important; border: none !important; cursor: pointer; }
        .om-marker-dot {
          display: block;
          width: 24px; height: 24px; border-radius: 50%;
          background: #005287;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .om-marker:hover .om-marker-dot {
          background: #a624d2;
          transform: scale(1.2);
        }
        .leaflet-popup-content-wrapper { border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .leaflet-popup-content { margin: 10px 14px; }
      `}</style>
    </div>
  );
}
