import { requireSupabase } from './supabase-client.js';
import { TABLES } from './constants.js';

// Admin CRUD data-access layer for wholesale_sections -- mirrors
// companies-api.js's admin section exactly. No storefront-facing function
// in this feature (nothing routes the public storefront through wholesale
// sections yet); the product admin form's wholesale-section <select> reads
// this list directly via fetchAllWholesaleSectionsAdmin(), same as it
// already does for retail sections/companies.

export async function fetchAllWholesaleSectionsAdmin() {
  const { data, error } = await requireSupabase()
    .from(TABLES.wholesaleSections)
    .select('*')
    .is('deleted_at', null)
    .order('display_order');
  if (error) throw error;
  return data || [];
}

export async function createWholesaleSection(section) {
  const { data, error } = await requireSupabase()
    .from(TABLES.wholesaleSections)
    .insert(section)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateWholesaleSection(id, updates) {
  const { data, error } = await requireSupabase()
    .from(TABLES.wholesaleSections)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function softDeleteWholesaleSection(id) {
  const { error } = await requireSupabase()
    .from(TABLES.wholesaleSections)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  return true;
}
