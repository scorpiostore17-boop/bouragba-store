import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminProducts = () => {
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('الكل');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadNotice, setUploadNotice] = useState(null);
  const [urlInput, setUrlInput] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'هواتف ذكية',
    brand: '',
    price: '',
    oldPrice: '',
    stock: '10',
    image: '',
    images: [],
    description: '',
    isNew: false,
    isFeatured: false,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        api.getProducts(),
        api.getCategories().catch(() => [])
      ]);
      setProductsList(prods || []);
      setCategoriesList(cats || []);
    } catch (err) {
      console.error('Failed to load products in admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = productsList.filter((p) => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === 'الكل' || p.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setUploadNotice(null);
    setUrlInput('');
    setFormData({
      name: '',
      category: categoriesList[0]?.name || 'هواتف ذكية',
      brand: '',
      price: '',
      oldPrice: '',
      stock: '10',
      image: '',
      images: [],
      description: '',
      isNew: true,
      isFeatured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setUploadNotice(null);
    setUrlInput('');
    const pImages = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : (p.image ? [p.image] : []);

    setFormData({
      name: p.name,
      category: p.category,
      brand: p.brand || '',
      price: p.price,
      oldPrice: p.oldPrice || '',
      stock: p.stock,
      image: p.image || pImages[0] || '',
      images: pImages,
      description: p.description || '',
      isNew: Boolean(p.isNew),
      isFeatured: Boolean(p.isFeatured),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج من قاعدة البيانات نهائياً؟')) {
      try {
        await api.deleteProduct(id);
        setProductsList(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        alert('فشل حذف المنتج: ' + err.message);
      }
    }
  };

  // Cloudinary Multi-Image Files Upload Handler
  const handleImageFilesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingImage(true);
      setUploadNotice(`جاري رفع ${files.length} صور سحابياً إلى Cloudinary...`);
      const newUrls = [];

      for (let i = 0; i < files.length; i++) {
        setUploadNotice(`جاري رفع الصورة (${i + 1} من أصل ${files.length})...`);
        const result = await api.uploadImage(files[i]);
        if (result.success && result.url) {
          newUrls.push(result.url);
        }
      }

      if (newUrls.length > 0) {
        setFormData(prev => {
          const currentList = Array.isArray(prev.images) ? prev.images : (prev.image ? [prev.image] : []);
          const combined = [...currentList, ...newUrls];
          return {
            ...prev,
            images: combined,
            image: prev.image || combined[0] || ''
          };
        });
        setUploadNotice(`تم رفع ${newUrls.length} صور وتخزينها سحابياً بنجاح!`);
      }
    } catch (err) {
      alert('خطأ أثناء رفع الصور: ' + err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Add Image via Direct URL
  const handleAddImageUrl = () => {
    if (!urlInput.trim()) return;
    const url = urlInput.trim();
    setFormData(prev => {
      const currentList = Array.isArray(prev.images) ? prev.images : (prev.image ? [prev.image] : []);
      const combined = [...currentList, url];
      return {
        ...prev,
        images: combined,
        image: prev.image || combined[0] || ''
      };
    });
    setUrlInput('');
  };

  // Set Main Image
  const handleSetMainImage = (url) => {
    setFormData(prev => {
      const currentList = Array.isArray(prev.images) ? prev.images : [];
      const remaining = currentList.filter(item => item !== url);
      return {
        ...prev,
        image: url,
        images: [url, ...remaining]
      };
    });
  };

  // Remove an Image from the list
  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => {
      const currentList = Array.isArray(prev.images) ? prev.images : [];
      const remaining = currentList.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: remaining,
        image: remaining[0] || ''
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert('يرجى إدخال اسم المنتج والسعر على الأقل');
      return;
    }

    try {
      const imagesList = Array.isArray(formData.images) && formData.images.length > 0
        ? formData.images
        : (formData.image ? [formData.image] : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80']);

      const mainImg = formData.image || imagesList[0];

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        brand: formData.brand.trim(),
        price: Number(formData.price),
        oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
        stock: Number(formData.stock) || 0,
        image: mainImg,
        images: imagesList,
        description: formData.description.trim(),
        isNew: formData.isNew,
        isFeatured: formData.isFeatured,
      };

      if (editingProduct) {
        const updated = await api.updateProduct(editingProduct.id, payload);
        setProductsList(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
      } else {
        const created = await api.createProduct(payload);
        setProductsList(prev => [created, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err) {
      alert('خطأ أثناء حفظ المنتج: ' + err.message);
    }
  };

  const fmt = (n) => Number(n).toLocaleString('ar-DZ') + ' د.ج';

  return (
    <div className="admin-products-view">
      {/* Top Header Actions */}
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">
            <i className="fa-solid fa-boxes-stacked" style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}></i>
            إدارة المنتجات في قاعدة البيانات
          </h2>
          <p className="admin-section-sub">
            المنتجات مخزنة في SQLite والصور تدعم Cloudinary سحابياً بالكامل
          </p>
        </div>

        <button className="btn-primary" onClick={handleOpenAdd} id="add-product-btn">
          <i className="fa-solid fa-plus"></i>
          إضافة منتج جديد
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-controls-card">
        <div className="admin-search-wrap">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="search"
            placeholder="بحث بالاسم أو الماركة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="admin-filter-group">
          <label className="admin-filter-label">
            <i className="fa-solid fa-filter" style={{ marginLeft: '0.35rem' }}></i>
            الفئة:
          </label>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="form-select admin-cat-select"
          >
            <option value="الكل">كافة الفئات</option>
            {categoriesList.map(c => (
              <option key={c.id || c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading">
            <i className="fa-solid fa-circle-notch fa-spin"></i>
            <p>جاري تحميل المنتجات من SQLite...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="admin-empty-table">
            <i className="fa-solid fa-box-open" style={{ fontSize: '2.5rem', color: 'var(--gray-300)' }}></i>
            <h3>لا توجد منتجات مطابقة</h3>
            <p>يمكنك إضافة منتجات حقيقية جديدة ورفع صورها عبر زر الإضافة أعلاه</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>الصورة</th>
                <th>اسم المنتج</th>
                <th>الفئة</th>
                <th>العلامة</th>
                <th>السعر</th>
                <th>المخزون</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={p.image} alt={p.name} className="product-table-thumb" />
                      {p.images && p.images.length > 1 && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            background: 'var(--gray-800)',
                            color: '#ffffff',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                          }}
                          title={`${p.images.length} صور لهذا المنتج`}
                        >
                          {p.images.length}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="product-table-title">{p.name}</div>
                    {p.isFeatured && <span className="admin-badge featured">مميز</span>}
                    {p.isNew && <span className="admin-badge new">جديد</span>}
                  </td>
                  <td>{p.category}</td>
                  <td>{p.brand || '-'}</td>
                  <td>
                    <div className="price-tag">{fmt(p.price)}</div>
                    {p.oldPrice && <small className="old-price-tag">{fmt(p.oldPrice)}</small>}
                  </td>
                  <td>
                    <span className={`stock-badge ${p.stock > 0 ? 'available' : 'empty'}`}>
                      {p.stock > 0 ? `${p.stock} قطعة` : 'نفد'}
                    </span>
                  </td>
                  <td>
                    {p.stock > 0 ? (
                      <span className="status-pill active">
                        <i className="fa-solid fa-check"></i> متوفر
                      </span>
                    ) : (
                      <span className="status-pill inactive">
                        <i className="fa-solid fa-xmark"></i> غير متوفر
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions-group">
                      <button
                        className="action-btn edit"
                        onClick={() => handleOpenEdit(p)}
                        title="تعديل"
                        aria-label="تعديل المنتج"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(p.id)}
                        title="حذف"
                        aria-label="حذف المنتج"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay animate-fade-in">
          <div className="admin-modal-dialog">
            <div className="admin-modal-header">
              <h3>
                <i className={`fa-solid ${editingProduct ? 'fa-pen-to-square' : 'fa-plus'}`} style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}></i>
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
              </h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-form">
              <div className="modal-form-grid">
                {/* Product Name */}
                <div className="form-group full-width">
                  <label className="form-label">اسم المنتج *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    placeholder="مثال: iPhone 15 Pro Max"
                  />
                </div>

                {/* Category */}
                <div className="form-group">
                  <label className="form-label">الفئة *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-select"
                  >
                    {categoriesList.map(c => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div className="form-group">
                  <label className="form-label">العلامة التجارية (Brand)</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="form-input"
                    placeholder="مثال: Apple, Samsung..."
                  />
                </div>

                {/* Price */}
                <div className="form-group">
                  <label className="form-label">السعر (د.ج) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="form-input"
                    placeholder="مثال: 185000"
                  />
                </div>

                {/* Old Price */}
                <div className="form-group">
                  <label className="form-label">السعر قبل التخفيض (اختياري)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                    className="form-input"
                    placeholder="مثال: 210000"
                  />
                </div>

                {/* Stock */}
                <div className="form-group">
                  <label className="form-label">الكمية في المخزون *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="form-input"
                  />
                </div>

                {/* Cloudinary Multi-Image Upload Section */}
                <div className="form-group full-width cloudinary-upload-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      <i className="fa-solid fa-images" style={{ marginLeft: '0.4rem', color: 'var(--primary)' }}></i>
                      صور المنتج (يمكنك رفع أو إضافة أكثر من صورة)
                    </label>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600 }}>
                      {formData.images?.length || 0} صور مضافة
                    </span>
                  </div>

                  <div className="image-upload-controls" style={{ flexWrap: 'wrap' }}>
                    <div className="file-input-wrapper">
                      <label className="btn-upload-file">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        {uploadingImage ? 'جاري الرفع سحابياً...' : 'رفع صور من الجهاز (تحديد متعدد)'}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageFilesChange}
                          disabled={uploadingImage}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    <div className="url-input-wrapper" style={{ display: 'flex', gap: '0.5rem', flex: '1 1 280px' }}>
                      <input
                        type="url"
                        placeholder="أو ألصق رابط صورة هنا..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="form-input"
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', flexShrink: 0 }}
                      >
                        <i className="fa-solid fa-plus"></i>
                        إضافة
                      </button>
                    </div>
                  </div>

                  {uploadNotice && (
                    <p className="upload-notice">
                      <i className="fa-solid fa-circle-check"></i> {uploadNotice}
                    </p>
                  )}

                  {/* Multi-Image Gallery */}
                  {formData.images && formData.images.length > 0 ? (
                    <div className="admin-gallery-wrap" style={{ marginTop: '0.85rem' }}>
                      <small style={{ color: 'var(--gray-500)', display: 'block', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
                        * الصورة الأولى هي المعروضة كصورة رئيسية في واجهة المتجر (اضغط على النجمة لتعيين صورة كرئيسية):
                      </small>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                          gap: '0.75rem',
                        }}
                      >
                        {formData.images.map((imgUrl, idx) => {
                          const isMain = idx === 0 || formData.image === imgUrl;
                          return (
                            <div
                              key={idx}
                              style={{
                                position: 'relative',
                                borderRadius: 'var(--radius-sm)',
                                border: isMain ? '2px solid var(--primary)' : '1px solid var(--border)',
                                overflow: 'hidden',
                                background: '#ffffff',
                                aspectRatio: '1 / 1',
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <img
                                src={imgUrl}
                                alt={`صورة ${idx + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              {isMain && (
                                <span
                                  style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    background: 'var(--primary)',
                                    color: '#ffffff',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    zIndex: 2,
                                  }}
                                >
                                  الرئيسية
                                </span>
                              )}
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: '0',
                                  insetInline: '0',
                                  background: 'rgba(15, 23, 42, 0.75)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-around',
                                  padding: '4px 0',
                                  zIndex: 2,
                                }}
                              >
                                {!isMain && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetMainImage(imgUrl)}
                                    title="تعيين كصورة رئيسية"
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#ffffff',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <i className="fa-solid fa-star"></i>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  title="حذف الصورة"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#f87171',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <i className="fa-solid fa-trash-can"></i>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '1rem',
                        background: 'var(--gray-50)',
                        border: '1px dashed var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'center',
                        color: 'var(--gray-500)',
                        fontSize: '0.85rem',
                        marginTop: '0.75rem',
                      }}
                    >
                      لا توجد صور مضافة للمنتج بعد. يمكنك رفع أكثر من صورة واحدة من جهازك أو وضع روابط مباشرة
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="form-group full-width">
                  <label className="form-label">وصف المنتج</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input"
                    placeholder="اكتب مواصفات أو وصفاً مختصراً للمنتج..."
                  />
                </div>

                {/* Flags */}
                <div className="form-group full-width checkboxes-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    />
                    <span>إظهار كمنتج جديد (شعار "جديد")</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    <span>إظهار في المنتجات المميزة بالمقدمة</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="admin-modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn-primary" disabled={uploadingImage}>
                  <i className="fa-solid fa-floppy-disk"></i>
                  حفظ في قاعدة البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
