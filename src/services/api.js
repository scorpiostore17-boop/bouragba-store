/**
 * Bouragba Store - Client API Service
 * Seamless communication with Express & SQLite Backend
 */

const API_BASE = '/api';

export const api = {
  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'الكل') query.append('category', params.category);
    if (params.brand && params.brand !== 'الكل') query.append('brand', params.brand);
    if (params.search) query.append('search', params.search);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.minPrice !== undefined) query.append('minPrice', params.minPrice);
    if (params.maxPrice !== undefined) query.append('maxPrice', params.maxPrice);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('فشل جلب المنتجات');
    return res.json();
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('فشل جلب تفاصيل المنتج');
    return res.json();
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل إضافة المنتج');
    }
    return res.json();
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل تحديث المنتج');
    }
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('فشل حذف المنتج');
    return res.json();
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('فشل جلب الفئات');
    return res.json();
  },

  async createCategory(categoryData) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل إنشاء الفئة');
    }
    return res.json();
  },

  async deleteCategory(id) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('فشل حذف الفئة');
    return res.json();
  },

  // Orders
  async getOrders() {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error('فشل جلب الطلبات');
    return res.json();
  },

  async createOrder(orderData) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل تأكيد الطلب');
    }
    return res.json();
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('فشل تحديث حالة الطلب');
    return res.json();
  },

  async deleteOrder(id) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('فشل حذف الطلب');
    return res.json();
  },

  // Coupons
  async getCoupons() {
    const res = await fetch(`${API_BASE}/coupons`);
    if (!res.ok) throw new Error('فشل جلب الكوبونات');
    return res.json();
  },

  async createCoupon(data) {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل إضافة الكوبون');
    }
    return res.json();
  },

  async deleteCoupon(id) {
    const res = await fetch(`${API_BASE}/coupons/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('فشل حذف الكوبون');
    return res.json();
  },

  async validateCoupon(code, subtotal) {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    return res.json();
  },

  // Shipping Rates
  async getShippingRates() {
    const res = await fetch(`${API_BASE}/shipping`);
    if (!res.ok) throw new Error('فشل جلب أسعار الشحن');
    return res.json();
  },

  async updateShippingRates(rates) {
    const res = await fetch(`${API_BASE}/shipping`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rates })
    });
    if (!res.ok) throw new Error('فشل تحديث أسعار الشحن');
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('فشل جلب الإعدادات');
    return res.json();
  },

  async updateSettings(settings) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('فشل حفظ الإعدادات');
    return res.json();
  },

  // Admin Auth
  async adminLogin(password) {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'كلمة السر غير صحيحة');
    }
    return res.json();
  },

  // Stats
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('فشل جلب الإحصائيات');
    return res.json();
  },

  // Cloudinary Image Upload
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل رفع الصورة إلى Cloudinary');
    }
    return res.json();
  }
};

export default api;
