import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Contact.css';

const Contact = () => {
  const [settings, setSettings] = useState({
    store_phone: '0550039581',
    store_whatsapp: '0550039581',
    store_email: 'info@bouragbastore.dz',
    store_address: 'الجزائر العاصمة، الجزائر',
    contact_hours_main: 'السبت - الخميس: 09:00 - 20:00',
    contact_hours_friday: 'الجمعة: 14:00 - 20:00',
    contact_map_url: '',
    contact_facebook: '',
    contact_instagram: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getSettings();
        if (data) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Failed to load contact settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Helper to extract clean embed url if iframe code was pasted
  const getEmbedUrl = (raw) => {
    if (!raw) return '';
    const trimmed = raw.trim();
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    if (match) return match[1];
    return trimmed;
  };

  const mapEmbedSrc = getEmbedUrl(settings.contact_map_url);
  const rawWa = (settings.store_whatsapp || '0550039581').replace(/\D/g, '');
  const waNumber = rawWa.startsWith('0') ? '213' + rawWa.slice(1) : rawWa;

  return (
    <div className="contact-page page-enter">
      <div className="container">
        {/* Header */}
        <div className="contact-header">
          <h1 className="contact-title">تواصل معنا</h1>
        </div>

        {/* Contact Hub Cards Grid */}
        <div className="contact-grid">
          {/* Phone */}
          <div className="contact-card">
            <div className="card-icon-wrap">
              <i className="fa-solid fa-phone-volume"></i>
            </div>
            <a href={`tel:${settings.store_phone || '0550039581'}`} className="btn-contact-action" id="contact-call-btn">
              <i className="fa-solid fa-phone"></i>
              {settings.store_phone || '0550039581'}
            </a>
          </div>

          {/* WhatsApp */}
          <div className="contact-card highlight-card">
            <div className="card-icon-wrap whatsapp-icon">
              <i className="fa-brands fa-whatsapp"></i>
            </div>
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-contact-action whatsapp-action"
              id="contact-whatsapp-direct"
            >
              <i className="fa-brands fa-whatsapp"></i>
              مراسلة عبر واتساب
            </a>
          </div>

          {/* Email */}
          <div className="contact-card">
            <div className="card-icon-wrap">
              <i className="fa-solid fa-envelope"></i>
            </div>
            <a href={`mailto:${settings.store_email || 'info@bouragbastore.dz'}`} className="btn-contact-action outline" id="contact-email-btn">
              <i className="fa-solid fa-paper-plane"></i>
              {settings.store_email || 'info@bouragbastore.dz'}
            </a>
          </div>

          {/* Location & Hours */}
          <div className="contact-card">
            <div className="card-icon-wrap">
              <i className="fa-solid fa-location-dot"></i>
            </div>
            <div className="hours-badge">
              <i className="fa-solid fa-clock"></i>
              <span>{settings.contact_hours_main || 'السبت - الخميس: 09:00 - 20:00'}</span>
            </div>
            <div className="hours-badge" style={{ marginTop: '0.4rem' }}>
              <i className="fa-solid fa-clock"></i>
              <span>{settings.contact_hours_friday || 'الجمعة: 14:00 - 20:00'}</span>
            </div>
          </div>
        </div>

        {/* Map / Visit Us & Social Section */}
        <div className="contact-details-box">
          <div className="details-col">
            <div className="social-links-block" style={{ marginTop: 0 }}>
              <span className="social-label">تابعونا على شبكات التواصل:</span>
              <div className="social-btns-group">
                {settings.contact_facebook && (
                  <a
                    href={settings.contact_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link-btn"
                    id="contact-facebook"
                    aria-label="Facebook"
                  >
                    <i className="fa-brands fa-facebook-f"></i>
                    <span>فيسبوك</span>
                  </a>
                )}
                {settings.contact_instagram && (
                  <a
                    href={settings.contact_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link-btn"
                    id="contact-instagram"
                    aria-label="Instagram"
                  >
                    <i className="fa-brands fa-instagram"></i>
                    <span>إنستغرام</span>
                  </a>
                )}
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link-btn"
                  id="contact-social-whatsapp"
                  aria-label="WhatsApp"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                  <span>واتساب</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Google Map Embed Section */}
        {mapEmbedSrc && (
          <div className="contact-map-wrapper">
            <div className="contact-map-header">
              <i className="fa-solid fa-map-location-dot"></i>
              <h3>موقعنا على الخريطة</h3>
            </div>
            <iframe
              src={mapEmbedSrc}
              title="موقع المتجر على الخريطة"
              width="100%"
              height="380"
              style={{ border: 0, display: 'block', width: '100%' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;
