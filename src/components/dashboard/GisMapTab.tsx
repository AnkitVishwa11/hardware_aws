import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { SensorData, SurfaceMeshNode } from '../../types/sensor';
import { 
  MapPin, 
  Layers, 
  Radio, 
  Compass, 
  Satellite, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Zap,
  Info,
  Navigation,
  Crosshair
} from 'lucide-react';

// Custom Map Marker Icons using Leaflet DivIcon
const createRoverIcon = (heading: number = 0, isWarning: boolean = false) => {
  return L.divIcon({
    className: 'custom-rover-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${isWarning ? 'rgba(217, 119, 6, 0.25)' : 'rgba(2, 132, 199, 0.25)'}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 28px; height: 28px; border-radius: 50%; background: #ffffff; border: 3px solid ${isWarning ? '#d97706' : '#0284c7'}; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
          <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 10px solid ${isWarning ? '#d97706' : '#0284c7'}; margin-top: -2px;"></div>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const createMeshNodeIcon = (role: string, status: string) => {
  let color = '#059669'; // green
  if (status === 'WARNING') color = '#d97706'; // amber
  if (status === 'CRITICAL') color = '#dc2626'; // red
  if (role === 'GATEWAY') color = '#7c3aed'; // purple

  return L.divIcon({
    className: 'custom-node-marker',
    html: `
      <div style="width: 24px; height: 24px; border-radius: 50%; background: #ffffff; border: 2.5px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

export interface GisMapTabProps {
  currentData: SensorData | null;
  history: SensorData[];
  roverId: string;
  isDemo?: boolean;
}

export const GisMapTab: React.FC<GisMapTabProps> = ({
  currentData,
  history,
  roverId,
  isDemo = false
}) => {
  // Base geographic coordinates for Indian Coal Mining Panel (e.g. Jharia Coalfield, Jharkhand: 23.75° N, 86.42° E)
  const defaultLat = 23.7524;
  const defaultLng = 86.4218;

  const roverLat = currentData?.latitude ?? (defaultLat + 0.0012);
  const roverLng = currentData?.longitude ?? (defaultLng + 0.0008);
  const roverHeading = currentData?.heading ?? 45;
  const satellites = currentData?.satellites ?? 9;
  const altitude = currentData?.altitude ?? 184.5;

  const [selectedNode, setSelectedNode] = useState<SurfaceMeshNode | null>(null);
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite' | 'dark'>('street');
  const [showRiskZones, setShowRiskZones] = useState<boolean>(true);
  const [showMeshLinks, setShowMeshLinks] = useState<boolean>(true);

  // Surface Mesh Anchor Nodes deployed across the mining block
  const surfaceMeshNodes: SurfaceMeshNode[] = [
    {
      id: 'NODE-01',
      node_name: 'Surface Mesh Anchor 01 (North East)',
      role: 'SURFACE_ANCHOR',
      latitude: defaultLat + 0.0035,
      longitude: defaultLng + 0.0030,
      altitude: 188.2,
      distance_to_ground_cm: 22.1,
      tilt_deg: 0.8,
      vibration_rms: 0.08,
      gas_adc: 390,
      battery_pct: 92,
      rssi_dbm: -68,
      mesh_hops: 1,
      parent_node_id: 'GATEWAY-01',
      last_packet_time: '2s ago',
      status: 'STABLE'
    },
    {
      id: 'NODE-02',
      node_name: 'Surface Mesh Anchor 02 (Crosscut 4)',
      role: 'SURFACE_ANCHOR',
      latitude: defaultLat + 0.0022,
      longitude: defaultLng - 0.0025,
      altitude: 185.7,
      distance_to_ground_cm: 19.4,
      tilt_deg: 3.4,
      vibration_rms: 0.28,
      gas_adc: 480,
      battery_pct: 84,
      rssi_dbm: -74,
      mesh_hops: 2,
      parent_node_id: 'NODE-01',
      last_packet_time: '4s ago',
      status: 'WARNING'
    },
    {
      id: 'NODE-03',
      node_name: 'Surface Mesh Anchor 03 (Goaf Boundary)',
      role: 'SURFACE_ANCHOR',
      latitude: defaultLat - 0.0028,
      longitude: defaultLng - 0.0018,
      altitude: 182.1,
      distance_to_ground_cm: 16.2,
      tilt_deg: 6.8,
      vibration_rms: 0.52,
      gas_adc: 620,
      battery_pct: 79,
      rssi_dbm: -81,
      mesh_hops: 2,
      parent_node_id: 'NODE-04',
      last_packet_time: '1s ago',
      status: 'CRITICAL'
    },
    {
      id: 'NODE-04',
      node_name: 'Surface Mesh Anchor 04 (South Entry)',
      role: 'SURFACE_ANCHOR',
      latitude: defaultLat - 0.0032,
      longitude: defaultLng + 0.0028,
      altitude: 186.0,
      distance_to_ground_cm: 21.9,
      tilt_deg: 1.1,
      vibration_rms: 0.11,
      gas_adc: 410,
      battery_pct: 95,
      rssi_dbm: -65,
      mesh_hops: 1,
      parent_node_id: 'GATEWAY-01',
      last_packet_time: '3s ago',
      status: 'STABLE'
    },
    {
      id: 'GATEWAY-01',
      node_name: 'Base Gateway Station (Control Room Uplink)',
      role: 'GATEWAY',
      latitude: defaultLat + 0.0002,
      longitude: defaultLng + 0.0045,
      altitude: 192.0,
      distance_to_ground_cm: 22.0,
      tilt_deg: 0.2,
      vibration_rms: 0.03,
      gas_adc: 370,
      battery_pct: 100,
      rssi_dbm: -42,
      mesh_hops: 0,
      last_packet_time: 'Live',
      status: 'STABLE'
    }
  ];

  // Underground Mine Panel P-4B Boundary Polygon
  const miningPanelPolygon: [number, number][] = [
    [defaultLat + 0.0045, defaultLng - 0.0035],
    [defaultLat + 0.0048, defaultLng + 0.0048],
    [defaultLat - 0.0042, defaultLng + 0.0052],
    [defaultLat - 0.0045, defaultLng - 0.0038]
  ];

  // Tile layer URL map
  const tileUrls = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };

  return (
    <div className="space-y-3">
      {/* Top GPS Telemetry Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-amber-50 text-amber-600 border border-amber-100">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-xs sm:text-sm">GIS Surface Mesh & Mine Subsidence Map</span>
            <span className="text-slate-500 text-[10px] sm:text-[11px]">Jharia Coalfield Sector • Panel P-4B Subsurface Void</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 flex items-center gap-1 text-[11px]">
            <Satellite className="h-3 w-3 text-sky-600" />
            <span className="text-slate-500">Sats:</span>
            <span className="text-emerald-700 font-bold">{satellites} Lock</span>
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 flex items-center gap-1 text-[11px]">
            <Crosshair className="h-3 w-3 text-amber-600" />
            <span className="text-slate-500">GPS:</span>
            <span className="text-slate-900 font-bold">{roverLat.toFixed(4)}°N, {roverLng.toFixed(4)}°E</span>
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 flex items-center gap-1 text-[11px]">
            <Navigation className="h-3 w-3 text-emerald-600" />
            <span className="text-slate-500">Alt:</span>
            <span className="text-slate-900 font-bold">{altitude.toFixed(1)} m</span>
          </div>
        </div>
      </div>

      {/* Map Control Bar & Map Container */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left Map View (8 cols) */}
        <div className="xl:col-span-8 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5">
          {/* Map Layer Switcher & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 pb-2 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-semibold text-[11px]">Style:</span>
              <div className="inline-flex rounded-md bg-slate-100 p-0.5 border border-slate-200">
                <button
                  onClick={() => setMapLayer('street')}
                  className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${mapLayer === 'street' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Street
                </button>
                <button
                  onClick={() => setMapLayer('satellite')}
                  className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${mapLayer === 'satellite' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Satellite
                </button>
                <button
                  onClick={() => setMapLayer('dark')}
                  className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${mapLayer === 'dark' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Dark SCADA
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <label className="flex items-center gap-1 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={showRiskZones}
                  onChange={(e) => setShowRiskZones(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-0"
                />
                <span>Risk Zones</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={showMeshLinks}
                  onChange={(e) => setShowMeshLinks(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-0"
                />
                <span>Mesh Links</span>
              </label>
            </div>
          </div>

          {/* Interactive Leaflet Map Container */}
          <div className="relative h-[360px] sm:h-[390px] w-full rounded-lg overflow-hidden border border-slate-200">
            <MapContainer
              center={[defaultLat, defaultLng]}
              zoom={16}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url={tileUrls[mapLayer]}
              />

              {/* Underground Mining Panel Perimeter Boundary */}
              <Polygon
                positions={miningPanelPolygon}
                pathOptions={{
                  color: '#0284c7',
                  weight: 2.5,
                  dashArray: '6, 6',
                  fillColor: '#0284c7',
                  fillOpacity: 0.08
                }}
              >
                <Tooltip sticky>
                  <div className="font-mono text-xs">
                    <strong>Underground Panel P-4B Boundary</strong><br/>
                    Target Extraction Depth: 120m<br/>
                    Seam: VII/VIII Coal Seam
                  </div>
                </Tooltip>
              </Polygon>

              {/* Subsidence Risk Hazard Zones (Heatmap Circles) */}
              {showRiskZones && (
                <>
                  {/* Critical Sagging Zone near Goaf (South-West) */}
                  <Circle
                    center={[defaultLat - 0.0028, defaultLng - 0.0018]}
                    radius={160}
                    pathOptions={{
                      color: '#dc2626',
                      fillColor: '#dc2626',
                      fillOpacity: 0.35,
                      weight: 2
                    }}
                  >
                    <Tooltip sticky>
                      <span className="font-mono text-xs text-rose-700 font-bold">
                        ⚠️ CRITICAL HAZARD ZONE (Goaf Sag &gt; 5.5cm)
                      </span>
                    </Tooltip>
                  </Circle>

                  {/* Warning Zone near Crosscut 4 */}
                  <Circle
                    center={[defaultLat + 0.0022, defaultLng - 0.0025]}
                    radius={140}
                    pathOptions={{
                      color: '#d97706',
                      fillColor: '#d97706',
                      fillOpacity: 0.25,
                      weight: 1.5
                    }}
                  >
                    <Tooltip sticky>
                      <span className="font-mono text-xs text-amber-700 font-bold">
                        ⚡ WARNING ZONE (Moderate Ground Movement 2.5 - 4.0cm)
                      </span>
                    </Tooltip>
                  </Circle>

                  {/* Stable Zone near Entry */}
                  <Circle
                    center={[defaultLat + 0.0035, defaultLng + 0.0030]}
                    radius={150}
                    pathOptions={{
                      color: '#059669',
                      fillColor: '#059669',
                      fillOpacity: 0.15,
                      weight: 1
                    }}
                  >
                    <Tooltip sticky>
                      <span className="font-mono text-xs text-emerald-700 font-bold">
                        ✓ STABLE SURFACE ZONE (&lt; 1.0cm Movement)
                      </span>
                    </Tooltip>
                  </Circle>
                </>
              )}

              {/* Wireless Mesh Link Polylines */}
              {showMeshLinks && (
                <>
                  {/* Gateway to Node 1 */}
                  <Polyline
                    positions={[[defaultLat + 0.0002, defaultLng + 0.0045], [defaultLat + 0.0035, defaultLng + 0.0030]]}
                    pathOptions={{ color: '#7c3aed', weight: 2.5, dashArray: '4, 4', opacity: 0.8 }}
                  />
                  {/* Gateway to Node 4 */}
                  <Polyline
                    positions={[[defaultLat + 0.0002, defaultLng + 0.0045], [defaultLat - 0.0032, defaultLng + 0.0028]]}
                    pathOptions={{ color: '#7c3aed', weight: 2.5, dashArray: '4, 4', opacity: 0.8 }}
                  />
                  {/* Node 1 to Node 2 */}
                  <Polyline
                    positions={[[defaultLat + 0.0035, defaultLng + 0.0030], [defaultLat + 0.0022, defaultLng - 0.0025]]}
                    pathOptions={{ color: '#d97706', weight: 2.5, dashArray: '4, 4', opacity: 0.8 }}
                  />
                  {/* Node 4 to Node 3 */}
                  <Polyline
                    positions={[[defaultLat - 0.0032, defaultLng + 0.0028], [defaultLat - 0.0028, defaultLng - 0.0018]]}
                    pathOptions={{ color: '#dc2626', weight: 2.5, dashArray: '4, 4', opacity: 0.8 }}
                  />
                  {/* Node 2 to Rover */}
                  <Polyline
                    positions={[[defaultLat + 0.0022, defaultLng - 0.0025], [roverLat, roverLng]]}
                    pathOptions={{ color: '#0284c7', weight: 3, opacity: 0.9 }}
                  />
                </>
              )}

              {/* Surface Mesh Nodes Markers */}
              {surfaceMeshNodes.map((node) => (
                <Marker
                  key={node.id}
                  position={[node.latitude, node.longitude]}
                  icon={createMeshNodeIcon(node.role, node.status)}
                  eventHandlers={{
                    click: () => setSelectedNode(node)
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="font-mono text-xs p-1 space-y-1 text-slate-800">
                      <div className="font-bold text-slate-900 border-b pb-1 flex items-center justify-between">
                        <span>{node.id}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] text-white ${node.status === 'CRITICAL' ? 'bg-red-600' : node.status === 'WARNING' ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                          {node.status}
                        </span>
                      </div>
                      <div><strong>Location:</strong> {node.node_name}</div>
                      <div><strong>Distance:</strong> {node.distance_to_ground_cm} cm</div>
                      <div><strong>Tilt / Vib:</strong> {node.tilt_deg}° / {node.vibration_rms}g</div>
                      <div><strong>Gas ADC:</strong> {node.gas_adc}</div>
                      <div><strong>Mesh Hops:</strong> {node.mesh_hops} ({node.rssi_dbm} dBm)</div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Rover Live GPS Marker */}
              <Marker
                position={[roverLat, roverLng]}
                icon={createRoverIcon(roverHeading, (currentData?.distance_2 ?? 22.0) < 18.0)}
              >
                <Popup>
                  <div className="font-mono text-xs p-1 space-y-1 text-slate-800">
                    <div className="font-bold text-sky-700 border-b pb-1 flex items-center justify-between">
                      <span>🛰️ {roverId} (Mobile Rover)</span>
                      <span className="bg-sky-600 text-white px-1.5 py-0.2 rounded text-[10px]">LIVE</span>
                    </div>
                    <div><strong>Coordinates:</strong> {roverLat.toFixed(5)}°N, {roverLng.toFixed(5)}°E</div>
                    <div><strong>Ground Dist S2:</strong> {currentData?.distance_2 ?? 21.8} cm</div>
                    <div><strong>Tilt X / Y:</strong> {currentData?.tilt_x ?? 0.8}° / {currentData?.tilt_y ?? 0.5}°</div>
                    <div><strong>Gas Level:</strong> {currentData?.gas ?? 410} ADC</div>
                    <div><strong>Battery:</strong> {currentData?.battery_voltage ?? 12.4} V</div>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {/* Right Node Inspector & Mesh Diagnostics (4 cols) */}
        <div className="xl:col-span-4 space-y-4 font-mono text-xs">
          {/* Active Node Detail Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-purple-50 text-purple-600 border border-purple-100">
                  <Radio className="h-4 w-4" />
                </div>
                <h3 className="font-bold uppercase tracking-wider text-slate-900">
                  {selectedNode ? selectedNode.id : `${roverId} (Mobile Unit)`}
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                (selectedNode?.status ?? 'STABLE') === 'CRITICAL'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : (selectedNode?.status ?? 'STABLE') === 'WARNING'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {selectedNode ? selectedNode.status : 'ONLINE'}
              </span>
            </div>

            <div className="space-y-2.5 text-slate-700">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Node Designation:</span>
                <span className="font-semibold text-slate-900">{selectedNode?.node_name ?? 'Underground Mobile Inspection Unit'}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">GPS Coordinates:</span>
                <span className="text-amber-700 font-bold">
                  {selectedNode ? `${selectedNode.latitude.toFixed(5)}°N, ${selectedNode.longitude.toFixed(5)}°E` : `${roverLat.toFixed(5)}°N, ${roverLng.toFixed(5)}°E`}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Ground Sag / Clearance:</span>
                <span className="text-sky-700 font-bold">
                  {selectedNode ? `${selectedNode.distance_to_ground_cm} cm` : `${currentData?.distance_2 ?? 21.8} cm`}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Surface Tilt & Vibration:</span>
                <span className="text-slate-900 font-semibold">
                  {selectedNode ? `${selectedNode.tilt_deg}° | ${selectedNode.vibration_rms} g` : `${currentData?.tilt_x ?? 0.8}° | ${currentData?.vibration_rms ?? 0.12} g`}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Atmospheric Gas (ADC):</span>
                <span className="text-amber-700 font-bold">
                  {selectedNode ? `${selectedNode.gas_adc} ADC` : `${currentData?.gas ?? 412} ADC`}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Mesh Signal / Hops:</span>
                <span className="text-purple-700 font-bold">
                  {selectedNode ? `${selectedNode.rssi_dbm} dBm (${selectedNode.mesh_hops} Hops)` : '-68 dBm (1 Hop Uplink)'}
                </span>
              </div>
            </div>
          </div>

          {/* Mesh Network Summary Matrix */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Zap className="h-3.5 w-3.5 text-amber-600" />
              Surface Mesh Network Health
            </h4>

            <div className="space-y-2">
              {surfaceMeshNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    selectedNode?.id === node.id
                      ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/70'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{node.id}</span>
                      <span className="text-[10px] text-slate-500 font-normal">({node.role})</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Sag: {node.distance_to_ground_cm}cm • Tilt: {node.tilt_deg}°
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      node.status === 'CRITICAL' ? 'text-rose-700 bg-rose-50 border border-rose-200' : node.status === 'WARNING' ? 'text-amber-700 bg-amber-50 border border-amber-200' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    }`}>
                      {node.status}
                    </span>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">{node.rssi_dbm} dBm</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
