import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="store-hero" aria-label="تعريف بمتجر بوراقبة ستور">
      <div className="hero-content">
        

        {/* Main Title */}
        <h1 className="hero-title">
          <span className="hero-title-highlight"> BOURAGBA PHONE & ACCESSORIES</span>
        </h1>

        {/* Description */}
        <p className="hero-desc">
         المحل متواجد في ولاية الجلفة طريق الولاية مقابل ثانوية طهيري
         <br></br><br></br><br></br>
         <img width={400} height={400} className='hero-desc'  src="src/logo.png" alt="" />
         <br></br>
        </p>

        {/* Action Buttons */}
        <div className="hero-actions">
          <a href="#shop-grid" className="btn-hero-primary" id="hero-browse-btn">
          
            تصفح المنتجات
          </a>
          
          <Link to="/contact" className="btn-hero-secondary" id="hero-contact-btn">
            تواصل معنا
           
          </Link>
        
        </div>
      </div>
    </section>
  );
};

export default Hero;
