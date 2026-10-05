export function optimizeRoute(places) {
  if (!places || places.length <= 1) return places;

  const optimized = [places[0]];
  const remaining = [...places.slice(1)];

  while (remaining.length > 0) {
    const current = optimized[optimized.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;

    remaining.forEach((place, idx) => {
      const dLat = place.latitude - current.latitude;
      const dLon = place.longitude - current.longitude;
      const dist = Math.sqrt(dLat * dLat + dLon * dLon);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = idx;
      }
    });

    optimized.push(remaining[nearestIdx]);
    remaining.splice(nearestIdx, 1);
  }

  return optimized;
}