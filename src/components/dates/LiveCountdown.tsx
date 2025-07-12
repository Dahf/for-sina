import { useState, useEffect } from 'react';
import type { DateEntry } from './DatesManager';
import './LiveCountdown.css';

interface LiveCountdownProps {
  dateEntry: DateEntry;
  showSeconds?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isToday: boolean;
  isPast: boolean;
}

export function LiveCountdown({ dateEntry, showSeconds = true }: LiveCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isToday: false,
    isPast: false
  });

  const calculateTimeRemaining = (): TimeRemaining => {
    const now = new Date();
    let targetDate = new Date(dateEntry.date);

    // Für wiederkehrende Ereignisse das nächste Datum berechnen
    if (dateEntry.isRecurring || dateEntry.recurringType !== 'none') {
      const currentYear = now.getFullYear();
      
      switch (dateEntry.recurringType) {
        case 'yearly':
          targetDate = new Date(currentYear, targetDate.getMonth(), targetDate.getDate());
          if (targetDate < now) {
            targetDate = new Date(currentYear + dateEntry.recurringInterval, targetDate.getMonth(), targetDate.getDate());
          }
          break;
        case 'monthly':
          targetDate = new Date(now.getFullYear(), now.getMonth(), targetDate.getDate());
          if (targetDate < now) {
            targetDate = new Date(now.getFullYear(), now.getMonth() + dateEntry.recurringInterval, targetDate.getDate());
          }
          break;
        case 'weekly': {
          const daysDiff = targetDate.getDay() - now.getDay();
          targetDate = new Date(now);
          targetDate.setDate(now.getDate() + daysDiff + (daysDiff < 0 ? 7 : 0));
          break;
        }
        case 'daily':
          targetDate = new Date(now);
          targetDate.setDate(now.getDate() + dateEntry.recurringInterval);
          break;
        default:
          // Legacy isRecurring - jährlich
          if (dateEntry.isRecurring) {
            targetDate = new Date(currentYear, targetDate.getMonth(), targetDate.getDate());
            if (targetDate < now) {
              targetDate = new Date(currentYear + 1, targetDate.getMonth(), targetDate.getDate());
            }
          }
      }
    }

    const diffTime = targetDate.getTime() - now.getTime();
    
    // Für nicht-wiederkehrende vergangene Ereignisse
    if (diffTime < 0 && !dateEntry.isRecurring && dateEntry.recurringType === 'none') {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isToday: false,
        isPast: true
      };
    }

    // Berechne die Zeitdifferenz (auch für negative Werte bei zukünftigen Ereignissen)
    const absDiffTime = Math.abs(diffTime);
    const days = Math.floor(absDiffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absDiffTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absDiffTime % (1000 * 60)) / 1000);

    return {
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      isToday: days === 0 && hours < 24 && diffTime >= 0,
      isPast: false
    };
  };

  useEffect(() => {
    const updateCountdown = () => {
      setTimeRemaining(calculateTimeRemaining());
    };

    // Sofort aktualisieren
    updateCountdown();

    // Jede Sekunde aktualisieren
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [dateEntry]);

  if (timeRemaining.isPast) {
    return (
      <div className="live-countdown past">
        <span className="countdown-status">Vergangen</span>
      </div>
    );
  }

  if (timeRemaining.isToday) {
    return (
      <div className="live-countdown today">
        <span className="countdown-status">🎉 Heute!</span>
        {timeRemaining.hours > 0 && (
          <span className="countdown-time">
            in {timeRemaining.hours}h {timeRemaining.minutes}m
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`live-countdown ${dateEntry.priority}`}>
      
      <div className="countdown-display">
        {timeRemaining.days > 0 && (
          <div className="countdown-unit">
            <span className="countdown-number">{timeRemaining.days}</span>
            <span className="countdown-label">Tag{timeRemaining.days > 1 ? 'e' : ''}</span>
          </div>
        )}
        
        {(timeRemaining.days > 0 || timeRemaining.hours > 0) && (
          <div className="countdown-unit">
            <span className="countdown-number">{timeRemaining.hours}</span>
            <span className="countdown-label">Std</span>
          </div>
        )}
        
        <div className="countdown-unit">
          <span className="countdown-number">{timeRemaining.minutes}</span>
          <span className="countdown-label">Min</span>
        </div>
        
        {showSeconds && timeRemaining.days === 0 && (
          <div className="countdown-unit">
            <span className="countdown-number">{timeRemaining.seconds}</span>
            <span className="countdown-label">Sek</span>
          </div>
        )}
      </div>
    </div>
  );
} 