import { useMemo } from 'react';
import type { DateEntry } from './DatesManager';
import './DateStatistics.css';

interface DateStatisticsProps {
  dates: DateEntry[];
}

interface Statistics {
  total: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  byTags: Record<string, number>;
  recurring: number;
  dateRanges: number;
  upcoming: number;
  past: number;
  thisMonth: number;
  thisYear: number;
}

export function DateStatistics({ dates }: DateStatisticsProps) {
  const statistics = useMemo((): Statistics => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    const stats: Statistics = {
      total: dates.length,
      byCategory: {},
      byPriority: {},
      byTags: {},
      recurring: 0,
      dateRanges: 0,
      upcoming: 0,
      past: 0,
      thisMonth: 0,
      thisYear: 0
    };

    dates.forEach(date => {
      const dateObj = new Date(date.date);
      
      // Kategorien
      stats.byCategory[date.category] = (stats.byCategory[date.category] || 0) + 1;
      
      // Prioritäten
      stats.byPriority[date.priority] = (stats.byPriority[date.priority] || 0) + 1;
      
      // Tags
      date.tags.forEach(tag => {
        stats.byTags[tag] = (stats.byTags[tag] || 0) + 1;
      });
      
      // Wiederkehrende Ereignisse
      if (date.isRecurring || date.recurringType !== 'none') {
        stats.recurring++;
      }
      
      // Datumsbereiche
      if (date.endDate) {
        stats.dateRanges++;
      }
      
      // Zeitbasierte Statistiken
      if (dateObj > now || date.isRecurring || date.recurringType !== 'none') {
        stats.upcoming++;
      } else {
        stats.past++;
      }
      
      if (dateObj >= startOfMonth && dateObj <= now) {
        stats.thisMonth++;
      }
      
      if (dateObj >= startOfYear && dateObj <= now) {
        stats.thisYear++;
      }
    });

    return stats;
  }, [dates]);

  const categoryIcons = {
    anniversary: '💕',
    birthday: '🎂',
    first: '🎉',
    vacation: '✈️',
    milestone: '🏆',
    other: '📅'
  };

  const priorityIcons = {
    high: '🔴',
    medium: '🟡',
    low: '🟢'
  };

  const priorityLabels = {
    high: 'Hoch',
    medium: 'Mittel',
    low: 'Niedrig'
  };

  return (
    <div className="date-statistics">
      <h3>📊 Statistiken</h3>
      
      <div className="stats-grid">
        {/* Übersicht */}
        <div className="stat-card overview">
          <h4>Übersicht</h4>
          <div className="stat-items">
            <div className="stat-item">
              <span className="stat-value">{statistics.total}</span>
              <span className="stat-label">Gesamt</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{statistics.upcoming}</span>
              <span className="stat-label">Zukünftig</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{statistics.past}</span>
              <span className="stat-label">Vergangen</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{statistics.thisMonth}</span>
              <span className="stat-label">Diesen Monat</span>
            </div>
          </div>
        </div>

        {/* Kategorien */}
        <div className="stat-card categories">
          <h4>Kategorien</h4>
          <div className="stat-items">
            {Object.entries(statistics.byCategory).map(([category, count]) => (
              <div key={category} className="stat-item">
                <span className="stat-icon">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                <span className="stat-value">{count}</span>
                <span className="stat-label">{category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prioritäten */}
        <div className="stat-card priorities">
          <h4>Prioritäten</h4>
          <div className="stat-items">
            {Object.entries(statistics.byPriority).map(([priority, count]) => (
              <div key={priority} className="stat-item">
                <span className="stat-icon">{priorityIcons[priority as keyof typeof priorityIcons]}</span>
                <span className="stat-value">{count}</span>
                <span className="stat-label">{priorityLabels[priority as keyof typeof priorityLabels]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        {Object.keys(statistics.byTags).length > 0 && (
          <div className="stat-card tags">
            <h4>Häufigste Tags</h4>
            <div className="stat-items">
              {Object.entries(statistics.byTags)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([tag, count]) => (
                  <div key={tag} className="stat-item">
                    <span className="stat-value">{count}</span>
                    <span className="stat-label">{tag}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Spezielle Ereignisse */}
        <div className="stat-card special">
          <h4>Besondere Ereignisse</h4>
          <div className="stat-items">
            <div className="stat-item">
              <span className="stat-icon">🔄</span>
              <span className="stat-value">{statistics.recurring}</span>
              <span className="stat-label">Wiederkehrend</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📅</span>
              <span className="stat-value">{statistics.dateRanges}</span>
              <span className="stat-label">Datumsbereiche</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📈</span>
              <span className="stat-value">{statistics.thisYear}</span>
              <span className="stat-label">Dieses Jahr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fortschrittsbalken für Prioritäten */}
      <div className="priority-progress">
        <h4>Prioritätsverteilung</h4>
        <div className="progress-bars">
          {Object.entries(statistics.byPriority).map(([priority, count]) => {
            const percentage = statistics.total > 0 ? (count / statistics.total) * 100 : 0;
            return (
              <div key={priority} className="progress-item">
                <div className="progress-header">
                  <span className="progress-label">
                    {priorityIcons[priority as keyof typeof priorityIcons]} {priorityLabels[priority as keyof typeof priorityLabels]}
                  </span>
                  <span className="progress-value">{count} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${priority}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 