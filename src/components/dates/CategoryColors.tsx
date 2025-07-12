import React, { useState, useEffect } from 'react';
import './CategoryColors.css';

interface CategoryColor {
  category: string;
  color: string;
  textColor: string;
}

interface CategoryColorsProps {
  categories: string[];
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
  onColorChange?: (category: string, color: string) => void;
}

const CategoryColors: React.FC<CategoryColorsProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  onColorChange
}) => {
  const [categoryColors, setCategoryColors] = useState<CategoryColor[]>([]);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  // Predefined color palette
  const colorPalette = [
    { color: '#dc3545', name: 'Rot', textColor: 'white' },
    { color: '#fd7e14', name: 'Orange', textColor: 'white' },
    { color: '#ffc107', name: 'Gelb', textColor: 'black' },
    { color: '#28a745', name: 'Grün', textColor: 'white' },
    { color: '#20c997', name: 'Türkis', textColor: 'white' },
    { color: '#17a2b8', name: 'Cyan', textColor: 'white' },
    { color: '#007bff', name: 'Blau', textColor: 'white' },
    { color: '#6f42c1', name: 'Lila', textColor: 'white' },
    { color: '#e83e8c', name: 'Pink', textColor: 'white' },
    { color: '#6c757d', name: 'Grau', textColor: 'white' },
    { color: '#343a40', name: 'Dunkelgrau', textColor: 'white' },
    { color: '#f8f9fa', name: 'Hellgrau', textColor: 'black' }
  ];

  // Default category colors
  const defaultColors = {
    'Familie': '#28a745',
    'Arbeit': '#007bff',
    'Urlaub': '#fd7e14',
    'Gesundheit': '#dc3545',
    'Geburtstag': '#e83e8c',
    'Hochzeit': '#6f42c1',
    'Jahrestag': '#20c997',
    'Feiertag': '#ffc107',
    'Termin': '#17a2b8',
    'Sonstiges': '#6c757d'
  };

  useEffect(() => {
    // Load saved colors from localStorage
    const savedColors = localStorage.getItem('categoryColors');
    let colors: CategoryColor[] = [];

    if (savedColors) {
      colors = JSON.parse(savedColors);
    }

    // Initialize colors for new categories
    const updatedColors = categories.map(category => {
      const existing = colors.find(c => c.category === category);
      if (existing) {
        return existing;
      }

      const defaultColor = defaultColors[category as keyof typeof defaultColors] || '#6c757d';
      const paletteColor = colorPalette.find(p => p.color === defaultColor);
      
      return {
        category,
        color: defaultColor,
        textColor: paletteColor?.textColor || 'white'
      };
    });

    setCategoryColors(updatedColors);
    
    // Save updated colors
    localStorage.setItem('categoryColors', JSON.stringify(updatedColors));
  }, [categories]);

  const handleColorChange = (category: string, color: string, textColor: string) => {
    const updatedColors = categoryColors.map(c => 
      c.category === category 
        ? { ...c, color, textColor }
        : c
    );
    
    setCategoryColors(updatedColors);
    localStorage.setItem('categoryColors', JSON.stringify(updatedColors));
    onColorChange?.(category, color);
    setShowColorPicker(null);
  };

  const getCategoryColor = (category: string): CategoryColor => {
    return categoryColors.find(c => c.category === category) || {
      category,
      color: '#6c757d',
      textColor: 'white'
    };
  };

  const resetToDefaults = () => {
    const defaultCategoryColors = categories.map(category => {
      const defaultColor = defaultColors[category as keyof typeof defaultColors] || '#6c757d';
      const paletteColor = colorPalette.find(p => p.color === defaultColor);
      
      return {
        category,
        color: defaultColor,
        textColor: paletteColor?.textColor || 'white'
      };
    });

    setCategoryColors(defaultCategoryColors);
    localStorage.setItem('categoryColors', JSON.stringify(defaultCategoryColors));
    setShowColorPicker(null);
  };

  return (
    <div className="category-colors">
      <div className="category-colors-header">
        <h4>🎨 Kategorie-Farben</h4>
        <button 
          className="reset-btn"
          onClick={resetToDefaults}
          title="Standardfarben wiederherstellen"
        >
          🔄 Zurücksetzen
        </button>
      </div>

      <div className="category-list">
        {categories.map(category => {
          const categoryColor = getCategoryColor(category);
          const isSelected = selectedCategory === category;
          const isPickerOpen = showColorPicker === category;

          return (
            <div key={category} className="category-item">
              <div 
                className={`category-badge ${isSelected ? 'selected' : ''}`}
                style={{ 
                  backgroundColor: categoryColor.color,
                  color: categoryColor.textColor,
                  borderColor: isSelected ? '#007bff' : 'transparent'
                }}
                onClick={() => onCategorySelect?.(category)}
              >
                <span className="category-name">{category}</span>
                <button
                  className="color-picker-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(isPickerOpen ? null : category);
                  }}
                  title="Farbe ändern"
                >
                  🎨
                </button>
              </div>

              {isPickerOpen && (
                <div className="color-picker-dropdown">
                  <div className="color-picker-header">
                    <span>Farbe für "{category}" wählen</span>
                    <button 
                      className="close-picker"
                      onClick={() => setShowColorPicker(null)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="color-palette">
                    {colorPalette.map((colorOption, index) => (
                      <button
                        key={index}
                        className={`color-option ${categoryColor.color === colorOption.color ? 'active' : ''}`}
                        style={{ backgroundColor: colorOption.color }}
                        onClick={() => handleColorChange(category, colorOption.color, colorOption.textColor)}
                        title={colorOption.name}
                      >
                        {categoryColor.color === colorOption.color && (
                          <span className="check-mark" style={{ color: colorOption.textColor }}>
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="custom-color-section">
                    <label htmlFor={`custom-color-${category}`}>
                      Benutzerdefinierte Farbe:
                    </label>
                    <input
                      id={`custom-color-${category}`}
                      type="color"
                      value={categoryColor.color}
                      onChange={(e) => {
                        const color = e.target.value;
                        // Simple contrast calculation
                        const rgb = parseInt(color.slice(1), 16);
                        const r = (rgb >> 16) & 0xff;
                        const g = (rgb >> 8) & 0xff;
                        const b = (rgb >> 0) & 0xff;
                        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                        const textColor = brightness > 128 ? 'black' : 'white';
                        
                        handleColorChange(category, color, textColor);
                      }}
                      className="custom-color-input"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="no-categories">
          <p>Keine Kategorien verfügbar</p>
          <p className="hint">Kategorien werden automatisch hinzugefügt, wenn du Ereignisse erstellst.</p>
        </div>
      )}

      <div className="color-preview">
        <h5>Farbvorschau:</h5>
        <div className="preview-badges">
          {categoryColors.map(({ category, color, textColor }) => (
            <span
              key={category}
              className="preview-badge"
              style={{ backgroundColor: color, color: textColor }}
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryColors; 