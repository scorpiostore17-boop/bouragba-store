import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: '',
    maxDiscount: '',
  });

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await api.getCoupons();
      setCoupons(data || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.discountPercent) return;

    try {
      const created = await api.createCoupon({
        code: formData.code.trim().toUpperCase(),
        discountPercent: Number(formData.discountPercent),
        maxDiscount: Number(formData.maxDiscount || 0)
      });
      setCoupons(prev => [created, ...prev]);
      setFormData({ code: '', discountPercent: '', maxDiscount: '' });
    } catch (err) {
      alert('فشل إنشاء الكوبون: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الكوبون من قاعدة البيانات؟')) {
      try {
        await api.deleteCoupon(id);
        setCoupons(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        alert('فشل حذف الكوبون: ' + err.message);
      }
    }
  };

  return (
    <div className="admin-coupons-page">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">
            <i className="fa-solid fa-ticket" style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}></i>
            إدارة كوبونات الخصم
          </h2>
          <p className="admin-section-sub">أكواد التخفيض المحفوظة في قاعدة بيانات SQLite</p>
        </div>
      </div>

      <div className="categories-two-col-grid">
        {/* Add Coupon Form */}
        <div className="admin-card">
          <h3 className="admin-card-title">
            <i className="fa-solid fa-plus" style={{ marginLeft: '0.4rem', color: 'var(--primary)' }}></i>
            إنشاء كود خصم جديد
          </h3>
          <form onSubmit={handleAdd} className="cat-form">
            <div className="form-group">
              <label className="form-label">كود الكوبون *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="مثال: SUMMER2026"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">نسبة الخصم (%) *</label>
              <input
                type="number"
                required
                min="1"
                max="90"
                className="form-input"
                placeholder="مثال: 10"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">الحد الأقصى للخصم (د.ج - اختياري)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                placeholder="0 يعني بدون سقف"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
              <i className="fa-solid fa-check"></i>
              حفظ الكوبون في قاعدة البيانات
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="admin-card">
          <h3 className="admin-card-title">
            <i className="fa-solid fa-tags" style={{ marginLeft: '0.4rem', color: 'var(--gray-500)' }}></i>
            الكوبونات الفعالة ({coupons.length})
          </h3>

          <div className="admin-table-container">
            {loading ? (
              <div className="admin-loading">
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                <p>جاري تحميل الكوبونات...</p>
              </div>
            ) : coupons.length === 0 ? (
              <div className="admin-empty-table">
                <p>لا توجد كوبونات مسجلة</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>الكود</th>
                    <th>نسبة الخصم</th>
                    <th>الحد الأقصى</th>
                    <th>الحالة</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong style={{ color: 'var(--primary)', letterSpacing: '1px' }}>{c.code}</strong>
                      </td>
                      <td>{c.discount_percent}%</td>
                      <td>{c.max_discount > 0 ? `${c.max_discount.toLocaleString('ar-DZ')} د.ج` : 'غير محدود'}</td>
                      <td>
                        <span className="status-badge status-completed">
                          <i className="fa-solid fa-check"></i> نشط
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="action-btn delete"
                          title="حذف الكوبون"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
