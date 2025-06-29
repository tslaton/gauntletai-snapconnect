// weather.ts
// https://open-meteo.com/en/docs?hourly=temperature_2m,precipitation_probability&timezone=GMT&time_mode=time_interval&start_date=2025-06-22&end_date=2025-07-06
import { fetchWeatherApi } from 'openmeteo';


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
        temperature2m: hourly.variables(0)!.valuesArray()!,
        precipitationProbability: hourly.variables(1)!.valuesArray()!,
      },
    };

    // `weatherData` now contains a simple structure with arrays for datetime and weather data
    for (let i = 0; i < weatherData.hourly.time.length; i++) {
      console.log(
        weatherData.hourly.time[i].toISOString(),
        weatherData.hourly.temperature2m[i],
        weatherData.hourly.precipitationProbability[i]
      );
    }

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}


