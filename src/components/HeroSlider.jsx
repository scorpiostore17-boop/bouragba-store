import React, { useState, useEffect, useCallback } from 'react';
import './HeroSlider.css';

const slides = [
  {
    id: 1,
    src: '/src/assets/images/hero1.jpg',
    text: 'عروض حصرية',
    sub: 'أفضل الأسعار على أحدث الهواتف الذكية',
  },
  {
    id: 2,
    src: '/src/assets/images/hero2.jpg',
    text: 'أكسسوارات أصلية',
    sub: 'كفرات، سماعات، شواحن وأكثر',
  },
  {
    id: 3,
    src: '/src/assets/images/hero3.jpg',
    text: 'أحدث الإصدارات',
    sub: 'آيفون، سامسونج، وكل العلامات الكبرى',
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % slides.length);
  }, []);

  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setDragging(true);
  };
  const handleTouchEnd = (e) => {
    if (!dragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    setDragging(false);
  };

  return (
    <div
      className="hero-slider"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="عرض الشرائح الرئيسي"
      role="region"
    >
      <div
        className="slides-track"
        style={{ transform: `translateX(${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={slide.id} className={`slide ${i === current ? 'active' : ''}`}>
            <img src={slide.src} alt={slide.text} loading={i === 0 ? 'eager' : 'lazy'} />
            <div className="slide-overlay">
              <div className="slide-content">
                <h2 className="slide-title">{slide.text}</h2>
                <p className="slide-sub">{slide.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nav Buttons */}
      <button className="slider-btn prev" onClick={prev} aria-label="الشريحة السابقة" id="slider-prev">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button className="slider-btn next" onClick={next} aria-label="الشريحة التالية" id="slider-next">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      {/* Dots */}
      <div className="slider-dots" role="tablist" aria-label="اختر الشريحة">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`الشريحة ${i + 1}`}
            aria-selected={i === current}
            role="tab"
            id={`slider-dot-${i}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
