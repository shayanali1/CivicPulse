import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useToast } from '../components/Toast';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const CATEGORIES = [
  { value: 'pothole', label: 'Pothole', icon: 'road', color: '#EF4444' },
  { value: 'water', label: 'Water Issue', icon: 'water_drop', color: '#3B82F6' },
  { value: 'power', label: 'Power Outage', icon: 'bolt', color: '#F59E0B' },
  { value: 'sewage', label: 'Sewage', icon: 'warning', color: '#8B5CF6' },
  { value: 'other', label: 'Other', icon: 'flag', color: '#6B7280' },
];

function LocationPicker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function ReportPage() {
  const { isDark, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    photo: null,
    photoPreview: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const handleLocationSelect = (latlng) => {
    setLocation(latlng);
  };

  const handleNext = () => {
    if (step === 1 && !location) {
      setError('Please click on the map to select a location');
      return;
    }
    if (step === 2) {
      if (!formData.title) return setError('Title is required');
      if (!formData.category) return setError('Please select a category');
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('lat', location.lat);
      data.append('lng', location.lng);
      if (formData.photo) {
        data.append('photo', formData.photo);
      }

      await axios.post(
        'http://localhost:5000/api/issues',
        data,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      addToast('Issue reported successfully! 🎉', 'success');
      navigate('/map');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to submit issue', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b1326] transition-colors duration-300">

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; }
        `}</style>

        {/* NAVBAR */}
        <header className="bg-white/90 dark:bg-[#0b1326]/90 border-b border-gray-200 dark:border-[#424754] backdrop-blur-md">
          <nav className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
            <Link to="/map" className="flex items-center gap-2 text-gray-600 dark:text-[#c2c6d6] hover:text-blue-500 transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span className="text-sm font-medium">Back to Map</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[16px]">location_city</span>
              </div>
              <span className="font-bold text-blue-500" style={{ fontFamily: 'Hanken Grotesk' }}>CivicPulse</span>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-lg border border-gray-200 dark:border-[#424754] hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors">
              <span className="material-symbols-outlined text-gray-600 dark:text-[#c2c6d6] text-[20px]">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </nav>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#dae2fd] mb-2" style={{ fontFamily: 'Hanken Grotesk' }}>
              Report an Issue
            </h1>
            <p className="text-gray-500 dark:text-[#c2c6d6]">Help your community by reporting civic problems</p>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-center mb-10">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-[#1e293b] text-gray-400'}`}>
                    {step > s ? <span className="material-symbols-outlined text-[18px]">check</span> : s}
                  </div>
                  <span className="text-xs mt-1 text-gray-500 dark:text-[#c2c6d6]">
                    {s === 1 ? 'Location' : s === 2 ? 'Details' : 'Review'}
                  </span>
                </div>
                {s < 3 && (
                  <div className={`h-1 w-24 mx-2 mb-4 rounded transition-all ${step > s ? 'bg-blue-500' : 'bg-gray-200 dark:bg-[#1e293b]'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* STEP 1: Pick Location */}
          {step === 1 && (
            <div className="bg-white dark:bg-[#171f33] border border-gray-200 dark:border-[#424754] rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-[#424754]">
                <h2 className="text-lg font-bold text-gray-900 dark:text-[#dae2fd] flex items-center gap-2" style={{ fontFamily: 'Hanken Grotesk' }}>
                  <span className="material-symbols-outlined text-blue-500">add_location</span>
                  Step 1: Click on the map to pin the issue location
                </h2>
                {location && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Location selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                )}
              </div>
              <div style={{ height: '400px' }}>
                <MapContainer center={[24.8607, 67.0011]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={true}>
                  <TileLayer url={tileUrl} />
                  <LocationPicker onLocationSelect={handleLocationSelect} />
                </MapContainer>
              </div>
            </div>
          )}

          {/* STEP 2: Fill Details */}
          {step === 2 && (
            <div className="bg-white dark:bg-[#171f33] border border-gray-200 dark:border-[#424754] rounded-2xl p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-[#dae2fd] flex items-center gap-2" style={{ fontFamily: 'Hanken Grotesk' }}>
                <span className="material-symbols-outlined text-blue-500">edit_note</span>
                Step 2: Describe the issue
              </h2>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#c2c6d6] mb-2">Issue Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Large pothole on main street"
                  className="w-full bg-gray-50 dark:bg-[#0b1326] border border-gray-200 dark:border-[#424754] rounded-xl px-4 py-3 text-gray-900 dark:text-[#dae2fd] placeholder-gray-400 focus:border-blue-500 outline-none transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#c2c6d6] mb-3">Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.category === cat.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-[#424754] hover:border-gray-300 dark:hover:border-[#5a6070]'}`}
                    >
                      <span className="material-symbols-outlined text-[24px]" style={{ color: cat.color }}>{cat.icon}</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-[#c2c6d6]">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

             {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#c2c6d6] mb-2">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  className="w-full bg-gray-50 dark:bg-[#0b1326] border border-gray-200 dark:border-[#424754] rounded-xl px-4 py-3 text-gray-900 dark:text-[#dae2fd] placeholder-gray-400 focus:border-blue-500 outline-none transition-colors resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#c2c6d6] mb-2">
                  Photo (optional)
                </label>
                <div
                  onClick={() => document.getElementById('photo-upload').click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${formData.photoPreview ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-[#424754] hover:border-blue-400'}`}
                >
                  {formData.photoPreview ? (
                    <div className="relative">
                      <img src={formData.photoPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-cover" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, photo: null, photoPreview: null });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-gray-400 text-[48px] block mb-2">add_photo_alternate</span>
                      <p className="text-sm text-gray-500 dark:text-[#c2c6d6]">Click to upload a photo</p>
                      <p className="text-xs text-gray-400 mt-1">JPEG, PNG or WebP — max 5MB</p>
                    </>
                  )}
                </div>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData({
                        ...formData,
                        photo: file,
                        photoPreview: URL.createObjectURL(file)
                      });
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="bg-white dark:bg-[#171f33] border border-gray-200 dark:border-[#424754] rounded-2xl p-8 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-[#dae2fd] flex items-center gap-2" style={{ fontFamily: 'Hanken Grotesk' }}>
                <span className="material-symbols-outlined text-blue-500">fact_check</span>
                Step 3: Review and Submit
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-[#424754]">
                  <span className="text-sm text-gray-500 dark:text-[#c2c6d6]">Title</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-[#dae2fd]">{formData.title}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-[#424754]">
                  <span className="text-sm text-gray-500 dark:text-[#c2c6d6]">Category</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-[#dae2fd] capitalize">{formData.category}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-[#424754]">
                  <span className="text-sm text-gray-500 dark:text-[#c2c6d6]">Location</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-[#dae2fd]">
                    {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
                  </span>
                </div>
                {formData.description && (
                  <div className="py-3">
                    <span className="text-sm text-gray-500 dark:text-[#c2c6d6] block mb-1">Description</span>
                    <span className="text-sm text-gray-900 dark:text-[#dae2fd]">{formData.description}</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  Once submitted, your issue will be assigned to the relevant authority and tracked publicly.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-gray-200 dark:border-[#424754] rounded-xl text-gray-600 dark:text-[#c2c6d6] font-medium hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back
              </button>
            ) : (
              <Link to="/map" className="px-6 py-3 border border-gray-200 dark:border-[#424754] rounded-xl text-gray-600 dark:text-[#c2c6d6] font-medium hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">close</span>
                Cancel
              </Link>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:brightness-110 transition-all flex items-center gap-2"
              >
                Next
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-blue-500 text-white rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Submit Issue
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}