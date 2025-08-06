import { createState } from "ags";
import { config } from "@/options";
import { fetch, URL } from "ags/fetch";
import { isLoading_set } from "./weather";

interface LocationData {
   city: string;
   country: string;
   country_code: string;
   latitude: number;
   longitude: number;
}

export const [currentLocation, currentLocation_set] =
   createState<LocationData | null>(null);

async function location_by_coords(lat: string, lon: string) {
   const params = {
      lat: lat,
      lon: lon,
      format: "json",
      addressdetails: "1",
      "accept-language": "en",
   };

   const paramString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

   const url = new URL(
      `https://nominatim.openstreetmap.org/reverse?${paramString}`,
   );

   try {
      isLoading_set(true);
      const res = await fetch(url, {
         headers: { "User-Agent": "Delta-shell Weather Widget" },
      });
      const json = await res.json();
      const location = json.address;

      currentLocation_set({
         city:
            location.hamlet ||
            location.city ||
            location.town ||
            location.village ||
            "Unknown",
         country: location.country,
         country_code: location.country_code.toLocaleUpperCase(),
         latitude: Number(lat),
         longitude: Number(lon),
      });
      isLoading_set(false);
   } catch (error) {
      console.error("Update weather failed:", error);
      currentLocation_set(null);
   }
}

async function location_by_city(city: string) {
   const params = {
      name: encodeURIComponent(city),
      count: 1,
      language: "en",
   };

   const paramString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

   const url = new URL(
      `https://geocoding-api.open-meteo.com/v1/search?${paramString}`,
   );

   try {
      isLoading_set(true);
      const res = await fetch(url);
      const json = await res.json();
      const location = json.results[0];

      currentLocation_set({
         city: location.name,
         country: location.country,
         country_code: location.country_code,
         latitude: location.latitude,
         longitude: location.longitude,
      });
      isLoading_set(false);
   } catch (error) {
      console.error("Location update failed:", error);
      currentLocation_set(null);
   }
}

async function location_auto() {
   try {
      isLoading_set(true);
      const Geoclue = (await import("gi://Geoclue")).default;
      Geoclue.Simple.new(
         "delta-shell",
         Geoclue.AccuracyLevel.CITY,
         null,
         (geoclue, result) => {
            Geoclue.Simple.new_finish(result);
            if (!geoclue) {
               console.error(
                  "GeoClue service is not available. Make sure that GeoClue is configured correctly and an agent is running.",
               );
               return;
            }
            location_by_coords(
               geoclue.location.latitude.toString(),
               geoclue.location.longitude.toString(),
            );
            isLoading_set(false);

            geoclue.connect("notify::location", () => {
               console.log("Location changed!");
               location_by_coords(
                  geoclue.location.latitude.toString(),
                  geoclue.location.longitude.toString(),
               );
            });
         },
      );
   } catch (error) {
      console.error("Location update failed:", error);
      currentLocation_set(null);
   }
}

export async function updateLocationData() {
   const location = config.weather.location.get();

   try {
      if (location.auto) {
         location_auto();
      } else if (location.coords !== null && location.coords !== undefined) {
         location_by_coords(
            location.coords.latitude,
            location.coords.longitude,
         );
      } else if (location.city !== null && location.city !== undefined) {
         location_by_city(location.city);
      } else {
         console.error("Location update failed: check settings in config file");
         currentLocation_set(null);
      }
   } catch (error) {
      console.error("Location update failed:", error);
      currentLocation_set(null);
   }
}
