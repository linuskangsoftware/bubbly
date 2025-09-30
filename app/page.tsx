"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, Point } from "geojson";

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

  // Fetch waypoints
  useEffect(() => {
    fetch("/api/waypoints")
      .then((res) => res.json())
      .then((data: Bubbler[]) => setBubblers(data))
      .catch(console.error);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

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
    map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }));

    // Fly to location from URL params
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

    map.on("error", (e) => console.error("Map error:", e));

    return () => map.remove();
  }, []);

  // Waypoints (initialise, handle user clicks)
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
          "circle-color": "#00BFFF",
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

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
