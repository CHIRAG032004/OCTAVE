async function getLocation(lat, lon) {
  const apiKey = process.env.OPENCAGE_API_KEY;
  if (!apiKey) {
    return { city: '', state: '' };
  }

  try {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`OpenCage request failed with status ${res.status}`);
    }

    const data = await res.json();
    const components = data.results?.[0]?.components || {};
    const city = components.city || components.town || components.village || '';
    const state = components.state || '';

    return { city, state };
  } catch (error) {
    console.error('Error resolving location:', error.message);
    return { city: '', state: '' };
  }
}

module.exports = getLocation;
