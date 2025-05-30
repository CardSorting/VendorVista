import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayContent, setDisplayContent] = useState(children);
  const [prevLocation, setPrevLocation] = useState(location);

  useEffect(() => {
    if (location !== prevLocation) {
      setIsTransitioning(true);
      
      // Short delay for fade out, then update content
      const fadeOutTimer = setTimeout(() => {
        setDisplayContent(children);
        setPrevLocation(location);
        
        // Brief moment for DOM update, then fade in
        const fadeInTimer = setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
        
        return () => clearTimeout(fadeInTimer);
      }, 100);

      return () => clearTimeout(fadeOutTimer);
    }
  }, [location, prevLocation, children]);

  return (
    <div 
      className={`transform transition-all duration-200 ease-in-out ${
        isTransitioning 
          ? 'opacity-0 translate-y-1' 
          : 'opacity-100 translate-y-0'
      }`}
      style={{ minHeight: '50vh' }}
    >
      {displayContent}
    </div>
  );
}