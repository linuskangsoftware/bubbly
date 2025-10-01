"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, Point } from "geojson";

import { SearchBar } from "@/components/Map/Search";
import { MapScale } from "@/components/Map/Scale";
import { useTheme, type Theme } from "@/lib/theme"

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Bubbler = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [bubblers, setBubblers] = useState<Bubbler[]>([]);
  const geolocateRef = useRef<maplibregl.GeolocateControl | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const { setTheme } = useTheme();
  const { theme } = useTheme();

  // Fetch waypoints
  useEffect(() => {
    fetch("/api/waypoints")
      .then((res) => res.json())
      .then((data: Bubbler[]) => setBubblers(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setStyle(theme === "dark"
    ? "http://localhost:8080/styles/dark/style.json"
    : "http://localhost:8080/styles/light/style.json"
  );

    map.once("styledata", () => {
      if (map.getStyle()) {
        map.getStyle().metadata = { theme };
      }
    });
  }, [theme]);


  // MAP THEME MANAGER //
  const getMapStyleUrl = (theme: Theme) => {
    if (theme === "dark") return "http://localhost:8080/styles/dark/style.json";
    return "http://localhost:8080/styles/light/style.json";
  };

  // MAP MANAGER //
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: getMapStyleUrl(theme),
      center: [0, 0],
      zoom: 2,
      attributionControl: false,
    });

    mapRef.current = map;

    // MAP CONTROLS //
    // GEOLOCATE //
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    });

    geolocateRef.current = geolocate;
    map.addControl(geolocate);
    
    //rm geo button
    const el = document.querySelector(".maplibregl-ctrl-geolocate") as HTMLElement;
    if (el) el.style.display = "none";

    // Fly to location from URL
    const onLoad = () => {
      console.log("Bubbly map loaded.");
      const params = new URLSearchParams(window.location.search);
      const lat = parseFloat(params.get("lat") || "");
      const lng = parseFloat(params.get("lng") || "");
      const zoom = parseFloat(params.get("zoom") || "");

      if (!isNaN(lat) && !isNaN(lng)) {
        map.flyTo({
          center: [lng, lat],
          zoom: !isNaN(zoom) ? zoom : 14,
          essential: true,
        });
      }
    };

    // Keep URL in sync w/ location
    const updateUrl = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const params = new URLSearchParams(window.location.search);

      params.set("lat", center.lat.toFixed(6));
      params.set("lng", center.lng.toFixed(6));
      params.set("zoom", zoom.toFixed(2));

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    };

    map.on("load", onLoad);
    map.on("moveend", updateUrl);

    map.on("contextmenu", (e) => {
      e.preventDefault();
      setMenuPos({ x: e.point.x, y: e.point.y });

      console.log(e.point)
    });

    map.on("error", (e) => console.error("Map error:", e));

    return () => map.remove();
  }, []);

  // later
  useEffect(() => {
    if (menuPos) {
      console.log("Menu position updated:", menuPos);
    }
  }, [menuPos]);

  // WAYPOINT MANAGER //
  useEffect(() => {
    const map = mapRef.current;
    if (!map || bubblers.length === 0) return;

    const addWaypoints = () => {
      console.log("Adding waypoints to map...");
      const geojson: FeatureCollection<Point, { id: number; name: string }> = {
        type: "FeatureCollection",
        features: bubblers.map((bubbler) => ({
          type: "Feature",
          properties: {
            id: bubbler.id,
            name: bubbler.name,
          },
          geometry: {
            type: "Point",
            coordinates: [bubbler.longitude, bubbler.latitude],
          },
        })),
      };

      if (map.getSource("bubblers")) {
        (map.getSource("bubblers") as maplibregl.GeoJSONSource).setData(geojson);
        return;
      }

      map.addSource("bubblers", {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "bubblers",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#60A5FA",
            10, "#3B82F6",
            50, "#2563EB",
            100, "#1E3A8A",
          ],
          "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 50, 25],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "bubblers",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "bubblers",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#00BFFF",
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("click", "unclustered-point", (e) => {
        const feature = e.features?.[0];
        if (!feature || !feature.properties) return;
        const id = feature.properties.id;
        const name = feature.properties.name;
        if (typeof id !== "number" || typeof name !== "string") return;
        const coordinates = (feature.geometry as Point).coordinates.slice() as [number, number];

        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<strong>${name}</strong>`)
          .addTo(map);
      });

      map.on("click", "clusters", async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        if (!features.length) return;
        const clusterFeature = features[0];
        if (!clusterFeature.properties) return;
        const clusterId = clusterFeature.properties.cluster_id;
        if (typeof clusterId !== "number") return;
        const source = map.getSource("bubblers") as maplibregl.GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(clusterId);

        const coords = (clusterFeature.geometry as Point).coordinates as [number, number];
        map.easeTo({ center: coords, zoom });
      });

      console.log("Waypoints added.");
    }

    if (map.isStyleLoaded()) {
      addWaypoints();
    } else {
      map.once("load", addWaypoints);
    }
  }, [bubblers]);


  // UI COMPONENTS //
  
  // SEARCH BAR //
  const [searchValue, setSearchValue] = useState("");

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 1, width: '400px'}}>
        <SearchBar
          placeholder="Search for water fountains..."
          value={searchValue}
          onChange={setSearchValue}
          onSearch={ () => alert(`Searched for: ${searchValue}`)}
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 15,
          right: 15,
          display: "flex",
          flexDirection: "column",
          zIndex: 1,
        }}
      >
        <button
          onClick={() => {
            geolocateRef.current?.trigger();
          }}
          style={{
            width: "50px",
            height: "50px",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "15px",
            fontSize: "20px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
          title="Go to my location"
        >
          -
        </button>
        <button
          onClick={() => mapRef.current?.zoomIn()}
          style={{
            width: "50px",
            height: "50px",
            background: "white",
            border: "1px solid #ccc",
            borderBottom: "none",
            borderTopLeftRadius: "15px",
            borderTopRightRadius: "15px",
            fontSize: "20px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          +
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          style={{
            width: "50px",
            height: "50px",
            background: "white",
            border: "1px solid #ccc",
            borderTop: "none",
            borderBottomLeftRadius: "15px",
            borderBottomRightRadius: "15px",
            fontSize: "20px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          –
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          zIndex: 1,
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="https://github.com/linuskang.png" />
              <AvatarFallback>LK</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="font-bold">Linus Kang</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>App Theme</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
      </div>

      <MapScale map={mapRef.current} maxWidth={100} />
    </div>
  );
}
