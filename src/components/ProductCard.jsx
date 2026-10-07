import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();

  const fmt = (n) => Number(n).toLocaleString('ar-DZ') + ' د.ج';
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="product-card"
      id={`product-card-${product.id}`}
      aria-label={`عرض تفاصيل ${product.name}`}
    >
      <div className="product-img-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-img"
          loading="lazy"
        />
        {product.isNew && <span className="badge-new">جديد</span>}
        {discount > 0 && (
          <span className="badge-discount">-{discount}%</span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="badge-low-stock">آخر {product.stock} قطع</span>
        )}
      </div>
      <div className="product-info">
        <div className="product-brand-row">
          <span className="product-brand">{product.brand || product.category}</span>
          {product.stock > 0 ? (
            <span className="stock-status in-stock">
              <i className="fa-solid fa-circle-check"></i> متوفر
            </span>
          ) : (
            <span className="stock-status out-of-stock">
              <i className="fa-solid fa-circle-xmark"></i> نفد
            </span>
          )}
        </div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-bottom-row">
          <div className="product-price-row">
            <span className="product-price">{fmt(product.price)}</span>
            {product.oldPrice && (
              <span className="product-old-price">{fmt(product.oldPrice)}</span>
            )}
          </div>
          <button
            type="button"
            className="product-cart-btn-circle"
            onClick={handleAddToCart}
            aria-label={`أضف ${product.name} إلى السلة`}
            title="أضف إلى السلة"
            id={`add-cart-${product.id}`}
          >
            <i className="fa-solid fa-cart-plus"></i>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
