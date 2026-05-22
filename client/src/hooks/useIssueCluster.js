import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useIssueCluster } from '../hooks/useIssueCluster';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const CATEGORY_CONFIG = {
  pothole: { color: '#EF4444', icon: 'road', label: 'Pothole' },
  water:   { color: '#3B82F6', icon: 'water_drop', label: 'Water' },
  power:   { color: '#F59E0B', icon: 'bolt', label: 'Power' },
  sewage:  { color: '#8B5CF6', icon: 'warning', label: 'Sewage' },
  other:   { color: '#6B7280', icon: 'flag', label: 'Other' },
};

const STATUS_CONFIG = {
  submitted:    { color: 'bg-gray-500', label: 'Submitted' },
  under_review: { color: 'bg-yellow-500', label: 'Under Review' },
  escalated_l1: { color: 'bg-orange-500', label: 'Escalated' },
  escalated_l2: { color: 'bg-red-500', label: 'Critical' },
  resolved:     { color: 'bg-green-500', label: 'Resolved' },
};

function createColoredIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
      background: ${color}; border: 3px solid white;
      transform: rotate(-45deg); box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

function createClusterIcon(count, color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 40px; height: 40px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      font-weight: bold; font-size: 13px; color: white;
      font-family: Inter, sans-serif;
    ">${count}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

// Component that tracks map viewport and zoom
function MapEventHandler({ onViewportChange }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onViewportChange({
        bounds: {
          west: bounds.getWest(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          north: bounds.getNorth(),
        },
        zoom: map.getZoom(),
      });
    },
    zoomend: () => {
      const bounds = map.getBounds();
      onViewportChange({
        bounds: {
          west: bounds.getWest(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          north: bounds.getNorth(),
        },
        zoom: map.getZoom(),
      });
    },
  });
  return null;
}

function MapThemeLayer({ isDark }) {
  const map = useMap();
  useEffect(() => { map.invalidateSize(); }, [isDark, map]);
  return null;
}

