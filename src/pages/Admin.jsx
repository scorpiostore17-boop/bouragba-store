import React, { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminOverview from '../components/admin/AdminOverview';
import AdminOrders from '../components/admin/AdminOrders';
import AdminProducts from '../components/admin/AdminProducts';
import AdminCategories from '../components/admin/AdminCategories';
import AdminCoupons from '../components/admin/AdminCoupons';
import AdminShipping from '../components/admin/AdminShipping';
import AdminSettings from '../components/admin/AdminSettings';
import AdminLogin from '../components/admin/AdminLogin';
import './Admin.css';

const SECTIONS = {
  overview: { label: 'نظرة عامة', component: AdminOverview },
  orders: { label: 'الطلبات والمبيعات', component: AdminOrders },
  products: { label: 'إدارة المنتجات', component: AdminProducts },
  categories: { label: 'الفئات والتصنيفات', component: AdminCategories },
  coupons: { label: 'كوبونات الخصم', component: AdminCoupons },
  shipping: { label: 'الولايات وأسعار الشحن', component: AdminShipping },
  settings: { label: 'إعدادات المتجر والتواصل والأمان', component: AdminSettings },
};

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('bouragba_admin_auth') === 'true';
  });
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('bouragba_admin_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const Section = SECTIONS[activeSection]?.component || AdminOverview;
  const sectionLabel = SECTIONS[activeSection]?.label || 'نظرة عامة';

  return (
    <div className="admin-layout">
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className={`admin-main ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        {/* Admin Header */}
        <header className="admin-topbar">
          <div className="admin-topbar-right">
            <button
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="تبديل الشريط الجانبي"
              id="sidebar-toggle-btn"
            >
              <i className="fa-solid fa-bars-staggered"></i>
            </button>
            <div className="admin-breadcrumb">
              <span>لوحة التحكم</span>
              <span>/</span>
              <span className="admin-breadcrumb-current">{sectionLabel}</span>
            </div>
          </div>
          <div className="admin-topbar-left">
            <div className="admin-badge-sqlite">
              <i className="fa-solid fa-database"></i>
              <span>SQLite المتصل</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="admin-logout-topbar-btn"
              title="تسجيل الخروج"
              aria-label="تسجيل الخروج"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>خروج</span>
            </button>
            <div className="admin-avatar" aria-label="المدير">
              <span>B</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content" id="admin-content">
          <div className="admin-content-inner animate-fade-in" key={activeSection}>
            <Section />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
