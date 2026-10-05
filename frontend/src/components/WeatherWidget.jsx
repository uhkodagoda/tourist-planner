import React, { useEffect, useState } from 'react';
import Icon from './Icon.jsx';

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const lat = 6.8174;
    const lon = 79.9236;

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      .then((res) => res.json())
      .then((data) => setWeather(data.current_weather))
      .catch(() => setError(true));
  }, []);

  if (error) return null;

  if (!weather) {
    return <div className="weather-widget loading">Loading weather...</div>;
  }

  const code = weather.weathercode;
  const temp = Math.round(weather.temperature);

  const getIcon = (code) => {
    if (code === 0) return 'sun';
    if (code <= 3) return 'cloudSun';
    if (code <= 67) return 'cloudRain';
    if (code <= 77) return 'snowflake';
    if (code <= 82) return 'cloudRain';
    return 'cloudLightning';
  };

  return (
    <div className="weather-widget">
      <span className="weather-icon"><Icon name={getIcon(code)} size={22} /></span>
      <span className="weather-temp">{temp}°C</span>
      <span className="weather-location">Piliyandala</span>
    </div>
  );
}