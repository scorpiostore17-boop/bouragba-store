import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import './Checkout.css';

const WILAYAS_LIST = [
  '01 - أدرار', '02 - الشلف', '03 - الأغواط', '04 - أم البواقي', '05 - باتنة',
  '06 - بجاية', '07 - بسكرة', '08 - بشار', '09 - البليدة', '10 - البويرة',
  '11 - تمنراست', '12 - تبسة', '13 - تلمسان', '14 - تيارت', '15 - تيزي وزو',
  '16 - الجزائر العاصمة', '17 - الجلفة', '18 - جيجل', '19 - سطيف', '20 - سعيدة',
  '21 - سكيكدة', '22 - سيدي بلعباس', '23 - عنابة', '24 - قالمة', '25 - قسنطينة',
  '26 - المدية', '27 - مستغانم', '28 - المسيلة', '29 - معسكر', '30 - ورقلة',
  '31 - وهران', '32 - البيض', '33 - إليزي', '34 - برج بوعريريج', '35 - بومرداس',
  '36 - الطارف', '37 - تندوف', '38 - تيسمسيلت', '39 - الوادي', '40 - خنشلة',
  '41 - سوق أهراس', '42 - تيبازة', '43 - ميلة', '44 - عين الدفلى', '45 - النعامة',
  '46 - عين تموشنت', '47 - غرداية', '48 - غليزان', '49 - تيميمون', '50 - برج باجي مختار',
  '51 - أولاد جلال', '52 - بني عباس', '53 - إن صالح', '54 - إن قزام', '55 - تقرت',
  '56 - جانت', '57 - المغير', '58 - المنيعة'
];

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: form, 2: success
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState(null);
  const [shippingRatesMap, setShippingRatesMap] = useState({});

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    wilaya: '',
    deliveryType: 'home', // 'home' or 'desk'
    payment: 'cod',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  // Load real shipping rates from SQLite
  useEffect(() => {
    api.getShippingRates()
      .then(rates => {
        if (Array.isArray(rates)) {
          const map = {};
          rates.forEach(r => {
            map[r.wilaya_code] = {
              desk: r.desk_price,
              home: r.home_price,
              name: r.wilaya_name
            };
          });
          setShippingRatesMap(map);
        }
      })
      .catch(() => {});
  }, []);

  // Calculate Shipping based on selected Wilaya
  const getShippingCost = () => {
    if (!form.wilaya) return 0;
    const code = form.wilaya.split(' - ')[0];
    const rate = shippingRatesMap[code];
    if (rate) {
      return form.deliveryType === 'desk' ? rate.desk : rate.home;
    }
    return 600; // fallback standard shipping
  };

  const shippingCost = getShippingCost();
  const discount = couponApplied ? couponApplied.discountAmount : 0;
  const grandTotal = Math.max(0, totalPrice - discount) + shippingCost;

  const fmt = (n) => Number(n).toLocaleString('ar-DZ') + ' د.ج';

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'الاسم مطلوب';
    if (!form.phone.match(/^0[5-7][0-9]{8}$/)) errs.phone = 'يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0550000000)';
    if (!form.wilaya) errs.wilaya = 'اختر الولاية لتحديد كلفة الشحن';
    if (!form.address.trim()) errs.address = 'العنوان أو البلدية مطلوبة';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setValidatingCoupon(true);
      setCouponError('');
      const res = await api.validateCoupon(couponCode, totalPrice);
      if (res.valid) {
        setCouponApplied(res);
        setCouponError('');
      } else {
        setCouponError(res.message || 'كود الخصم غير صحيح');
        setCouponApplied(null);
      }
    } catch (err) {
      setCouponError('تعذر التحقق من الكود حالياً');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setLoading(true);
      const orderPayload = {
        customerName: form.fullName.trim(),
        customerPhone: form.phone.trim(),
        customerWilaya: form.wilaya,
        customerCommune: form.address.trim(),
        items: items.map(it => ({
          id: it.id,
          name: it.name,
          price: it.price,
          qty: it.qty,
          image: it.image
        })),
        subtotal: totalPrice,
        shippingCost,
        discount,
        total: grandTotal,
        paymentMethod: form.payment,
        notes: form.notes.trim()
      };

      const result = await api.createOrder(orderPayload);
      setConfirmedOrderId(result.orderId);
      setStep(2);
      clearCart();
    } catch (err) {
      alert('حدث خطأ أثناء حفظ الطلب: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== 2) {
    return (
      <div className="checkout-page page-enter">
        <div className="container checkout-empty">
          <div className="empty-cart-icon">
            <i className="fa-solid fa-basket-shopping"></i>
          </div>
          <h2>سلتك فارغة حالياً</h2>
          <p>أضف بعض المنتجات إلى سلتك قبل متابعة إتمام الطلب</p>
          <Link to="/shop" className="btn-primary">
            <i className="fa-solid fa-bag-shopping" style={{ marginLeft: '0.4rem' }}></i>
            تصفح المتجر الآن
          </Link>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="checkout-page page-enter">
        <div className="container checkout-success">
          <div className="success-icon">
            <i className="fa-solid fa-check"></i>
          </div>
          <h2>تم تأكيد طلبك بنجاح!</h2>
          <p className="order-number-tag">
            رقم الطلب الخاص بك: <strong>#{confirmedOrderId || 'BS-2026'}</strong>
          </p>
          <p className="success-note">
            شكراً لثقتك بنا سيد/ة {form.fullName}! سنتصل بك قريباً عبر الهاتف <strong>{form.phone}</strong> لتأكيد التفاصيل وموعد الاستلام.
          </p>

          <div className="success-details">
            <div className="success-detail-row">
              <span>الإجمالي المستحق للدفع:</span>
              <strong>{fmt(grandTotal)}</strong>
            </div>
            <div className="success-detail-row">
              <span>الولاية والعنوان:</span>
              <strong>{form.wilaya} - {form.address}</strong>
            </div>
            <div className="success-detail-row">
              <span>طريقة الدفع:</span>
              <strong>
                {form.payment === 'cod' ? 'الدفع عند الاستلام نقداً' : form.payment === 'ccp' ? 'تحويل حساب بريدي CCP' : 'تطبيق BaridiMob'}
              </strong>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/shop" className="btn-primary" id="success-continue-shopping">
              <i className="fa-solid fa-bag-shopping" style={{ marginLeft: '0.4rem' }}></i>
              متابعة التسوق
            </Link>
            <Link to="/" className="btn-outline" id="success-go-home">
              <i className="fa-solid fa-house" style={{ marginLeft: '0.4rem' }}></i>
              الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page page-enter">
      <div className="container">
        <div className="checkout-header">
          <h1 className="checkout-title">
            <i className="fa-solid fa-shield-halved" style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}></i>
            إتمام الطلب
          </h1>
          <p className="checkout-subtitle">يرجى ملء المعلومات أدناه لتأكيد طلبك وتوصيله إليك</p>
        </div>

        <div className="checkout-layout">
          {/* Order Summary Sidebar */}
          <aside className="checkout-summary-wrap">
            <div className="order-summary-card">
              <h2 className="summary-title">
                <i className="fa-solid fa-receipt" style={{ marginLeft: '0.4rem', color: 'var(--gray-500)' }}></i>
                ملخص الطلب ({items.length} منتجات)
              </h2>

              <div className="summary-items-list">
                {items.map(item => (
                  <div key={item.id} className="summary-item">
                    <img src={item.image} alt={item.name} className="summary-item-img" />
                    <div className="summary-item-info">
                      <h4 className="summary-item-name">{item.name}</h4>
                      <p className="summary-item-qty">الكمية: {item.qty} × {fmt(item.price)}</p>
                    </div>
                    <span className="summary-item-total">{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon input */}
              <div className="coupon-box">
                <label className="coupon-label">كوبون الخصم:</label>
                <div className="coupon-input-wrap">
                  <input
                    type="text"
                    placeholder="أدخل كود الخصم (مثال: BOURAGBA10)"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    className="form-input coupon-input"
                    id="coupon-code-input"
                  />
                  <button
                    type="button"
                    onClick={handleCoupon}
                    className="btn-coupon"
                    disabled={validatingCoupon || !couponCode.trim()}
                    id="apply-coupon-btn"
                  >
                    {validatingCoupon ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'تطبيق'}
                  </button>
                </div>
                {couponApplied && (
                  <p className="coupon-success">
                    <i className="fa-solid fa-circle-check"></i> {couponApplied.message} (-{fmt(discount)})
                  </p>
                )}
                {couponError && (
                  <p className="coupon-error">
                    <i className="fa-solid fa-circle-xmark"></i> {couponError}
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="summary-totals">
                <div className="total-row">
                  <span>المجموع الفرعي:</span>
                  <span>{fmt(totalPrice)}</span>
                </div>
                {discount > 0 && (
                  <div className="total-row discount-row">
                    <span>الخصم:</span>
                    <span>-{fmt(discount)}</span>
                  </div>
                )}
                <div className="total-row">
                  <span>تكلفة الشحن:</span>
                  <span>{form.wilaya ? fmt(shippingCost) : 'حدد الولاية أولاً'}</span>
                </div>
                <div className="total-row grand-total-row">
                  <span>الإجمالي الكلي:</span>
                  <span className="grand-price">{fmt(grandTotal)}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Form */}
          <main className="checkout-form-wrap">
            <form onSubmit={handleSubmit} noValidate>
              {/* Step 1: Client Information */}
              <div className="form-section-card">
                <h3 className="form-section-title">
                  <span className="form-step-num">1</span>
                  معلومات التوصيل والمستلم
                </h3>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label" htmlFor="fullName">الاسم واللقب الكامل *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                      placeholder="مثال: محمد بن علي"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                    />
                    {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label" htmlFor="phone">رقم الهاتف للتأكيد والتوصيل *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={`form-input ${errors.phone ? 'input-error' : ''}`}
                      placeholder="مثال: 0550000000"
                      value={form.phone}
                      onChange={handleChange}
                      dir="ltr"
                      style={{ textAlign: 'right' }}
                      required
                    />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="wilaya">الولاية *</label>
                    <select
                      id="wilaya"
                      name="wilaya"
                      className={`form-select ${errors.wilaya ? 'input-error' : ''}`}
                      value={form.wilaya}
                      onChange={handleChange}
                      required
                    >
                      <option value="">اختر ولايتك (58 ولاية)</option>
                      {WILAYAS_LIST.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                    {errors.wilaya && <span className="field-error">{errors.wilaya}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="address">البلدية والعنوان *</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className={`form-input ${errors.address ? 'input-error' : ''}`}
                      placeholder="البلدية أو الحي"
                      value={form.address}
                      onChange={handleChange}
                      required
                    />
                    {errors.address && <span className="field-error">{errors.address}</span>}
                  </div>

                  {form.wilaya && (
                    <div className="form-group full-width">
                      <label className="form-label">مكان الاستلام المفضل:</label>
                      <div className="delivery-type-options">
                        <label className={`delivery-type-box ${form.deliveryType === 'home' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="deliveryType"
                            value="home"
                            checked={form.deliveryType === 'home'}
                            onChange={handleChange}
                          />
                          <i className="fa-solid fa-house"></i>
                          <span>توصيل للمنزل</span>
                        </label>
                        <label className={`delivery-type-box ${form.deliveryType === 'desk' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="deliveryType"
                            value="desk"
                            checked={form.deliveryType === 'desk'}
                            onChange={handleChange}
                          />
                          <i className="fa-solid fa-building"></i>
                          <span>استلام من المكتب (Stop Desk)</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Payment */}
              <div className="form-section-card">
                <h3 className="form-section-title">
                  <span className="form-step-num">2</span>
                  طريقة الدفع
                </h3>

                <div className="payment-options" role="radiogroup" aria-label="طريقة الدفع">
                  {[
                    { value: 'cod', label: 'الدفع عند الاستلام', iconClass: 'fa-solid fa-money-bill-wave', desc: 'ادفع نقداً لعامل التوصيل بعد معاينة وفحص طلبك' },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`payment-option ${form.payment === opt.value ? 'selected' : ''}`}
                      id={`payment-${opt.value}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.value}
                        checked={form.payment === opt.value}
                        onChange={handleChange}
                        aria-label={opt.label}
                      />
                      <span className="payment-icon">
                        <i className={opt.iconClass}></i>
                      </span>
                      <span className="payment-label-text">
                        <span>{opt.label}</span>
                        <small>{opt.desc}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 3: Notes */}
              <div className="form-section-card">
                <h3 className="form-section-title">
                  <span className="form-step-num">3</span>
                  ملاحظات إضافية (اختياري)
                </h3>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-input textarea-input"
                  placeholder="أي ملاحظات خاصة بوقت التوصيل أو العنوان..."
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`btn-primary submit-order-btn ${loading ? 'loading' : ''}`}
                disabled={loading}
                id="submit-order-btn"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    جاري تأكيد الطلب وحفظه...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    تأكيد الطلب الآن ({fmt(grandTotal)})
                  </>
                )}
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
