import { supabase } from '../supabase-client.js';
import { sanitizeInput } from '../utils.js';

const LOCAL_STORAGE_KEY = 'bayt_al_ezz_customers';

export async function fetchCustomers(searchQuery = '') {
  const query = sanitizeInput(searchQuery || '').trim().toLowerCase();
  let customers = [];

  try {
    let req = supabase.from('customers').select('*').is('deleted_at', null).order('name');
    if (query) {
      req = req.or(`name.ilike.%${query}%,phone.ilike.%${query}%`);
    }
    const { data, error } = await req;
    if (!error && data) {
      customers = data;
    }
  } catch (err) {
    console.warn('Supabase fetch customers error:', err);
  }

  // Merge with localStorage
  try {
    const localData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const map = new Map(customers.map(c => [c.name.trim().toLowerCase(), c]));
    
    localData.forEach(c => {
      const key = c.name.trim().toLowerCase();
      if (!map.has(key)) {
        customers.push(c);
      }
    });
  } catch (e) {
    console.error('LocalStorage merge customers error:', e);
  }

  if (query) {
    customers = customers.filter(c => 
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.phone && c.phone.toLowerCase().includes(query)) ||
      (c.address && c.address.toLowerCase().includes(query))
    );
  }

  return customers;
}

export async function saveOrUpdateCustomer(name, phone = '', address = '') {
  const sanitizedName = sanitizeInput(name || '').trim();
  const sanitizedPhone = sanitizeInput(phone || '').trim();
  const sanitizedAddress = sanitizeInput(address || '').trim();

  if (!sanitizedName) return null;

  const payload = {
    name: sanitizedName,
    phone: sanitizedPhone,
    address: sanitizedAddress
  };

  let savedCustomer = null;

  // Supabase save / update logic by name
  try {
    const { data: existing } = await supabase
      .from('customers')
      .select('*')
      .eq('name', sanitizedName)
      .is('deleted_at', null)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('customers')
        .update({ phone: sanitizedPhone, address: sanitizedAddress })
        .eq('id', existing.id)
        .select('*')
        .maybeSingle();
      if (!error && data) savedCustomer = data;
    } else {
      const { data, error } = await supabase
        .from('customers')
        .insert(payload)
        .select('*')
        .maybeSingle();
      if (!error && data) savedCustomer = data;
    }
  } catch (err) {
    console.warn('Supabase customer save error:', err);
  }

  // LocalStorage Sync
  try {
    let localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const index = localList.findIndex(c => c.name.trim().toLowerCase() === sanitizedName.toLowerCase());
    
    if (index >= 0) {
      localList[index] = {
        ...localList[index],
        phone: sanitizedPhone,
        address: sanitizedAddress,
        updated_at: new Date().toISOString()
      };
    } else {
      localList.unshift({
        id: savedCustomer?.id || Date.now().toString(),
        name: sanitizedName,
        phone: sanitizedPhone,
        address: sanitizedAddress,
        created_at: new Date().toISOString()
      });
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localList));
  } catch (e) {
    console.error('LocalStorage write customer error:', e);
  }

  return savedCustomer || { name: sanitizedName, phone: sanitizedPhone, address: sanitizedAddress };
}

export async function updateCustomer(id, data) {
  const payload = {
    name: sanitizeInput(data.name || '').trim(),
    phone: sanitizeInput(data.phone || '').trim(),
    address: sanitizeInput(data.address || '').trim()
  };

  try {
    if (id) {
      await supabase.from('customers').update(payload).eq('id', id);
    }
  } catch (e) {}

  try {
    let localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const index = localList.findIndex(c => c.id === id || c.name === payload.name);
    if (index >= 0) {
      localList[index] = { ...localList[index], ...payload };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localList));
    }
  } catch (e) {}
}

export async function deleteCustomer(id, name) {
  try {
    if (id) {
      await supabase.from('customers').delete().eq('id', id);
    }
  } catch (e) {}

  try {
    let localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    localList = localList.filter(c => c.id !== id && c.name !== name);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localList));
  } catch (e) {}
}
