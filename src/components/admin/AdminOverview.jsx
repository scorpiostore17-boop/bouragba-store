import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminOverview.css';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    ordersCount: 0,
    revenue: 0,
    productsCount: 0,
    outOfStock: 0,
    recentOrders: [],
  });
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const [statsData, prods] = await Promise.all([
          api.getStats().catch(() => ({})),
          api.getProducts().catch(() => [])
        ]);

        if (statsData) setStats(statsData);
        if (prods) setFeaturedProducts(prods.slice(0, 5));
      } catch (err) {
        console.error('Failed to load overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const fmt = (n) => Number(n || 0).toLocaleString('ar-DZ') + ' د.ج';

  return (
    <div className="admin-overview">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">
            <i className="fa-solid fa-chart-pie" style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}></i>
            نظرة عامة على المتجر
          </h2>
          <p className="admin-section-sub">مؤشرات الأداء المباشرة المستخرجة من قاعدة بيانات SQLite</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        {/* Total Revenue */}
        <div className="admin-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">إجمالي المبيعات المؤكدة</span>
            <div className="stat-icon-wrap primary">
              <i className="fa-solid fa-money-bill-trend-up"></i>
            </div>
          </div>
          <div className="stat-value">{fmt(stats.revenue)}</div>
          <div className="stat-sub-note">
            <i className="fa-solid fa-circle-check" style={{ color: '#16a34a', marginLeft: '0.35rem' }}></i>
            مبيعات الطلبات المسجلة
          </div>
        </div>

        {/* Total Orders */}
        <div className="admin-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">إجمالي عدد الطلبات</span>
            <div className="stat-icon-wrap info">
              <i className="fa-solid fa-truck-ramp-box"></i>
            </div>
          </div>
          <div className="stat-value">{stats.ordersCount} طلب</div>
          <div className="stat-sub-note">
            <i className="fa-solid fa-arrow-trend-up" style={{ color: 'var(--primary)', marginLeft: '0.35rem' }}></i>
            طلبات الشراء في قاعدة البيانات
          </div>
        </div>

        {/* Total Products */}
        <div className="admin-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">المنتجات في المتجر</span>
            <div className="stat-icon-wrap success">
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
          </div>
          <div className="stat-value">{stats.productsCount} منتج</div>
          <div className="stat-sub-note">
            <i className="fa-solid fa-database" style={{ color: '#0284c7', marginLeft: '0.35rem' }}></i>
            منتجات حقيقية في SQLite
          </div>
        </div>

        {/* Out of Stock */}
        <div className="admin-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">المنتجات التي نفدت</span>
            <div className="stat-icon-wrap danger">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
          </div>
          <div className="stat-value">{stats.outOfStock || 0} منتج</div>
          <div className="stat-sub-note">
            <span style={{ color: stats.outOfStock > 0 ? '#dc2626' : '#16a34a' }}>
              {stats.outOfStock > 0 ? 'تتطلب إعادة تزويد المخزون' : 'كافة المنتجات متوفرة'}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="overview-split-grid">
        {/* Recent Orders Card */}
        <div className="admin-box-card">
          <h3 className="box-card-title">
            <i className="fa-solid fa-clock-rotate-left" style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}></i>
            أحدث الطلبات الواردة
          </h3>

          {(stats.recentOrders || []).length === 0 ? (
            <div className="empty-box-state">
              <i className="fa-solid fa-receipt"></i>
              <p>لا توجد طلبات مسجلة بعد</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>الطلب</th>
                    <th>العميل</th>
                    <th>الهاتف</th>
                    <th>المبلغ</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map(o => (
                    <tr key={o.id}>
                      <td><strong>#{o.id}</strong></td>
                      <td>{o.customerName}</td>
                      <td dir="ltr" style={{ textAlign: 'left' }}>{o.customerPhone}</td>
                      <td><strong>{fmt(o.total)}</strong></td>
                      <td>
                        <span className={`status-badge status-${o.status}`}>
                          {o.status === 'completed' ? 'مكتمل' : o.status === 'processing' ? 'قيد التجهيز' : o.status === 'cancelled' ? 'ملغي' : 'معلق'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Featured Products List */}
        <div className="admin-box-card">
          <h3 className="box-card-title">
            <i className="fa-solid fa-star" style={{ marginLeft: '0.5rem', color: '#f59e0b' }}></i>
            قائمة المنتجات المتاحة
          </h3>

          {featuredProducts.length === 0 ? (
            <div className="empty-box-state">
              <i className="fa-solid fa-box-open"></i>
              <p>لا توجد منتجات مسجلة في قاعدة البيانات</p>
            </div>
          ) : (
            <div className="featured-prods-list">
              {featuredProducts.map(p => (
                <div key={p.id} className="featured-prod-item">
                  <img src={p.image} alt={p.name} className="featured-prod-img" />
                  <div className="featured-prod-info">
                    <h4>{p.name}</h4>
                    <span>{p.category}</span>
                  </div>
                  <div className="featured-prod-price">
                    <strong>{fmt(p.price)}</strong>
                    <small>المخزون: {p.stock}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
