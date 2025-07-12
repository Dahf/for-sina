import { useState, useEffect } from 'react';
import { DateForm } from './DateForm';
import './DatesManager.css';
import { NextEventCard } from './NextEventCard';
import { DatesList } from './DatesList';
import { DateFilters, type SortOption } from './DateFilters';
import { DateStatistics } from './DateStatistics';
import { useDates } from '../../hooks/useDates';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import NotificationSettings from './NotificationSettings';
import CalendarView from './CalendarView';
import CategoryColors from './CategoryColors';
import { notificationService } from '../../services/notificationService';

export interface DateEntry {
  id: string;
  title: string;
  date: string;
  endDate?: string; // Optional für Bereichsauswahl
  description: string;
  category: 'anniversary' | 'birthday' | 'first' | 'vacation' | 'milestone' | 'other';
  isRecurring: boolean;
  // Neue Felder für erweiterte Funktionen
  tags: string[]; // Tags/Labels für bessere Organisation
  priority: 'low' | 'medium' | 'high'; // Prioritätssystem
  reminderDays: number[]; // Erinnerungen (Tage vorher)
  recurringType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'; // Erweiterte Wiederholungen
  recurringInterval: number; // Intervall (z.B. alle 2 Jahre)
  recurringEndDate?: string; // Wann soll Wiederholung enden
  photos: string[]; // URLs zu Fotos/Medien
  color?: string; // Benutzerdefinierte Farbe
  createdAt: string;
  updatedAt: string;
}

export function DatesManager() {
  const { dates, loading, error, createDate, updateDate, deleteDate } = useDates();
  const [showForm, setShowForm] = useState(false);
  const [editingDate, setEditingDate] = useState<DateEntry | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline' | 'statistics' | 'calendar' | 'settings'>('cards');
  const [filteredDates, setFilteredDates] = useState<DateEntry[]>([]);
  const [currentSort, setCurrentSort] = useState<SortOption>('date-desc');
  const [notificationPermission, setNotificationPermission] = useState({ granted: false, supported: false });

  // Initialize notification service
  useEffect(() => {
    if (dates.length > 0) {
      notificationService.startReminderCheck(dates);
    }
    
    return () => {
      notificationService.stopReminderCheck();
    };
  }, [dates]);

  // Get unique categories from dates
  const categories = [...new Set(dates.map(date => date.category))].filter(Boolean);

  // Handle save date from form
  const handleSaveDate = async (dateEntry: DateEntry) => {
    if (editingDate) {
      // Update existing date
      const success = await updateDate(editingDate.id, dateEntry);
      if (success) {
        setShowForm(false);
        setEditingDate(null);
      }
    } else {
      // Create new date
      const success = await createDate(dateEntry);
      if (success) {
        setShowForm(false);
        setEditingDate(null);
      }
    }
  };

  // Handle delete date
  const handleDeleteDate = async (dateId: string) => {
    if (window.confirm('Möchtest du dieses Datum wirklich löschen?')) {
      await deleteDate(dateId);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="dates-manager">
        <div className="dates-header">
          <h2>📅 Unsere wichtigen Daten</h2>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dates-manager">
        <div className="dates-header">
          <h2>📅 Unsere wichtigen Daten</h2>
        </div>
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#dc3545',
          background: '#f8d7da',
          borderRadius: '8px',
          margin: '1rem 0'
        }}>
          <p>❌ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Seite neu laden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dates-manager">
      <div className="dates-header">
        <h2>📅 Unsere wichtigen Daten</h2>
        
        <NextEventCard dates={dates} />
      </div>

      <DateFilters
        dates={dates}
        onFilteredDatesChange={setFilteredDates}
        onSortChange={setCurrentSort}
      />

      <div className="dates-controls">
        <button 
          className="add-date-btn"
          onClick={() => setShowForm(true)}
        >
          + Neues Datum hinzufügen
        </button>
        
        <div className="view-toggle">
          <button 
            className={viewMode === 'cards' ? 'active' : ''}
            onClick={() => setViewMode('cards')}
          >
            📋 Karten
          </button>
          <button 
            className={viewMode === 'timeline' ? 'active' : ''}
            onClick={() => setViewMode('timeline')}
          >
            📈 Timeline
          </button>
          <button 
            className={viewMode === 'statistics' ? 'active' : ''}
            onClick={() => setViewMode('statistics')}
          >
            📊 Statistiken
          </button>
          <button 
            className={viewMode === 'calendar' ? 'active' : ''}
            onClick={() => setViewMode('calendar')}
          >
            📅 Kalender
          </button>
          <button 
            className={viewMode === 'settings' ? 'active' : ''}
            onClick={() => setViewMode('settings')}
          >
            ⚙️ Einstellungen
          </button>
        </div>
      </div>

      {viewMode === 'statistics' && (
        <DateStatistics dates={filteredDates.length > 0 ? filteredDates : dates} />
      )}
      
      {viewMode === 'calendar' && (
        <CalendarView 
          dates={filteredDates.length > 0 ? filteredDates : dates}
          onEventClick={(event) => {
            setEditingDate(event);
            setShowForm(true);
          }}
        />
      )}
      
      {viewMode === 'settings' && (
        <div className="settings-container">
          <NotificationSettings 
            onPermissionChange={setNotificationPermission}
          />
          <CategoryColors 
            categories={categories}
            onColorChange={(category, color) => {
              console.log(`Category ${category} color changed to ${color}`);
            }}
          />
        </div>
      )}
      
      {(viewMode === 'cards' || viewMode === 'timeline') && (
        <DatesList 
          dates={filteredDates.length > 0 ? filteredDates : dates}
          viewMode={viewMode as 'cards' | 'timeline'}
          onEditDate={(date) => {
            setEditingDate(date);
            setShowForm(true);
          }}
          onDeleteDate={handleDeleteDate}
        />
      )}

      {showForm && (
        <DateForm
          editingDate={editingDate}
          onSave={handleSaveDate}
          onCancel={() => {
            setShowForm(false);
            setEditingDate(null);
          }}
        />
      )}
    </div>
  );
} 