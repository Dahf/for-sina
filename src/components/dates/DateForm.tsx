import { useState, useEffect } from 'react';
import type { DateEntry } from './DatesManager';
import './DateForm.css';

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

export function DateForm({ editingDate, onSave, onCancel }: DateFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    category: 'anniversary' as DateEntry['category'],
    isRecurring: false
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
        description: editingDate.description,
        category: editingDate.category,
        isRecurring: editingDate.isRecurring
      });
    } else {
      setFormData({
        title: '',
        date: '',
        description: '',
        category: 'anniversary',
        isRecurring: false
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
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.date = 'Datum kann nicht in der Zukunft liegen';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dateEntry: DateEntry = {
      id: editingDate?.id || Date.now().toString(),
      title: formData.title.trim(),
      date: formData.date,
      description: formData.description.trim(),
      category: formData.category,
      isRecurring: formData.isRecurring
    };

    await onSave(dateEntry);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
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
            <label htmlFor="date">Datum *</label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={errors.date ? 'error' : ''}
            />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </div>

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

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
              />
              <span className="checkbox-text">
                🔄 Wiederkehrend (jährlich)
                <small>Zeigt Countdown bis zum nächsten Jahrestag</small>
              </span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Abbrechen
            </button>
            <button type="submit" className="save-btn">
              {editingDate ? 'Speichern' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 