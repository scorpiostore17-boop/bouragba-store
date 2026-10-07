import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(false);
  const [activeTab, setActiveTab] = useState('desc');

  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await api.getProductById(id);
        if (isMounted && data) {
          setProduct(data);
          setActiveImg(0);
          setQty(1);

          // Fetch related
          if (data.category) {
            const relData = await api.getProducts({ category: data.category });
            if (isMounted) {
              setRelated((relData || []).filter(p => p.id !== data.id).slice(0, 4));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail-page page-enter">
        <div className="container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
          <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}></i>
          <p style={{ marginTop: '1rem', color: 'var(--gray-600)' }}>جاري تحميل تفاصيل المنتج...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="not-found-page page-enter">
        <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <div style={{ fontSize: '3rem', color: 'var(--gray-300)', marginBottom: '1rem' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>المنتج غير موجود</h2>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>قد يكون تم حذفه أو أن الرابط غير صحيح</p>
          <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/shop')}>
            العودة للمتجر
          </button>
        </div>
      </div>
    );
  }

  const fmt = (n) => Number(n).toLocaleString('ar-DZ') + ' د.ج';
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    setToast(true);
    setTimeout(() => setToast(false), 2800);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    navigate('/checkout');
  };

  const images = (product.images && product.images.length > 0) ? product.images : [product.image];

  return (
    <div className="product-detail-page page-enter">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="مسار التنقل">
          <Link to="/" id="breadcrumb-home">
            <i className="fa-solid fa-house" style={{ marginLeft: '0.35rem' }}></i>
            الرئيسية
          </Link>
          <span>/</span>
          <Link to="/shop" id="breadcrumb-shop">المتجر</Link>
          <span>/</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        {/* Main Product */}
        <div className="product-main">
          {/* Images */}
          <div className="product-images">
            <div className="main-img-wrap">
              <img
                src={images[activeImg] || product.image}
                alt={product.name}
                className="main-img"
                id="product-main-img"
              />
              {discount > 0 && (
                <span className="badge-discount-lg">-{discount}%</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="thumbnail-list">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumbnail ${i === activeImg ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`صورة ${i + 1}`}
                    id={`thumb-${i}`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-details">
            <p className="detail-brand">{product.brand || product.category}</p>
            <h1 className="detail-name">{product.name}</h1>

            <div style={{ marginBottom: '1rem' }}>
              <span className={`detail-stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                {product.stock > 0 ? (
                  <>
                    <i className="fa-solid fa-circle-check" style={{ marginLeft: '0.3rem' }}></i>
                    متوفر ({product.stock} قطعة)
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-circle-xmark" style={{ marginLeft: '0.3rem' }}></i>
                    نفدت الكمية
                  </>
                )}
              </span>
            </div>

            <div className="detail-price-block">
              <span className="detail-price">{fmt(product.price)}</span>
              {product.oldPrice && (
                <span className="detail-old-price">{fmt(product.oldPrice)}</span>
              )}
              {discount > 0 && (
                <span className="detail-discount-tag">وفر {discount}%</span>
              )}
            </div>

            <p className="detail-desc">{product.description}</p>

            {/* Quantity */}
            <div className="detail-qty">
              <label className="form-label">الكمية المطلوبة:</label>
              <div className="qty-control">
                <button
                  className="qty-btn"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="تقليل"
                  id="qty-minus"
                >
                  <i className="fa-solid fa-minus"></i>
                </button>
                <span className="qty-num">{qty}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}
                  disabled={qty >= (product.stock || 99)}
                  aria-label="زيادة"
                  id="qty-plus"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="detail-actions">
              <button
                className="btn-primary detail-add-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                id="detail-add-to-cart"
              >
                <i className="fa-solid fa-cart-plus"></i>
                أضف إلى السلة
              </button>
              <button
                className="btn-navy detail-buy-btn"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                id="detail-buy-now"
              >
                <i className="fa-solid fa-bolt"></i>
                شراء فوري
              </button>
            </div>

            {/* Direct Features Checklist */}
            <div className="detail-features">
              <div className="feature-item">
                <i className="fa-solid fa-truck-fast"></i>
                <span>توصيل سريع لكافة الـ 58 ولاية</span>
              </div>
              <div className="feature-item">
                <i className="fa-solid fa-shield-halved"></i>
                <span>ضمان رسمي مع حق الفحص قبل الدفع</span>
              </div>
              <div className="feature-item">
                <i className="fa-solid fa-medal"></i>
                <span>منتج أصلي ومضمون 100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Specifications Tabs */}
        <div className="detail-tabs">
          <div className="tabs-nav" role="tablist">
            <button
              className={`tab-btn ${activeTab === 'desc' ? 'active' : ''}`}
              onClick={() => setActiveTab('desc')}
              role="tab"
              aria-selected={activeTab === 'desc'}
              id="tab-desc"
            >
              <i className="fa-solid fa-align-right" style={{ marginLeft: '0.4rem' }}></i>
              الوصف والخصائص
            </button>
            <button
              className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
              role="tab"
              aria-selected={activeTab === 'specs'}
              id="tab-specs"
            >
              <i className="fa-solid fa-list-check" style={{ marginLeft: '0.4rem' }}></i>
              المواصفات التقنية
            </button>
          </div>

          <div className="tab-content animate-fade-in" key={activeTab}>
            {activeTab === 'desc' && (
              <p className="desc-text">{product.description || 'لا يوجد وصف مفصل متاح لهذا المنتج حالياً.'}</p>
            )}
            {activeTab === 'specs' && (
              Object.keys(product.specs || {}).length > 0 ? (
                <table className="specs-table" aria-label="مواصفات المنتج">
                  <tbody>
                    {Object.entries(product.specs).map(([k, v]) => (
                      <tr key={k}>
                        <th>{k.replace(/_/g, ' ')}</th>
                        <td>{String(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="desc-text" style={{ color: 'var(--gray-500)' }}>لا توجد مواصفات تقنية مسجلة لهذا المنتج.</p>
              )
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="related-section" aria-label="منتجات مشابهة">
            <h2 className="section-title">
              <i className="fa-solid fa-fire" style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}></i>
              منتجات مشابهة قد تهمك
            </h2>
            <div className="products-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      {/* Toast Notification */}
      <div className={`toast success ${toast ? 'show' : ''}`} role="alert">
        <i className="fa-solid fa-check"></i>
        تمت إضافة المنتج إلى السلة بنجاح!
      </div>
    </div>
  );
};

export default ProductDetail;
