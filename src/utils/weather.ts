// weather.ts
// https://open-meteo.com/en/docs?hourly=temperature_2m,precipitation_probability,weather_code&timezone=GMT&time_mode=time_interval&start_date=2025-06-22&end_date=2025-07-06
import { fetchWeatherApi } from 'openmeteo';

const wmoCodes = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
}

// https://pictogrammers.com/library/mdi/category/weather/
export function getMaterialIcon(wmoCode: number, time: string) {
  const hour = new Date(time).getHours();
  const isNight = hour < 6 || hour > 18;
  switch (wmoCode) {
    case 0:
    case 1:
      return isNight ? "weather-night" : "weather-sunny";
    case 2:
      return isNight ? "weather-night-partly-cloudy" : "weather-partly-cloudy";
    case 3:
      return "weather-cloudy";
    case 45:
    case 48:
      return "weather-fog";
    case 51:
    case 53:
    case 57:
    case 61:
    case 63:
    case 80:
    case 81:
      return "weather-rainy";
    case 65:
    case 82:
      return "weather-pouring";
    case 66:
    case 67:
      return "weather-snowy-rainy";
    case 71:
    case 73:
    case 85:
      return "weather-snowy";
    case 75:
    case 77:
    case 86:
      return "weather-snowy-heavy";
    case 95:
      return "weather-lightning";
    case 96:
      return "weather-lightning-rainy";
    case 99:
      return "weather-hail";
    default:
      return "weather-cloudy";
  }
}

const wmoCodesToMaterialIcons = {
  0: "sunny",
  1: "partly-cloudy-day",
  2: "cloudy",
  3: "cloudy",
  45: "foggy",
}

export async function getWeather(
  latitude: number, 
  longitude: number, 
  hourly: string[] = ["temperature_2m", "precipitation_probability"],
  timezone: string = "GMT",
  start_date: string,
  end_date: string,
) {
  const url = "https://api.open-meteo.com/v1/forecast";
  const params = {
    latitude,
    longitude,
    hourly,
    timezone,
    start_date,
    end_date,
  };

  try {
    const responses = await fetchWeatherApi(url, params);

    // Process first location. Add a for-loop for multiple locations or weather models
    const response = responses[0];
    
    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const timezone = response.timezone();
    const timezoneAbbreviation = response.timezoneAbbreviation();
    const latitude = response.latitude();
    const longitude = response.longitude();
    
    const hourly = response.hourly()!;
    
    // Note: The order of weather variables in the URL query and the indices below need to match!
    const weatherData = {
      hourly: {
        time: [...Array((Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval())].map(
          (_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
        ),
        temperature: hourly.variables(0)!.valuesArray()!,
        precipitationProbability: hourly.variables(1)!.valuesArray()!,
        weatherCode: hourly.variables(2)!.valuesArray()!,
      },
    };
    
    // `weatherData` now contains a simple structure with arrays for datetime and weather data
    console.log('retrieved weather data: ');
    for (let i = 0; i < weatherData.hourly.time.length; i++) {
      console.log(
        weatherData.hourly.time[i].toISOString(),
        weatherData.hourly.temperature[i],
        weatherData.hourly.precipitationProbability[i],
        weatherData.hourly.weatherCode[i]
      );
    }
    

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}


