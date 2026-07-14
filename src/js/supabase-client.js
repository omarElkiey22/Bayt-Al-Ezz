import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const url = globalThis.SUPABASE_URL || localStorage.getItem('SUPABASE_URL') || 'https://nendbanobyqwkvbnrlvv.supabase.co';
const key = globalThis.SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbmRiYW5vYnlxd2t2Ym5ybHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NzA2NjksImV4cCI6MjA5OTU0NjY2OX0.b17KjR-CNyVo_hCKgmeGPqkLTWN405NVf8uY0PwTXdc';

// Define default mock data with valid UUID v4 IDs
const defaultSections = [
  { id: '11111111-1111-4111-a111-111111111111', name: 'الغسالة', slug: 'laundry', icon_name: 'washing-machine.svg', display_order: 0, is_active: true, deleted_at: null },
  { id: '22222222-2222-4222-a222-222222222222', name: 'رفايع المطبخ', slug: 'kitchen-shelving', icon_name: 'kitchen-shelf.svg', display_order: 1, is_active: true, deleted_at: null },
  { id: '33333333-3333-4333-a333-333333333333', name: 'ورقيات', slug: 'paper-goods', icon_name: 'foil-roll.svg', display_order: 2, is_active: true, deleted_at: null },
  { id: '44444444-4444-4444-a444-444444444444', name: 'بيت الراحة', slug: 'bathroom', icon_name: 'toilet.svg', display_order: 3, is_active: true, deleted_at: null },
  { id: '55555555-5555-4555-a555-555555555555', name: 'نص الدنيا', slug: 'women', icon_name: 'female-head.svg', display_order: 4, is_active: true, deleted_at: null },
  { id: '66666666-6666-4666-a666-666666666666', name: 'جنتلمان', slug: 'men', icon_name: 'razor.svg', display_order: 5, is_active: true, deleted_at: null },
  { id: '77777777-7777-4777-a777-777777777777', name: 'الريسبشن', slug: 'reception', icon_name: 'reception-bell.svg', display_order: 6, is_active: true, deleted_at: null },
  { id: '88888888-8888-4888-a888-888888888888', name: 'بيبي زون', slug: 'baby', icon_name: 'baby-bottle.svg', display_order: 7, is_active: true, deleted_at: null },
  { id: '99999999-9999-4999-a999-999999999999', name: 'الجزامة', slug: 'footwear', icon_name: 'shoe.svg', display_order: 8, is_active: true, deleted_at: null },
  { id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', name: 'التسريحة', slug: 'vanity', icon_name: 'vanity-brush.svg', display_order: 9, is_active: true, deleted_at: null },
  { id: 'bbbbbbbb-bbbb-4bbb-abbb-bbbbbbbbbbbb', name: 'الجراج', slug: 'garage', icon_name: 'garage-door.svg', display_order: 10, is_active: true, deleted_at: null },
  { id: 'cccccccc-cccc-4ccc-accc-cccccccccccc', name: 'منظفات', slug: 'cleaning', icon_name: 'spray-bottle.svg', display_order: 11, is_active: true, deleted_at: null }
];

const defaultProducts = [
  { id: 'd1111111-1111-4111-a111-111111111111', name: 'منظف ملابس لافندر', description: 'منظف ملابس سائل برائحة اللافندر المنعشة، سعة 3 لتر.', section_id: '11111111-1111-4111-a111-111111111111', primary_image_url: 'https://images.unsplash.com/photo-1610557892470-76d747eed2f3?w=500', base_price: 120, is_active: true, created_at: new Date().toISOString(), deleted_at: null },
  { id: 'd2222222-2222-4222-a222-222222222222', name: 'مسحوق غسيل أوتوماتيك', description: 'مسحوق غسيل عالي الجودة للغسالات الأوتوماتيك، عبوة 5 كيلو.', section_id: '11111111-1111-4111-a111-111111111111', primary_image_url: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=500', base_price: 240, is_active: true, created_at: new Date().toISOString(), deleted_at: null },
  { id: 'd3333333-3333-4333-a333-333333333333', name: 'طقم معالق خشبية', description: 'طقم مكون من 5 ملاعق خشبية مختلفة الأحجام للطبخ والتقديم.', section_id: '22222222-2222-4222-a222-222222222222', primary_image_url: 'https://images.unsplash.com/photo-1594756184511-df7de9d8d648?w=500', base_price: 85, is_active: true, created_at: new Date().toISOString(), deleted_at: null },
  { id: 'd4444444-4444-4444-a444-444444444444', name: 'قطاعة خضروات متعددة الوظائف', description: 'قطاعة خضروات يدوية مع 4 شفرات مختلفة ستانلس ستيل.', section_id: '22222222-2222-4222-a222-222222222222', primary_image_url: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=500', base_price: 150, is_active: true, created_at: new Date().toISOString(), deleted_at: null },
  { id: 'd5555555-5555-4555-a555-555555555555', name: 'مناديل مطبخ رول', description: 'طقم 4 رول مناديل مطبخ عالية الامتصاص ومتينة.', section_id: '33333333-3333-4333-a333-333333333333', primary_image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', base_price: 45, is_active: true, created_at: new Date().toISOString(), deleted_at: null },
  { id: 'd6666666-6666-4666-a666-666666666666', name: 'طقم موزع صابون سيراميك', description: 'طقم موزع صابون وحامل فرشاة أسنان بتصميم عصري من السيراميك.', section_id: '44444444-4444-4444-a444-444444444444', primary_image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=500', base_price: 195, is_active: true, created_at: new Date().toISOString(), deleted_at: null },
  { id: 'd7777777-7777-4777-a777-777777777777', name: 'فستان صيفي مشجر', description: 'فستان صيفي مريح وأنيق بخامات قطنية عالية الجودة.', section_id: '55555555-5555-4555-a555-555555555555', primary_image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', base_price: 450, is_active: true, created_at: new Date().toISOString(), deleted_at: null },
  { id: 'd8888888-8888-4888-a888-888888888888', name: 'قميص أكسفورد كلاسيك', description: 'قميص رجالي كلاسيك مناسب للعمل والمناسبات الرسمية.', section_id: '66666666-6666-4666-a666-666666666666', primary_image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', base_price: 380, is_active: true, created_at: new Date().toISOString(), deleted_at: null },
  { id: 'd9999999-9999-4999-a999-999999999999', name: 'حذاء كاجوال خفيف', description: 'حذاء رجالي مريح وخفيف الوزن للمشي اليومي.', section_id: '66666666-6666-4666-a666-666666666666', primary_image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500', base_price: 420, is_active: true, created_at: new Date().toISOString(), deleted_at: null }
];

const defaultVariants = [
  { id: 'e1111111-1111-4111-a111-111111111111', product_id: 'd8888888-8888-4888-a888-888888888888', label: 'أبيض - M', price_override: 380, image_url: null, is_in_stock: true, display_order: 0, created_at: new Date().toISOString(), deleted_at: null },
  { id: 'e2222222-2222-4222-a222-222222222222', product_id: 'd8888888-8888-4888-a888-888888888888', label: 'أزرق - L', price_override: 400, image_url: null, is_in_stock: true, display_order: 1, created_at: new Date().toISOString(), deleted_at: null },
  { id: 'e3333333-3333-4333-a333-333333333333', product_id: 'd8888888-8888-4888-a888-888888888888', label: 'رمادي - XL', price_override: 420, image_url: null, is_in_stock: false, display_order: 2, created_at: new Date().toISOString(), deleted_at: null },
  { id: 'e4444444-4444-4444-a444-444444444444', product_id: 'd9999999-9999-4999-a999-999999999999', label: 'أسود - 42', price_override: 420, image_url: null, is_in_stock: true, display_order: 0, created_at: new Date().toISOString(), deleted_at: null },
  { id: 'e5555555-5555-4555-a555-555555555555', product_id: 'd9999999-9999-4999-a999-999999999999', label: 'كحلي - 43', price_override: 420, image_url: null, is_in_stock: true, display_order: 1, created_at: new Date().toISOString(), deleted_at: null }
];

// Helper functions for localStorage DB management
function getStorageData(table) {
  const key = `sb_mock_${table}`;
  let data = localStorage.getItem(key);
  if (!data) {
    if (table === 'sections') {
      localStorage.setItem(key, JSON.stringify(defaultSections));
      return defaultSections;
    }
    if (table === 'products') {
      localStorage.setItem(key, JSON.stringify(defaultProducts));
      return defaultProducts;
    }
    if (table === 'product_variants') {
      localStorage.setItem(key, JSON.stringify(defaultVariants));
      return defaultVariants;
    }
    if (table === 'merchant_settings') {
      const defaultSettings = [{ id: '1', whatsapp_number: '201000000000', updated_at: new Date().toISOString() }];
      localStorage.setItem(key, JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    return [];
  }
  return JSON.parse(data);
}

function setStorageData(table, data) {
  localStorage.setItem(`sb_mock_${table}`, JSON.stringify(data));
}

class MockQueryBuilder {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.isSingle = false;
    this.isMaybeSingle = false;
    this.limitCount = null;
    this.orderConfig = null;
    this.selectColumns = '*';
    this.insertData = null;
    this.updateData = null;
  }

  select(columns) {
    this.selectColumns = columns || '*';
    return this;
  }

  is(column, value) {
    this.filters.push({ type: 'is', column, value });
    return this;
  }

  eq(column, value) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  in(column, values) {
    this.filters.push({ type: 'in', column, values });
    return this;
  }

  order(column, options) {
    this.orderConfig = { column, ...options };
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  insert(data) {
    this.insertData = data;
    return this;
  }

  update(data) {
    this.updateData = data;
    return this;
  }

  async execute() {
    let dbData = getStorageData(this.table);

    if (this.insertData) {
      const rowsToInsert = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
      const inserted = rowsToInsert.map(row => {
        const newRow = { 
          id: row.id || 'gen-' + Math.random().toString(36).substr(2, 9), 
          created_at: new Date().toISOString(),
          deleted_at: null,
          is_active: true,
          ...row 
        };
        dbData.push(newRow);
        return newRow;
      });
      setStorageData(this.table, dbData);
      const res = Array.isArray(this.insertData) ? inserted : inserted[0];
      return { data: res, error: null };
    }

    if (this.updateData) {
      let affected = [];
      dbData = dbData.map(row => {
        if (this.matchRow(row)) {
          const updated = { ...row, ...this.updateData, updated_at: new Date().toISOString() };
          affected.push(updated);
          return updated;
        }
        return row;
      });
      setStorageData(this.table, dbData);
      const res = this.isSingle || this.isMaybeSingle ? affected[0] || null : affected;
      return { data: res, error: null };
    }

    let result = [...dbData];

    for (const filter of this.filters) {
      result = result.filter(row => {
        const val = row[filter.column];
        if (filter.type === 'is') {
          if (filter.value === null) return val === null || val === undefined;
          return val === filter.value;
        }
        if (filter.type === 'eq') {
          return val == filter.value;
        }
        if (filter.type === 'in') {
          return filter.values.includes(val);
        }
        return true;
      });
    }

    if (this.orderConfig) {
      const col = this.orderConfig.column;
      const asc = this.orderConfig.ascending !== false;
      result.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];
        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
      });
    }

    // Support nested product_variants select
    if (this.table === 'products' && this.selectColumns.includes('product_variants')) {
      const variants = getStorageData('product_variants');
      result = result.map(prod => {
        return {
          ...prod,
          product_variants: variants.filter(v => v.product_id === prod.id && !v.deleted_at)
        };
      });
    }

    if (this.limitCount !== null) {
      result = result.slice(0, this.limitCount);
    }

    if (this.isSingle) {
      if (result.length === 0) {
        return { data: null, error: { message: 'Not found' } };
      }
      return { data: result[0], error: null };
    }

    if (this.isMaybeSingle) {
      return { data: result[0] || null, error: null };
    }

    return { data: result, error: null };
  }

  matchRow(row) {
    for (const filter of this.filters) {
      const val = row[filter.column];
      if (filter.type === 'is') {
        if (filter.value === null) {
          if (val !== null && val !== undefined) return false;
        } else if (val !== filter.value) return false;
      } else if (filter.type === 'eq') {
        if (val != filter.value) return false;
      } else if (filter.type === 'in') {
        if (!filter.values.includes(val)) return false;
      }
    }
    return true;
  }

  then(onfulfilled, onrejected) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

class MockStorageBucket {
  constructor(bucketName) {
    this.bucketName = bucketName;
  }
  async upload(path, file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        const storageKey = `sb_mock_storage_${path}`;
        localStorage.setItem(storageKey, base64data);
        resolve({ data: { path }, error: null });
      };
      reader.onerror = () => {
        resolve({ data: null, error: { message: 'Failed to read file' } });
      };
      reader.readAsDataURL(file);
    });
  }
  getPublicUrl(path) {
    const storageKey = `sb_mock_storage_${path}`;
    const dataUrl = localStorage.getItem(storageKey);
    return { data: { publicUrl: dataUrl || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500' } };
  }
}

class MockSupabaseClient {
  constructor() {
    this.auth = {
      async signInWithPassword({ email, password }) {
        if (email === 'admin@baytalezz.com' && password === 'admin123') {
          const user = { id: 'admin-user', email };
          localStorage.setItem('sb-mock-session', JSON.stringify({ user }));
          return { data: { user }, error: null };
        }
        return { data: null, error: { message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' } };
      },
      async signOut() {
        localStorage.removeItem('sb-mock-session');
        return { error: null };
      },
      async getSession() {
        const session = localStorage.getItem('sb-mock-session');
        return { data: { session: session ? JSON.parse(session) : null }, error: null };
      },
      onAuthStateChange(callback) {
        return { data: { subscription: { unsubscribe() {} } } };
      }
    };
    this.storage = {
      from(bucketName) {
        return new MockStorageBucket(bucketName);
      }
    };
  }

  from(table) {
    return new MockQueryBuilder(table);
  }
}

const useMock = localStorage.getItem('USE_MOCK') !== 'false';

export const supabase = useMock ? new MockSupabaseClient() : (url && key ? createClient(url, key) : null);

console.log('SUPABASE INITIALIZATION MODE:', useMock ? 'MOCK' : 'REAL');

export function requireSupabase() {
  if (!supabase) throw new Error('إعدادات Supabase غير مضافة بعد.');
  return supabase;
}
