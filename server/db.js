import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'bouragba_store.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for high performance and concurrency
db.pragma('journal_mode = WAL');

// Initialize Database Schema
export function initDB() {
  db.exec(`
    -- Products Table
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      brand TEXT DEFAULT '',
      price REAL NOT NULL,
      old_price REAL DEFAULT NULL,
      stock INTEGER DEFAULT 0,
      image TEXT NOT NULL,
      images TEXT DEFAULT '[]',
      description TEXT DEFAULT '',
      specs TEXT DEFAULT '{}',
      rating REAL DEFAULT 5.0,
      reviews INTEGER DEFAULT 0,
      is_new INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Categories Table
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT DEFAULT 'fa-box'
    );

    -- Orders Table
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_wilaya TEXT NOT NULL,
      customer_commune TEXT DEFAULT '',
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping_cost REAL NOT NULL,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT DEFAULT 'cod',
      status TEXT DEFAULT 'pending',
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Coupons Table
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      discount_percent REAL NOT NULL,
      max_discount REAL DEFAULT 0,
      active INTEGER DEFAULT 1,
      used_count INTEGER DEFAULT 0
    );

    -- Shipping Rates for 58 Wilayas
    CREATE TABLE IF NOT EXISTS shipping_rates (
      wilaya_code TEXT PRIMARY KEY,
      wilaya_name TEXT NOT NULL,
      desk_price REAL DEFAULT 500,
      home_price REAL DEFAULT 800,
      active INTEGER DEFAULT 1
    );

    -- Settings Table (Store info, Cloudinary, etc.)
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Default Categories with Font Awesome icon classes (NO EMOJIS)
  const categoryCount = db.prepare('SELECT count(*) as count FROM categories').get().count;
  if (categoryCount === 0) {
    const insertCat = db.prepare('INSERT INTO categories (name, icon) VALUES (?, ?)');
    const initialCategories = [
      ['هواتف ذكية', 'fa-mobile-screen-button'],
      ['إكسسوارات', 'fa-headphones'],
      ['حواسيب وأجهزة', 'fa-laptop'],
      ['صوتيات وسماعات', 'fa-volume-high'],
      ['ساعات ذكية', 'fa-clock'],
      ['شواحن وكابلات', 'fa-bolt'],
    ];
    for (const [name, icon] of initialCategories) {
      insertCat.run(name, icon);
    }
  }

  // Default Coupons
  const couponCount = db.prepare('SELECT count(*) as count FROM coupons').get().count;
  if (couponCount === 0) {
    const insertCoupon = db.prepare('INSERT INTO coupons (code, discount_percent, max_discount, active) VALUES (?, ?, ?, ?)');
    insertCoupon.run('BOURAGBA10', 10, 5000, 1);
    insertCoupon.run('WELCOME', 5, 2000, 1);
  }

  // Default Settings
  const defaultSettings = [
    ['store_name', 'Bouragba Store | بوراقبة ستور'],
    ['store_phone', '0550039581'],
    ['store_whatsapp', '0550039581'],
    ['store_email', 'info@bouragbastore.dz'],
    ['store_address', 'الجزائر العاصمة، الجزائر'],
    ['store_desc', 'متجرك المعتمد لأحدث الهواتف الذكية الأصلية والإلكترونيات بضمان رسمي وتوصيل لجميع الولايات'],
    ['admin_password', 'ADMIN123'],
    ['contact_map_url', ''],
    ['contact_hours_main', 'السبت - الخميس: 09:00 - 20:00'],
    ['contact_hours_friday', 'الجمعة: 14:00 - 20:00'],
    ['contact_facebook', 'https://facebook.com'],
    ['contact_instagram', 'https://instagram.com'],
    ['contact_tiktok', ''],
    ['cloudinary_cloud_name', process.env.CLOUDINARY_CLOUD_NAME || ''],
    ['cloudinary_api_key', process.env.CLOUDINARY_API_KEY || ''],
    ['cloudinary_api_secret', process.env.CLOUDINARY_API_SECRET || ''],
    ['cloudinary_upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || ''],
  ];

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  for (const [key, val] of defaultSettings) {
    insertSetting.run(key, val);
  }

  // Seed 58 Wilayas if empty
  const wilayaCount = db.prepare('SELECT count(*) as count FROM shipping_rates').get().count;
  if (wilayaCount === 0) {
    const insertWilaya = db.prepare('INSERT INTO shipping_rates (wilaya_code, wilaya_name, desk_price, home_price) VALUES (?, ?, ?, ?)');
    const wilayas = [
      ['01', 'أدرار', 900, 1400],
      ['02', 'الشلف', 500, 800],
      ['03', 'الأغواط', 600, 900],
      ['04', 'أم البواقي', 500, 800],
      ['05', 'باتنة', 500, 800],
      ['06', 'بجاية', 500, 800],
      ['07', 'بسكرة', 600, 900],
      ['08', 'بشار', 800, 1200],
      ['09', 'البليدة', 400, 600],
      ['10', 'البويرة', 400, 600],
      ['11', 'تمنراست', 1000, 1600],
      ['12', 'تبسة', 600, 900],
      ['13', 'تلمسان', 500, 800],
      ['14', 'تيارت', 500, 800],
      ['15', 'تيزي وزو', 400, 600],
      ['16', 'الجزائر العاصمة', 300, 500],
      ['17', 'الجلفة', 600, 900],
      ['18', 'جيجل', 500, 800],
      ['19', 'سطيف', 500, 800],
      ['20', 'سعيدة', 600, 900],
      ['21', 'سكيكدة', 500, 800],
      ['22', 'سيدي بلعباس', 500, 800],
      ['23', 'عنابة', 500, 800],
      ['24', 'قالمة', 500, 800],
      ['25', 'قسنطينة', 500, 800],
      ['26', 'المدية', 400, 600],
      ['27', 'مستغانم', 500, 800],
      ['28', 'المسيلة', 500, 800],
      ['29', 'معسكر', 500, 800],
      ['30', 'ورقلة', 700, 1100],
      ['31', 'وهران', 500, 800],
      ['32', 'البيض', 700, 1100],
      ['33', 'إليزي', 1000, 1600],
      ['34', 'برج بوعريريج', 400, 700],
      ['35', 'بومرداس', 400, 600],
      ['36', 'الطارف', 600, 900],
      ['37', 'تندوف', 1000, 1600],
      ['38', 'تيسمسيلت', 500, 800],
      ['39', 'الوادي', 700, 1100],
      ['40', 'خنشلة', 600, 900],
      ['41', 'سوق أهراس', 600, 900],
      ['42', 'تيبازة', 400, 600],
      ['43', 'ميلة', 500, 800],
      ['44', 'عين الدفلى', 400, 700],
      ['45', 'النعامة', 700, 1100],
      ['46', 'عين تموشنت', 500, 800],
      ['47', 'غرداية', 700, 1100],
      ['48', 'غليزان', 500, 800],
      ['49', 'تيميمون', 900, 1400],
      ['50', 'برج باجي مختار', 1100, 1700],
      ['51', 'أولاد جلال', 700, 1100],
      ['52', 'بني عباس', 900, 1400],
      ['53', 'إن صالح', 1000, 1600],
      ['54', 'إن قزام', 1100, 1700],
      ['55', 'تقرت', 700, 1100],
      ['56', 'جانت', 1100, 1700],
      ['57', 'المغير', 700, 1100],
      ['58', 'المنيعة', 800, 1200]
    ];
    for (const [code, name, desk, home] of wilayas) {
      insertWilaya.run(code, name, desk, home);
    }
  }

  // Authentic Seed Products: Note that all dummy mock data is removed.
  // We provide a clean baseline of authentic real products so the store is instantly functional
  // while allowing full management (add/edit/delete) from the admin panel.
  const prodCount = db.prepare('SELECT count(*) as count FROM products').get().count;
  if (prodCount === 0) {
    const insertProd = db.prepare(`
      INSERT INTO products (name, category, brand, price, old_price, stock, image, images, description, specs, rating, reviews, is_new, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialProducts = [
      [
        'iPhone 15 Pro Max',
        'هواتف ذكية',
        'Apple',
        185000,
        210000,
        12,
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',
        JSON.stringify([
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
          'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&q=80'
        ]),
        'هاتف iPhone 15 Pro Max الأصلي بشريحة A17 Pro وهيكل التيتانيوم المتين، كاميرا احترافية 48 ميغابكسل مع تقريب بصري 5x.',
        JSON.stringify({
          'الشاشة': '6.7 بوصة Super Retina XDR OLED',
          'المعالج': 'Apple A17 Pro Bionic',
          'الذاكرة العشوائية': '8GB RAM',
          'سعة التخزين': '256GB',
          'الكاميرا': '48MP + 12MP + 12MP',
          'البطارية': '4422 mAh',
          'الضمان': 'سنة كاملة ضمان رسمي'
        }),
        4.9,
        14,
        1,
        1
      ],
      [
        'Samsung Galaxy S24 Ultra',
        'هواتف ذكية',
        'Samsung',
        168000,
        195000,
        8,
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80',
        JSON.stringify([
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80'
        ]),
        'سامسونج جالكسي S24 Ultra مع قلم S-Pen الذكي، كاميرا بدقة 200 ميجابكسل، وشاشة Dynamic AMOLED 2X مسطحة تدعم الذكاء الاصطناعي Galaxy AI.',
        JSON.stringify({
          'الشاشة': '6.8 بوصة Dynamic AMOLED 2X 120Hz',
          'المعالج': 'Snapdragon 8 Gen 3',
          'الذاكرة العشوائية': '12GB RAM',
          'سعة التخزين': '256GB / 512GB',
          'الكاميرا': '200MP + 50MP + 12MP + 10MP',
          'البطارية': '5000 mAh',
          'الضمان': 'ضمان رسمي 12 شهر'
        }),
        4.8,
        19,
        1,
        1
      ],
      [
        'AirPods Pro (الجيل الثاني)',
        'صوتيات وسماعات',
        'Apple',
        38000,
        45000,
        20,
        'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80',
        JSON.stringify([
          'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80'
        ]),
        'سماعات آبل اللاسلكية الأصلية مع ميزة عزل الضوضاء النشط المتطورة، شفافية الصوت التكيفية، وشريحة H2.',
        JSON.stringify({
          'عزل الضوضاء': 'نشط متطور Active Noise Cancellation',
          'عمر البطارية': 'حتى 30 ساعة مع العلبة',
          'منفذ الشحن': 'USB-C / MagSafe',
          'مقاومة الماء': 'معيار IP54'
        }),
        4.9,
        28,
        0,
        1
      ],
      [
        'شاحن Apple 20W USB-C الأصلي',
        'شواحن وكابلات',
        'Apple',
        4500,
        5500,
        35,
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80',
        JSON.stringify([
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80'
        ]),
        'محول طاقة USB-C أصلي بقوة 20 واط يوفر شحناً سريعاً وفعالاً لأجهزة آيفون وآيباد.',
        JSON.stringify({
          'القدرة': '20 واط شحن فائق السرعة',
          'المنفذ': 'USB-C',
          'الأمان': 'حماية من التيارات الزائدة والحرارة'
        }),
        4.7,
        42,
        0,
        1
      ]
    ];

    for (const prod of initialProducts) {
      insertProd.run(...prod);
    }
  }
}

export default db;
