import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">
          {/* Brand */}
          <div className="footer-brand">
          
              
            <div className="footer-social">
              <a href="#" className="social-btn" aria-label="Facebook" id="social-facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="social-btn" aria-label="Instagram" id="social-instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a
                href="https://wa.me/213550039581"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn whatsapp-social"
                aria-label="WhatsApp"
                id="social-whatsapp"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">روابط سريعة</h4>
            <ul className="footer-links">
              <li>
                <Link to="/shop" id="footer-shop">
                  <i className="fa-solid fa-angle-left"></i>
                  المتجر
                </Link>
              </li>
              <li>
                <Link to="/contact" id="footer-contact">
                  <i className="fa-solid fa-angle-left"></i>
                  تواصل معنا
                </Link>
              </li>
              <li>
                <Link to="/admin" id="footer-admin">
                  <i className="fa-solid fa-angle-left"></i>
                  لوحة التحكم
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h4 className="footer-heading">الفئات</h4>
            <ul className="footer-links">
              <li>
                <Link to="/shop?category=هواتف ذكية" id="footer-phones">
                  <i className="fa-solid fa-mobile-screen-button"></i>
                  هواتف ذكية
                </Link>
              </li>
              <li>
                <Link to="/shop?category=صوتيات وسماعات" id="footer-audio">
                  <i className="fa-solid fa-headphones"></i>
                  سماعات وصوتيات
                </Link>
              </li>
              <li>
                <Link to="/shop?category=إكسسوارات" id="footer-accessories">
                  <i className="fa-solid fa-plug"></i>
                  إكسسوارات وشواحن
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="footer-heading">معلومات المتجر</h4>
            <ul className="footer-contact-list">
              <li>
                <i className="fa-solid fa-phone"></i>
                <a href="tel:0550039581">0550039581</a>
              </li>
              <li>
                <i className="fa-solid fa-envelope"></i>
                <a href="mailto:info@bouragbastore.dz">info@bouragbastore.dz</a>
              </li>
              <li>
                <i className="fa-solid fa-location-dot"></i>
                <span>الجزائر العاصمة، الجزائر</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {currentYear} Bouragba Store. جميع الحقوق محفوظة.</p>
          <p className="footer-made">
           bouragba<i className="fa-solid fa-heart" style={{ color: '#ef4444', margin: '0 4px' }}></i>phone
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
