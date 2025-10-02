"use client";

// packages & libraries
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ui components
import { SearchBar } from "@/components/Map/Search";
import { MapScale } from "@/components/Map/Scale";
import { Attribution } from "@/components/Map/Attribution";
import { Watermark } from "@/components/Map/Watermark"
import { AvatarManager } from "@/components/Map/Avatar";
import { SignInButton } from "@/components/Map/SignIn";
import { ZoomControl } from "@/components/Map/Zoom";

// util scripts
import { loadMap, querySearch, addWaypoints } from "@/utils/MapUtils";
import { useTheme } from "@/lib/theme";

// types
import type { Waypoint } from "@/types/types";

export function Map() {
    //theme
    const { theme } = useTheme();
    //nextauth
    const { data: session } = useSession();
    // map
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
    // search
    const [searchValue, setSearchValue] = useState("");
    // waypoints
    const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

    // initialize map
    useEffect(() => {
        let effectiveTheme = theme;
        if (theme === "system") {
            effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
        }

        loadMap(mapRef, mapContainerRef, effectiveTheme);

        if (mapRef.current && mapRef.current !== mapInstance) {
            setMapInstance(mapRef.current);
        }

        mapRef.current!.on("load", () => {
            addWaypoints(mapRef.current!, waypoints);
        })

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                setMapInstance(null);
            }
        };
    }, [theme]);

    // fetch waypoints
    useEffect(() => {
        fetch("/api/waypoints")
            .then((res) => res.json())
            .then((data: Waypoint[]) => {
                setWaypoints(data);
                if (mapRef.current?.isStyleLoaded()) addWaypoints(mapRef.current, data);
                else mapRef.current?.once("load", () => addWaypoints(mapRef.current!, data));
            });
    }, []);

    return (
        <div className="relative w-full h-screen">
            <div ref={mapContainerRef} className="w-full h-full" />

            <div className="absolute top-5 left-5 z-10">
                <SearchBar
                    placeholder="Search water fountains..."
                    className="w-72 md:w-96"
                    value={searchValue}
                    onChange={setSearchValue}
                    onSearch={() => querySearch(searchValue)}
                />
            </div>

            <div className="absolute top-5 right-5 z-10">
                {session ? <AvatarManager /> : <SignInButton />}
            </div>

            <div className="absolute left-2 z-10">
                {mapInstance && <MapScale map={mapInstance} maxWidth={120} />}
            </div>

            <Attribution />
            <Watermark />
            <ZoomControl map={mapInstance} />
        </div>
    );
}
