import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

// Scroll to top helper on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Main App Layout that conditionally shows Navbar & Footer
const AppLayout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Shop />} />
        </Routes>
      </main>

      {!isAdmin && <Footer />}
    </div>
  );
};

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
