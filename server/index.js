import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDB } from './db.js';
import { uploadMiddleware, uploadImageBuffer, getCloudinaryConfig } from './cloudinary.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB schema & tables
initDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local static uploaded files if any
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// -------------------------------------------------------------
// HELPER: Format Product Row from SQLite
// -------------------------------------------------------------
function formatProduct(row) {
  if (!row) return null;
  let parsedImages = [];
  let parsedSpecs = {};
  try {
    parsedImages = typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []);
  } catch (e) {
    parsedImages = [];
  }
  try {
    parsedSpecs = typeof row.specs === 'string' ? JSON.parse(row.specs) : (row.specs || {});
  } catch (e) {
    parsedSpecs = {};
  }

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand || '',
    price: Number(row.price),
    oldPrice: row.old_price ? Number(row.old_price) : null,
    stock: Number(row.stock),
    image: row.image,
    images: parsedImages.length > 0 ? parsedImages : [row.image],
    description: row.description || '',
    specs: parsedSpecs,
    rating: Number(row.rating || 5.0),
    reviews: Number(row.reviews || 0),
    isNew: Boolean(row.is_new),
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at
  };
}

// -------------------------------------------------------------
// PRODUCTS API
// -------------------------------------------------------------
app.get('/api/products', (req, res) => {
  try {
    const { category, brand, search, sortBy, minPrice, maxPrice } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'الكل') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (brand && brand !== 'الكل') {
      query += ' AND brand = ?';
      params.push(brand);
    }

    if (search) {
      query += ' AND (name LIKE ? OR brand LIKE ? OR category LIKE ? OR description LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (minPrice !== undefined && minPrice !== '') {
      query += ' AND price >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      query += ' AND price <= ?';
      params.push(Number(maxPrice));
    }

    switch (sortBy) {
      case 'price-asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY price DESC';
        break;
      case 'newest':
        query += ' ORDER BY is_new DESC, id DESC';
        break;
      case 'rating':
        query += ' ORDER BY rating DESC';
        break;
      default:
        query += ' ORDER BY is_featured DESC, id DESC';
    }

    const rows = db.prepare(query).all(...params);
    res.json(rows.map(formatProduct));
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'تعذر جلب المنتجات' });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }
    res.json(formatProduct(row));
  } catch (error) {
    res.status(500).json({ error: 'تعذر جلب المنتج' });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      price,
      oldPrice,
      stock,
      image,
      images,
      description,
      specs,
      rating,
      isNew,
      isFeatured
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'اسم المنتج والسعر مطلوبان' });
    }

    const defaultImg = image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80';
    const imagesList = Array.isArray(images) && images.length > 0 ? images : [defaultImg];

    const stmt = db.prepare(`
      INSERT INTO products (
        name, category, brand, price, old_price, stock, image, images, description, specs, rating, reviews, is_new, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      category || 'هواتف ذكية',
      brand || '',
      Number(price),
      oldPrice ? Number(oldPrice) : null,
      Number(stock) || 0,
      defaultImg,
      JSON.stringify(imagesList),
      description || '',
      JSON.stringify(specs || {}),
      Number(rating) || 5.0,
      0,
      isNew ? 1 : 0,
      isFeatured ? 1 : 0
    );

    const inserted = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(formatProduct(inserted));
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'تعذر إنشاء المنتج' });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }

    const {
      name,
      category,
      brand,
      price,
      oldPrice,
      stock,
      image,
      images,
      description,
      specs,
      rating,
      isNew,
      isFeatured
    } = req.body;

    const mainImage = image || existing.image;
    let imagesList = existing.images;
    if (images) {
      imagesList = JSON.stringify(Array.isArray(images) ? images : [mainImage]);
    } else if (image && image !== existing.image) {
      imagesList = JSON.stringify([image]);
    }

    const stmt = db.prepare(`
      UPDATE products SET
        name = ?,
        category = ?,
        brand = ?,
        price = ?,
        old_price = ?,
        stock = ?,
        image = ?,
        images = ?,
        description = ?,
        specs = ?,
        rating = ?,
        is_new = ?,
        is_featured = ?
      WHERE id = ?
    `);

    stmt.run(
      name !== undefined ? name.trim() : existing.name,
      category !== undefined ? category : existing.category,
      brand !== undefined ? brand : existing.brand,
      price !== undefined ? Number(price) : existing.price,
      oldPrice !== undefined ? (oldPrice ? Number(oldPrice) : null) : existing.old_price,
      stock !== undefined ? Number(stock) : existing.stock,
      mainImage,
      imagesList,
      description !== undefined ? description : existing.description,
      specs !== undefined ? JSON.stringify(specs) : existing.specs,
      rating !== undefined ? Number(rating) : existing.rating,
      isNew !== undefined ? (isNew ? 1 : 0) : existing.is_new,
      isFeatured !== undefined ? (isFeatured ? 1 : 0) : existing.is_featured,
      id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(formatProduct(updated));
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'تعذر تحديث المنتج' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const info = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'تعذر حذف المنتج' });
  }
});

// -------------------------------------------------------------
// CATEGORIES API
// -------------------------------------------------------------
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT c.id, c.name, c.icon, COUNT(p.id) as count
      FROM categories c
      LEFT JOIN products p ON p.category = c.name
      GROUP BY c.id
      ORDER BY c.id ASC
    `).all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'تعذر جلب الفئات' });
  }
});

