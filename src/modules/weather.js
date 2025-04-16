const API_KEY = 'c72881ce2baaae31c880f1fa64c1b4ea';

export async function getWeather() {
  try {
    // First try to get location from IP (fallback)
    const locationResponse = await fetch('https://ipapi.co/json/');
    const locationData = await locationResponse.json();

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${locationData.city}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      city: data.name,
      country: data.sys.country,
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed),
      description: data.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    };
  } catch (error) {
    console.error('Weather error:', error);
    document.getElementById('weather').textContent = 'Weather data unavailable';
    return null;
  }
}