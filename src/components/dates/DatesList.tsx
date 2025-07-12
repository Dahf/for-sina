import type { DateEntry } from './DatesManager';
import './DatesList.css';
import { LiveCountdown } from './LiveCountdown';
import { getCategoryColor } from '../../utils/categoryColors';

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
    let prefix = 'Vor';
    if (diffDays < 0) {
      prefix = 'In';
    }
    if (diffYears > 0) {
      return `${prefix} ${Math.abs(diffYears)} Jahr${Math.abs(diffYears) > 1 ? 'en' : ''}, ${Math.abs(diffMonths)} Monate`;
    } else if (diffMonths > 0) {
      return `${prefix} ${Math.abs(diffMonths)} Monate, ${Math.abs(remainingDays)} Tage`;
    } else {
      return `${prefix} ${Math.abs(diffDays)} Tag${Math.abs(diffDays) > 1 ? 'en' : ''}`;
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
        {dates.map(date => {
          const categoryColor = getCategoryColor(categoryNames[date.category]);
          return (
            <div 
              key={date.id} 
              className={`date-card ${date.category}`}
              style={{
                borderLeft: `4px solid ${categoryColor.color}`,
                backgroundColor: `${categoryColor.color}10`
              }}
            >
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
                {date.endDate && (
                  <>
                    <span className="date-range-separator"> - </span>
                    <span className="date-end-value">
                      {new Date(date.endDate).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </>
                )}
              </div>
              <div className="date-time-ago">
                {calculateTimeDifference(date.date)}
              </div>
              {date.isRecurring && (
                <div className="recurring-info">
                  🔄 Wiederkehrend - {calculateCountdown(date.date, true)}
                </div>
              )}
              
              <div className="live-countdown-container">
                <LiveCountdown dateEntry={date} showSeconds={false} />
              </div>
             
            </div>
            
            {date.description && (
              <div className="date-description">
                {date.description}
              </div>
            )}
          </div>
        );
        })}
      </div>
    );
  }

  // Timeline View
  return (
    <div className="timeline-view">
      <div className="timeline">
        {dates
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((date, index) => {
            const categoryColor = getCategoryColor(categoryNames[date.category]);
            return (
              <div 
                key={date.id} 
                className={`timeline-item ${date.category}-${index}`}
                
              >
              <div className="timeline-marker">
                <span className="timeline-icon">{categoryIcons[date.category]}</span>
              </div>
              <div className="timeline-content" 
                style={{
                 
                  backgroundColor: `${categoryColor.color}20`,
                  ...({ '--timeline-bg': `${categoryColor.color}20` } as React.CSSProperties)
                }}>
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
                  {date.endDate && (
                    <>
                      <span className="date-range-separator"> - </span>
                      <span className="date-end-value">
                        {new Date(date.endDate).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </>
                  )}
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
          );
          })}
      </div>
    </div>
  );
} 