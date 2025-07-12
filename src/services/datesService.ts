import { supabase } from '../supabaseClient';
import type { DateEntry } from '../components/dates/DatesManager';

export interface SupabaseDateEntry {
  id: string;
  title: string;
  date: string;
  end_date?: string; // Optional für Bereichsauswahl
  description: string;
  category: 'anniversary' | 'birthday' | 'first' | 'vacation' | 'milestone' | 'other';
  is_recurring: boolean;
  // Neue Felder für erweiterte Funktionen
  tags: string[]; // JSON Array
  priority: 'low' | 'medium' | 'high';
  reminder_days: number[]; // JSON Array
  recurring_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  recurring_interval: number;
  recurring_end_date?: string;
  photos: string[]; // JSON Array
  color?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export class DatesService {
  // Alle Dates für den aktuellen User laden
  static async getDates(): Promise<DateEntry[]> {
    try {
      const { data, error } = await supabase
        .from('dates')
        .select('*')
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
  static async updateDate(dateId: string, updates: Partial<DateEntry>): Promise<DateEntry> {
    try {
      const supabaseUpdates = this.convertToSupabaseUpdates(updates);
      
      const { data, error } = await supabase
        .from('dates')
        .update(supabaseUpdates)
        .eq('id', dateId)
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
  static async deleteDate(dateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('dates')
        .delete()
        .eq('id', dateId)

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
      end_date: date.endDate,
      description: date.description,
      category: date.category,
      is_recurring: date.isRecurring,
      tags: date.tags,
      priority: date.priority,
      reminder_days: date.reminderDays,
      recurring_type: date.recurringType,
      recurring_interval: date.recurringInterval,
      recurring_end_date: date.recurringEndDate,
      photos: date.photos,
      color: date.color,
      user_id: userId
    };
  }

  // Konvertierung von Supabase-Format zu App-Format
  private static convertFromSupabase(supabaseDate: SupabaseDateEntry): DateEntry {
    return {
      id: supabaseDate.id,
      title: supabaseDate.title,
      date: supabaseDate.date,
      endDate: supabaseDate.end_date,
      description: supabaseDate.description,
      category: supabaseDate.category,
      isRecurring: supabaseDate.is_recurring,
      tags: supabaseDate.tags || [],
      priority: supabaseDate.priority || 'medium',
      reminderDays: supabaseDate.reminder_days || [],
      recurringType: supabaseDate.recurring_type || 'none',
      recurringInterval: supabaseDate.recurring_interval || 1,
      recurringEndDate: supabaseDate.recurring_end_date,
      photos: supabaseDate.photos || [],
      color: supabaseDate.color,
      createdAt: supabaseDate.created_at || new Date().toISOString(),
      updatedAt: supabaseDate.updated_at || new Date().toISOString()
    };
  }

  // Konvertierung von partiellen Updates
  private static convertToSupabaseUpdates(updates: Partial<DateEntry>): Partial<SupabaseDateEntry> {
    const supabaseUpdates: Partial<SupabaseDateEntry> = {};
    
    if (updates.title !== undefined) supabaseUpdates.title = updates.title;
    if (updates.date !== undefined) supabaseUpdates.date = updates.date;
    if (updates.endDate !== undefined) supabaseUpdates.end_date = updates.endDate;
    if (updates.description !== undefined) supabaseUpdates.description = updates.description;
    if (updates.category !== undefined) supabaseUpdates.category = updates.category;
    if (updates.isRecurring !== undefined) supabaseUpdates.is_recurring = updates.isRecurring;
    if (updates.tags !== undefined) supabaseUpdates.tags = updates.tags;
    if (updates.priority !== undefined) supabaseUpdates.priority = updates.priority;
    if (updates.reminderDays !== undefined) supabaseUpdates.reminder_days = updates.reminderDays;
    if (updates.recurringType !== undefined) supabaseUpdates.recurring_type = updates.recurringType;
    if (updates.recurringInterval !== undefined) supabaseUpdates.recurring_interval = updates.recurringInterval;
    if (updates.recurringEndDate !== undefined) supabaseUpdates.recurring_end_date = updates.recurringEndDate;
    if (updates.photos !== undefined) supabaseUpdates.photos = updates.photos;
    if (updates.color !== undefined) supabaseUpdates.color = updates.color;
    
    return supabaseUpdates;
  }
} 