'use client';

// useFavorites - 股票收藏Hook

import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'rho_favorites';

export interface FavoriteStock {
  code: string;
  name: string;
  addedAt: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteStock[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load favorites:', e);
    }
  }, []);

  // Add to favorites
  const addFavorite = useCallback((code: string, name: string) => {
    const item: FavoriteStock = { code, name, addedAt: new Date().toISOString() };
    setFavorites(prev => {
      if (prev.some(f => f.code === code)) return prev;
      const updated = [item, ...prev];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Remove from favorites
  const removeFavorite = useCallback((code: string) => {
    setFavorites(prev => {
      const updated = prev.filter(f => f.code !== code);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Toggle favorite - 直接操作state避免闭包陷阱
  const toggleFavorite = useCallback((code: string, name: string) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.code === code);
      if (exists) {
        const updated = prev.filter(f => f.code !== code);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
        return updated;
      } else {
        const item: FavoriteStock = { code, name, addedAt: new Date().toISOString() };
        const updated = [item, ...prev];
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
        return updated;
      }
    });
  }, []);

  // Check if code is favorited
  const isFavorite = useCallback((code: string) => {
    return favorites.some(f => f.code === code);
  }, [favorites]);

  return { favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite };
}
