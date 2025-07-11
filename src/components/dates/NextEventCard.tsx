import type { DateEntry } from './DatesManager';
import './NextEventCard.css';

interface NextEventCardProps {
  dates: DateEntry[];
}

const categoryIcons = {
  anniversary: '💕',
  birthday: '🎂',
  first: '🎉',
  vacation: '✈️',
  milestone: '🏆',
  other: '📅'
};

export function NextEventCard({ dates }: NextEventCardProps) {
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

  // Finde nächstes wichtiges Ereignis
  const getNextImportantDate = () => {
    const upcomingDates = dates
      .filter(date => date.isRecurring || new Date(date.date) > new Date())
      .map(date => ({
        ...date,
        nextDate: date.isRecurring ? getNextRecurringDate(date.date) : new Date(date.date),
        countdown: calculateCountdown(date.date, date.isRecurring)
      }))
      .filter(date => date.countdown !== null)
      .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());

    return upcomingDates[0] || null;
  };

  const nextDate = getNextImportantDate();

  if (!nextDate) {
    return null;
  }

  return (
    <div className="next-event">
      <h3>⏰ Nächstes Ereignis:</h3>
      <div className="next-event-card">
        <span className="event-icon">{categoryIcons[nextDate.category]}</span>
        <div className="event-details">
          <div className="event-title">{nextDate.title}</div>
          <div className="event-countdown">{nextDate.countdown}</div>
        </div>
      </div>
    </div>
  );
} 