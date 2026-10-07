import React from 'react';
import { Link } from 'react-router-dom';
import './AdminSidebar.css';

const NAV_ITEMS = [
  {
    key: 'overview',
    label: 'نظرة عامة',
    iconClass: 'fa-solid fa-chart-pie',
  },
  {
    key: 'orders',
    label: 'الطلبات والمبيعات',
    iconClass: 'fa-solid fa-truck-ramp-box',
  },
  {
    key: 'products',
    label: 'إدارة المنتجات',
    iconClass: 'fa-solid fa-boxes-stacked',
  },
  {
    key: 'categories',
    label: 'الفئات والتصنيفات',
    iconClass: 'fa-solid fa-tags',
  },
  {
    key: 'coupons',
    label: 'كوبونات الخصم',
    iconClass: 'fa-solid fa-ticket',
  },
  {
    key: 'shipping',
    label: 'الولايات وأسعار الشحن',
    iconClass: 'fa-solid fa-location-dot',
  },
  {
    key: 'settings',
    label: 'إعدادات المتجر و Cloudinary',
    iconClass: 'fa-solid fa-sliders',
  },
];

const AdminSidebar = ({ activeSection, setActiveSection, isOpen, setIsOpen, onLogout }) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`admin-sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`} aria-label="قائمة الإدارة">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">B</div>
          <div className="sidebar-logo-text">
            <span>Bouragba</span>
            <small>Admin Console</small>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="قائمة التنقل">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`sidebar-nav-item ${activeSection === item.key ? 'active' : ''}`}
              onClick={() => {
                setActiveSection(item.key);
                if (window.innerWidth < 900) setIsOpen(false);
              }}
              aria-current={activeSection === item.key ? 'page' : undefined}
              id={`admin-nav-${item.key}`}
            >
              <i className={`sidebar-icon ${item.iconClass}`}></i>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <Link
            to="/shop"
            className="sidebar-footer-btn"
            id="admin-view-store"
          >
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
            <span>عرض المتجر</span>
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="sidebar-footer-btn logout"
            id="admin-logout"
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'inherit', font: 'inherit' }}
            title="تسجيل الخروج من لوحة التحكم"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>خروج</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
