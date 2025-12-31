import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Building2, Stethoscope, Star, MapPin, Phone, X, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Facility {
  id: number;
  name: string;
  type?: string;
  location: string;
  address: string;
  phone: string;
  rating: number;
  reviews: number;
  lat: number;
  lng: number;
  specialties?: string[];
  services?: string[];
  emergency?: boolean;
}

interface FacilitiesMapProps {
  hospitals: Facility[];
  diagnostics: Facility[];
  activeTab: "hospitals" | "diagnostics";
  selectedLocation: string;
}

// Bangladesh city coordinates
const cityCoordinates: Record<string, [number, number]> = {
  all: [90.4125, 23.8103], // Center of Bangladesh
  dhaka: [90.4125, 23.8103],
  chattogram: [91.8349, 22.3569],
  rajshahi: [88.6042, 24.3636],
  khulna: [89.5403, 22.8456],
  sylhet: [91.8687, 24.8949],
  barisal: [90.3535, 22.7010],
  rangpur: [89.2752, 25.7439],
  mymensingh: [90.4203, 24.7471],
};

export function FacilitiesMap({ hospitals, diagnostics, activeTab, selectedLocation }: FacilitiesMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [tokenInput, setTokenInput] = useState("");

  // Check for stored token
  useEffect(() => {
    const storedToken = localStorage.getItem("mapbox_token");
    if (storedToken) {
      setMapboxToken(storedToken);
      setIsTokenSet(true);
    }
  }, []);

  const handleSetToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem("mapbox_token", tokenInput.trim());
      setMapboxToken(tokenInput.trim());
      setIsTokenSet(true);
    }
  };

  const facilities = activeTab === "hospitals" ? hospitals : diagnostics;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !isTokenSet || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const center = cityCoordinates[selectedLocation] || cityCoordinates.all;
    const zoom = selectedLocation === "all" ? 6 : 12;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: center,
      zoom: zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
    };
  }, [isTokenSet, mapboxToken]);

  // Update map center when location changes
  useEffect(() => {
    if (!map.current) return;

    const center = cityCoordinates[selectedLocation] || cityCoordinates.all;
    const zoom = selectedLocation === "all" ? 6 : 12;

    map.current.flyTo({
      center: center,
      zoom: zoom,
      duration: 1500,
    });
  }, [selectedLocation]);

  // Add markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    facilities.forEach((facility) => {
      const el = document.createElement("div");
      el.className = "facility-marker";
      el.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 transition-transform ${
          activeTab === "hospitals" 
            ? "bg-primary text-primary-foreground" 
            : "bg-accent text-accent-foreground"
        }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${activeTab === "hospitals" 
              ? '<path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>' 
              : '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>'
            }
          </svg>
        </div>
      `;

      el.addEventListener("click", () => {
        setSelectedFacility(facility);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([facility.lng, facility.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [facilities, activeTab]);

  if (!isTokenSet) {
    return (
      <div className="h-[500px] rounded-2xl bg-muted flex items-center justify-center">
        <div className="max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Mapbox API Key Required
            </h3>
            <p className="text-sm text-muted-foreground">
              To display the interactive map, please enter your Mapbox public token. 
              Get one free at{" "}
              <a 
                href="https://mapbox.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="pk.eyJ1Ijoi..."
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button variant="healthcare" className="w-full" onClick={handleSetToken}>
              Set Token & Load Map
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] rounded-2xl overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Selected Facility Popup */}
      {selectedFacility && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-card rounded-xl shadow-healthcare-lg p-4 z-10">
          <button
            onClick={() => setSelectedFacility(null)}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              activeTab === "hospitals" ? "bg-primary/10" : "bg-accent/10"
            }`}>
              {activeTab === "hospitals" ? (
                <Building2 className="w-5 h-5 text-primary" />
              ) : (
                <Stethoscope className="w-5 h-5 text-accent" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate pr-6">
                {selectedFacility.name}
              </h3>
              {selectedFacility.type && (
                <span className="text-xs text-primary font-medium">{selectedFacility.type}</span>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{selectedFacility.address}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{selectedFacility.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="font-medium text-foreground">{selectedFacility.rating}</span>
              <span className="text-muted-foreground">({selectedFacility.reviews} reviews)</span>
            </div>
          </div>

          {selectedFacility.emergency && (
            <span className="inline-block mt-3 bg-healthcare-red text-white text-xs px-2 py-1 rounded-full">
              24/7 Emergency
            </span>
          )}

          <Button variant="healthcare" size="sm" className="w-full mt-4">
            <Phone className="w-4 h-4 mr-2" />
            Contact
          </Button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary" />
            <span className="text-foreground">Hospitals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-accent" />
            <span className="text-foreground">Diagnostics</span>
          </div>
        </div>
      </div>
    </div>
  );
}
