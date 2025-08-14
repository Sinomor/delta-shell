import { currentLocation } from "./location";
import { createState } from "ags";
import { interval } from "ags/time";
import { getWeatherIcon } from "@/src/lib/icons";
import { fetch, URL } from "ags/fetch";
import { config } from "@/options";

export interface HourlyWeather {
   temperature: number;
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

export const [weatherData, weatherData_set] = createState<WeatherData | null>(
   null,
);
export const [isLoading, isLoading_set] = createState(false);

export async function updateWeatherData() {
   const location = currentLocation.get();
   if (!location) {
      weatherData_set(null);
      return;
   }
   isLoading_set(true);

   const params = {
      latitude: location.latitude,
      longitude: location.longitude,
      hourly: [
         "temperature_2m",
         "apparent_temperature",
         "precipitation_probability",
         "weather_code",
         "is_day",
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

   const url = new URL(`https://api.open-meteo.com/v1/forecast?${paramString}`);

   try {
      const res = await fetch(url);
      const json = await res.json();

      const hourlyData: HourlyWeather[] = [];
      for (let i = 0; i < 12; i++) {
         hourlyData.push({
            temperature: Math.round(json.hourly.temperature_2m[i]),
            apparent_temperature: Math.round(
               json.hourly.apparent_temperature[i],
            ),
            precipitation_probability: json.hourly.precipitation_probability[i],
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

      weatherData_set({
         hourly: hourlyData,
         daily: dailyData,
      });
      isLoading_set(false);
   } catch (error) {
      console.error("Weather update failed:", error);
      weatherData_set(null);
   }
}

currentLocation.subscribe(() => {
   updateWeatherData();
});
if (config.weather.enabled.get()) {
   interval(300 * 1000, () => {
      updateWeatherData();
   });
}
