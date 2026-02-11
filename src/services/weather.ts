import GObject, { register, property } from "ags/gobject";
import { bash, dependencies, hasBarItem } from "@/src/lib/utils";
import { config } from "@/options";
import fetch, { URL } from "ags/fetch";
import { getWeatherIcon } from "../lib/icons";
import { interval, Timer } from "ags/time";

interface LocationData {
   city: string;
   country: string;
   country_code: string;
   latitude: number;
   longitude: number;
}

interface HourlyWeather {
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
interface DailyWeather {
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

@register({ GTypeName: "Weather" })
export default class Weather extends GObject.Object {
   static instance: Weather;

   static get_default() {
      if (!this.instance) this.instance = new Weather();
      return this.instance;
   }

   @property(Boolean)
   running = false;

   @property(Object)
   location: Partial<LocationData> = {};

   @property(Boolean)
   loading = false;

   @property(Object)
   data: Partial<WeatherData> = {};

   interval?: Timer;

   constructor() {
      super();
      if (
         (config.weather.enabled && hasBarItem("weather")) ||
         config.quicksettings.buttons.includes("weather")
      )
         this.start();
   }

   async start() {
      console.log("Weather: service started");
      this.running = true;
      this.updateLocation();
      this.interval = interval(300000, () => {
         this.update();
      });
   }

   async stop() {
      if (this.interval) {
         this.running = false;
         this.interval.cancel();
      }
      console.log("Weather: service stopped");
   }

   async updateLocation() {
      const location = config.weather.location;

      try {
         this.loading = true;
         if (location.auto) {
            console.log("Weather: detecting location automatically");
            this.location_auto();
         } else if (location.coords !== null && location.coords !== undefined) {
            console.log(
               `Weather: using coordinates (${location.coords.latitude}, ${location.coords.longitude})`,
            );
            this.location_by_coords(
               location.coords.latitude,
               location.coords.longitude,
            );
         } else if (location.city !== null && location.city !== undefined) {
            console.log(`Weather: searching for city ${location.city}`);
            this.location_by_city(location.city);
         } else {
            console.error(
               "Weather: invalid location config (specify city, coords, or enable auto)",
            );
            this.location = {};
         }
         this.loading = false;
      } catch (error) {
         console.error("Weather: location update failed:", error);
         this.location = {};
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

         this.location = {
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
         };
         this.update();
      } catch (error) {
         console.error(
            `Weather: failed to reverse geocode coordinates (${lat}, ${lon}):`,
            error,
         );
         this.location = {};
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

         if (!json.results || json.results.length === 0) {
            throw new Error("NOT_FOUND");
         }

         const location = json.results[0];

         this.location = {
            city: location.name,
            country: location.country,
            country_code: location.country_code,
            latitude: location.latitude,
            longitude: location.longitude,
         };
         console.log(
            `Weather: found ${location.name}, ${location.country_code}`,
         );
         this.update();
      } catch (error) {
         if (error instanceof Error && error.message === "NOT_FOUND") {
            console.error(`Weather: city ${city} not found`);
         } else {
            console.error(`Weather: failed to search for city ${city}:`, error);
         }

         this.location = {};
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
                     "Weather: Geoclue service unavailable (make sure geoclue is running and configured)",
                  );
                  this.location = {};
                  return;
               }
               console.log("Weather: location detected via GeoClue");

               this.location_by_coords(
                  geoclue.location.latitude.toString(),
                  geoclue.location.longitude.toString(),
               );

               geoclue.connect("notify::location", () => {
                  console.log("Weather: location changed, updating");
                  this.location_by_coords(
                     geoclue.location.latitude.toString(),
                     geoclue.location.longitude.toString(),
                  );
               });
            },
         );
      } catch (error) {
         console.error("Weather: failed to initialize Geoclue:", error);
         this.location = {};
      }
   }

   async update() {
      if (!this.location.city) {
         this.location = {};
         return;
      }
      if (this.loading) {
         console.warn("Weather: update already in progress, skipping");
         this.loading = false;
         return;
      }
      console.log(`Weather: updating forecast for ${this.location.city}`);
      this.loading = true;

      const params = {
         latitude: this.location.latitude,
         longitude: this.location.longitude,
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

         console.log(
            `Weather: forecast updated (${hourlyData.length} hours, ${dailyData.length} days)`,
         );

         this.data = {
            hourly: hourlyData,
            daily: dailyData,
         };
         this.loading = false;
      } catch (error) {
         console.error("Weather update failed:", error);
         this.data = {};
      }
   }
}
