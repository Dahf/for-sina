interface CategoryColor {
  category: string;
  color: string;
  textColor: string;
}

// Export utility function to get category color
export const getCategoryColor = (category: string): { color: string; textColor: string } => {
  const savedColors = localStorage.getItem('categoryColors');
  if (savedColors) {
    const colors = JSON.parse(savedColors);
    const categoryColor = colors.find((c: CategoryColor) => c.category === category);
    if (categoryColor) {
      return { color: categoryColor.color, textColor: categoryColor.textColor };
    }
  }

  // Default colors
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

  const color = defaultColors[category as keyof typeof defaultColors] || '#6c757d';
  const rgb = parseInt(color.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const textColor = brightness > 128 ? 'black' : 'white';

  return { color, textColor };
}; 