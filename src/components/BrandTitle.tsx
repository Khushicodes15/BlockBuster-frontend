'use client';

import { useEffect, useState } from 'react';

const ENGLISH = 'BlockBuster';
const KANNADA = 'ಬ್ಲಾಕ್‌ಬಸ್ಟರ್';

export function BrandTitle() {
  const [showKannada, setShowKannada] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const cycle = () => {
      setFading(true);
      setTimeout(() => {
        setShowKannada((prev) => !prev);
        setFading(false);
      }, 500);
    };

    // First transition: English → Kannada after 1.8s
    const first = setTimeout(cycle, 1800);
    // Then keep alternating every 3s
    const interval = setInterval(cycle, 3800);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  return (
    <h1
      className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl"
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      {showKannada ? KANNADA : ENGLISH}
    </h1>
  );
}
