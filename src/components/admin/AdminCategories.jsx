import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AVAILABLE_ICONS = [
  { class: 'fa-mobile-screen-button', label: 'هاتف' },
  { class: 'fa-headphones', label: 'سماعات' },
  { class: 'fa-laptop', label: 'لابتوب' },
  { class: 'fa-volume-high', label: 'صوتيات' },
  { class: 'fa-clock', label: 'ساعة' },
  { class: 'fa-bolt', label: 'طاقة وشحن' },
  { class: 'fa-plug', label: 'كابلات' },
  { class: 'fa-shield-halved', label: 'حماية وكفرات' },
  { class: 'fa-gamepad', label: 'ألعاب' },
  { class: 'fa-tv', label: 'شاشات' },
  { class: 'fa-camera', label: 'كاميرا' },
  { class: 'fa-box', label: 'عام' },
];

const AdminCategories = () => {
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('fa-mobile-screen-button');

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getCategories();
      setCategoriesList(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const created = await api.createCategory({
        name: newCatName.trim(),
        icon: newCatIcon
      });
      setCategoriesList(prev => [...prev, created]);
      setNewCatName('');
    } catch (err) {
      alert('فشل إضافة الفئة: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفئة من قاعدة البيانات؟')) {
      try {
        await api.deleteCategory(id);
        setCategoriesList(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        alert('فشل حذف الفئة: ' + err.message);
      }
    }
  };

  return (
    <div className="admin-categories-page">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">
            <i className="fa-solid fa-tags" style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}></i>
            إدارة الفئات والتصنيفات
          </h2>
          <p className="admin-section-sub">تصنيفات المنتجات المخزنة في قاعدة بيانات SQLite بأيقونات Font Awesome</p>
        </div>
      </div>

      <div className="categories-two-col-grid">
        {/* Add Form */}
        <div className="admin-card">
          <h3 className="admin-card-title">
            <i className="fa-solid fa-plus" style={{ marginLeft: '0.4rem', color: 'var(--primary)' }}></i>
            إضافة فئة جديدة
          </h3>
          <form onSubmit={handleAddCategory} className="cat-form">
            <div className="form-group">
              <label className="form-label">اسم الفئة *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="مثال: شواحن وبنوك طاقة"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">اختيار أيقونة الفئة (Font Awesome):</label>
              <div className="font-awesome-icon-picker">
                {AVAILABLE_ICONS.map((iconObj) => (
                  <button
                    key={iconObj.class}
                    type="button"
                    onClick={() => setNewCatIcon(iconObj.class)}
                    className={`icon-pick-btn ${newCatIcon === iconObj.class ? 'selected' : ''}`}
                    title={iconObj.label}
                  >
                    <i className={`fa-solid ${iconObj.class}`}></i>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
              <i className="fa-solid fa-check"></i>
              إضافة الفئة لقاعدة البيانات
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="admin-card">
          <h3 className="admin-card-title">
            <i className="fa-solid fa-list" style={{ marginLeft: '0.4rem', color: 'var(--gray-500)' }}></i>
            الفئات الحالية ({categoriesList.length})
          </h3>

          <div className="admin-table-container">
            {loading ? (
              <div className="admin-loading">
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                <p>جاري تحميل الفئات...</p>
              </div>
            ) : categoriesList.length === 0 ? (
              <div className="admin-empty-table">
                <p>لا توجد فئات حالياً</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>الأيقونة</th>
                    <th>اسم الفئة</th>
                    <th>عدد المنتجات</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriesList.map((cat) => (
                    <tr key={cat.id}>
                      <td>
                        <div className="cat-icon-badge">
                          <i className={`fa-solid ${cat.icon || 'fa-box'}`}></i>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--gray-900)' }}>{cat.name}</strong>
                      </td>
                      <td>
                        <span className="stock-badge available">{cat.count || 0} منتج</span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="action-btn delete"
                          title="حذف الفئة"
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

export default AdminCategories;
