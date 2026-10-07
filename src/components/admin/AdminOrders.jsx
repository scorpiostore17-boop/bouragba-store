import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('الكل');
  const [search, setSearch] = useState('');

  const statuses = [
    { key: 'الكل', label: 'الكل' },
    { key: 'pending', label: 'قيد الانتظار' },
    { key: 'processing', label: 'قيد المعالجة والتجهيز' },
    { key: 'completed', label: 'مكتمل ومستلم' },
    { key: 'cancelled', label: 'ملغي' },
  ];

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'الكل' || o.status === filter;
    const s = search.toLowerCase();
    const matchSearch =
      (o.customerName || '').toLowerCase().includes(s) ||
      String(o.id).includes(s) ||
      (o.customerPhone || '').includes(s) ||
      (o.customerWilaya || '').includes(s);
    return matchStatus && matchSearch;
  });

  const updateStatus = async (id, status) => {
    try {
      await api.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      alert('فشل تحديث حالة الطلب: ' + err.message);
    }
  };

  const deleteOrder = async (id) => {
    if (window.confirm('هل تريد حذف هذا الطلب نهائياً من قاعدة البيانات؟')) {
      try {
        await api.deleteOrder(id);
        setOrders(prev => prev.filter(o => o.id !== id));
      } catch (err) {
        alert('فشل حذف الطلب: ' + err.message);
      }
    }
  };

  const fmt = (n) => Number(n).toLocaleString('ar-DZ') + ' د.ج';

  const getStatusBadge = (s) => {
    switch (s) {
      case 'completed':
        return <span className="status-badge status-completed"><i className="fa-solid fa-check"></i> مكتمل</span>;
      case 'processing':
        return <span className="status-badge status-shipping"><i className="fa-solid fa-truck-fast"></i> قيد التجهيز</span>;
      case 'cancelled':
        return <span className="status-badge status-cancelled"><i className="fa-solid fa-xmark"></i> ملغي</span>;
      default:
        return <span className="status-badge status-pending"><i className="fa-solid fa-clock"></i> قيد الانتظار</span>;
    }
  };

  return (
    <div className="admin-orders-view">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">
            <i className="fa-solid fa-truck-ramp-box" style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}></i>
            إدارة الطلبات والمبيعات
          </h2>
          <p className="admin-section-sub">طلبات العملاء المسجلة مباشرة في قاعدة بيانات SQLite</p>
        </div>
        <button className="btn-outline" onClick={loadOrders} title="تحديث القائمة">
          <i className="fa-solid fa-arrows-rotate"></i>
          تحديث الطلبات
        </button>
      </div>

      <div className="admin-controls-card">
        <div className="admin-search-wrap">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="search"
            className="admin-search-input"
            placeholder="بحث بالاسم، رقم الطلب، الهاتف أو الولاية..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="orders-search"
            aria-label="بحث في الطلبات"
          />
        </div>

        <div className="status-filter-pills">
          {statuses.map(s => (
            <button
              key={s.key}
              className={`cat-pill ${filter === s.key ? 'active' : ''}`}
              onClick={() => setFilter(s.key)}
              id={`order-filter-${s.key}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading">
            <i className="fa-solid fa-circle-notch fa-spin"></i>
            <p>جاري جلب الطلبات من SQLite...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty-table">
            <i className="fa-solid fa-receipt" style={{ fontSize: '2.5rem', color: 'var(--gray-300)' }}></i>
            <h3>لا توجد طلبات مطابقة</h3>
            <p>سيتم ظهور الطلبات الجديدة هنا بمجرد إتمام الزوار لعمليات الشراء من صفحة الدفع</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>اسم العميل</th>
                <th>الهاتف</th>
                <th>الولاية والعنوان</th>
                <th>المنتجات المطلوبة</th>
                <th>الإجمالي</th>
                <th>طريقة الدفع</th>
                <th>الحالة</th>
                <th>تغيير الحالة</th>
                <th>حذف</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}>
                  <td>
                    <strong style={{ color: 'var(--primary)' }}>#{order.id}</strong>
                  </td>
                  <td>
                    <strong>{order.customerName}</strong>
                  </td>
                  <td dir="ltr" style={{ textAlign: 'left', fontWeight: 'bold' }}>
                    <a href={`tel:${order.customerPhone}`} style={{ color: 'var(--primary)' }}>
                      {order.customerPhone}
                    </a>
                  </td>
                  <td>
                    <div>{order.customerWilaya}</div>
                    {order.customerCommune && (
                      <small style={{ color: 'var(--gray-500)' }}>{order.customerCommune}</small>
                    )}
                  </td>
                  <td>
                    <div className="order-items-mini-list">
                      {(order.items || []).map((it, idx) => (
                        <div key={idx} className="order-mini-item">
                          <span>{it.name}</span>
                          <span className="qty-tag">×{it.qty}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <strong className="price-tag">{fmt(order.total)}</strong>
                  </td>
                  <td>
                    <span className="payment-method-badge">
                      {order.paymentMethod === 'cod' ? 'عند الاستلام' : order.paymentMethod === 'ccp' ? 'CCP' : 'BaridiMob'}
                    </span>
                  </td>
                  <td>
                    {getStatusBadge(order.status)}
                  </td>
                  <td>
                    <select
                      className="form-select status-select"
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      aria-label={`تغيير حالة الطلب ${order.id}`}
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="processing">قيد المعالجة</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="action-btn delete"
                      onClick={() => deleteOrder(order.id)}
                      title="حذف الطلب"
                      aria-label="حذف الطلب"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
