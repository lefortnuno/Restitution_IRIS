import * as leaflet from "leaflet";

if (typeof window !== "undefined") {
  (window as any).L = leaflet;
}
