import React, { useContext, useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import { Loader, Locate, Search } from "lucide-react";

import PortalContext from "../context/PortalContext";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ChangeMapView({ position }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView(position, 15);
        }
    }, [position, map]);

    return null;
}

export const Location = () => {
    const { selectedLocation, setSelectedLocation } = useContext(PortalContext);
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(selectedLocation);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (selectedLocation) {
            setCurrentLocation(selectedLocation);
            setSearchText(selectedLocation.label);
        }
    }, [selectedLocation]);

    // Search locations using OpenStreetMap Nominatim
    useEffect(() => {
        if (!searchText.trim()) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setIsSearching(true);

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=in&q=${encodeURIComponent(
                        searchText
                    )}`
                );

                if (!response.ok) {
                    throw new Error("Location search failed");
                }

                const data = await response.json();

                setSuggestions(data);
            } catch (err) {
                console.error("Location search error:", err);
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText]);

    // Select searched location
    const selectLocation = (place) => {
        const latitude = Number(place.lat);
        const longitude = Number(place.lon);

        const location = {
            label: place.display_name,
            value: {
                description: place.display_name,
                place_id: String(place.place_id),
                latitude,
                longitude,
            },
        };

        setCurrentLocation(location);
        setSelectedLocation(location);
        setSearchText(place.display_name);
        setSuggestions([]);
        setError(null);
    };

    // Get user's current location
    const getCurrentLocation = () => {
        setIsLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by this browser.");
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Reverse geocoding using OpenStreetMap
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                    );

                    const data = await response.json();

                    const address =
                        data.display_name ||
                        `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

                    const location = {
                        label: address,
                        value: {
                            description: address,
                            place_id: data.place_id
                                ? String(data.place_id)
                                : "current-location",
                            latitude,
                            longitude,
                        },
                    };

                    setCurrentLocation(location);
                    setSelectedLocation(location);
                    setSearchText(address);
                } catch (err) {
                    console.error("Reverse geocoding error:", err);

                    const address = `${latitude.toFixed(
                        6
                    )}, ${longitude.toFixed(6)}`;

                    const location = {
                        label: address,
                        value: {
                            description: address,
                            place_id: "current-location",
                            latitude,
                            longitude,
                        },
                    };

                    setCurrentLocation(location);
                    setSelectedLocation(location);
                    setSearchText(address);
                } finally {
                    setIsLoading(false);
                }
            },
            (locationError) => {
                setIsLoading(false);

                switch (locationError.code) {
                    case locationError.PERMISSION_DENIED:
                        setError(
                            "Location access denied. Please allow location permission."
                        );
                        break;

                    case locationError.POSITION_UNAVAILABLE:
                        setError("Location information is unavailable.");
                        break;

                    case locationError.TIMEOUT:
                        setError("Location request timed out.");
                        break;

                    default:
                        setError("Unable to get your current location.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    const mapPosition = currentLocation
        ? [
              currentLocation.value.latitude,
              currentLocation.value.longitude,
          ]
        : null;

    return (
        <div className="w-full max-w-xl min-h-80 p-6 pt-5 relative">
            {/* Loading indicator */}
            {(isLoading || isSearching) && (
                <div className="absolute top-7 right-7 z-50">
                    <Loader size={18} className="animate-spin" />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="text-red-500 text-sm mb-3">
                    {error}
                </div>
            )}

            {/* Search box */}
            <div className="w-full flex flex-col gap-3">
                <div className="relative">
                    <div className="flex items-center border border-slate-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
                        <Search
                            size={18}
                            className="text-slate-500 mr-2"
                        />

                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setError(null);
                            }}
                            placeholder="Search your location"
                            className="w-full outline-none text-sm"
                        />
                    </div>

                    {/* Search suggestions */}
                    {suggestions.length > 0 && (
                        <div className="absolute z-[1000] w-full bg-white border border-slate-200 rounded-md shadow-lg mt-1 overflow-hidden">
                            {suggestions.map((place) => (
                                <button
                                    key={place.place_id}
                                    type="button"
                                    onClick={() =>
                                        selectLocation(place)
                                    }
                                    className="w-full text-left px-4 py-3 hover:bg-slate-100 border-b last:border-b-0"
                                >
                                    <div className="text-sm font-medium">
                                        {place.name ||
                                            place.display_name.split(
                                                ","
                                            )[0]}
                                    </div>

                                    <div className="text-xs text-slate-500 mt-1">
                                        {place.display_name}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Current location */}
                <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                    className="rounded text-blue-600 hover:bg-slate-200 transition-colors flex items-center gap-2 uppercase text-sm tracking-wide p-2 w-fit"
                >
                    <Locate size={20} />

                    <span>
                        {isLoading
                            ? "Getting location..."
                            : "Use Current Location"}
                    </span>
                </button>
            </div>

            {/* Map */}
            {mapPosition && (
                <div className="mt-5">
                    <MapContainer
                        center={mapPosition}
                        zoom={15}
                        scrollWheelZoom={true}
                        style={{
                            height: "350px",
                            width: "100%",
                            borderRadius: "12px",
                            overflow: "hidden",
                        }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <ChangeMapView position={mapPosition} />

                        <Marker position={mapPosition}>
                            <Popup>
                                {currentLocation?.label ||
                                    "Selected location"}
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>
            )}

            {/* Selected location */}
            {currentLocation && (
                <div className="mt-4 p-3 bg-slate-100 rounded-md">
                    <p className="text-xs text-slate-500">
                        Selected location
                    </p>

                    <p className="text-sm font-medium mt-1">
                        {currentLocation.label}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Location;