import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import './Shop.css';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState(['الكل']);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedBrand, setSelectedBrand] = useState('الكل');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 300000]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Fetch products & categories from SQLite backend
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prods, cats] = await Promise.all([
          api.getProducts(),
          api.getCategories().catch(() => [])
        ]);

        if (isMounted) {
          setProductsList(prods || []);
          const catNames = ['الكل', ...(cats || []).map(c => c.name)];
          setCategoriesList(catNames);
        }
      } catch (err) {
        console.error('Failed to load shop data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  // Sync URL params
  useEffect(() => {
    const cat = searchParams.get('category');
    const search = searchParams.get('search');
    if (cat) setSelectedCategory(cat);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  // Extract distinct brands from products
  const brandsList = useMemo(() => {
    const set = new Set();
    productsList.forEach(p => {
      if (p.brand && p.brand.trim()) set.add(p.brand.trim());
    });
    return ['الكل', ...Array.from(set)];
  }, [productsList]);

  // Client-side filtering & sorting for instant reactivity
  const filtered = useMemo(() => {
    let list = [...productsList];
    if (selectedCategory !== 'الكل') {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (selectedBrand !== 'الكل') {
      list = list.filter(p => p.brand === selectedBrand);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.includes(searchQuery))
      );
    }
    list = list.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-asc': list.sort((a,b) => a.price - b.price); break;
      case 'price-desc': list.sort((a,b) => b.price - a.price); break;
      case 'newest': list.sort((a,b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      case 'rating': list.sort((a,b) => (b.rating || 0) - (a.rating || 0)); break;
      default: list.sort((a,b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
    return list;
  }, [productsList, selectedCategory, selectedBrand, searchQuery, sortBy, priceRange]);

  const resetFilters = () => {
    setSelectedCategory('الكل');
    setSelectedBrand('الكل');
    setSortBy('featured');
    setPriceRange([0, 300000]);
    setSearchQuery('');
  };

  const fmt = (n) => Number(n).toLocaleString('ar-DZ') + ' د.ج';

  return (
    <div className="shop-page page-enter">
      <div className="container">
        {/* Minimalist Hero Section replacing slider */}
        <Hero />

        {/* Shop Controls & Header */}
        <div className="shop-header" id="shop-grid">
          <div className="shop-header-right">
            <h2 className="section-title">
              <i className="fa-solid fa-layer-group" style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}></i>
              المنتجات المعروضة
            </h2>
           
          </div>

          <div className="shop-header-left">
            <button
              className={`filters-toggle-btn ${filtersOpen ? 'active' : ''}`}
              onClick={() => setFiltersOpen(!filtersOpen)}
              id="filters-toggle-btn"
              aria-expanded={filtersOpen}
            >
              <i className="fa-solid fa-sliders"></i>
              الفلاتر
            </button>
            <select
              className="sort-select form-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              id="sort-select"
              aria-label="ترتيب المنتجات"
            >
              <option value="featured">الأكثر توصية</option>
              <option value="newest">الأحدث وصولاً</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
              <option value="rating">أعلى تقييم</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="category-pills" role="tablist" aria-label="تصفية حسب الفئة">
          {categoriesList.map(cat => (
            <button
              key={cat}
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              role="tab"
              aria-selected={selectedCategory === cat}
              id={`cat-${cat}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filters Panel */}
        {filtersOpen && (
          <div className="filters-panel animate-fade-in">
            {brandsList.length > 1 && (
              <div className="filter-group">
                <h3 className="filter-label">العلامة التجارية:</h3>
                <div className="brand-pills">
                  {brandsList.map(brand => (
                    <button
                      key={brand}
                      className={`brand-pill ${selectedBrand === brand ? 'active' : ''}`}
                      onClick={() => setSelectedBrand(brand)}
                      id={`brand-${brand}`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="filter-group">
              <h3 className="filter-label">
                نطاق السعر: {fmt(priceRange[0])} — {fmt(priceRange[1])}
              </h3>
              <div className="price-range-inputs">
                <input
                  type="range"
                  min="0"
                  max="300000"
                  step="5000"
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], +e.target.value])}
                  className="price-range-slider"
                  aria-label="الحد الأقصى للسعر"
                />
              </div>
            </div>

            {(selectedCategory !== 'الكل' || selectedBrand !== 'الكل' || searchQuery) && (
              <button className="reset-filters-btn" onClick={resetFilters} id="reset-filters-btn">
                <i className="fa-solid fa-rotate-right" style={{ marginLeft: '0.4rem' }}></i>
                إعادة تعيين الفلاتر
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        <main id="products-grid" aria-label="قائمة المنتجات">
          {loading ? (
            <div className="loading-state">
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <p>جاري تحميل المنتجات من قاعدة البيانات...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">
                <i className="fa-solid fa-box-open"></i>
              </div>
              <h3>لا توجد منتجات حالياً</h3>
              <p>
                {searchQuery || selectedCategory !== 'الكل' || selectedBrand !== 'الكل'
                  ? 'لا توجد منتجات تطابق معايير البحث الحالية'
                  : 'لم تتم إضافة منتجات بعد. يمكن للمدير إضافة منتجات من لوحة التحكم.'}
              </p>
              {(selectedCategory !== 'الكل' || selectedBrand !== 'الكل' || searchQuery) ? (
                <button className="btn-primary" onClick={resetFilters}>
                  إعادة ضبط الفلاتر
                </button>
              ) : null}
            </div>
          ) : (
            <div className="products-grid">
              {filtered.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
