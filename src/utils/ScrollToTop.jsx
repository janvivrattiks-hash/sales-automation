import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Disable browser automatic scroll restoration to prevent jumps during navigation
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Core scroll reset - triggers on every navigation (even same path)
    window.scrollTo(0, 0);

    // Secondary reset for components that might change height after initial render
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    return () => cancelAnimationFrame(rafId);
  }, [location]);

  return null;
};

export default ScrollToTop;