app.post('/api/categories', (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'اسم الفئة مطلوب' });
    }
    const stmt = db.prepare('INSERT INTO categories (name, icon) VALUES (?, ?)');
    const result = stmt.run(name.trim(), icon || 'fa-box');
    const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'هذه الفئة موجودة بالفعل' });
    }
    res.status(500).json({ error: 'تعذر إضافة الفئة' });
  }
});

app.delete('/api/categories/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'الفئة غير موجودة' });
    res.json({ success: true, message: 'تم حذف الفئة بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'تعذر حذف الفئة' });
  }
});

// -------------------------------------------------------------
// ORDERS API
// -------------------------------------------------------------
app.get('/api/orders', (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
    const formatted = orders.map(o => {
      let items = [];
      try {
        items = JSON.parse(o.items);
      } catch (e) {
        items = [];
      }
      return {
        id: o.id,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        customerWilaya: o.customer_wilaya,
        customerCommune: o.customer_commune,
        items,
        subtotal: o.subtotal,
        shippingCost: o.shipping_cost,
        discount: o.discount,
        total: o.total,
        paymentMethod: o.payment_method,
        status: o.status,
        notes: o.notes,
        createdAt: o.created_at
      };
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'تعذر جلب الطلبات' });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerWilaya,
      customerCommune,
      items,
      subtotal,
      shippingCost,
      discount,
      total,
      paymentMethod,
      notes
    } = req.body;

    if (!customerName || !customerPhone || !customerWilaya || !items || !items.length) {
      return res.status(400).json({ error: 'يرجى تقديم كافة المعلومات المطلوبة للطلب' });
    }

    const stmt = db.prepare(`
      INSERT INTO orders (
        customer_name, customer_phone, customer_wilaya, customer_commune,
        items, subtotal, shipping_cost, discount, total, payment_method, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      customerName,
      customerPhone,
      customerWilaya,
      customerCommune || '',
      JSON.stringify(items),
      Number(subtotal),
      Number(shippingCost),
      Number(discount || 0),
      Number(total),
      paymentMethod || 'cod',
      notes || ''
    );

    // Update stock for purchased products
    const updateStock = db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?');
    for (const item of items) {
      if (item.id && item.qty) {
        updateStock.run(item.qty, item.id);
      }
    }

    res.status(201).json({
      success: true,
      orderId: result.lastInsertRowid,
      message: 'تم تأكيد طلبك بنجاح'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'تعذر إنشاء الطلب' });
  }
});

app.put('/api/orders/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
    const info = stmt.run(status, req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'الطلب غير موجود' });
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: 'تعذر تحديث حالة الطلب' });
  }
});

app.delete('/api/orders/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'الطلب غير موجود' });
    res.json({ success: true, message: 'تم حذف الطلب' });
  } catch (error) {
    res.status(500).json({ error: 'تعذر حذف الطلب' });
  }
});

// -------------------------------------------------------------
// COUPONS API
// -------------------------------------------------------------
app.get('/api/coupons', (req, res) => {
  try {
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY id DESC').all();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'تعذر جلب الكوبونات' });
  }
});

app.post('/api/coupons', (req, res) => {
  try {
    const { code, discountPercent, maxDiscount } = req.body;
    if (!code || !discountPercent) return res.status(400).json({ error: 'رمز الكوبون ونسبة الخصم مطلوبة' });

    const stmt = db.prepare('INSERT INTO coupons (code, discount_percent, max_discount) VALUES (?, ?, ?)');
    const result = stmt.run(code.toUpperCase().trim(), Number(discountPercent), Number(maxDiscount || 0));
    const created = db.prepare('SELECT * FROM coupons WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'هذا الكود مستخدم بالفعل' });
    }
    res.status(500).json({ error: 'تعذر إنشاء الكوبون' });
  }
});

app.delete('/api/coupons/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'الكوبون غير موجود' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'تعذر حذف الكوبون' });
  }
});

app.post('/api/coupons/validate', (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ valid: false, message: 'يرجى إدخال رمز الكوبون' });

    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(code.toUpperCase().trim());
    if (!coupon) {
      return res.status(400).json({ valid: false, message: 'رمز الكوبون غير صالح أو منتهي الصلاحية' });
    }

    let discount = (Number(subtotal || 0) * coupon.discount_percent) / 100;
    if (coupon.max_discount > 0 && discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discount_percent,
      discountAmount: Math.round(discount),
      message: `تم تطبيق خصم ${coupon.discount_percent}%`
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: 'خطأ في فحص الكوبون' });
  }
});

// -------------------------------------------------------------
// SHIPPING RATES API
// -------------------------------------------------------------
app.get('/api/shipping', (req, res) => {
  try {
    const rates = db.prepare('SELECT * FROM shipping_rates ORDER BY wilaya_code ASC').all();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: 'تعذر جلب أسعار الشحن' });
  }
});

app.put('/api/shipping', (req, res) => {
  try {
    const { rates } = req.body;
    if (!Array.isArray(rates)) return res.status(400).json({ error: 'بيانات غير صالحة' });

    const update = db.prepare(`
      UPDATE shipping_rates SET desk_price = ?, home_price = ?, active = ? WHERE wilaya_code = ?
    `);

    const updateMany = db.transaction((rows) => {
      for (const r of rows) {
        update.run(Number(r.desk_price), Number(r.home_price), r.active ? 1 : 0, r.wilaya_code);
      }
    });

    updateMany(rates);
    res.json({ success: true, message: 'تم تحديث أسعار الشحن' });
  } catch (error) {
    res.status(500).json({ error: 'تعذر تحديث أسعار الشحن' });
  }
});

// -------------------------------------------------------------
// ADMIN AUTH API
// -------------------------------------------------------------
app.post('/api/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password');
    const correctPassword = row ? row.value : 'ADMIN123';
    if (password && password.trim() === correctPassword.trim()) {
      return res.json({ success: true, message: 'تم الدخول بنجاح' });
    }
    return res.status(401).json({ error: 'كلمة السر غير صحيحة، يرجى المحاولة مجدداً' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

// -------------------------------------------------------------
// SETTINGS API
// -------------------------------------------------------------
app.get('/api/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
    const cloudStatus = getCloudinaryConfig();
    res.json({ ...settings, cloudinaryConfigured: cloudStatus.isConfigured });
  } catch (error) {
    res.status(500).json({ error: 'تعذر جلب الإعدادات' });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const newSettings = req.body;
    const upsert = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    const apply = db.transaction((entries) => {
      for (const [k, v] of Object.entries(entries)) {
        upsert.run(k, String(v));
      }
    });

    apply(newSettings);
    res.json({ success: true, message: 'تم حفظ الإعدادات بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'تعذر حفظ الإعدادات' });
  }
});

// -------------------------------------------------------------
// CLOUDINARY UPLOAD API
// -------------------------------------------------------------
app.post('/api/upload', uploadMiddleware.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'يرجى اختيار صورة للرفع' });
    }

    const uploadResult = await uploadImageBuffer(req.file.buffer, req.file.originalname);
    res.json({
      success: true,
      url: uploadResult.url,
      publicId: uploadResult.public_id,
      source: uploadResult.source,
      notice: uploadResult.notice || null
    });
  } catch (error) {
    console.error('Image upload failed:', error);
    res.status(500).json({ error: 'فشل رفع الصورة إلى Cloudinary. يرجى التحقق من الاتصال وإعدادات الحساب.' });
  }
});

// -------------------------------------------------------------
// OVERVIEW STATS API
// -------------------------------------------------------------
app.get('/api/stats', (req, res) => {
  try {
    const ordersCount = db.prepare('SELECT count(*) as count FROM orders').get().count;
    const revenue = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status != 'cancelled'").get().total;
    const productsCount = db.prepare('SELECT count(*) as count FROM products').get().count;
    const outOfStock = db.prepare('SELECT count(*) as count FROM products WHERE stock = 0').get().count;
    const recentOrders = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 5').all().map(o => ({
      id: o.id,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      total: o.total,
      status: o.status,
      createdAt: o.created_at
    }));

    res.json({
      ordersCount,
      revenue,
      productsCount,
      outOfStock,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: 'تعذر جلب الإحصائيات' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`[Bouragba Store API] Server running on http://localhost:${PORT}`);
  console.log(`[Bouragba Store SQLite] Database connected successfully`);
  const { isConfigured } = getCloudinaryConfig();
  console.log(`[Cloudinary Integration] Status: ${isConfigured ? 'Connected' : 'Ready (configure in settings)'}`);
});
