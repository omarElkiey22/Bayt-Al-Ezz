import {requireSupabase} from './supabase-client.js'; import {TABLES,MAX_SECTIONS} from './constants.js';
export async function fetchActiveSections(){try{const db=requireSupabase();const {data:{session}}=await db.auth.getSession();const isAdmin=!!session;const {data,error}=await db.from(TABLES.sections).select('id,name,slug,icon_name,display_order,description').is('deleted_at',null).eq('is_active',true).order('display_order');if(error)throw error;const sections=data||[];if(!isAdmin){return sections.filter(s=>s.icon_name!=='library-book.svg')}return sections}catch(error){console.error(error);return []}}
export async function fetchAllSectionsAdmin(){const {data,error}=await requireSupabase().from(TABLES.sections).select('*').is('deleted_at',null).order('display_order');if(error)throw error;return data||[]}
export async function createSection(section){const existing=await fetchAllSectionsAdmin();if(existing.length>=MAX_SECTIONS)throw new Error('تم الوصول للحد الأقصى: 12 قسم عادي + قسم عروض خاص.');const {data,error}=await requireSupabase().from(TABLES.sections).insert(section).select().single();if(error)throw error;return data}
export async function updateSection(id,updates){const {data,error}=await requireSupabase().from(TABLES.sections).update(updates).eq('id',id).select().single();if(error)throw error;return data}
// plan-eng-review finding, resolved: this used to hard-delete every product
// row referencing the section (which cascade-hard-deletes their variants
// too, via product_variants' ON DELETE CASCADE FK) and then hard-delete the
// section itself -- despite its name, and despite Constitution Principle
// VIII requiring soft-delete. Now mirrors softDeleteCompany() exactly: the
// active-products guard is unchanged, but the only mutation is a single
// deleted_at update on the section row. No product row is ever touched.
export async function softDeleteSection(id){const db=requireSupabase();const {count,error:countError}=await db.from(TABLES.products).select('*',{count:'exact',head:true}).eq('section_id',id).is('deleted_at',null).eq('is_active',true);if(countError)throw countError;if(count)throw new Error('لا يمكن حذف قسم به منتجات نشطة قبل نقلها أو إيقافها.');const {error}=await db.from(TABLES.sections).update({deleted_at:new Date().toISOString()}).eq('id',id);if(error)throw error;return true}
