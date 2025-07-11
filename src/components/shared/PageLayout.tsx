import { Navigation } from './Navigation';
import './PageLayout.css';

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="page-layout">
      <Navigation />
      
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

      <main className="page-content">
        {children}
      </main>

      <footer className="page-footer">Für Sina ♥</footer>
    </div>
  );
} 