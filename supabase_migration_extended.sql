-- Erweiterte Migration für Date-Tracking App mit neuen Features
-- Führe diese Migration in deiner Supabase SQL-Konsole aus

-- Neue Spalten zur dates Tabelle hinzufügen
ALTER TABLE dates 
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS reminder_days INTEGER[],
ADD COLUMN IF NOT EXISTS recurring_type TEXT DEFAULT 'none' CHECK (recurring_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly', 'custom')),
ADD COLUMN IF NOT EXISTS recurring_interval INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS recurring_end_date DATE,
ADD COLUMN IF NOT EXISTS photos TEXT[],
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_dates_updated_at ON dates;
CREATE TRIGGER update_dates_updated_at
    BEFORE UPDATE ON dates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_dates_priority ON dates(priority);
CREATE INDEX IF NOT EXISTS idx_dates_recurring_type ON dates(recurring_type);
CREATE INDEX IF NOT EXISTS idx_dates_date_range ON dates(date, end_date);
CREATE INDEX IF NOT EXISTS idx_dates_tags ON dates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_dates_created_at ON dates(created_at);

-- Funktion für Tag-Suche
CREATE OR REPLACE FUNCTION search_dates_by_tags(search_tags TEXT[])
RETURNS TABLE(
    id TEXT,
    title TEXT,
    date DATE,
    end_date DATE,
    description TEXT,
    category TEXT,
    is_recurring BOOLEAN,
    tags TEXT[],
    priority TEXT,
    reminder_days INTEGER[],
    recurring_type TEXT,
    recurring_interval INTEGER,
    recurring_end_date DATE,
    photos TEXT[],
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT d.id, d.title, d.date, d.end_date, d.description, d.category, d.is_recurring,
           d.tags, d.priority, d.reminder_days, d.recurring_type, d.recurring_interval,
           d.recurring_end_date, d.photos, d.color, d.created_at, d.updated_at
    FROM dates d
    WHERE d.tags && search_tags;
END;
$$ LANGUAGE plpgsql;

-- Funktion für kommende Ereignisse mit Erinnerungen
CREATE OR REPLACE FUNCTION get_upcoming_events_with_reminders()
RETURNS TABLE(
    id TEXT,
    title TEXT,
    date DATE,
    reminder_days INTEGER[],
    days_until_event INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT d.id, d.title, d.date, d.reminder_days,
           (d.date - CURRENT_DATE) as days_until_event
    FROM dates d
    WHERE d.date >= CURRENT_DATE
    AND array_length(d.reminder_days, 1) > 0
    ORDER BY d.date;
END;
$$ LANGUAGE plpgsql;

-- View für Statistiken
DROP VIEW IF EXISTS date_statistics;
CREATE OR REPLACE VIEW date_statistics AS
SELECT 
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE date >= CURRENT_DATE) as upcoming_events,
    COUNT(*) FILTER (WHERE date < CURRENT_DATE) as past_events,
    COUNT(*) FILTER (WHERE is_recurring = true) as recurring_events,
    COUNT(*) FILTER (WHERE priority = 'high') as high_priority_events,
    COUNT(*) FILTER (WHERE priority = 'medium') as medium_priority_events,
    COUNT(*) FILTER (WHERE priority = 'low') as low_priority_events,
    COUNT(*) FILTER (WHERE end_date IS NOT NULL) as date_range_events,
    COUNT(DISTINCT category) as unique_categories,
    -- Häufigste Kategorie mit LATERAL JOIN
    (SELECT category 
     FROM dates 
     GROUP BY category 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) as most_common_category,
    -- Durchschnittliche Tage bis zum nächsten Ereignis
    (SELECT AVG(date - CURRENT_DATE) 
     FROM dates 
     WHERE date >= CURRENT_DATE) as avg_days_to_next_event
FROM dates;

-- HINWEIS: Storage-Bucket muss über die Supabase-Oberfläche erstellt werden
-- Gehe zu: Supabase Dashboard → Storage → Create Bucket
-- Name: 'event-media'
-- Public: ✅ (aktiviert)
-- Dann unter Policies → New Policy → "Give users access to own folder" 