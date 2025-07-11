import { useEffect, useState } from 'react';
import { PageLayout } from '../../components/shared/PageLayout';
import './Dashboard.css';

const START_DATE = new Date(2022, 6, 10, 0, 0, 0); 
const TOTAL_MESSAGES = 184826;

// WhatsApp Analyse Daten
const TOP_EMOJIS = [
  { emoji: '❤️', count: 43259 },
  { emoji: '😂', count: 3879 },
  { emoji: '👍', count: 1955 },
  { emoji: '😭', count: 1908 },
  { emoji: '😍', count: 1703 },
  { emoji: '😇', count: 1256 },
  { emoji: '😎', count: 1014 },
  { emoji: '♀️', count: 859 },
  { emoji: '🙇', count: 570 },
  { emoji: '👩', count: 473 }
];

const YEAR_STATS = [
  { year: 2022, total: 21336, sina: 10523, silas: 10813 },
  { year: 2023, total: 84221, sina: 48237, silas: 35984 },
  { year: 2024, total: 55975, sina: 32469, silas: 23506 },
  { year: 2025, total: 23294, sina: 13117, silas: 10177 }
];

const IMAGE_STATS = {
  total: 25432,
  sina: { count: 16827, percentage: 66.2 },
  silas: { count: 8605, percentage: 33.8 }
};

const TOP_WORDS = [
  { word: 'ich', count: 18972 },
  { word: 'nicht', count: 9120 },
  { word: 'und', count: 8472 },
  { word: 'das', count: 6418 },
  { word: 'ist', count: 6348 },
  { word: 'auch', count: 4110 },
  { word: 'aber', count: 3940 },
  { word: 'dich', count: 3903 },
  { word: 'dir', count: 3864 },
  { word: 'mir', count: 3862 }
];

function getTimeDiff(from: Date, to: Date) {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  let years = toDate.getFullYear() - fromDate.getFullYear();
  let months = toDate.getMonth() - fromDate.getMonth();
  let days = toDate.getDate() - fromDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(toDate.getFullYear(), toDate.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // Jetzt berechnen wir die Uhrzeitdifferenz
  const fromTime = new Date(
    toDate.getFullYear(),
    toDate.getMonth(),
    toDate.getDate(),
    from.getHours(),
    from.getMinutes(),
    from.getSeconds()
  );
  const diffMs = toDate.getTime() - fromTime.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return { years, months, days, hours, minutes, seconds };
}

export function Dashboard() {
  const [timer, setTimer] = useState(getTimeDiff(START_DATE, new Date()));
  const [avgPerDay, setAvgPerDay] = useState('0');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(getTimeDiff(START_DATE, new Date()));
      const now = new Date();
      const daysTogether = Math.max(1, Math.floor((now.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)));
      setAvgPerDay((TOTAL_MESSAGES / daysTogether).toFixed(1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageLayout>
      <div className="dashboard-content">
        <header className="love-header">
          <h1>Mein Schatz &lt;3</h1>
          <p className="love-subtitle">Ich liebe dich, danke, dass du einfach in meinem Leben bist ♥</p>
        </header>
        
        <section className="timer-section">
          <h2>Unsere Zeit zusammen</h2>
          <div className="timer-cards">
            <div className="timer-card"><span>{String(timer.years).padStart(2, '0')}</span><small>Jahre</small></div>
            <div className="timer-card"><span>{String(timer.months).padStart(2, '0')}</span><small>Monate</small></div>
            <div className="timer-card"><span>{String(timer.days).padStart(2, '0')}</span><small>Tage</small></div>
            <div className="timer-card"><span>{String(timer.hours).padStart(2, '0')}</span><small>Stunden</small></div>
            <div className="timer-card"><span>{String(timer.minutes).padStart(2, '0')}</span><small>Minuten</small></div>
            <div className="timer-card"><span>{String(timer.seconds).padStart(2, '0')}</span><small>Sekunden</small></div>
          </div>
        </section>
        
        <section className="wa-section">
          <h2>WhatsApp Chat Analyse</h2>
          <div className="wa-cards">
            <div className="wa-card">
              <div className="wa-title">Gesamte Nachrichten</div>
              <div className="wa-value">{TOTAL_MESSAGES.toLocaleString('de-DE')} <span className="wa-sub">({avgPerDay}/Tag)</span></div>
            </div>
            <div className="wa-card">
              <div className="wa-title">Top-Sender</div>
              <div className="wa-value">Sina <span className="wa-sub">(104.346 Nachrichten)</span></div>
            </div>
            <div className="wa-card">
              <div className="wa-title">Aktivste Uhrzeit</div>
              <div className="wa-value">22 Uhr <span className="wa-sub">(23.188 Nachrichten)</span></div>
            </div>
          </div>
        </section>

        <section className="image-section">
          <h2>Bild-Analyse 📸</h2>
          <div className="image-stats">
            <div className="image-total">
              <div className="image-number">{IMAGE_STATS.total.toLocaleString('de-DE')}</div>
              <div className="image-label">Gesamte Bilder</div>
            </div>
            <div className="image-breakdown">
              <div className="image-person">
                <div className="person-name">Sina</div>
                <div className="person-count">{IMAGE_STATS.sina.count.toLocaleString('de-DE')} Bilder</div>
                <div className="person-percentage">{IMAGE_STATS.sina.percentage}%</div>
                <div className="person-bar" style={{width: `${IMAGE_STATS.sina.percentage}%`}}></div>
              </div>
              <div className="image-person">
                <div className="person-name">Silas</div>
                <div className="person-count">{IMAGE_STATS.silas.count.toLocaleString('de-DE')} Bilder</div>
                <div className="person-percentage">{IMAGE_STATS.silas.percentage}%</div>
                <div className="person-bar" style={{width: `${IMAGE_STATS.silas.percentage}%`}}></div>
              </div>
            </div>
          </div>
        </section>

        <section className="emoji-section">
          <h2>Unsere Lieblings-Emojis</h2>
          <div className="emoji-grid">
            {TOP_EMOJIS.map((item, index) => (
              <div key={index} className="emoji-card">
                <div className="emoji-display">{item.emoji}</div>
                <div className="emoji-count">{item.count.toLocaleString('de-DE')}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="words-section">
          <h2>Unsere Lieblings-Wörter</h2>
          <div className="words-grid">
            {TOP_WORDS.map((item, index) => (
              <div key={index} className="word-card">
                <div className="word-text">{item.word}</div>
                <div className="word-count">{item.count.toLocaleString('de-DE')}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="year-section">
          <h2>Jahresvergleich</h2>
          <div className="year-cards">
            {YEAR_STATS.map((year) => (
              <div key={year.year} className="year-card">
                <div className="year-title">{year.year}</div>
                <div className="year-total">{year.total.toLocaleString('de-DE')} Nachrichten</div>
                <div className="year-breakdown">
                  <div className="year-person">
                    <span className="person-name">Sina:</span> {year.sina.toLocaleString('de-DE')}
                  </div>
                  <div className="year-person">
                    <span className="person-name">Silas:</span> {year.silas.toLocaleString('de-DE')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageLayout>
  );
} 