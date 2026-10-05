function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearbyPlaces(currentPlace, allPlaces, { limit = 4, withinKm = 12 } = {}) {
  if (!currentPlace) return [];

  return allPlaces
    .filter((p) => p.place_id !== currentPlace.place_id)
    .map((p) => ({
      ...p,
      nearbyKm: haversineDistance(
        Number(currentPlace.latitude), Number(currentPlace.longitude),
        Number(p.latitude), Number(p.longitude)
      )
    }))
    .filter((p) => p.nearbyKm <= withinKm)
    .sort((a, b) => a.nearbyKm - b.nearbyKm)
    .slice(0, limit);
}