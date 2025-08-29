// Client/src/utils/weatherPrecautions.js
// Maps OpenWeather current conditions to your weatherPrecuations.json tips.

import precautionsData from '../data/weatherPrecautions.json';

/**
 * Return true if "now" is between sunrise and sunset.
 */
const isDaytime = (nowUnix, sunriseUnix, sunsetUnix) => {
  if (!sunriseUnix || !sunsetUnix) return true; // assume day if unknown
  return nowUnix >= sunriseUnix && nowUnix <= sunsetUnix;
};

/**
 * Map cloud description to subtype used in JSON (few/scattered/broken/overcast).
 */
const parseCloudsSubtype = (desc = '') => {
  const d = (desc || '').toLowerCase();
  if (d.includes('few')) return 'few';
  if (d.includes('scattered')) return 'scattered';
  if (d.includes('broken')) return 'broken';
  if (d.includes('overcast')) return 'overcast';
  return null;
};

/**
 * Bucket rain intensity using mm/hr (fallback moderate if rate unknown).
 * OpenWeather current: rain["1h"] or rain["3h"] (3h total).
 */
const rainIntensityFromRate = (mmPerHr) => {
  if (mmPerHr == null) return 'moderate';
  if (mmPerHr < 2) return 'light';
  if (mmPerHr <= 10) return 'moderate';
  return 'heavy';
};

/**
 * Map temp (°C) to bands defined in JSON.
 */
const tempBand = (t) => {
  if (!Number.isFinite(t)) return null;
  if (t <= -10) return '≤ -10';
  if (t > -10 && t < 0) return '-10 to 0';
  if (t >= 0 && t < 5) return '0 to 5';
  if (t >= 5 && t < 15) return '5 to 15';
  if (t >= 15 && t < 25) return '15 to 25';
  if (t >= 25 && t < 32) return '25 to 32';
  if (t >= 32 && t <= 40) return '32 to 40';
  return '> 40';
};

/**
 * Compute precautions from OpenWeather "current weather" payload.
 * Expects metric (°C) per your app config.
 *
 * @param {object} weatherData - OpenWeather /weather response.
 * @returns {string[]} unique list of tips ordered by discovery.
 */
export const getPrecautions = (weatherData) => {
  const tips = new Set();
  if (!weatherData?.main || !weatherData?.weather?.[0]) return [];

  const { byMain, byTemp, fallback } = precautionsData || {};
  const main = weatherData.weather[0].main;            // e.g., 'Rain'
  const desc = weatherData.weather[0].description;     // e.g., 'light rain'
  const tempC = weatherData.main?.temp;                // °C (your actions request metric)
  const now = Math.floor(Date.now() / 1000);
  const sunrise = weatherData.sys?.sunrise;
  const sunset = weatherData.sys?.sunset;
  const rain1h = weatherData.rain?.['1h'];
  const rain3h = weatherData.rain?.['3h'];

  // --- byMain match ---
  if (byMain?.[main]) {
    const block = byMain[main];

    if (main === 'Clear') {
      const key = isDaytime(now, sunrise, sunset) ? 'day' : 'night';
      (block[key] || []).forEach((t) => tips.add(t));
    } else if (main === 'Clouds') {
      const subtype = parseCloudsSubtype(desc) || 'overcast';
      (block[subtype] || []).forEach((t) => tips.add(t));
    } else if (main === 'Rain') {
      const rate = rain1h != null ? rain1h : rain3h != null ? rain3h / 3 : null;
      const bucket = rainIntensityFromRate(rate);
      (block[bucket] || []).forEach((t) => tips.add(t));
    } else if (Array.isArray(block.precautions)) {
      block.precautions.forEach((t) => tips.add(t));
    }
  }

  // --- byTemp match ---
  const band = tempBand(tempC);
  if (band && Array.isArray(byTemp)) {
    const tempMatch = byTemp.find((b) => b.band === band);
    tempMatch?.precautions?.forEach((t) => tips.add(t));
  }

  // --- fallback ---
  if (tips.size === 0) {
    fallback?.precautions?.forEach((t) => tips.add(t));
  }

  return Array.from(tips);
};

/**
 * (Optional) Helper for forecast entries (from /forecast list items),
 * which have a slightly different shape.
 *
 * Usage: getPrecautionsFromForecastItem(forecastItem, { sunrise, sunset })
 */
export const getPrecautionsFromForecastItem = (item, { sunrise, sunset } = {}) => {
  if (!item?.main || !item?.weather?.[0]) return [];
  // Normalize to something close to current weather shape and reuse logic
  const normalized = {
    main: item.main,
    weather: item.weather,
    sys: { sunrise, sunset }, // pass in city-level sunrise/sunset if you have it
    rain: item.rain,
  };
  return getPrecautions(normalized);
};
