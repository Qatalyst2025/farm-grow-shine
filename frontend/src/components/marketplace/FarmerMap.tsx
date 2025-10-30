import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface Farmer {
  id: string;
  user?: {
    name: string;
    email: string;
  };
  farm_size?: string;
  location?: any;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface FarmerMapProps {
  farmers: Farmer[];
}

export const FarmerMap = ({ farmers }: FarmerMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real implementation, you would use a mapping library like:
    // - Google Maps
    // - Mapbox
    // - Leaflet
    // - OpenLayers
    
    // For now, we'll create a simple SVG-based map visualization
    // This is a placeholder until you integrate a real mapping service
    
    if (mapRef.current && farmers.length > 0) {
      // Simple SVG map visualization
      const svg = `
        <svg width="100%" height="100%" viewBox="0 0 800 400" style="background: #f8f9fa">
          <!-- Background -->
          <rect width="100%" height="100%" fill="#e9ecef" />
          
          <!-- Simple land mass representation (East Africa region) -->
          <path d="M100,150 Q200,100 300,120 Q400,140 500,130 Q600,150 700,120 L700,300 Q600,280 500,290 Q400,300 300,280 Q200,260 100,280 Z" 
                fill="#74c69d" stroke="#2d6a4f" stroke-width="2" />
          
          <!-- Farmer markers -->
          ${farmers.map((farmer, index) => {
            // Convert coordinates to SVG coordinates (simplified)
            const x = 100 + (farmer.coordinates.lng + 4.67) * 100;
            const y = 150 + (farmer.coordinates.lat + 4.62) * 25;
            
            return `
              <g key="${farmer.id}">
                <circle cx="${x}" cy="${y}" r="8" fill="#e63946" stroke="#fff" stroke-width="2">
                  <title>${farmer.user?.name || 'Farmer'}</title>
                </circle>
                <text x="${x}" y="${y - 12}" text-anchor="middle" fill="#1d3557" font-size="10" font-weight="bold">
                  ${index + 1}
                </text>
              </g>
            `;
          }).join('')}
          
          <!-- Legend -->
          <rect x="20" y="20" width="160" height="80" fill="white" stroke="#ddd" rx="4" />
          <text x="30" y="40" fill="#1d3557" font-weight="bold" font-size="12">Farmers Map</text>
          <circle cx="30" cy="60" r="6" fill="#e63946" />
          <text x="45" y="64" fill="#1d3557" font-size="10">Registered Farmers</text>
          <text x="30" y="80" fill="#666" font-size="9">${farmers.length} farmers shown</text>
        </svg>
      `;
      
      mapRef.current.innerHTML = svg;
    }
  }, [farmers]);

  return (
    <div className="relative w-full h-full">
      {/* Placeholder for real map integration */}
      <div ref={mapRef} className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Loading farmers map...</p>
          <p className="text-sm mt-2">{farmers.length} farmers registered</p>
        </div>
      </div>
      
      {/* Map attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded">
        AgriLinka Farmers Network
      </div>
    </div>
  );
};
