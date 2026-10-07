import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import './Navbar.css';

const Navbar = () => {
  const { totalItems, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner container">
          {/* Left: Cart + Phone */}
          <div className="navbar-left">
            <button
              id="cart-toggle-btn"
              className="cart-btn"
              onClick={toggleCart}
              aria-label="فتح السلة"
            >
              <i className="fa-solid fa-bag-shopping"></i>
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </button>
            <a href="tel:0550039581" className="phone-link">
              <i className="fa-solid fa-phone"></i>
              <span>0550039581</span>
            </a>
          </div>
          {/* Right: Nav Links + Search */}
          <div className="navbar-right">
            <nav className="nav-links" aria-label="القائمة الرئيسية">
              <Link to="/shop" className={`nav-link ${location.pathname === '/' || location.pathname === '/shop' ? 'active' : ''}`} id="nav-shop">
                <i className="fa-solid fa-store"></i>
                المتجر
              </Link>
              <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`} id="nav-contact">
                <i className="fa-solid fa-headset"></i>
                تواصل معنا
              </Link>
          
            </nav>

            <form className="search-form" onSubmit={handleSearch} role="search">
              <input
                ref={searchRef}
                type="search"
                placeholder="ابحث عن هاتف أو منتج..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="بحث عن منتجات"
                id="navbar-search"
              />
              <button type="submit" className="search-btn" aria-label="بحث">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </form>
          </div>

          {/* Mobile menu button */}
          <button
            className={`mobile-menu-btn ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="فتح القائمة"
            id="mobile-menu-btn"
          >
            <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
          <form className="mobile-search-form" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="بحث عن منتجات..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input"
            />
            <button type="submit" className="btn-primary">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>
          <nav>
            <Link to="/shop" className="mobile-nav-link" id="mobile-nav-shop">
              <i className="fa-solid fa-store" style={{ marginLeft: '0.5rem' }}></i>
              المتجر
            </Link>
            <Link to="/contact" className="mobile-nav-link" id="mobile-nav-contact">
              <i className="fa-solid fa-headset" style={{ marginLeft: '0.5rem' }}></i>
              تواصل معنا
            </Link>
        
          </nav>
          <a href="tel:0550039581" className="mobile-phone">
            <i className="fa-solid fa-phone" style={{ marginLeft: '0.5rem' }}></i>
            0550039581
          </a>
        </div>
      </header>

      <CartDrawer />
    </>
  );
};

export default Navbar;
