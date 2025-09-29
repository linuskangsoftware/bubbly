"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Init
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "http://localhost:8080/styles/bubbly/style.json",
      center: [0, 0],
      zoom: 2,
      attributionControl: false,
    });

    mapRef.current = map;

    // Controls
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");
    map.addControl(new maplibregl.GeolocateControl({ 
      positionOptions: { enableHighAccuracy: true }, 
      trackUserLocation: true 
    }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }));

    const onError = (e: any) => console.error("Map error:", e);
    const onLoad = () => {
      console.log("Loaded map!");
      const params = new URLSearchParams(window.location.search);
      const lat = parseFloat(params.get("lat") || "");
      const lng = parseFloat(params.get("lng") || "");
      const zoom = parseFloat(params.get("zoom") || "");

      if (!isNaN(lat) && !isNaN(lng)) {
        map.flyTo({
          center: [lng, lat],
          zoom: !isNaN(zoom) ? zoom : 14,
          essential: true
        });
      }
    };

    map.on("error", onError);
    map.on("load", onLoad);

    return () => {
      map.off("error", onError);
      map.off("load", onLoad);
      map.remove();
    };
  }, []);

  useEffect((): void | (() => void) => {
    const map = mapRef.current;
    if (!map) return;

    const updateUrl = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const params = new URLSearchParams(window.location.search);

      params.set("lng", center.lng.toFixed(5));
      params.set("lat", center.lat.toFixed(5));
      params.set("zoom", zoom.toFixed(2));

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    };

    map.on("moveend", updateUrl);
    return () => map.off("moveend", updateUrl);
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
