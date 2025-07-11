import { useState } from 'react';
import { DateForm } from './DateForm';
import './DatesManager.css';
import { NextEventCard } from './NextEventCard';
import { DatesList } from './DatesList';
import { useDates } from '../../hooks/useDates';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export interface DateEntry {
  id: string;
  title: string;
  date: string;
  description: string;
  category: 'anniversary' | 'birthday' | 'first' | 'vacation' | 'milestone' | 'other';
  isRecurring: boolean;
}

export function DatesManager() {
  const { dates, loading, error, createDate, updateDate, deleteDate } = useDates();
  const [showForm, setShowForm] = useState(false);
  const [editingDate, setEditingDate] = useState<DateEntry | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');

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
        </div>
      </div>

      <DatesList 
        dates={dates}
        viewMode={viewMode}
        onEditDate={(date) => {
          setEditingDate(date);
          setShowForm(true);
        }}
        onDeleteDate={handleDeleteDate}
      />

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