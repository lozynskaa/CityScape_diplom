import Script from "next/script";
import { memo, useEffect, useRef } from "react";

type Marker = {
  lat: number;
  lng: number;
  title?: string;
};

type HereMapProps = {
  zoom?: number;
  markers?: Marker[];
};

const defaultCenter = { lat: 50.4501, lng: 30.5234 };

const apiKey = "DPlThiZyJRk3Pe2S2hKmiRqPi45f6LzrMYu6r8C0uyE";

const Map = memo(({ zoom = 14, markers = [] }: HereMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  console.log("🚀 ~ Map ~ rerender");

  useEffect(() => {
    if (!mapRef.current || !apiKey || !window.H) return;
    const H = window.H;

    const platform = new H.service.Platform({
      apikey: apiKey,
    });
    const defaultLayers = platform.createDefaultLayers();

    //Step 2: initialize a map - this map is centered over Europe
    const map = new H.Map(mapRef.current, defaultLayers.vector.normal.map, {
      center: defaultCenter,
      zoom: zoom,
      pixelRatio: window.devicePixelRatio || 1,
    });
    // add a resize listener to make sure that the map occupies the whole container
    window.addEventListener("resize", () => map.getViewPort().resize());

    //Step 3: make the map interactive
    // MapEvents enables the event system
    // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
    new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    // Create the default UI components
    H.ui.UI.createDefault(map, defaultLayers);

    // Add markers
    markers.forEach(({ lat, lng, title }, index) => {
      const marker = new H.map.Marker({ lat, lng });
      if (title) {
        marker.setData(title);
      }
      map.addObject(marker);
      if (index === 0) {
        map.setCenter({ lat, lng });
      }
    });

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", () => map.getViewPort().resize());
      map.dispose();
    };
  }, [zoom, markers]);

  return (
    <>
      <Script
        type="text/javascript"
        strategy="beforeInteractive"
        src="https://js.api.here.com/v3/3.1/mapsjs-core.js"
      />
      <Script
        type="text/javascript"
        strategy="beforeInteractive"
        src="https://js.api.here.com/v3/3.1/mapsjs-service.js"
      />
      <Script
        type="text/javascript"
        strategy="beforeInteractive"
        src="https://js.api.here.com/v3/3.1/mapsjs-ui.js"
      />
      <Script
        type="text/javascript"
        strategy="beforeInteractive"
        src="https://js.api.here.com/v3/3.1/mapsjs-mapevents.js"
      />
      <div ref={mapRef} style={{ width: "100%", height: "500px" }} />
    </>
  );
}, areEqual);

function areEqual(prevProps: HereMapProps, nextProps: HereMapProps) {
  return (
    prevProps.zoom === nextProps.zoom && prevProps.markers === nextProps.markers
  );
}

Map.displayName = "Map";

export default Map;
