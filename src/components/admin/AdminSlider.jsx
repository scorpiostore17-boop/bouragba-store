import React, { useState } from 'react';
import { sliderImages as initialSlides } from '../../data/products';

const AdminSlider = () => {
  const [slides, setSlides] = useState([
    {
      id: 1,
      title: 'أقوى العروض على الهواتف الذكية',
      subtitle: 'تخفيضات تصل حتى 30% مع ضمان رسمي لمدة عام',
      tag: 'عرض محدود',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&q=80',
      btnText: 'تسوق الآن',
      btnLink: '/shop',
      active: true,
    },
    {
      id: 2,
      title: 'أفضل الإكسسوارات الأصلية 100%',
      subtitle: 'سماعات، شواحن، كفرات حماية بأفضل الأسعار في الجزائر',
      tag: 'جديد وحصري',
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=1200&q=80',
      btnText: 'استكشف الإكسسوارات',
      btnLink: '/shop',
      active: true,
    },
    {
      id: 3,
      title: 'توصيل سريع ومضمون لـ 58 ولاية',
      subtitle: 'الدفع عند الاستلام مع إمكانية المعاينة قبل الدفع',
      tag: 'خدمة التوصيل',
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1200&q=80',
      btnText: 'اطلب الآن',
      btnLink: '/shop',
      active: true,
    },
  ]);

  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tag: '',
    image: '',
    btnText: '',
  });

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      tag: slide.tag,
      image: slide.image,
      btnText: slide.btnText,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingSlide) {
      setSlides(slides.map(s => s.id === editingSlide.id ? { ...s, ...formData } : s));
      setEditingSlide(null);
    } else {
      const newSlide = {
        id: Date.now(),
        ...formData,
        btnLink: '/shop',
        active: true,
      };
      setSlides([...slides, newSlide]);
    }
    setFormData({ title: '', subtitle: '', tag: '', image: '', btnText: '' });
  };

  const toggleActive = (id) => {
    setSlides(slides.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الشريحة؟')) {
      setSlides(slides.filter(s => s.id !== id));
    }
  };

  return (
    <div className="admin-slider-page">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">إدارة سلايدر الصفحة الرئيسية</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            التحكم في البانرات الإعلانية والعروض الترويجية
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem' }}>
        {/* Form */}
        <div className="admin-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '1.25rem' }}>
            {editingSlide ? 'تعديل الشريحة' : 'إضافة شريحة جديدة'}
          </h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                العنوان الرئيسي *
              </label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                الوصف الفرعي
              </label>
              <textarea
                className="form-input"
                rows="2"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  الشارة (Tag)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="مثال: خصم 50%"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  نص الزر
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="تسوق الآن"
                  value={formData.btnText}
                  onChange={(e) => setFormData({ ...formData, btnText: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                رابط صورة الخلفية
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              {editingSlide && (
                <button
                  type="button"
                  onClick={() => { setEditingSlide(null); setFormData({ title: '', subtitle: '', tag: '', image: '', btnText: '' }); }}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'var(--gray-100)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  إلغاء
                </button>
              )}
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {editingSlide ? 'حفظ التعديل' : 'إضافة الشريحة'}
              </button>
            </div>
          </form>
        </div>

        {/* Slides List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {slides.map((s, idx) => (
            <div
              key={s.id}
              className="admin-card"
              style={{
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <img
                src={s.image}
                alt={s.title}
                style={{
                  width: '120px',
                  height: '80px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  flexShrink: 0
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(255,107,0,0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    {s.tag || `شريحة ${idx + 1}`}
                  </span>
                  <h4 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1rem' }}>{s.title}</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: 0 }}>
                  {s.subtitle}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                <button
                  onClick={() => toggleActive(s.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <span className={`status-badge ${s.active ? 'status-completed' : 'status-cancelled'}`}>
                    {s.active ? 'معروض' : 'مخفي'}
                  </span>
                </button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEdit(s)}
                    style={{
                      padding: '4px 10px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    style={{
                      padding: '4px 10px',
                      background: '#fef2f2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSlider;
