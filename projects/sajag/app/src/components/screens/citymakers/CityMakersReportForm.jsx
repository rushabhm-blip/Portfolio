import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Send, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Navigation,
  AlertTriangle,
  Trash2,
  Droplets,
  Wind,
  Lightbulb,
  Trees,
  Plus,
  Image,
  FolderOpen,
  Crosshair,
  Maximize2,
  Minimize2,
  ChevronDown
} from 'lucide-react';

export default function CityMakersReportForm({ 
  initialCategory = { id: 'pothole', label: 'Pothole', icon: AlertTriangle, color: 'text-red-600' },
  onBack, 
  onSubmitSuccess 
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [photos, setPhotos] = useState([
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=300&auto=format&fit=crop&q=80'
  ]);
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [location, setLocation] = useState('Hauz Khas Main Road, Near Metro');
  const [mapCenter, setMapCenter] = useState([28.5585, 77.2065]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [title, setTitle] = useState('Large pothole near pedestrian crossing');
  const [description, setDescription] = useState('Deep crater on left lane causing severe traffic slowdown and hazard for two-wheelers.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapFullscreen, setMapFullscreen] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const allCategories = [
    { 
      id: 'pothole', 
      label: 'Pothole', 
      subtitle: 'Road Crater',
      icon: AlertTriangle
    },
    { 
      id: 'garbage', 
      label: 'Garbage', 
      subtitle: 'Waste / Litter',
      icon: Trash2
    },
    { 
      id: 'drainage', 
      label: 'Drainage', 
      subtitle: 'Waterlogging',
      icon: Droplets
    },
    { 
      id: 'smell', 
      label: 'Foul Smell', 
      subtitle: 'Air / Odor',
      icon: Wind
    },
    { 
      id: 'light', 
      label: 'Street Light', 
      subtitle: 'Broken / Dark',
      icon: Lightbulb
    },
    { 
      id: 'tree', 
      label: 'Tree / Plant', 
      subtitle: 'Hazard / Fallen',
      icon: Trees
    }
  ];

  const samplePhotos = [
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&auto=format&fit=crop&q=80'
  ];

  const handleAddPhotoFromCamera = () => {
    if (photos.length < 3) {
      setPhotos((prev) => [...prev, samplePhotos[prev.length % samplePhotos.length]]);
    }
    setPhotoPickerOpen(false);
  };

  const handleAddPhotoFromGallery = () => {
    if (photos.length < 3) {
      const galleryPhotos = [
        'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=300&auto=format&fit=crop&q=80'
      ];
      setPhotos((prev) => [...prev, galleryPhotos[prev.length % galleryPhotos.length]]);
    }
    setPhotoPickerOpen(false);
  };

  const handleRemovePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    const newCenter = [28.5585, 77.2065];
    setMapCenter(newCenter);
    setTimeout(() => {
      setLocation('28.5585° N, 77.2065° E (Near Green Park)');
      setIsDetectingLocation(false);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(newCenter, 16);
        if (markerRef.current) {
          markerRef.current.setLatLng(newCenter);
        }
      }
    }, 600);
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: mapCenter,
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    // Google Maps Streets Tiles (Clean, crisp, no API key required)
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Pin marker
    const pinIcon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:32px;height:42px;display:flex;align-items:flex-start;justify-content:center;">
          <div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:#155DFC;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(21,93,252,0.35);">
            <div style="width:12px;height:12px;border-radius:50%;background:white;transform:rotate(45deg);"></div>
          </div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:10px;height:4px;border-radius:50%;background:rgba(0,0,0,0.2);filter:blur(1px);"></div>
        </div>
      `,
      iconSize: [32, 42],
      iconAnchor: [16, 42]
    });

    const marker = L.marker(mapCenter, { icon: pinIcon, draggable: true }).addTo(map);
    markerRef.current = marker;

    // Update location on marker drag
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setMapCenter([pos.lat, pos.lng]);
      setLocation(`${pos.lat.toFixed(4)}° N, ${pos.lng.toFixed(4)}° E`);
    });

    // Update location on map click
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setMapCenter([lat, lng]);
      setLocation(`${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess({
        id: `ISS-${Math.floor(1000 + Math.random() * 9000)}`,
        category: selectedCategory,
        title,
        description,
        location,
        photos,
        reportedAt: 'Just now',
        status: 'Acknowledged',
        upvotes: 1,
        comments: 0
      });
    }, 900);
  };

  const activeCategory = allCategories.find((c) => c.id === selectedCategory?.id) || allCategories[0];
  const Icon = activeCategory.icon || AlertTriangle;

  return (
    <div className="w-full h-full bg-[#F9FAFB] overflow-hidden flex flex-col justify-between font-sans antialiased text-[#101828] relative select-none">
      
      {/* 2. TOP CLEAN WHITE HEADER */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 shadow-2xs flex items-center gap-3 shrink-0">
        <button 
          onClick={onBack}
          disabled={isSubmitting}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 flex items-center justify-center transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900 tracking-tight">
            Report Issue
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Help improve our city
          </p>
        </div>
      </div>

      {/* 3. SCROLLABLE FORM BODY */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-4 py-4 space-y-4">
        
        {/* CATEGORY DROPDOWN SELECTOR */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`w-full p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${dropdownOpen ? 'ring-2 ring-blue-400/50' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-blue-50 text-[#155DFC] flex items-center justify-center shrink-0 border border-blue-100/80">
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Reporting Category</span>
                <h3 className="text-sm font-bold text-gray-900">{activeCategory.label}</h3>
              </div>
            </div>

            <div className={`p-1.5 rounded-full bg-gray-50 border border-gray-200/60 shadow-2xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4 text-gray-500 stroke-[2.2]" />
            </div>
          </button>

          {/* Dropdown List */}
          {dropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">
              {allCategories.map((cat) => {
                const CatIcon = cat.icon;
                const isSelected = activeCategory.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50/70 border-l-[3px] border-l-[#155DFC]' 
                        : 'hover:bg-gray-50 border-l-[3px] border-l-transparent'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#155DFC] flex items-center justify-center shrink-0 border border-blue-100/80">
                      <CatIcon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="text-left flex-1">
                      <span className="text-xs font-bold text-gray-900 block">{cat.label}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{cat.subtitle}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#155DFC] stroke-[2.2]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ADD PHOTOS SECTION */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">
              Add Photos
            </h3>
            <span className="text-[10px] font-bold text-gray-400">
              {photos.length}/3 photos added
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {photos.map((src, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-xs group">
                <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black text-white rounded-full transition-all cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {photos.length < 3 && (
              <button
                type="button"
                onClick={() => setPhotoPickerOpen(true)}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50/50 flex flex-col items-center justify-center text-gray-400 hover:text-[#155DFC] transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold">Add Photo</span>
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-400">
            Clear photos help local authorities resolve issues faster.
          </p>
        </div>

        {/* LOCATION SECTION WITH MAP */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">
              Location
            </h3>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="text-[10px] font-bold text-[#155DFC] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Navigation className="w-3 h-3" />
              <span>{isDetectingLocation ? 'Detecting...' : 'Use Current Location'}</span>
            </button>
          </div>

          {/* Interactive Map */}
          <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 shadow-xs" style={{ zIndex: 0, isolation: 'isolate' }}>
            <div ref={mapContainerRef} className="w-full h-full" />
            {/* Crosshair overlay hint */}
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm border border-gray-200/80 flex items-center gap-1.5 pointer-events-none z-[400]">
              <Crosshair className="w-3 h-3 text-[#155DFC]" />
              <span className="text-[9px] font-bold text-gray-500">Tap or drag pin to set location</span>
            </div>
            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={() => {
                setMapFullscreen(true);
                setTimeout(() => {
                  if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
                }, 100);
              }}
              className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/80 flex items-center justify-center text-gray-600 hover:text-[#155DFC] cursor-pointer z-[400] transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Location text display */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location will appear here"
              className="w-full bg-gray-50 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-bold text-gray-900 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* ISSUE DETAILS SECTION */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">
            Issue Details
          </h3>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title (e.g., Large pothole near crossing)"
              className="w-full bg-gray-50 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detailed description of the issue..."
              className="w-full bg-gray-50 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-900 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
        </div>

      </div>

      {/* 4. BOTTOM ACTION BAR */}
      <div className="bg-white border-t border-gray-200/90 p-4 shadow-xl shrink-0">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim()}
          className="w-full py-3.5 bg-[#155DFC] hover:bg-[#1D4ED8] text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting Report...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span>Submit Report (+10 Pts)</span>
            </div>
          )}
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Reports are sent directly to municipal maintenance departments
        </p>
      </div>
      {/* FULLSCREEN MAP OVERLAY */}
      {mapFullscreen && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col">
          {/* Map header */}
          <div className="bg-white px-4 py-3 border-b border-gray-100 shadow-xs flex items-center justify-between shrink-0 z-10">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMapFullscreen(false);
                  setTimeout(() => {
                    if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
                  }, 100);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 flex items-center justify-center transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Select Location</h2>
                <p className="text-[10px] text-gray-400 font-medium">Tap on the map or drag the pin</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="text-[10px] font-bold text-[#155DFC] flex items-center gap-1 cursor-pointer"
            >
              <Navigation className="w-3 h-3" />
              <span>{isDetectingLocation ? 'Detecting...' : 'My Location'}</span>
            </button>
          </div>

          {/* Full map area - reuse same map by moving it */}
          <div className="flex-1 relative">
            {/* We overlay a new map for fullscreen */}
            <FullscreenMap
              center={mapCenter}
              onLocationSelect={(lat, lng) => {
                setMapCenter([lat, lng]);
                setLocation(`${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
                // Also update the inline map marker
                if (markerRef.current) {
                  markerRef.current.setLatLng([lat, lng]);
                }
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
                }
              }}
            />
          </div>

          {/* Bottom confirm bar */}
          <div className="bg-white border-t border-gray-200 p-4 shadow-xl shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-4 h-4 text-[#155DFC] shrink-0" />
              <span className="text-xs font-bold text-gray-900 truncate">{location}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setMapFullscreen(false);
                setTimeout(() => {
                  if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
                }, 100);
              }}
              className="w-full py-3 bg-[#155DFC] hover:bg-[#1D4ED8] text-white font-black text-sm rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>
      )}

      {/* PHOTO PICKER BOTTOM SHEET MODAL */}
      {photoPickerOpen && (
        <div className="absolute inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setPhotoPickerOpen(false)}
          />
          {/* Sheet */}
          <div className="relative w-full bg-white rounded-t-3xl p-5 pb-8 shadow-2xl z-10" style={{ animation: 'slideUp 0.25s ease-out' }}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className="text-sm font-black text-gray-900 text-center mb-4">Add Photo</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Camera Option */}
              <button
                type="button"
                onClick={handleAddPhotoFromCamera}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-blue-50 border border-blue-200/80 hover:bg-blue-100 active:scale-95 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#155DFC] text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-gray-900 block">Camera</span>
                  <span className="text-[10px] text-gray-400">Take a photo</span>
                </div>
              </button>

              {/* Gallery Option */}
              <button
                type="button"
                onClick={handleAddPhotoFromGallery}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-purple-50 border border-purple-200/80 hover:bg-purple-100 active:scale-95 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#9333EA] text-white flex items-center justify-center shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
                  <Image className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-gray-900 block">Gallery</span>
                  <span className="text-[10px] text-gray-400">Choose from photos</span>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPhotoPickerOpen(false)}
              className="w-full mt-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}

// Fullscreen map sub-component with its own Leaflet instance
function FullscreenMap({ center, onLocationSelect }) {
  const fsMapRef = useRef(null);
  const fsMapInstanceRef = useRef(null);
  const fsMarkerRef = useRef(null);

  useEffect(() => {
    if (!fsMapRef.current || fsMapInstanceRef.current) return;

    const map = L.map(fsMapRef.current, {
      center: center,
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    // Google Maps Streets Tiles (Clean, crisp, no API key required)
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const pinIcon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:36px;height:48px;display:flex;align-items:flex-start;justify-content:center;">
          <div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:#155DFC;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(21,93,252,0.4);">
            <div style="width:14px;height:14px;border-radius:50%;background:white;transform:rotate(45deg);"></div>
          </div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:12px;height:5px;border-radius:50%;background:rgba(0,0,0,0.2);filter:blur(1px);"></div>
        </div>
      `,
      iconSize: [36, 48],
      iconAnchor: [18, 48]
    });

    const marker = L.marker(center, { icon: pinIcon, draggable: true }).addTo(map);
    fsMarkerRef.current = marker;

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onLocationSelect(pos.lat, pos.lng);
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onLocationSelect(lat, lng);
    });

    fsMapInstanceRef.current = map;

    return () => {
      map.remove();
      fsMapInstanceRef.current = null;
    };
  }, []);

  return <div ref={fsMapRef} className="w-full h-full" />;
}
