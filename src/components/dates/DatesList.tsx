import type { DateEntry } from './DatesManager';
import './DatesList.css';

interface DatesListProps {
  dates: DateEntry[];
  viewMode: 'cards' | 'timeline';
  onEditDate: (date: DateEntry) => void;
  onDeleteDate: (dateId: string) => void;
}

const categoryIcons = {
  anniversary: '💕',
  birthday: '🎂',
  first: '🎉',
  vacation: '✈️',
  milestone: '🏆',
  other: '📅'
};

const categoryNames = {
  anniversary: 'Jahrestag',
  birthday: 'Geburtstag',
  first: 'Erstes Mal',
  vacation: 'Urlaub',
  milestone: 'Meilenstein',
  other: 'Sonstiges'
};

export function DatesList({ dates, viewMode, onEditDate, onDeleteDate }: DatesListProps) {
  // Berechne Zeitdifferenz
  const calculateTimeDifference = (dateString: string) => {
    const targetDate = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const diffMonths = Math.floor((diffDays % 365) / 30);
    const remainingDays = diffDays % 30;

    if (diffYears > 0) {
      return `Vor ${diffYears} Jahr${diffYears > 1 ? 'en' : ''}, ${diffMonths} Monat${diffMonths > 1 ? 'en' : ''}`;
    } else if (diffMonths > 0) {
      return `Vor ${diffMonths} Monat${diffMonths > 1 ? 'en' : ''}, ${remainingDays} Tag${remainingDays > 1 ? 'en' : ''}`;
    } else {
      return `Vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    }
  };

  // Finde nächstes wiederkehrendes Ereignis
  const getNextRecurringDate = (dateString: string) => {
    const originalDate = new Date(dateString);
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Erstelle Datum für dieses Jahr
    const thisYearDate = new Date(currentYear, originalDate.getMonth(), originalDate.getDate());
    
    // Wenn das Datum dieses Jahr schon vorbei ist, nimm nächstes Jahr
    if (thisYearDate < now) {
      return new Date(currentYear + 1, originalDate.getMonth(), originalDate.getDate());
    }
    
    return thisYearDate;
  };

  // Berechne Countdown zum nächsten Ereignis
  const calculateCountdown = (dateString: string, isRecurring: boolean) => {
    const targetDate = isRecurring ? getNextRecurringDate(dateString) : new Date(dateString);
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    
    if (diffTime < 0 && !isRecurring) {
      return null; // Vergangenes Ereignis
    }
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Heute!';
    } else if (diffDays === 1) {
      return 'Morgen!';
    } else {
      return `in ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    }
  };

  if (viewMode === 'cards') {
    return (
      <div className="dates-grid">
        {dates.map(date => (
          <div key={date.id} className={`date-card ${date.category}`}>
            <div className="date-card-header">
              <span className="date-icon">{categoryIcons[date.category]}</span>
              <div className="date-info">
                <h4>{date.title}</h4>
                <div className="date-category">{categoryNames[date.category]}</div>
              </div>
              <div className="date-actions">
                <button 
                  className="edit-btn"
                  onClick={() => onEditDate(date)}
                >
                  ✏️
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => onDeleteDate(date.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div className="date-details">
              <div className="date-value">
                {new Date(date.date).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <div className="date-time-ago">
                {calculateTimeDifference(date.date)}
              </div>
              {date.isRecurring && (
                <div className="recurring-info">
                  🔄 Wiederkehrend - {calculateCountdown(date.date, true)}
                </div>
              )}
            </div>
            
            {date.description && (
              <div className="date-description">
                {date.description}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Timeline View
  return (
    <div className="timeline-view">
      <div className="timeline">
        {dates
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((date) => (
            <div key={date.id} className={`timeline-item ${date.category}`}>
              <div className="timeline-marker">
                <span className="timeline-icon">{categoryIcons[date.category]}</span>
              </div>
              <div className="timeline-content">
                <div className="timeline-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => onEditDate(date)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => onDeleteDate(date.id)}
                  >
                    🗑️
                  </button>
                </div>
                <div className="timeline-date">
                  {new Date(date.date).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <h4>{date.title}</h4>
                <div className="timeline-category">{categoryNames[date.category]}</div>
                {date.description && (
                  <p className="timeline-description">{date.description}</p>
                )}
                <div className="timeline-time-ago">
                  {calculateTimeDifference(date.date)}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
} 