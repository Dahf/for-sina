import { useState, useEffect } from 'react';
import type { DateEntry } from './DatesManager';
import './DateForm.css';
import MediaUpload from './MediaUpload';
import { supabase } from '../../supabaseClient';

interface DateFormProps {
  editingDate: DateEntry | null;
  onSave: (date: DateEntry) => Promise<void>;
  onCancel: () => void;
}

const categoryOptions = [
  { value: 'anniversary', label: 'Jahrestag', icon: '💕' },
  { value: 'birthday', label: 'Geburtstag', icon: '🎂' },
  { value: 'first', label: 'Erstes Mal', icon: '🎉' },
  { value: 'vacation', label: 'Urlaub', icon: '✈️' },
  { value: 'milestone', label: 'Meilenstein', icon: '🏆' },
  { value: 'other', label: 'Sonstiges', icon: '📅' }
];

const priorityOptions = [
  { value: 'low', label: 'Niedrig', icon: '🟢', color: '#28a745' },
  { value: 'medium', label: 'Mittel', icon: '🟡', color: '#ffc107' },
  { value: 'high', label: 'Hoch', icon: '🔴', color: '#dc3545' }
];

const recurringOptions = [
  { value: 'none', label: 'Keine Wiederholung' },
  { value: 'daily', label: 'Täglich' },
  { value: 'weekly', label: 'Wöchentlich' },
  { value: 'monthly', label: 'Monatlich' },
  { value: 'yearly', label: 'Jährlich' },
  { value: 'custom', label: 'Benutzerdefiniert' }
];

const commonTags = [
  'Familie', 'Arbeit', 'Urlaub', 'Gesundheit', 'Freunde', 
  'Hobbys', 'Sport', 'Reisen', 'Bildung', 'Finanzen'
];

const reminderOptions = [
  { value: 0, label: 'Am Tag selbst' },
  { value: 1, label: '1 Tag vorher' },
  { value: 3, label: '3 Tage vorher' },
  { value: 7, label: '1 Woche vorher' },
  { value: 14, label: '2 Wochen vorher' },
  { value: 30, label: '1 Monat vorher' }
];

