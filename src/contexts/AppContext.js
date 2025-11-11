import React, { createContext, useState, useContext, useEffect } from 'react';
import * as storageService from '../services/storageService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [hist, favs, statistics] = await Promise.all([
        storageService.getHistory(),
        storageService.getFavorites(),
        storageService.getStats()
      ]);

      setHistory(hist);
      setFavorites(favs);
      setStats(statistics);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUsageLimit = async () => {
    return true; // Sempre permitir uso (app gratuito)
  };

  const incrementUsage = async () => {
    // Não faz nada, mantido para compatibilidade
  };

  const addToHistory = async (item) => {
    const saved = await storageService.saveToHistory(item);
    setHistory(prev => [saved, ...prev].slice(0, 50));
    await loadStats(); // Atualiza stats
  };

  const toggleFavorite = async (item) => {
    const isFav = await storageService.isFavorite(item.id);
    
    if (isFav) {
      await storageService.removeFromFavorites(item.id);
      setFavorites(prev => prev.filter(f => f.id !== item.id));
    } else {
      await storageService.addToFavorites(item);
      setFavorites(prev => [item, ...prev]);
    }
  };

  const loadStats = async () => {
    const statistics = await storageService.getStats();
    setStats(statistics);
  };

  const value = {
    checkUsageLimit,
    incrementUsage,
    history,
    favorites,
    stats,
    addToHistory,
    toggleFavorite,
    refreshData: loadData,
    resetApp: async () => {
      await loadData();
    },
    loading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
};
