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
    // Scroll to top only when the pathname changes
    // This prevents scrolling when only location.state is updated (e.g. during state-to-history sync)
    window.scrollTo(0, 0);

    // Secondary reset for components that might change height after initial render
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    return () => cancelAnimationFrame(rafId);
  }, [location.pathname]);

  return null;
};

export default ScrollToTop;
