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

export async function getWeather(
  latitude: number, 
  longitude: number, 
  hourly: string[] = ["temperature_2m", "precipitation_probability", "weather_code"],
  timezone: string = "GMT",
  temperature_unit: string = "fahrenheit",
  start_date: string,
  end_date: string,
) {
  const url = "https://api.open-meteo.com/v1/forecast";
  const params = {
    latitude,
    longitude,
    hourly,
    timezone,
    temperature_unit,
    start_date,
    end_date,
  };

  try {
    console.log('Weather API Request Parameters:', JSON.stringify(params, null, 2));
    
    const responses = await fetchWeatherApi(url, params);
    console.log('Weather API Response Count:', responses.length);

    // Process first location. Add a for-loop for multiple locations or weather models
    const response = responses[0];
    console.log('Raw response object type:', typeof response);
    console.log('Raw response object methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(response)));
    
    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const timezone = response.timezone();
    const timezoneAbbreviation = response.timezoneAbbreviation();
    const latitude = response.latitude();
    const longitude = response.longitude();
    
    console.log('Response metadata:', {
      utcOffsetSeconds,
      timezone,
      timezoneAbbreviation,
      latitude,
      longitude
    });
    
    const hourly = response.hourly()!;
    console.log('Hourly object:', hourly);
    console.log('Hourly variables count:', hourly.variablesLength ? hourly.variablesLength() : 'variablesLength method not found');
    
    // Debug each variable
    console.log('=== Debugging Variables ===');
    console.log('Requested hourly parameters:', params.hourly);
    
    // Check each variable index
    const numVariables = params.hourly.length;
    console.log(`Expected number of variables: ${numVariables}`);
    
    for (let i = 0; i < numVariables; i++) {
      try {
        const variable = hourly.variables(i);
        console.log(`Variable ${i} (${params.hourly[i]}):`, variable);
        if (variable) {
          const values = variable.valuesArray();
          console.log(`Variable ${i} valuesArray:`, values);
          console.log(`Variable ${i} first 5 values:`, values ? values.slice(0, 5) : 'null/undefined');
          console.log(`Variable ${i} values type:`, values ? typeof values : 'null/undefined');
          console.log(`Variable ${i} values length:`, values ? values.length : 'null/undefined');
          console.log(`Variable ${i} is Float32Array?:`, values instanceof Float32Array);
        } else {
          console.log(`Variable ${i} is null/undefined`);
        }
      } catch (error) {
        console.log(`Error accessing variable ${i}:`, error);
      }
    }
    
    // Note: The order of weather variables in the URL query and the indices below need to match!
    // Find the indices for each expected variable
    const tempIndex = params.hourly.indexOf('temperature_2m');
    const precipIndex = params.hourly.indexOf('precipitation_probability');
    const weatherCodeIndex = params.hourly.indexOf('weather_code');
    
    console.log('Variable indices:', {
      temperature: tempIndex,
      precipitation: precipIndex,
      weatherCode: weatherCodeIndex
    });
    
    // Helper function to safely convert values to array
    const safeArrayConvert = (values: any): number[] => {
      if (!values) return [];
      if (values instanceof Float32Array) {
        return Array.from(values);
      }
      if (Array.isArray(values)) {
        return values;
      }
      console.warn('Unexpected values type:', typeof values, values);
      return [];
    };
    
    const weatherData = {
      hourly: {
        time: [...Array((Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval())].map(
          (_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
        ),
        temperature: tempIndex >= 0 ? safeArrayConvert(hourly.variables(tempIndex)!.valuesArray()!) : [],
        precipitationProbability: precipIndex >= 0 ? safeArrayConvert(hourly.variables(precipIndex)!.valuesArray()!) : [],
        weatherCode: weatherCodeIndex >= 0 ? safeArrayConvert(hourly.variables(weatherCodeIndex)!.valuesArray()!) : [],
      },
    };
    
    console.log('=== Processed Weather Data ===');
    console.log('Time array length:', weatherData.hourly.time.length);
    console.log('Temperature array length:', weatherData.hourly.temperature.length);
    console.log('First 5 temperatures:', weatherData.hourly.temperature.slice(0, 5));
    console.log('Precipitation array length:', weatherData.hourly.precipitationProbability.length);
    console.log('First 5 precipitation values:', weatherData.hourly.precipitationProbability.slice(0, 5));
    console.log('Weather code array length:', weatherData.hourly.weatherCode.length);
    console.log('First 5 weather codes:', weatherData.hourly.weatherCode.slice(0, 5));
    
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
    
    // Check if any values are NaN (which happens when requesting historical data or dates too far in the future)
    const hasNaNTemperature = Array.from(weatherData.hourly.temperature).some(val => isNaN(val));
    const hasNaNPrecipitation = Array.from(weatherData.hourly.precipitationProbability).some(val => isNaN(val));
    const hasNaNWeatherCode = Array.from(weatherData.hourly.weatherCode).some(val => isNaN(val));
    
    if (hasNaNTemperature || hasNaNPrecipitation || hasNaNWeatherCode) {
      console.log('[getWeather] Weather data contains NaN values - likely requesting historical data or dates beyond forecast range');
      return null;
    }

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}


