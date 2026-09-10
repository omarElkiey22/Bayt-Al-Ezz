import { requireSupabase } from './supabase-client.js';
import { TABLES } from './constants.js';

// Admin CRUD data-access layer for wholesale_sections -- mirrors
// companies-api.js's admin section exactly.

// ── Storefront (public, RLS-backed) ──────────────────────────────────────

// Feature 005, US1: the first storefront-facing read of wholesale_sections --
// mirrors fetchActiveSections() (sections-api.js) exactly. No hidden-section-
// style gating (research.md Decision 4 -- that retail-only convention isn't
// replicated for wholesale sections in this feature).
export async function fetchActiveWholesaleSections() {
  const { data, error } = await requireSupabase()
    .from(TABLES.wholesaleSections)
    .select('*')
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('display_order');
  if (error) throw error;
  return data || [];
}

// ── Admin (write-gated by RLS is_admin(), called from wholesale-sections-crud.js) ─

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
