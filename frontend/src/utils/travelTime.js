const AVERAGE_SPEED_KMH = 25;

export function estimateTravelTime(distanceKm) {
  const hours = Number(distanceKm) / AVERAGE_SPEED_KMH;
  const minutes = Math.round(hours * 60);

  if (minutes < 60) {
    return `~${minutes} min`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `~${h} hr` : `~${h} hr ${m} min`;
}