import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable browser automatic scroll restoration to prevent jumps during navigation
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Core scroll reset
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    // Secondary reset for components that might change height after initial render
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
