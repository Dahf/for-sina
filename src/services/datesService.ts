import { supabase } from '../supabaseClient';
import type { DateEntry } from '../components/dates/DatesManager';

export interface SupabaseDateEntry {
  id: string;
  title: string;
  date: string;
  description: string;
  category: 'anniversary' | 'birthday' | 'first' | 'vacation' | 'milestone' | 'other';
  is_recurring: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export class DatesService {
  // Alle Dates für den aktuellen User laden
  static async getDates(userId: string): Promise<DateEntry[]> {
    try {
      const { data, error } = await supabase
        .from('dates')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Fehler beim Laden der Dates:', error);
        throw error;
      }

      // Konvertiere Supabase-Format zu App-Format
      return data.map(this.convertFromSupabase);
    } catch (error) {
      console.error('Fehler beim Laden der Dates:', error);
      throw error;
    }
  }

  // Neues Date erstellen
  static async createDate(date: Omit<DateEntry, 'id'>, userId: string): Promise<DateEntry> {
    try {
      const supabaseDate = this.convertToSupabase(date, userId);
      
      const { data, error } = await supabase
        .from('dates')
        .insert([supabaseDate])
        .select()
        .single();

      if (error) {
        console.error('Fehler beim Erstellen des Dates:', error);
        throw error;
      }

      return this.convertFromSupabase(data);
    } catch (error) {
      console.error('Fehler beim Erstellen des Dates:', error);
      throw error;
    }
  }

  // Date aktualisieren
  static async updateDate(dateId: string, updates: Partial<DateEntry>, userId: string): Promise<DateEntry> {
    try {
      const supabaseUpdates = this.convertToSupabaseUpdates(updates);
      
      const { data, error } = await supabase
        .from('dates')
        .update(supabaseUpdates)
        .eq('id', dateId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Fehler beim Aktualisieren des Dates:', error);
        throw error;
      }

      return this.convertFromSupabase(data);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Dates:', error);
      throw error;
    }
  }

  // Date löschen
  static async deleteDate(dateId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('dates')
        .delete()
        .eq('id', dateId)
        .eq('user_id', userId);

      if (error) {
        console.error('Fehler beim Löschen des Dates:', error);
        throw error;
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Dates:', error);
      throw error;
    }
  }

  // Konvertierung von App-Format zu Supabase-Format
  private static convertToSupabase(date: Omit<DateEntry, 'id'>, userId: string): Omit<SupabaseDateEntry, 'id' | 'created_at' | 'updated_at'> {
    return {
      title: date.title,
      date: date.date,
      description: date.description,
      category: date.category,
      is_recurring: date.isRecurring,
      user_id: userId
    };
  }

  // Konvertierung von Supabase-Format zu App-Format
  private static convertFromSupabase(supabaseDate: SupabaseDateEntry): DateEntry {
    return {
      id: supabaseDate.id,
      title: supabaseDate.title,
      date: supabaseDate.date,
      description: supabaseDate.description,
      category: supabaseDate.category,
      isRecurring: supabaseDate.is_recurring
    };
  }

  // Konvertierung von partiellen Updates
  private static convertToSupabaseUpdates(updates: Partial<DateEntry>): Partial<SupabaseDateEntry> {
    const supabaseUpdates: Partial<SupabaseDateEntry> = {};
    
    if (updates.title !== undefined) supabaseUpdates.title = updates.title;
    if (updates.date !== undefined) supabaseUpdates.date = updates.date;
    if (updates.description !== undefined) supabaseUpdates.description = updates.description;
    if (updates.category !== undefined) supabaseUpdates.category = updates.category;
    if (updates.isRecurring !== undefined) supabaseUpdates.is_recurring = updates.isRecurring;
    
    return supabaseUpdates;
  }
} 