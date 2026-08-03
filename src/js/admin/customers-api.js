import { supabase } from '../supabase-client.js';
import { sanitizeInput } from '../utils.js';

const LOCAL_STORAGE_KEY = 'bayt_al_ezz_customers';

export async function getCustomerDebt(customerName, currentInvoiceNumber = null) {
  const name = sanitizeInput(customerName || '').trim();
  if (!name) return 0;

  const invoicesMap = new Map();

  // Supabase Fetch
  try {
    const { data } = await supabase
      .from('invoices')
      .select('invoice_number, remaining_amount, grand_total, paid_amount, payment_status')
      .ilike('customer_name', name)
      .is('deleted_at', null);

    if (data && data.length > 0) {
      data.forEach(inv => {
        if (inv.invoice_number) {
          invoicesMap.set(inv.invoice_number, inv);
        }
      });
    }
  } catch (err) {
    console.warn('Supabase fetch customer debt error:', err);
  }

  // LocalStorage Sync
  try {
    const localInvoices = JSON.parse(localStorage.getItem('bayt_al_ezz_invoices') || '[]');
    localInvoices.forEach(inv => {
      if (inv.customer_name && inv.customer_name.trim().toLowerCase() === name.toLowerCase()) {
        if (inv.invoice_number && !invoicesMap.has(inv.invoice_number)) {
          invoicesMap.set(inv.invoice_number, inv);
        }
      }
    });
  } catch (e) {
    console.error('LocalStorage fetch debt error:', e);
  }

  let totalDebt = 0;
  invoicesMap.forEach((inv) => {
    if (currentInvoiceNumber && inv.invoice_number === currentInvoiceNumber) {
      return;
    }

    if (inv.payment_status === 'غير مدفوع') {
      const rem = (inv.remaining_amount !== undefined && inv.remaining_amount !== null)
        ? Number(inv.remaining_amount)
        : Number(inv.grand_total || 0);
      totalDebt += rem;
    } else if (inv.payment_status === 'مدفوع جزئياً') {
      if (inv.remaining_amount !== undefined && inv.remaining_amount !== null) {
        totalDebt += Number(inv.remaining_amount);
      } else {
        const paid = Number(inv.paid_amount || 0);
        totalDebt += Math.max(0, Number(inv.grand_total || 0) - paid);
      }
    }
  });

  return totalDebt;
}

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

  // Compute live dynamic total_debt for each customer
  for (let cust of customers) {
    cust.total_debt = await getCustomerDebt(cust.name);
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

export async function updateCustomer(id, data, oldName = '') {
  const payload = {
    name: sanitizeInput(data.name || '').trim(),
    phone: sanitizeInput(data.phone || '').trim(),
    address: sanitizeInput(data.address || '').trim()
  };

  const nameToMatch = oldName || payload.name;

  // 1. Update customer in Supabase customers table
  try {
    if (id) {
      await supabase.from('customers').update(payload).eq('id', id);
    } else {
      await supabase.from('customers').update(payload).eq('name', nameToMatch);
    }
  } catch (e) {}

  // 2. Cascade update customer details in existing invoices in Supabase
  try {
    if (nameToMatch) {
      await supabase.from('invoices').update({
        customer_name: payload.name,
        customer_phone: payload.phone,
        customer_address: payload.address
      }).eq('customer_name', nameToMatch);
    }
  } catch (e) {}

  // 3. LocalStorage update for customers
  try {
    let localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const index = localList.findIndex(c => c.id === id || c.name === nameToMatch || c.name === payload.name);
    if (index >= 0) {
      localList[index] = { ...localList[index], ...payload };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localList));
    }
  } catch (e) {}

  // 4. Cascade update existing invoices in LocalStorage
  try {
    let localInvoices = JSON.parse(localStorage.getItem('bayt_al_ezz_invoices') || '[]');
    let updatedAny = false;
    localInvoices = localInvoices.map(inv => {
      if (inv.customer_name === nameToMatch || (id && inv.customer_id === id)) {
        updatedAny = true;
        return {
          ...inv,
          customer_name: payload.name,
          customer_phone: payload.phone,
          customer_address: payload.address,
          updated_at: new Date().toISOString()
        };
      }
      return inv;
    });
    if (updatedAny) {
      localStorage.setItem('bayt_al_ezz_invoices', JSON.stringify(localInvoices));
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
