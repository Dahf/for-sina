import { useEffect, useState } from 'react';
import './App.css';

const START_DATE = new Date(2022, 6, 10, 0, 0, 0); 
const TOTAL_MESSAGES = 184844;

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


function App() {
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
    <div className="love-bg">
      {/* Animierte Herzen im Hintergrund */}
      <div className="hearts-bg">
        <span className="animated-heart h1">♥</span>
        <span className="animated-heart h2">♥</span>
        <span className="animated-heart h3">♥</span>
        <span className="animated-heart h4">♥</span>
        <span className="animated-heart h5">♥</span>
        <span className="animated-heart h6">♥</span>
        <span className="animated-heart h7">♥</span>
        <span className="animated-heart h8">♥</span>
        <span className="animated-heart h9">♥</span>
        <span className="animated-heart h10">♥</span>
        <span className="animated-heart h11">♥</span>
        <span className="animated-heart h12">♥</span>
        <span className="animated-heart h13">♥</span>
        <span className="animated-heart h14">♥</span>
        <span className="animated-heart h15">♥</span>
      </div>
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
            <div className="wa-value">Sina <span className="wa-sub">(104.360 Nachrichten)</span></div>
          </div>
          <div className="wa-card">
            <div className="wa-title">Aktivste Uhrzeit</div>
            <div className="wa-value">22 Uhr <span className="wa-sub">(23.188 Nachrichten)</span></div>
          </div>
        </div>
      </section>
      <footer className="love-footer">Für Sina ♥</footer>
    </div>
  );
}

export default App;
