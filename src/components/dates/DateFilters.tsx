import { useState } from 'react';
import type { DateEntry } from './DatesManager';
import './DateFilters.css';

interface DateFiltersProps {
  dates: DateEntry[];
  onFilteredDatesChange: (filteredDates: DateEntry[]) => void;
  onSortChange: (sortBy: SortOption) => void;
}

export type SortOption = 'date-asc' | 'date-desc' | 'title-asc' | 'title-desc' | 'priority-high' | 'priority-low' | 'category';

interface FilterState {
  searchTerm: string;
  selectedCategories: string[];
  selectedTags: string[];
  selectedPriorities: string[];
  dateRange: {
    start: string;
    end: string;
  };
  showRecurringOnly: boolean;
  showUpcomingOnly: boolean;
}

export function DateFilters({ dates, onFilteredDatesChange, onSortChange }: DateFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedCategories: [],
    selectedTags: [],
    selectedPriorities: [],
    dateRange: {
      start: '',
      end: ''
    },
    showRecurringOnly: false,
    showUpcomingOnly: false
  });

  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [isExpanded, setIsExpanded] = useState(false);

  // Alle verfügbaren Kategorien, Tags und Prioritäten sammeln
  const availableCategories = [...new Set(dates.map(date => date.category))];
  const availableTags = [...new Set(dates.flatMap(date => date.tags || []))];
  const availablePriorities = [...new Set(dates.map(date => date.priority))];

  const applyFilters = (newFilters: FilterState) => {
    let filteredDates = dates;

    // Text-Suche
    if (newFilters.searchTerm.trim()) {
      const searchLower = newFilters.searchTerm.toLowerCase();
      filteredDates = filteredDates.filter(date => 
        date.title.toLowerCase().includes(searchLower) ||
        date.description.toLowerCase().includes(searchLower) ||
        date.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Kategorie-Filter
    if (newFilters.selectedCategories.length > 0) {
      filteredDates = filteredDates.filter(date => 
        newFilters.selectedCategories.includes(date.category)
      );
    }

    // Tag-Filter
    if (newFilters.selectedTags.length > 0) {
      filteredDates = filteredDates.filter(date => 
        newFilters.selectedTags.some(tag => date.tags.includes(tag))
      );
    }

    // Prioritäts-Filter
    if (newFilters.selectedPriorities.length > 0) {
      filteredDates = filteredDates.filter(date => 
        newFilters.selectedPriorities.includes(date.priority)
      );
    }

    // Datumsbereich-Filter
    if (newFilters.dateRange.start) {
      filteredDates = filteredDates.filter(date => 
        new Date(date.date) >= new Date(newFilters.dateRange.start)
      );
    }
    if (newFilters.dateRange.end) {
      filteredDates = filteredDates.filter(date => 
        new Date(date.date) <= new Date(newFilters.dateRange.end)
      );
    }

    // Wiederkehrende Ereignisse
    if (newFilters.showRecurringOnly) {
      filteredDates = filteredDates.filter(date => 
        date.isRecurring || date.recurringType !== 'none'
      );
    }

    // Nur zukünftige Ereignisse
    if (newFilters.showUpcomingOnly) {
      const now = new Date();
      filteredDates = filteredDates.filter(date => 
        new Date(date.date) > now || date.isRecurring || date.recurringType !== 'none'
      );
    }

    // Sortierung anwenden
    filteredDates = sortDates(filteredDates, sortBy);

    onFilteredDatesChange(filteredDates);
  };

  const sortDates = (datesToSort: DateEntry[], sortOption: SortOption): DateEntry[] => {
    const sorted = [...datesToSort];
    
    switch (sortOption) {
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'priority-high':
        return sorted.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
      case 'priority-low':
        return sorted.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
      case 'category':
        return sorted.sort((a, b) => a.category.localeCompare(b.category));
      default:
        return sorted;
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string | string[] | boolean | { start: string; end: string }) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    onSortChange(newSortBy);
    applyFilters(filters);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      searchTerm: '',
      selectedCategories: [],
      selectedTags: [],
      selectedPriorities: [],
      dateRange: { start: '', end: '' },
      showRecurringOnly: false,
      showUpcomingOnly: false
    };
    setFilters(clearedFilters);
    applyFilters(clearedFilters);
  };

  const hasActiveFilters = 
    filters.searchTerm ||
    filters.selectedCategories.length > 0 ||
    filters.selectedTags.length > 0 ||
    filters.selectedPriorities.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.showRecurringOnly ||
    filters.showUpcomingOnly;

  return (
    <div className="date-filters">
      <div className="filters-header">
        <div className="search-and-sort">
          <div className="search-box">
            <input
              type="text"
              placeholder="Suche nach Titel, Beschreibung oder Tags..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="sort-select"
          >
            <option value="date-desc">Neueste zuerst</option>
            <option value="date-asc">Älteste zuerst</option>
            <option value="title-asc">Titel A-Z</option>
            <option value="title-desc">Titel Z-A</option>
            <option value="priority-high">Höchste Priorität</option>
            <option value="priority-low">Niedrigste Priorität</option>
            <option value="category">Nach Kategorie</option>
          </select>
        </div>
        
        <div className="filter-controls">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`filter-toggle ${isExpanded ? 'active' : ''}`}
          >
            🔽 Filter {hasActiveFilters ? `(${hasActiveFilters ? 'Aktiv' : ''})` : ''}
          </button>
          
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="clear-filters">
              ✕ Zurücksetzen
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="filters-content">
          <div className="filter-grid">
            {/* Kategorien */}
            <div className="filter-group">
              <h4>Kategorien</h4>
              <div className="filter-options">
                {availableCategories.map(category => (
                  <label key={category} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.selectedCategories.includes(category)}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...filters.selectedCategories, category]
                          : filters.selectedCategories.filter(c => c !== category);
                        handleFilterChange('selectedCategories', newCategories);
                      }}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            {availableTags.length > 0 && (
              <div className="filter-group">
                <h4>Tags</h4>
                <div className="filter-options">
                  {availableTags.map(tag => (
                    <label key={tag} className="filter-option">
                      <input
                        type="checkbox"
                        checked={filters.selectedTags.includes(tag)}
                        onChange={(e) => {
                          const newTags = e.target.checked
                            ? [...filters.selectedTags, tag]
                            : filters.selectedTags.filter(t => t !== tag);
                          handleFilterChange('selectedTags', newTags);
                        }}
                      />
                      <span>{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Prioritäten */}
            <div className="filter-group">
              <h4>Prioritäten</h4>
              <div className="filter-options">
                {availablePriorities.map(priority => (
                  <label key={priority} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.selectedPriorities.includes(priority)}
                      onChange={(e) => {
                        const newPriorities = e.target.checked
                          ? [...filters.selectedPriorities, priority]
                          : filters.selectedPriorities.filter(p => p !== priority);
                        handleFilterChange('selectedPriorities', newPriorities);
                      }}
                    />
                    <span>{priority === 'high' ? 'Hoch' : priority === 'medium' ? 'Mittel' : 'Niedrig'}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Datumsbereich */}
          <div className="date-range-filter">
            <h4>Datumsbereich</h4>
            <div className="date-range-inputs">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                placeholder="Von"
              />
              <span>bis</span>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                placeholder="Bis"
              />
            </div>
          </div>

          {/* Spezielle Filter */}
          <div className="special-filters">
            <label className="filter-option">
              <input
                type="checkbox"
                checked={filters.showRecurringOnly}
                onChange={(e) => handleFilterChange('showRecurringOnly', e.target.checked)}
              />
              <span>Nur wiederkehrende Ereignisse</span>
            </label>
            
            <label className="filter-option">
              <input
                type="checkbox"
                checked={filters.showUpcomingOnly}
                onChange={(e) => handleFilterChange('showUpcomingOnly', e.target.checked)}
              />
              <span>Nur zukünftige Ereignisse</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
} 