"use client"

import { loadMap } from "@/hooks/map.loader"
import { useRef, useEffect } from "react"

export default function Map() {
  // Load map
  const mapContainer = useRef<HTMLDivElement | null>(null)
  loadMap(mapContainer)

  // Remove overflow
  useEffect(() =>{
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
      document.body.style.overflow = prevOverflow
      }
  }, [])

  return (
    <div className="w-screen h-screen">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  )
}
