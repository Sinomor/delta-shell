import GObject, { register, getter } from "ags/gobject";
import { bash, cacheDir, dependencies, ensureDirectory } from "@/src/lib/utils";
import { createState } from "ags";
import { config } from "@/options";
import GLib from "gi://GLib?version=2.0";
import fetch, { URL } from "ags/fetch";
import { getWeatherIcon } from "../lib/icons";
import { interval } from "ags/time";

interface LocationData {
   city: string;
   country: string;
   country_code: string;
   latitude: number;
   longitude: number;
}

export interface HourlyWeather {
   temperature: number;
   wind_speed: number;
   apparent_temperature: number;
   precipitation_probability: number;
   weather_code: number;
   icon: string;
   time: number;
   is_day: boolean;
   units: {
      temperature: string;
      wind_speed: string;
   };
}
export interface DailyWeather {
   time: number;
   weather_code: number;
   precipitation_probability: number;
   temperature_max: number;
   temperature_min: number;
   icon: string;
   units: {
      temperature_max: string;
      temperature_min: string;
   };
}

interface WeatherData {
   hourly: HourlyWeather[];
   daily: DailyWeather[];
}

@register({ GTypeName: "WeatherService" })
export default class WeatherService extends GObject.Object {
   static instance: WeatherService;

   static get_default() {
      if (!this.instance) this.instance = new WeatherService();
      return this.instance;
   }

   #running = createState<boolean>(false);
   #location = createState<LocationData | null>(null);
   #data = createState<WeatherData | null>(null);
   #interval: any = null;
   #loading = createState(false);

   constructor() {
      super();
      if (config.weather.enabled.get()) this.start();
   }

   async start() {
      if (config.weather.enabled.get()) {
         this.updateLocation();
         this.#running[1](true);
         this.#location[0].subscribe(() => this.update());
         this.#interval = interval(5 * 60 * 1000, () => {
            this.update();
         });
      }
   }

   async stop() {
      if (this.#interval) {
         this.#running[1](false);
         this.#interval.cancel();
         this.#interval = null;
      }
   }

   toggle() {
      if (this.#interval !== null) this.stop();
      else this.start();
   }

   get running() {
      return this.#running[0];
   }

   get location() {
      return this.#location[0];
   }

   get loading() {
      return this.#loading[0];
   }

   get data() {
      return this.#data[0];
   }

   async updateLocation() {
      const location = config.weather.location.get();

      try {
         this.#loading[1](true);
         if (location.auto) {
            this.location_auto();
         } else if (location.coords !== null && location.coords !== undefined) {
            this.location_by_coords(
               location.coords.latitude,
               location.coords.longitude,
            );
         } else if (location.city !== null && location.city !== undefined) {
            this.location_by_city(location.city);
         } else {
            console.error(
               "Location update failed: check settings in config file",
            );
            this.#location[1](null);
         }
         this.#loading[1](false);
      } catch (error) {
         console.error("Location update failed:", error);
         this.#location[1](null);
      }
   }

   async location_by_coords(lat: string, lon: string) {
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
         const res = await fetch(url, {
            headers: { "User-Agent": "Delta-shell Weather Widget" },
         });
         const json = await res.json();
         const location = json.address;

         this.#location[1]({
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
      } catch (error) {
         console.error("Update weather failed:", error);
         this.#location[1](null);
      }
   }

   async location_by_city(city: string) {
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
         const res = await fetch(url);
         const json = await res.json();
         const location = json.results[0];

         this.#location[1]({
            city: location.name,
            country: location.country,
            country_code: location.country_code,
            latitude: location.latitude,
            longitude: location.longitude,
         });
      } catch (error) {
         console.error("Location update failed:", error);
         this.#location[1](null);
      }
   }

   async location_auto() {
      try {
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
               this.location_by_coords(
                  geoclue.location.latitude.toString(),
                  geoclue.location.longitude.toString(),
               );

               geoclue.connect("notify::location", () => {
                  console.log("Location changed!");
                  this.location_by_coords(
                     geoclue.location.latitude.toString(),
                     geoclue.location.longitude.toString(),
                  );
               });
            },
         );
      } catch (error) {
         console.error("Location update failed:", error);
         this.#location[1](null);
      }
   }

   async update() {
      const location = this.#location[0].get();
      if (!location) {
         this.#location[1](null);
         return;
      }
      if (this.#loading[0].get()) {
         this.#loading[1](false);
         return;
      }
      this.#loading[1](true);

      const params = {
         latitude: location.latitude,
         longitude: location.longitude,
         hourly: [
            "temperature_2m",
            "apparent_temperature",
            "precipitation_probability",
            "weather_code",
            "is_day",
            "wind_speed_10m",
         ],
         daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_max",
         ],
         wind_speed_unit: "ms",
         timezone: "auto",
         timeformat: "unixtime",
         forecast_hours: 12,
         forecast_days: 7,
      };

      const paramString = Object.entries(params)
         .map(([key, value]) => {
            let valueString: string;
            if (typeof value == "string") {
               valueString = value;
            } else if (typeof value == "number") {
               valueString = value.toString();
            } else if (Array.isArray(value)) {
               valueString = value.join(",");
            } else {
               throw new Error("Unhandled parameter value");
            }

            return `${key}=${valueString}`;
         })
         .join("&");

      const url = new URL(
         `https://api.open-meteo.com/v1/forecast?${paramString}`,
      );

      try {
         const res = await fetch(url);
         const json = await res.json();

         const hourlyData: HourlyWeather[] = [];
         for (let i = 0; i < 12; i++) {
            hourlyData.push({
               temperature: Math.round(json.hourly.temperature_2m[i]),
               wind_speed: Math.round(json.hourly.wind_speed_10m[i]),
               apparent_temperature: Math.round(
                  json.hourly.apparent_temperature[i],
               ),
               precipitation_probability:
                  json.hourly.precipitation_probability[i],
               is_day: Boolean(json.hourly.is_day[i]),
               weather_code: json.hourly.weather_code[i],
               icon: getWeatherIcon(
                  json.hourly.weather_code[i],
                  Boolean(json.hourly.is_day[i]),
               ),
               time: json.hourly.time[i],
               units: {
                  temperature: json.hourly_units.temperature_2m,
                  wind_speed: json.hourly_units.wind_speed_10m,
               },
            });
         }

         const dailyData: DailyWeather[] = [];
         for (let i = 0; i < 7; i++) {
            dailyData.push({
               time: json.daily.time[i],
               weather_code: json.daily.weather_code[i],
               precipitation_probability:
                  json.daily.precipitation_probability_max[i],
               temperature_max: Math.round(json.daily.temperature_2m_max[i]),
               temperature_min: Math.round(json.daily.temperature_2m_min[i]),
               icon: getWeatherIcon(json.daily.weather_code[i]),
               units: {
                  temperature_max: json.daily_units.temperature_2m_max,
                  temperature_min: json.daily_units.temperature_2m_min,
               },
            });
         }

         this.#data[1]({
            hourly: hourlyData,
            daily: dailyData,
         });
         this.#loading[1](false);
      } catch (error) {
         console.error("Weather update failed:", error);
         this.#data[1](null);
      }
   }
}
