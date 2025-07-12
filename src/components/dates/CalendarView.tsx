import React, { useState, useMemo } from 'react';
import type { DateEntry } from './DatesManager';
import { getCategoryColor } from '../../utils/categoryColors';
import './CalendarView.css';

interface CalendarViewProps {
  dates: DateEntry[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: DateEntry) => void;
}

type ViewMode = 'month' | 'year';

const priorityColors = {
  high: '#dc3545',
  medium: '#ffc107',
  low: '#28a745',
};

const priorityLabels = {
  high: 'Hohe Priorität',
  medium: 'Mittlere Priorität',
  low: 'Niedrige Priorität',
};

const CalendarView: React.FC<CalendarViewProps> = ({ dates, onDateClick, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const navigateYear = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Hilfsfunktion: Nur das Datum (ohne Zeit) als YYYY-MM-DD
  const toDateString = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  // Range robust prüfen (inklusive Enddatum)
  const isDateInRange = (date: Date, start: string, end: string) => {
    const d = toDateString(date);
    const s = toDateString(start);
    const e = toDateString(end);
    return d >= s && d <= e;
  };

  // Hilfsfunktion: Prüft, ob ein wiederkehrendes Event an diesem Tag stattfindet
  const isRecurringOnDate = (event: DateEntry, date: Date) => {
    // Erzeuge Startdatum lokal!
    const [sy, sm, sd] = event.date.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd);
  
    // Enddatum ggf. lokal erzeugen
    let end;
    if (event.recurringEndDate) {
      const [ey, em, ed] = event.recurringEndDate.split('-').map(Number);
      end = new Date(ey, em - 1, ed);
      if (date > end) return false;
    }
    if (date < start) return false;
  
    if (isSameDay(date, start)) return true;
  
    const interval = event.recurringInterval || 1;
  
    switch (event.recurringType) {
      case 'yearly':
        return (
          date.getDate() === start.getDate() &&
          date.getMonth() === start.getMonth() &&
          (date.getFullYear() - start.getFullYear()) % interval === 0
        );
      case 'monthly':
        return (
          date.getDate() === start.getDate() &&
          (date.getFullYear() * 12 + date.getMonth() - (start.getFullYear() * 12 + start.getMonth())) % interval === 0
        );
      case 'weekly': {
        const diffDays = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return (
          date.getDay() === start.getDay() &&
          diffDays % (7 * interval) === 0
        );
      }
      case 'daily': {
        const diff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return diff % interval === 0;
      }
      default:
        return false;
    }
  };

  const getEventsForDate = (date: Date) => {
    return dates.filter(event => {
      if (event.recurringType && event.recurringType !== 'none') {
        return isRecurringOnDate(event, date);
      }
      if (!event.endDate) {
        return toDateString(event.date) === toDateString(date);
      }
      return isDateInRange(date, event.date, event.endDate);
    });
  };
  function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }
  const getEventsForMonth = (year: number, month: number) => {
    return dates.filter(event => {
      for (let day = 1; day <= 31; day++) {
        const testDate = new Date(year, month, day);
        if (testDate.getMonth() !== month) continue; // statt break!
        if (event.recurringType && event.recurringType !== 'none') {
          if (isRecurringOnDate(event, testDate)) return true;
        } else if (!event.endDate && isSameDay(testDate, new Date(event.date))) {
          return true;
        } else if (event.endDate && isDateInRange(testDate, event.date, event.endDate)) {
          return true;
        }
      }
      return false;
    });
  };
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayEvents = getEventsForDate(currentDay);
      days.push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === new Date().toDateString(),
        events: dayEvents
      });
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  }, [currentDate, dates]);

  const yearMonths = useMemo(() => {
    const year = currentDate.getFullYear();
    return monthNames.map((monthName, index) => {
      const monthEvents = getEventsForMonth(year, index);
      return {
        name: monthName,
        index,
        events: monthEvents,
        eventCount: monthEvents.length
      };
    });
  }, [currentDate, dates]);

  // Kategorie-Legende dynamisch
  const usedCategories = Array.from(new Set(dates.map(e => e.category)));

  // Prioritäten-Legende dynamisch
  const usedPriorities = Array.from(new Set(dates.map(e => e.priority)));

  // Event-Dot: Kategorie-Farbe als Hintergrund, Priorität als Rand
  const getEventDotStyle = (event: DateEntry) => {
    const cat = getCategoryColor(event.category);
    const border = `2px solid ${priorityColors[event.priority] || '#6c757d'}`;
    return {
      backgroundColor: cat.color,
      border,
    };
  };

  const renderMonthView = () => (
    <div className="calendar-month">
      <div className="calendar-header">
        <button onClick={() => navigateMonth(-1)} className="nav-btn">
          ←
        </button>
        <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button onClick={() => navigateMonth(1)} className="nav-btn">
          →
        </button>
      </div>

      <div className="calendar-weekdays">
        {dayNames.map(day => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {monthDays.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}`}
            onClick={() => onDateClick?.(day.date)}
          >
            <div className="day-number">{day.date.getDate()}</div>
            <div className="day-events">
              {day.events.slice(0, 3).map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  className="event-dot"
                  style={getEventDotStyle(event)}
                  title={`${event.title} (${event.category}) - ${priorityLabels[event.priority]}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick?.(event);
                  }}
                />
              ))}
              {day.events.length > 3 && (
                <div className="event-more">+{day.events.length - 3}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderYearView = () => (
    <div className="calendar-year">
      <div className="calendar-header">
        <button onClick={() => navigateYear(-1)} className="nav-btn">
          ←
        </button>
        <h2>{currentDate.getFullYear()}</h2>
        <button onClick={() => navigateYear(1)} className="nav-btn">
          →
        </button>
      </div>

      <div className="year-grid">
        {yearMonths.map((month, index) => (
          <div
            key={index}
            className="year-month"
            onClick={() => {
              setCurrentDate(new Date(currentDate.getFullYear(), month.index, 1));
              setViewMode('month');
            }}
          >
            <h3>{month.name}</h3>
            <div className="month-stats">
              <div className="event-count">
                {month.eventCount} Ereignisse
              </div>
              <div className="month-events">
                {month.events.slice(0, 5).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className="mini-event"
                    style={getEventDotStyle(event)}
                    title={`${event.title} (${event.category}) - ${priorityLabels[event.priority]}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  />
                ))}
                {month.events.length > 5 && (
                  <div className="mini-event-more">+{month.events.length - 5}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="calendar-view">
      <div className="calendar-controls">
        <div className="view-mode-toggle">
          <button
            className={`mode-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            📅 Monat
          </button>
          <button
            className={`mode-btn ${viewMode === 'year' ? 'active' : ''}`}
            onClick={() => setViewMode('year')}
          >
            📆 Jahr
          </button>
        </div>
        
        <button onClick={goToToday} className="today-btn">
          🎯 Heute
        </button>
      </div>

      {viewMode === 'month' ? renderMonthView() : renderYearView()}

      <div className="calendar-legend">
        {/* Kategorie-Legende */}
        {usedCategories.map(cat => {
          const color = getCategoryColor(cat);
          return (
            <div className="legend-item" key={cat}>
              <div className="legend-dot" style={{ backgroundColor: color.color }}></div>
              <span>{cat}</span>
            </div>
          );
        })}
        {/* Priorität-Legende */}
        {usedPriorities.map(prio => (
          <div className="legend-item" key={prio}>
            <div className="legend-dot" style={{ backgroundColor: '#fff', border: `2px solid ${priorityColors[prio]}` }}></div>
            <span>{priorityLabels[prio]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView; 