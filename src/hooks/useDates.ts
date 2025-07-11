import { useState, useEffect } from 'react';
import { DatesService } from '../services/datesService';
import { useAuth } from './useAuth';
import type { DateEntry } from '../components/dates/DatesManager';

export function useDates() {
  const [dates, setDates] = useState<DateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Dates laden
  const loadDates = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const loadedDates = await DatesService.getDates(user.id);
      setDates(loadedDates);
    } catch (err) {
      console.error('Fehler beim Laden der Dates:', err);
      setError('Fehler beim Laden der Dates');
    } finally {
      setLoading(false);
    }
  };

  // Dates beim Mount und bei User-Änderung laden
  useEffect(() => {
    loadDates();
  }, [user]);

  // Neues Date erstellen
  const createDate = async (date: Omit<DateEntry, 'id'>): Promise<DateEntry | null> => {
    if (!user) {
      setError('Benutzer nicht angemeldet');
      return null;
    }

    try {
      setError(null);
      const newDate = await DatesService.createDate(date, user.id);
      setDates(prev => [newDate, ...prev]);
      return newDate;
    } catch (err) {
      console.error('Fehler beim Erstellen des Dates:', err);
      setError('Fehler beim Erstellen des Dates');
      return null;
    }
  };

  // Date aktualisieren
  const updateDate = async (dateId: string, updates: Partial<DateEntry>): Promise<DateEntry | null> => {
    if (!user) {
      setError('Benutzer nicht angemeldet');
      return null;
    }

    try {
      setError(null);
      const updatedDate = await DatesService.updateDate(dateId, updates, user.id);
      setDates(prev => prev.map(date => 
        date.id === dateId ? updatedDate : date
      ));
      return updatedDate;
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Dates:', err);
      setError('Fehler beim Aktualisieren des Dates');
      return null;
    }
  };

  // Date löschen
  const deleteDate = async (dateId: string): Promise<boolean> => {
    if (!user) {
      setError('Benutzer nicht angemeldet');
      return false;
    }

    try {
      setError(null);
      await DatesService.deleteDate(dateId, user.id);
      setDates(prev => prev.filter(date => date.id !== dateId));
      return true;
    } catch (err) {
      console.error('Fehler beim Löschen des Dates:', err);
      setError('Fehler beim Löschen des Dates');
      return false;
    }
  };

  return {
    dates,
    loading,
    error,
    createDate,
    updateDate,
    deleteDate,
    refetch: loadDates
  };
} 