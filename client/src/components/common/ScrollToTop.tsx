import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Automatically scrolls window to top (0, 0) on every route or search param navigation.
 * Solves the issue where navigating from a scrolled page (like Roadmap) leaves the user
 * at the bottom of the destination page (like Practice Sandbox or Problem Workspace).
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

