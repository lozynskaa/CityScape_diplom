import { useRouter } from "next/navigation";
import Script from "next/script";
import { memo, useEffect, useRef } from "react";
import { DEFAULT_LOCATION } from "~/lib/location";

export type Marker = {
  lat: number;
  lng: number;
  title: string;
  id?: string;
};

type HereMapProps = {
  zoom?: number;
  markers?: Marker[];
};

const defaultCenter = {
  lat: DEFAULT_LOCATION.latitude,
  lng: DEFAULT_LOCATION.longitude,
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    H: any;
  }
}

const apiKey = "01kwiBkfBE52HAkRv1UQ0yZr976MyJ15c2WR0FA19ac";

const Map = memo(({ zoom = 14, markers = [] }: HereMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!mapRef.current || !apiKey || !window.H) return;
    const H = window.H;
    const abortController = new AbortController();

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
    window.addEventListener("resize", () => map.getViewPort().resize(), {
      signal: abortController.signal,
    });

    //Step 3: make the map interactive
    // MapEvents enables the event system
    // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
    new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    // Create the default UI components
    H.ui.UI.createDefault(map, defaultLayers);

    // Add markers
    markers.forEach(({ lat, lng, title, id }, index) => {
      const marker = new H.map.Marker({ lat, lng });
      marker.setData(title);
      if (id) {
        marker.addEventListener(
          "longpress",
          () => router.push(`/event/${id}`),
          {
            signal: abortController.signal,
          },
        );
      }
      map.addObject(marker);
      if (index === 0) {
        map.setCenter({ lat, lng });
      }
    });

    // Cleanup on unmount
    return () => {
      abortController.abort();
      map.dispose();
    };
  }, [zoom, markers]);

  return (
    <>
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
