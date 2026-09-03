import {requireSupabase} from './supabase-client.js'; import {TABLES} from './constants.js'; import {fetchProductsBySection, getHiddenSectionContext, mapProductWithVariants} from './products-api.js'; import {filterWholesaleProducts} from './pricing-mode.js';
const active=query=>query.is('deleted_at',null).eq('is_active',true);

// ── Storefront (public, RLS-backed) ──────────────────────────────────────

// Scale note: fetches every product row (+ variants) for the section just
// to reduce it to a distinct company_id list -- deliberate, per research.md
// Decision 2, to reuse filterWholesaleProducts() rather than duplicating
// its wholesale-price condition in a second query (Constitution VI). Fine
// at today's scale; revisit if any single section exceeds ~500 active
// products.
export async function fetchCompaniesForSection(sectionSlug){const db=requireSupabase();const products=await fetchProductsBySection(sectionSlug);const wholesale=filterWholesaleProducts(products);const hasUnassigned=wholesale.some(p=>!p.company_id);const companyIds=[...new Set(wholesale.map(p=>p.company_id).filter(Boolean))];if(companyIds.length===0)return {companies:[],hasUnassigned};const {data,error}=await active(db.from(TABLES.companies).select('*').in('id',companyIds)).order('name');if(error)throw error;return {companies:data||[],hasUnassigned}}

// Homepage direct-browsing showcase (User Story 2). Matches
// filterWholesaleProducts()'s actual "wholesale-eligible" condition
// (wholesale_price > 0, not "is not null" -- 0 is a DB-legal value that
// would otherwise show a company card with nothing actually wholesale-
// priced behind it) and excludes hidden-section products for non-admins,
// same as every other product-facing query. Degrades to [] on error
// (logged, not thrown) since this powers a homepage showcase that should
// never break the page, matching fetchActiveSections()'s error style.
export async function fetchActiveCompanies(){try{const db=requireSupabase();const {isAdmin,hiddenSectionIds}=await getHiddenSectionContext(db);let query=active(db.from(TABLES.products).select('company_id')).gt('wholesale_price',0).not('company_id','is',null);if(!isAdmin&&hiddenSectionIds.size>0)query=query.not('section_id','in',`(${[...hiddenSectionIds].join(',')})`);const {data,error}=await query;if(error)throw error;const companyIds=[...new Set((data||[]).map(row=>row.company_id).filter(Boolean))];if(companyIds.length===0)return [];const {data:companies,error:companiesError}=await active(db.from(TABLES.companies).select('*').in('id',companyIds)).order('name');if(companiesError)throw companiesError;return companies||[]}catch(error){console.error(error);return []}}

// Single active, non-deleted company by id. Both company-scoped
// category.html routes call this first and catch its "not found" error
// with the spec's existing invalid-ID empty-state UI, so a soft-deleted/
// deactivated/nonexistent company behaves identically on both routes.
export async function fetchCompanyDetails(id){const db=requireSupabase();const {data,error}=await active(db.from(TABLES.companies).select('*').eq('id',id)).single();if(error)throw error;return data}

// Mirrors fetchProductsBySection's shape and admin/hidden-section handling.
// Callers validate the company via fetchCompanyDetails() first -- this
// function only handles the product-fetch side (same division of
// responsibility fetchProductsBySection/fetchProductDetails already have).
export async function fetchProductsByCompany(companyId,{sectionSlug}={}){const db=requireSupabase();const {isAdmin,hiddenSectionIds}=await getHiddenSectionContext(db);let sectionId=null;if(sectionSlug){const {data:section,error:sectionError}=await db.from(TABLES.sections).select('id,icon_name').eq('slug',sectionSlug).is('deleted_at',null).eq('is_active',true).single();if(sectionError)throw sectionError;if(section.icon_name==='library-book.svg'&&!isAdmin)throw new Error('Not authorized');sectionId=section.id}let query=active(db.from(TABLES.products).select('*, product_variants(*)').eq('company_id',companyId));if(sectionId){query=query.eq('section_id',sectionId)}else if(!isAdmin&&hiddenSectionIds.size>0){query=query.not('section_id','in',`(${[...hiddenSectionIds].join(',')})`)}const {data,error}=await query.order('created_at',{ascending:false});if(error)throw error;return (data||[]).map(mapProductWithVariants)}

// ── Admin (write-gated by RLS is_admin(), called from companies-crud.js) ─

export async function fetchAllCompaniesAdmin(){const {data,error}=await requireSupabase().from(TABLES.companies).select('*').is('deleted_at',null).order('name');if(error)throw error;return data||[]}
export async function createCompany(company){const {data,error}=await requireSupabase().from(TABLES.companies).insert(company).select().single();if(error)throw error;return data}
export async function updateCompany(id,updates){const {data,error}=await requireSupabase().from(TABLES.companies).update({...updates,updated_at:new Date().toISOString()}).eq('id',id).select().single();if(error)throw error;return data}
export async function softDeleteCompany(id){const {error}=await requireSupabase().from(TABLES.companies).update({deleted_at:new Date().toISOString()}).eq('id',id);if(error)throw error;return true}
