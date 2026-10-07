import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

const CartDrawer = () => {
  const { items, isOpen, closeCart, removeItem, updateQty, totalPrice, clearCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const fmt = (n) => Number(n).toLocaleString('ar-DZ') + ' د.ج';

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={closeCart} aria-hidden="true" />
      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`} aria-label="سلة المشتريات" role="dialog">
        <div className="cart-drawer-header">
          <h2>
            <i className="fa-solid fa-bag-shopping" style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}></i>
            سلة المشتريات
          </h2>
          <div className="cart-header-actions">
            {items.length > 0 && (
              <button className="clear-cart-btn" onClick={clearCart}>
                <i className="fa-solid fa-trash-can" style={{ marginLeft: '0.3rem' }}></i>
                تفريغ
              </button>
            )}
            <button className="close-cart-btn" onClick={closeCart} aria-label="إغلاق السلة" id="close-cart-btn">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">
                <i className="fa-solid fa-basket-shopping"></i>
              </div>
              <p>سلتك فارغة</p>
              <span>لم تقم بإضافة أي منتج بعد</span>
              <button className="btn-primary" onClick={closeCart}>
                تصفح المنتجات
              </button>
            </div>
          ) : (
            <ul className="cart-items">
              {items.map((item) => (
                <li key={item.id} className="cart-item animate-fade-in">
                  <img src={item.image} alt={item.name} className="cart-item-img" loading="lazy" />
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <p className="cart-item-price">{fmt(item.price)}</p>
                    <div className="cart-item-qty">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="qty-btn"
                        aria-label="تقليل الكمية"
                      >
                        <i className="fa-solid fa-minus"></i>
                      </button>
                      <span className="qty-value">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="qty-btn"
                        aria-label="زيادة الكمية"
                      >
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <p className="cart-item-total">{fmt(item.price * item.qty)}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="remove-item-btn"
                      aria-label="حذف المنتج"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total-row">
              <span>المجموع الفرعي:</span>
              <span>{fmt(totalPrice)}</span>
            </div>
            <div className="cart-total-row">
              <span>الشحن:</span>
              <span className="text-orange">يُحسب عند إتمام الطلب</span>
            </div>
            <div className="cart-total-row total">
              <span>الإجمالي:</span>
              <strong>{fmt(totalPrice)}</strong>
            </div>
            <Link to="/checkout" className="btn-primary checkout-cart-btn" onClick={closeCart} id="cart-checkout-btn">
              <span>متابعة إتمام الطلب</span>
              <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <button className="continue-shopping-btn" onClick={closeCart}>
              متابعة التسوق
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
