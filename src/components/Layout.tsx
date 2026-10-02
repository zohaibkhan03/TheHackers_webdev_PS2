import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './Navbar';

gsap.registerPlugin(ScrollTrigger);

export default function Layout() {
  const lenisRef = useRef<Lenis | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Integrate Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();
  }, [location.pathname]);

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: '32px 24px',
          background: 'var(--color-surface)',
        }}
      >
        <div className="container-page" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
              <circle cx="16" cy="13" r="5" fill="white" />
              <path d="M16 18C11.5 18 8 20.5 8 23.5V25H24V23.5C24 20.5 20.5 18 16 18Z" fill="white" />
              <circle cx="22" cy="9" r="3" fill="var(--color-accent)" />
            </svg>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-text)' }}>LocalPulse</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Built for communities. Connecting neighbors since 2025.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Bengaluru, India
          </p>
        </div>
      </footer>
    </div>
  );
}
