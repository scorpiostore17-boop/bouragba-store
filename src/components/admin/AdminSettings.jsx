import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    store_name: 'Bouragba Store | بوراقبة ستور',
    store_phone: '0550039581',
    store_whatsapp: '0550039581',
    store_email: 'info@bouragbastore.dz',
    store_address: 'الجزائر العاصمة، الجزائر',
    store_desc: 'متجرك المعتمد لأحدث الهواتف الذكية الأصلية والإلكترونيات بضمان رسمي وتوصيل لجميع الولايات',
    admin_password: 'ADMIN123',
    contact_hours_main: 'السبت - الخميس: 09:00 - 20:00',
    contact_hours_friday: 'الجمعة: 14:00 - 20:00',
    contact_map_url: '',
    contact_facebook: '',
    contact_instagram: '',
    contact_tiktok: '',
    cloudinary_cloud_name: '',
    cloudinary_api_key: '',
    cloudinary_api_secret: '',
    cloudinary_upload_preset: '',
    cloudinaryConfigured: false,
  });

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await api.getSettings();
        if (data) setSettings(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      // Reload settings to refresh status
      const updated = await api.getSettings();
      if (updated) setSettings(prev => ({ ...prev, ...updated }));
    } catch (err) {
      alert('فشل حفظ الإعدادات: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-settings-page">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">
            <i className="fa-solid fa-sliders" style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}></i>
            إعدادات المتجر وصفحة التواصل والأمان
          </h2>
          <p className="admin-section-sub">
            التحكم الكامل في محتوى صفحة التواصل، رابط الخريطة، كلمة سر المدير، وربط Cloudinary
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="btn-primary"
          disabled={saving}
          id="btn-save-settings"
        >
          {saving ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              جاري الحفظ...
            </>
          ) : saved ? (
            <>
              <i className="fa-solid fa-check"></i>
              تم حفظ الإعدادات في SQLite
            </>
          ) : (
            <>
              <i className="fa-solid fa-floppy-disk"></i>
              حفظ التعديلات
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-settings-form">
        {/* Security / Admin Password Card */}
        <div className="admin-card">
          <h3 className="admin-card-title">
            <i className="fa-solid fa-shield-halved" style={{ marginLeft: '0.5rem', color: '#dc2626' }}></i>
            أمان لوحة التحكم وكلمة المرور
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
            كلمة السر المطلوبة للوصول إلى لوحة التحكم (/admin). يمكنك تغييرها في أي وقت
          </p>

          <div className="form-grid" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">كلمة سر لوحة التحكم (Admin Password) *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="admin_password"
                  value={settings.admin_password || ''}
                  onChange={handleChange}
                  className="form-input"
                  dir="ltr"
                  placeholder="ADMIN123"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--gray-500)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                  title={showPassword ? 'إخفاء' : 'إظهار'}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              <small style={{ color: 'var(--gray-500)', fontSize: '0.78rem', marginTop: '0.35rem', display: 'block' }}>
                الكلمة الحالية الافتراضية هي <code>ADMIN123</code>
              </small>
            </div>
          </div>
        </div>

        {/* Contact Page & Map Card */}
        <div className="admin-card highlight-border">
          <h3 className="admin-card-title">
            <i className="fa-solid fa-address-book" style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}></i>
            إدارة صفحة تواصل معنا وساعات العمل والخريطة
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
            التحكم الشامل في أرقام الاتصال، واتساب، وساعات العمل، وتضمين خريطة موقع المتجر
          </p>

          <div className="form-grid" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">رقم هاتف الاتصال *</label>
              <input
                type="text"
                name="store_phone"
                value={settings.store_phone || ''}
                onChange={handleChange}
                className="form-input"
                dir="ltr"
                style={{ textAlign: 'right' }}
                placeholder="0550039581"
              />
            </div>

            <div className="form-group">
              <label className="form-label">رقم واتساب المباشر *</label>
              <input
                type="text"
                name="store_whatsapp"
                value={settings.store_whatsapp || ''}
                onChange={handleChange}
                className="form-input"
                dir="ltr"
                style={{ textAlign: 'right' }}
                placeholder="0550039581"
              />
            </div>

            <div className="form-group">
              <label className="form-label">البريد الإلكتروني الرسمي *</label>
              <input
                type="email"
                name="store_email"
                value={settings.store_email || ''}
                onChange={handleChange}
                className="form-input"
                dir="ltr"
                style={{ textAlign: 'right' }}
                placeholder="info@bouragbastore.dz"
              />
            </div>

            <div className="form-group">
              <label className="form-label">عنوان ومقر المتجر</label>
              <input
                type="text"
                name="store_address"
                value={settings.store_address || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="مثال: الجزائر العاصمة، الجزائر"
              />
            </div>

            <div className="form-group">
              <label className="form-label">أوقات العمل الرئيسية</label>
              <input
                type="text"
                name="contact_hours_main"
                value={settings.contact_hours_main || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="السبت - الخميس: 09:00 - 20:00"
              />
            </div>

            <div className="form-group">
              <label className="form-label">أوقات العمل يوم الجمعة</label>
              <input
                type="text"
                name="contact_hours_friday"
                value={settings.contact_hours_friday || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="الجمعة: 14:00 - 20:00"
              />
            </div>

            {/* Google Map Embed Link */}
            <div className="form-group full-width">
              <label className="form-label">
                <i className="fa-solid fa-map-location-dot" style={{ marginLeft: '0.4rem', color: 'var(--primary)' }}></i>
                رابط خريطة Google Maps (EMBED)
              </label>
              <input
                type="text"
                name="contact_map_url"
                value={settings.contact_map_url || ''}
                onChange={handleChange}
                className="form-input"
                dir="ltr"
                placeholder="ضع هنا رابط التضمين https://www.google.com/maps/embed?... أو كود iframe من جوجل مابس"
              />
              <small style={{ color: 'var(--gray-500)', fontSize: '0.78rem', marginTop: '0.35rem', display: 'block' }}>
                عند وضع الرابط أو كود التضمين هنا، ستظهر الخريطة فوراً داخل صفحة "تواصل معنا"
              </small>
            </div>

            {/* Social links */}
            <div className="form-group">
              <label className="form-label">
                <i className="fa-brands fa-facebook-f" style={{ marginLeft: '0.4rem', color: '#1877f2' }}></i>
                رابط صفحة فيسبوك
              </label>
              <input
                type="url"
                name="contact_facebook"
                value={settings.contact_facebook || ''}
                onChange={handleChange}
                className="form-input"
                dir="ltr"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fa-brands fa-instagram" style={{ marginLeft: '0.4rem', color: '#e4405f' }}></i>
                رابط حساب إنستغرام
              </label>
              <input
                type="url"
                name="contact_instagram"
                value={settings.contact_instagram || ''}
                onChange={handleChange}
                className="form-input"
                dir="ltr"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fa-brands fa-tiktok" style={{ marginLeft: '0.4rem', color: '#000000' }}></i>
                رابط تيك توك (اختياري)
              </label>
              <input
                type="url"
                name="contact_tiktok"
                value={settings.contact_tiktok || ''}
                onChange={handleChange}
                className="form-input"
                dir="ltr"
                placeholder="https://tiktok.com/@..."
              />
            </div>
          </div>
        </div>

        {/* General Store Information */}
        <div className="admin-card">
          <h3 className="admin-card-title">
            <i className="fa-solid fa-store" style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}></i>
            معلومات وهوية المتجر
          </h3>

          <div className="form-grid" style={{ marginTop: '1.25rem' }}>
            <div className="form-group full-width">
              <label className="form-label">اسم المتجر *</label>
              <input
                type="text"
                name="store_name"
                value={settings.store_name || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">نبذة ووصف المتجر</label>
              <textarea
                name="store_desc"
                rows={3}
                value={settings.store_desc || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Cloudinary Integration Card */}
        <div className="admin-card highlight-border">
          <div className="card-top-header">
            <div>
              <h3 className="admin-card-title">
                <i className="fa-solid fa-cloud" style={{ color: '#0284c7', marginLeft: '0.5rem' }}></i>
                إعدادات حساب Cloudinary لتخزين الصور
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                يقوم المتجر برفع كافة صور المنتجات مباشرة إلى حسابك السحابي في Cloudinary
              </p>
            </div>

            <div className="cloud-status-indicator">
              {settings.cloudinaryConfigured ? (
                <span className="status-badge status-completed">
                  <i className="fa-solid fa-circle-check"></i> متصل بـ Cloudinary
                </span>
              ) : (
                <span className="status-badge status-pending">
                  <i className="fa-solid fa-circle-info"></i> جاهز للإعداد (محلي حالياً)
                </span>
              )}
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Cloud Name (اسم السحابة) *</label>
              <input
                type="text"
                name="cloudinary_cloud_name"
                value={settings.cloudinary_cloud_name || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="مثال: djbouragba"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">API Key *</label>
              <input
                type="text"
                name="cloudinary_api_key"
                value={settings.cloudinary_api_key || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="مثال: 984572918471928"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">API Secret *</label>
              <input
                type="password"
                name="cloudinary_api_secret"
                value={settings.cloudinary_api_secret || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••••••••••••••••••"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Upload Preset (اختياري)</label>
              <input
                type="text"
                name="cloudinary_upload_preset"
                value={settings.cloudinary_upload_preset || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="مثال: bouragba_preset"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
