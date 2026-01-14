"use client";

import jsVectorMap from "jsvectormap";
import { useEffect } from "react";

export default function Map() {
  useEffect(() => {
    // Ensure jsVectorMap is available globally for the map file
    // @ts-ignore
    window.jsVectorMap = jsVectorMap;

    // Dynamically import the map data
    // @ts-ignore
    import("@/js/us-aea-en").then(() => {
      const mapOne = new jsVectorMap({
        selector: "#mapOne",
        map: "us_aea_en",
        zoomButtons: true,
        regionStyle: {
          initial: {
            fill: "#C8D0D8",
          },
          hover: {
            fillOpacity: 1,
            fill: "#3056D3",
          },
        },
        regionLabelStyle: {
          initial: {
            fontWeight: "semibold",
            fill: "#fff",
          },
          hover: {
            cursor: "pointer",
          },
        },
        labels: {
          regions: {
            render(code: string) {
              return code.split("-")[1];
            },
          },
        },
      });
    });

    return () => {
      // Cleanup logic if needed, accessing the map instance if we saved it
      const mapElement = document.getElementById("mapOne");
      if (mapElement) {
        mapElement.innerHTML = ""; // forceful cleanup
      }
    };
  }, []);

  return (
    <div className="h-[422px]">
      <div id="mapOne" className="mapOne map-btn" />
    </div>
  );
}