export function DateForm({ editingDate, onSave, onCancel }: DateFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    endDate: '',
    description: '',
    category: 'anniversary' as DateEntry['category'],
    isRecurring: false,
    isDateRange: false,
    // Neue Felder für erweiterte Funktionen
    tags: [] as string[],
    priority: 'medium' as DateEntry['priority'],
    reminderDays: [] as number[],
    recurringType: 'none' as DateEntry['recurringType'],
    recurringInterval: 1,
    recurringEndDate: '',
    photos: [] as (string | File)[], // Kann sowohl URLs als auch File-Objekte enthalten
    color: '',
    newTag: '' // Für neuen Tag Input
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Verhindere Body-Scroll wenn Modal geöffnet ist
  useEffect(() => {
    // Speichere aktuelle Scroll-Position
    const scrollY = window.scrollY;
    
    // Verhindere Body-Scroll
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    // Cleanup: Stelle Body-Scroll wieder her
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    if (editingDate) {
      setFormData({
        title: editingDate.title,
        date: editingDate.date,
        endDate: editingDate.endDate || '',
        description: editingDate.description,
        category: editingDate.category,
        isRecurring: editingDate.isRecurring,
        isDateRange: !!editingDate.endDate,
        tags: editingDate.tags || [],
        priority: editingDate.priority || 'medium',
        reminderDays: editingDate.reminderDays || [],
        recurringType: editingDate.recurringType || 'none',
        recurringInterval: editingDate.recurringInterval || 1,
        recurringEndDate: editingDate.recurringEndDate || '',
        photos: editingDate.photos || [],
        color: editingDate.color || '',
        newTag: ''
      });
    } else {
      setFormData({
        title: '',
        date: '',
        endDate: '',
        description: '',
        category: 'anniversary',
        isRecurring: false,
        isDateRange: false,
        tags: [],
        priority: 'medium',
        reminderDays: [],
        recurringType: 'none',
        recurringInterval: 1,
        recurringEndDate: '',
        photos: [],
        color: '',
        newTag: ''
      });
    }
    setErrors({});
  }, [editingDate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Titel ist erforderlich';
    }

    if (!formData.date) {
      newErrors.date = 'Datum ist erforderlich';
    }

    // Validierung für Bereichsauswahl
    if (formData.isDateRange && !formData.endDate) {
      newErrors.endDate = 'Enddatum ist erforderlich für Bereichsauswahl';
    }

    if (formData.isDateRange && formData.date && formData.endDate) {
      const startDate = new Date(formData.date);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        newErrors.endDate = 'Enddatum muss nach dem Startdatum liegen';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  async function uploadFileToBucket(file: File) {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const { error } = await supabase.storage
      .from('event-media')
      .upload(fileName, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('event-media').getPublicUrl(fileName);
    return data.publicUrl;
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const uploadedUrls: string[] = [];
    
    // Verarbeite sowohl existierende URLs als auch neue File-Objekte
    for (const media of formData.photos) {
      if (typeof media === 'string') {
        // Bereits hochgeladene URL
        uploadedUrls.push(media);
      } else if (media instanceof File) {
        // Neues File-Objekt - zu Supabase hochladen
        try {
          const url = await uploadFileToBucket(media);
          uploadedUrls.push(url);
        } catch (error) {
          console.error('Fehler beim Hochladen der Datei:', error);
          alert(`Fehler beim Hochladen von ${media.name}`);
          return; // Stoppe den Submit-Prozess bei Fehlern
        }
      }
    }
  
    const dateEntry: DateEntry = {
      id: editingDate?.id || Date.now().toString(),
      title: formData.title.trim(),
      date: formData.date,
      endDate: formData.isDateRange ? formData.endDate : undefined,
      description: formData.description.trim(),
      category: formData.category,
      isRecurring: formData.isRecurring,
      tags: formData.tags,
      priority: formData.priority,
      reminderDays: formData.reminderDays,
      recurringType: formData.recurringType,
      recurringInterval: formData.recurringInterval,
      recurringEndDate: formData.recurringEndDate || undefined,
      photos: uploadedUrls,
      color: formData.color || undefined,
      createdAt: editingDate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onSave(dateEntry);
  };

  const handleInputChange = (field: string, value: string | boolean | string[] | number | number[] | (string | File)[]) => {
    console.log('handleInputChange:', field, value); // Debug-Logging
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Entferne Fehler wenn Feld korrigiert wird
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="form-overlay" onClick={handleOverlayClick}>
      <div className="form-container">
        <h3>{editingDate ? 'Datum bearbeiten' : 'Neues Datum hinzufügen'}</h3>
        
        <form onSubmit={handleSubmit} className="date-form">
          <div className="form-group">
            <label htmlFor="title">Titel *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="z.B. Erstes Date, Jahrestag..."
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isDateRange}
                onChange={(e) => {
                  console.log('Checkbox clicked:', e.target.checked);
                  handleInputChange('isDateRange', e.target.checked);
                }}
              />
              <span className="checkbox-text">
                📅 Bereichsauswahl (z.B. für Urlaub) {formData.isDateRange ? '✅' : '❌'}
              </span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="date">{formData.isDateRange ? 'Startdatum *' : 'Datum *'}</label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={errors.date ? 'error' : ''}
            />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </div>

          {formData.isDateRange && (
            <div className="form-group" style={{ border: '2px solid red', padding: '10px' }}>
              <label htmlFor="endDate">Enddatum *</label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                min={formData.date}
                className={errors.endDate ? 'error' : ''}
              />
              {errors.endDate && <span className="error-text">{errors.endDate}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="category">Kategorie</label>
            <div className="category-grid">
              {categoryOptions.map(option => (
                <label key={option.value} className="category-option">
                  <input
                    type="radio"
                    name="category"
                    value={option.value}
                    checked={formData.category === option.value}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  />
                  <div className={`category-card ${formData.category === option.value ? 'selected' : ''}`}>
                    <span className="category-icon">{option.icon}</span>
                    <span className="category-label">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Beschreibung</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Besondere Erinnerungen oder Details..."
              rows={3}
            />
          </div>

          {/* Priorität */}
          <div className="form-group">
            <label htmlFor="priority">Priorität</label>
            <div className="priority-grid">
              {priorityOptions.map(option => (
                <label key={option.value} className="priority-option">
                  <input
                    type="radio"
                    name="priority"
                    value={option.value}
                    checked={formData.priority === option.value}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                  />
                  <div className={`priority-card ${formData.priority === option.value ? 'selected' : ''}`}>
                    <span className="priority-icon">{option.icon}</span>
                    <span className="priority-label">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <div className="tags-container">
              <div className="selected-tags">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag-chip">
                    {tag}
                    <button
                      type="button"
                      onClick={() => {
                        const newTags = formData.tags.filter((_, i) => i !== index);
                        handleInputChange('tags', newTags);
                      }}
                      className="tag-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="common-tags">
                {commonTags.filter(tag => !formData.tags.includes(tag)).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const newTags = [...formData.tags, tag];
                      handleInputChange('tags', newTags);
                    }}
                    className="tag-suggestion"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Erweiterte Wiederholungen */}
          <div className="form-group">
            <label htmlFor="recurringType">Wiederholung</label>
            <select
              id="recurringType"
              value={formData.recurringType}
              onChange={(e) => handleInputChange('recurringType', e.target.value)}
            >
              {recurringOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {formData.recurringType !== 'none' && (
            <div className="form-group">
              <label htmlFor="recurringInterval">Intervall</label>
              <input
                type="number"
                id="recurringInterval"
                value={formData.recurringInterval}
                onChange={(e) => handleInputChange('recurringInterval', parseInt(e.target.value) || 1)}
                min="1"
                placeholder="z.B. 2 für alle 2 Jahre"
              />
            </div>
          )}

          {/* Erinnerungen */}
          <div className="form-group">
            <label htmlFor="reminders">Erinnerungen</label>
            <div className="reminders-container">
              {reminderOptions.map(option => (
                <label key={option.value} className="reminder-option">
                  <input
                    type="checkbox"
                    checked={formData.reminderDays.includes(option.value)}
                    onChange={(e) => {
                      const newReminders = e.target.checked
                        ? [...formData.reminderDays, option.value]
                        : formData.reminderDays.filter(day => day !== option.value);
                      handleInputChange('reminderDays', newReminders);
                    }}
                  />
                  <span className="reminder-label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>



          {/* Media Upload */}
          <div className="form-group">
            <MediaUpload
              existingMedia={formData.photos.filter(p => typeof p === 'string') as string[]}
              onMediaChange={(mediaFiles) => {
                // Kombiniere existierende URLs mit neuen File-Objekten
                const existingUrls = formData.photos.filter(p => typeof p === 'string');
                const combinedMedia = [...existingUrls, ...mediaFiles];
                handleInputChange('photos', combinedMedia);
              }}
              maxFiles={5}
              maxFileSize={10}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Abbrechen
            </button>
            <button type="submit" className="save-btn">
              {editingDate ? 'Aktualisieren' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 