export default function MapPage() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [viewport, setViewport] = useState({
    bounds: { west: 66.9, south: 24.8, east: 67.1, north: 24.9 },
    zoom: 13,
  });
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => { fetchIssues(); }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/issues');
      setIssues(res.data);
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleViewportChange = useCallback(({ bounds, zoom }) => {
    setViewport({ bounds, zoom });
  }, []);

  // Filter issues based on selected filters
  const filteredIssues = issues.filter((issue) => {
    const categoryMatch = selectedCategory === 'all' || issue.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || issue.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  // Use Supercluster hook for client-side clustering
  const { clusters, getClusterExpansionZoom } = useIssueCluster(
    filteredIssues,
    viewport.bounds,
    viewport.zoom
  );

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="h-screen flex flex-col bg-white dark:bg-[#0b1326] transition-colors duration-300">

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; }
          .leaflet-container { height: 100%; width: 100%; }
          .custom-popup .leaflet-popup-content-wrapper { background: ${isDark ? '#171f33' : '#ffffff'}; color: ${isDark ? '#dae2fd' : '#1b1b1d'}; border: 1px solid ${isDark ? '#424754' : '#e5e7eb'}; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
          .custom-popup .leaflet-popup-tip { background: ${isDark ? '#171f33' : '#ffffff'}; }
          .custom-popup .leaflet-popup-close-button { color: ${isDark ? '#c2c6d6' : '#6b7280'}; }
        `}</style>

        {/* NAVBAR */}
        <header className="flex-shrink-0 bg-white/90 dark:bg-[#0b1326]/90 border-b border-gray-200 dark:border-[#424754] backdrop-blur-md z-50">
          <nav className="flex justify-between items-center px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors">
                <span className="material-symbols-outlined text-gray-600 dark:text-[#c2c6d6]">{sidebarOpen ? 'menu_open' : 'menu'}</span>
              </button>
              <Link to="/" className="flex items-center gap-2">
                <div className="h-7 w-7 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[16px]">location_city</span>
                </div>
                <span className="font-bold text-blue-500 hidden sm:block" style={{ fontFamily: 'Hanken Grotesk' }}>CivicPulse</span>
              </Link>
            </div>

            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                <input type="text" placeholder="Search issues..."
                  className="w-full bg-gray-100 dark:bg-[#171f33] border border-gray-200 dark:border-[#424754] rounded-xl pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-[#dae2fd] placeholder-gray-400 focus:border-blue-500 outline-none transition-colors" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-lg border border-gray-200 dark:border-[#424754] hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors">
                <span className="material-symbols-outlined text-gray-600 dark:text-[#c2c6d6] text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
              </button>
              {user ? (
                <>
                  <Link to="/report" className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span className="hidden sm:block">Report Issue</span>
                  </Link>
                  <div className="flex items-center gap-2 ml-1">
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <button onClick={handleLogout} className="text-xs text-gray-500 dark:text-[#c2c6d6] hover:text-red-500 transition-colors hidden sm:block">Logout</button>
                  </div>
                </>
              ) : (
                <Link to="/login" className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all">Login</Link>
              )}
            </div>
          </nav>
        </header>

        {/* MAIN CONTENT */}
        <div className="flex flex-1 overflow-hidden">

          {/* SIDEBAR */}
          {sidebarOpen && (
            <aside className="w-80 flex-shrink-0 bg-white dark:bg-[#0f1729] border-r border-gray-200 dark:border-[#424754] flex flex-col overflow-hidden z-40">
              <div className="p-4 border-b border-gray-200 dark:border-[#424754]">
                <h3 className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] mb-3" style={{ fontFamily: 'Hanken Grotesk' }}>Filter by Category</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-[#1e293b] text-gray-600 dark:text-[#c2c6d6]'}`}>All</button>
                  {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
                    <button key={key} onClick={() => setSelectedCategory(key)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedCategory === key ? 'text-white' : 'bg-gray-100 dark:bg-[#1e293b] text-gray-600 dark:text-[#c2c6d6]'}`}
                      style={selectedCategory === key ? { backgroundColor: val.color } : {}}>
                      {val.label}
                    </button>
                  ))}
                </div>

                <h3 className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] mb-3 mt-4" style={{ fontFamily: 'Hanken Grotesk' }}>Filter by Status</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedStatus('all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-[#1e293b] text-gray-600 dark:text-[#c2c6d6]'}`}>All</button>
                  {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                    <button key={key} onClick={() => setSelectedStatus(key)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedStatus === key ? `${val.color} text-white` : 'bg-gray-100 dark:bg-[#1e293b] text-gray-600 dark:text-[#c2c6d6]'}`}>
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-[#dae2fd]" style={{ fontFamily: 'Hanken Grotesk' }}>
                    Issues ({filteredIssues.length})
                  </h3>
                  <button onClick={fetchIssues} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">refresh</span>Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <span className="material-symbols-outlined animate-spin text-blue-500 text-[32px]">progress_activity</span>
                  </div>
                ) : filteredIssues.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-gray-300 dark:text-[#424754] text-[48px] block mb-3">location_off</span>
                    <p className="text-sm text-gray-500 dark:text-[#c2c6d6]">No issues found</p>
                  </div>
                ) : (
                  filteredIssues.map((issue) => (
                    <div key={issue.id} onClick={() => setSelectedIssue(issue)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedIssue?.id === issue.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-[#424754] bg-white dark:bg-[#171f33] hover:border-blue-300'}`}>
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: CATEGORY_CONFIG[issue.category]?.color + '20' }}>
                          <span className="material-symbols-outlined text-[16px]" style={{ color: CATEGORY_CONFIG[issue.category]?.color }}>
                            {CATEGORY_CONFIG[issue.category]?.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-[#dae2fd] truncate">{issue.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex h-2 w-2 rounded-full ${STATUS_CONFIG[issue.status]?.color}`}></span>
                            <span className="text-xs text-gray-500 dark:text-[#c2c6d6]">{STATUS_CONFIG[issue.status]?.label}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">thumb_up</span>
                              {issue.upvote_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {user && (
                <div className="p-4 border-t border-gray-200 dark:border-[#424754]">
                  <Link to="/report" className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all">
                    <span className="material-symbols-outlined text-[18px]">add_location</span>
                    Report New Issue
                  </Link>
                </div>
              )}
            </aside>
          )}

          {/* MAP */}
          <div className="flex-1 relative">
            <MapContainer center={[24.8607, 67.0011]} zoom={13}
              style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url={tileUrl}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>' />
              <MapThemeLayer isDark={isDark} />
              <MapEventHandler onViewportChange={handleViewportChange} />

              {/* Render clusters and individual markers */}
              {clusters.map((cluster) => {
                const [lng, lat] = cluster.geometry.coordinates;
                const isCluster = cluster.properties.cluster;

                if (isCluster) {
                  // Render cluster bubble
                  const { point_count, dominant_category } = cluster.properties;
                  const color = CATEGORY_CONFIG[dominant_category]?.color || '#3B82F6';
                  return (
                    <Marker
                      key={`cluster-${cluster.id}`}
                      position={[lat, lng]}
                      icon={createClusterIcon(point_count, color)}
                      eventHandlers={{
                        click: () => {
                          const expansionZoom = getClusterExpansionZoom(cluster.id);
                          // zoom into cluster on click
                        }
                      }}
                    >
                      <Popup className="custom-popup">
                        <div className="p-1">
                          <p className="font-bold text-sm">{point_count} Issues in this area</p>
                          <p className="text-xs text-gray-500 mt-1">Zoom in to see individual issues</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                }

                // Render individual issue marker
                const issue = cluster.properties;
                return (
                  <Marker
                    key={issue.id}
                    position={[lat, lng]}
                    icon={createColoredIcon(CATEGORY_CONFIG[issue.category]?.color || '#6B7280')}
                    eventHandlers={{ click: () => setSelectedIssue(issue) }}
                  >
                    <Popup className="custom-popup">
                      <div className="p-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-[14px]"
                            style={{ color: CATEGORY_CONFIG[issue.category]?.color }}>
                            {CATEGORY_CONFIG[issue.category]?.icon}
                          </span>
                          <span className="text-xs font-medium" style={{ color: CATEGORY_CONFIG[issue.category]?.color }}>
                            {CATEGORY_CONFIG[issue.category]?.label}
                          </span>
                        </div>
                        <p className="font-bold text-sm mb-1">{issue.title}</p>
                        <Link to={`/issues/${issue.id}`}
                          className="text-xs text-blue-500 font-medium hover:underline flex items-center gap-1">
                          View details <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Legend */}
            <div className="absolute bottom-6 right-4 z-50 bg-white/90 dark:bg-[#171f33]/90 backdrop-blur-md border border-gray-200 dark:border-[#424754] rounded-xl p-3 shadow-lg">
              <div className="flex items-center gap-4">
                {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: val.color }}></div>
                    <span className="text-xs text-gray-500 dark:text-[#c2c6d6]">{val.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}