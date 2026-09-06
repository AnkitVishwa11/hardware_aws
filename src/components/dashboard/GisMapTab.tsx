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
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${isWarning ? 'rgba(245, 158, 11, 0.25)' : 'rgba(14, 165, 233, 0.25)'}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 26px; height: 26px; border-radius: 50%; background: #0c1222; border: 2.5px solid ${isWarning ? '#f59e0b' : '#38bdf8'}; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); box-shadow: 0 0 10px ${isWarning ? '#f59e0b' : '#38bdf8'};">
          <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 9px solid ${isWarning ? '#f59e0b' : '#38bdf8'}; margin-top: -2px;"></div>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const createMeshNodeIcon = (role: string, status: string) => {
  let color = '#10b981'; // green
  if (status === 'WARNING') color = '#f59e0b'; // amber
  if (status === 'CRITICAL') color = '#ef4444'; // red
  if (role === 'GATEWAY') color = '#a855f7'; // purple

  return L.divIcon({
    className: 'custom-node-marker',
    html: `
      <div style="width: 24px; height: 24px; border-radius: 50%; background: #0c1222; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px ${color};">
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
  const [mapLayer, setMapLayer] = useState<'dark' | 'satellite' | 'street'>('dark');
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
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1c2842] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-400" />
              GIS Surface Mesh & Mine Subsidence Map
            </h2>
            {isDemo && (
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-400 border border-amber-500/30">
                GPS TELEMETRY ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Geospatial surface sensor mesh deployment over Underground Panel P-4B (Jharia Coalfield Sector)
          </p>
        </div>

        {/* GPS Quick Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="rounded-lg bg-[#10192d] border border-[#1c2842] px-3 py-1.5 flex items-center gap-2">
            <Satellite className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-slate-400">GPS Sats:</span>
            <span className="text-emerald-400 font-bold">{satellites} Lock (3D Fix)</span>
          </div>

          <div className="rounded-lg bg-[#10192d] border border-[#1c2842] px-3 py-1.5 flex items-center gap-2">
            <Crosshair className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-slate-400">Coords:</span>
            <span className="text-white font-bold">{roverLat.toFixed(5)}°N, {roverLng.toFixed(5)}°E</span>
          </div>

          <div className="rounded-lg bg-[#10192d] border border-[#1c2842] px-3 py-1.5 flex items-center gap-2">
            <Navigation className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-400">Altitude:</span>
            <span className="text-white font-bold">{altitude.toFixed(1)} m AMSL</span>
          </div>
        </div>
      </div>

      {/* Map Control Bar & Map Container */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Map View (8 cols) */}
        <div className="xl:col-span-8 rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm space-y-3">
          {/* Map Layer Switcher & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c2842] pb-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Map Style:</span>
              <div className="inline-flex rounded-md bg-[#070a12] p-0.5 border border-[#1c2842]">
                <button
                  onClick={() => setMapLayer('dark')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${mapLayer === 'dark' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Dark SCADA
                </button>
                <button
                  onClick={() => setMapLayer('satellite')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${mapLayer === 'satellite' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Satellite Aerial
                </button>
                <button
                  onClick={() => setMapLayer('street')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${mapLayer === 'street' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  OpenStreetMap
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showRiskZones}
                  onChange={(e) => setShowRiskZones(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-400 focus:ring-0"
                />
                <span>Subsidence Risk Heatmap</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showMeshLinks}
                  onChange={(e) => setShowMeshLinks(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-400 focus:ring-0"
                />
                <span>Wireless Mesh Links</span>
              </label>
            </div>
          </div>

          {/* Interactive Leaflet Map Container */}
          <div className="relative h-[520px] w-full rounded-lg overflow-hidden border border-[#1c2842]">
            <MapContainer
              center={[defaultLat, defaultLng]}
              zoom={16}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CartoDB</a> | OpenStreetMap'
                url={tileUrls[mapLayer]}
              />

              {/* Underground Mining Panel Perimeter Boundary */}
              <Polygon
                positions={miningPanelPolygon}
                pathOptions={{
                  color: '#38bdf8',
                  weight: 2,
                  dashArray: '6, 6',
                  fillColor: '#38bdf8',
                  fillOpacity: 0.05
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
                      color: '#ef4444',
                      fillColor: '#ef4444',
                      fillOpacity: 0.35,
                      weight: 2
                    }}
                  >
                    <Tooltip sticky>
                      <span className="font-mono text-xs text-rose-400 font-bold">
                        ⚠️ CRITICAL HAZARD ZONE (Goaf Sag &gt; 5.5cm)
                      </span>
                    </Tooltip>
                  </Circle>

                  {/* Warning Zone near Crosscut 4 */}
                  <Circle
                    center={[defaultLat + 0.0022, defaultLng - 0.0025]}
                    radius={140}
                    pathOptions={{
                      color: '#f59e0b',
                      fillColor: '#f59e0b',
                      fillOpacity: 0.25,
                      weight: 1.5
                    }}
                  >
                    <Tooltip sticky>
                      <span className="font-mono text-xs text-amber-400 font-bold">
                        ⚡ WARNING ZONE (Moderate Ground Movement 2.5 - 4.0cm)
                      </span>
                    </Tooltip>
                  </Circle>

                  {/* Stable Zone near Entry */}
                  <Circle
                    center={[defaultLat + 0.0035, defaultLng + 0.0030]}
                    radius={150}
                    pathOptions={{
                      color: '#10b981',
                      fillColor: '#10b981',
                      fillOpacity: 0.15,
                      weight: 1
                    }}
                  >
                    <Tooltip sticky>
                      <span className="font-mono text-xs text-emerald-400 font-bold">
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
                    pathOptions={{ color: '#a855f7', weight: 2, dashArray: '4, 4', opacity: 0.7 }}
                  />
                  {/* Gateway to Node 4 */}
                  <Polyline
                    positions={[[defaultLat + 0.0002, defaultLng + 0.0045], [defaultLat - 0.0032, defaultLng + 0.0028]]}
                    pathOptions={{ color: '#a855f7', weight: 2, dashArray: '4, 4', opacity: 0.7 }}
                  />
                  {/* Node 1 to Node 2 */}
                  <Polyline
                    positions={[[defaultLat + 0.0035, defaultLng + 0.0030], [defaultLat + 0.0022, defaultLng - 0.0025]]}
                    pathOptions={{ color: '#f59e0b', weight: 2, dashArray: '4, 4', opacity: 0.7 }}
                  />
                  {/* Node 4 to Node 3 */}
                  <Polyline
                    positions={[[defaultLat - 0.0032, defaultLng + 0.0028], [defaultLat - 0.0028, defaultLng - 0.0018]]}
                    pathOptions={{ color: '#ef4444', weight: 2, dashArray: '4, 4', opacity: 0.7 }}
                  />
                  {/* Node 2 to Rover */}
                  <Polyline
                    positions={[[defaultLat + 0.0022, defaultLng - 0.0025], [roverLat, roverLng]]}
                    pathOptions={{ color: '#38bdf8', weight: 2, opacity: 0.8 }}
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
          <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#1c2842] pb-3">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-purple-400" />
                <h3 className="font-bold uppercase tracking-wider text-slate-200">
                  {selectedNode ? selectedNode.id : `${roverId} (Mobile Unit)`}
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                (selectedNode?.status ?? 'STABLE') === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : (selectedNode?.status ?? 'STABLE') === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {selectedNode ? selectedNode.status : 'ONLINE'}
              </span>
            </div>

            <div className="space-y-2.5 text-slate-300">
              <div className="flex justify-between border-b border-[#1c2842]/60 pb-1.5">
                <span className="text-slate-400">Node Designation:</span>
                <span className="font-semibold text-white">{selectedNode?.node_name ?? 'Underground Mobile Inspection Unit'}</span>
              </div>

              <div className="flex justify-between border-b border-[#1c2842]/60 pb-1.5">
                <span className="text-slate-400">GPS Coordinates:</span>
                <span className="text-amber-400 font-bold">
                  {selectedNode ? `${selectedNode.latitude.toFixed(5)}°N, ${selectedNode.longitude.toFixed(5)}°E` : `${roverLat.toFixed(5)}°N, ${roverLng.toFixed(5)}°E`}
                </span>
              </div>

              <div className="flex justify-between border-b border-[#1c2842]/60 pb-1.5">
                <span className="text-slate-400">Ground Sag / Clearance:</span>
                <span className="text-sky-400 font-bold">
                  {selectedNode ? `${selectedNode.distance_to_ground_cm} cm` : `${currentData?.distance_2 ?? 21.8} cm`}
                </span>
              </div>

              <div className="flex justify-between border-b border-[#1c2842]/60 pb-1.5">
                <span className="text-slate-400">Surface Tilt & Vibration:</span>
                <span className="text-white">
                  {selectedNode ? `${selectedNode.tilt_deg}° | ${selectedNode.vibration_rms} g` : `${currentData?.tilt_x ?? 0.8}° | ${currentData?.vibration_rms ?? 0.12} g`}
                </span>
              </div>

              <div className="flex justify-between border-b border-[#1c2842]/60 pb-1.5">
                <span className="text-slate-400">Atmospheric Gas (ADC):</span>
                <span className="text-amber-300 font-bold">
                  {selectedNode ? `${selectedNode.gas_adc} ADC` : `${currentData?.gas ?? 412} ADC`}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Mesh Signal / Hops:</span>
                <span className="text-purple-300 font-bold">
                  {selectedNode ? `${selectedNode.rssi_dbm} dBm (${selectedNode.mesh_hops} Hops)` : '-68 dBm (1 Hop Uplink)'}
                </span>
              </div>
            </div>
          </div>

          {/* Mesh Network Summary Matrix */}
          <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-[#1c2842] pb-2">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Surface Mesh Network Health
            </h4>

            <div className="space-y-2">
              {surfaceMeshNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    selectedNode?.id === node.id
                      ? 'border-amber-500 bg-[#070a12]'
                      : 'border-[#1c2842] bg-[#0c1222] hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{node.id}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({node.role})</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Sag: {node.distance_to_ground_cm}cm • Tilt: {node.tilt_deg}°
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      node.status === 'CRITICAL' ? 'text-rose-400 bg-rose-500/10' : node.status === 'WARNING' ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10'
                    }`}>
                      {node.status}
                    </span>
                    <div className="text-[10px] text-slate-500">{node.rssi_dbm} dBm</div>
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
