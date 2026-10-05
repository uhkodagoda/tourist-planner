import React, { createContext, useContext, useEffect, useState } from 'react';

const PlanContext = createContext(null);
const STORAGE_KEY = 'in_progress_visit_plan';
const FAV_KEY = 'favorite_places';

export function PlanProvider({ children }) {
  const [plan, setPlan] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(FAV_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites]);

  function addPlace(place) {
    setPlan((prev) => {
      if (prev.some((p) => p.place_id === place.place_id)) return prev;
      return [...prev, place];
    });
  }

  function removePlace(placeId) {
    setPlan((prev) => prev.filter((p) => p.place_id !== placeId));
  }

  function isInPlan(placeId) {
    return plan.some((p) => p.place_id === placeId);
  }

  function moveUp(index) {
    if (index <= 0) return;
    setPlan((prev) => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  }

  function moveDown(index) {
    setPlan((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
  }

  function clearPlan() {
    setPlan([]);
  }

  function toggleFavorite(placeId) {
    setFavorites((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  }

  function isFavorite(placeId) {
    return favorites.includes(placeId);
  }

  const totalDistance = plan.reduce((sum, p) => sum + Number(p.distance_km || 0), 0);

  return (
    <PlanContext.Provider
      value={{
        plan, addPlace, removePlace, isInPlan, moveUp, moveDown, clearPlan, totalDistance,
        favorites, toggleFavorite, isFavorite
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within a PlanProvider');
  return ctx;
}