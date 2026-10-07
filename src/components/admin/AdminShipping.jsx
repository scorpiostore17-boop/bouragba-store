import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminShipping = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const data = await api.getShippingRates();
        setRates(data || []);
      } catch (err) {
        console.error('Failed to load shipping rates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const handleUpdate = (code, field, val) => {
    setRates(prev => prev.map(r => r.wilaya_code === code ? { ...r, [field]: Number(val) } : r));
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateShippingRates(rates);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('فشل حفظ أسعار الشحن: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = rates.filter(r =>
    (r.wilaya_name || '').includes(searchTerm) ||
    String(r.wilaya_code).includes(searchTerm)
  );

  return (
    <div className="admin-shipping-page">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">
            <i className="fa-solid fa-location-dot" style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}></i>
            إدارة الولايات وأسعار الشحن
          </h2>
          <p className="admin-section-sub">
            أسعار التوصيل لـ 58 ولاية جزائرية مخزنة في SQLite (شحن للمنزل أو استلام من المكتب)
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={handleSaveAll}
          disabled={saving}
          id="btn-save-shipping"
        >
          {saving ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              جاري الحفظ...
            </>
          ) : savedSuccess ? (
            <>
              <i className="fa-solid fa-check"></i>
              تم حفظ الأسعار في SQLite
            </>
          ) : (
            <>
              <i className="fa-solid fa-floppy-disk"></i>
              حفظ كافة الأسعار
            </>
          )}
        </button>
      </div>

      <div className="admin-controls-card">
        <div className="admin-search-wrap">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="search"
            className="admin-search-input"
            placeholder="ابحث عن ولاية بالاسم أو الرقم..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="products-count">{filtered.length} ولاية</span>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading">
            <i className="fa-solid fa-circle-notch fa-spin"></i>
            <p>جاري تحميل أسعار الولايات من SQLite...</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>الرمز</th>
                <th>اسم الولاية</th>
                <th>سعر التوصيل للمنزل (د.ج)</th>
                <th>سعر الاستلام من المكتب (د.ج)</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.wilaya_code}>
                  <td>
                    <strong style={{ color: 'var(--primary)' }}>{r.wilaya_code}</strong>
                  </td>
                  <td>
                    <strong>{r.wilaya_name}</strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        className="form-input"
                        value={r.home_price}
                        onChange={(e) => handleUpdate(r.wilaya_code, 'home_price', e.target.value)}
                        style={{ width: '100px', textAlign: 'center', fontWeight: 'bold' }}
                      />
                      <small style={{ color: 'var(--gray-500)' }}>د.ج</small>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        className="form-input"
                        value={r.desk_price}
                        onChange={(e) => handleUpdate(r.wilaya_code, 'desk_price', e.target.value)}
                        style={{ width: '100px', textAlign: 'center', fontWeight: 'bold' }}
                      />
                      <small style={{ color: 'var(--gray-500)' }}>د.ج</small>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge status-completed">
                      <i className="fa-solid fa-check"></i> نشط
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminShipping;
