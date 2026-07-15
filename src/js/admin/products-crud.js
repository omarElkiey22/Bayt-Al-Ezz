import { fetchAllSectionsAdmin } from '../sections-api.js';
import { createProduct, updateProduct, softDeleteProduct, fetchProductDetails } from '../products-api.js';
import { compressImage } from '../image-compressor.js';
import { TABLES } from '../constants.js';
import { formatPrice, sanitizeInput } from '../utils.js';
import { requireAdmin } from './auth-gate.js';

// Image Upload Helper
async function upload(file) {
  if (!file) return '';
  const compressed = await compressImage(file);
  const { supabase } = await import('../supabase-client.js');
  const path = `products/${crypto.randomUUID()}-${compressed.name}`;
  const { error } = await supabase.storage.from('store-assets').upload(path, compressed);
  if (error) throw error;
  return supabase.storage.from('store-assets').getPublicUrl(path).data.publicUrl;
}

export async function initializeProductsPage(root) {
  const sections = await fetchAllSectionsAdmin();
  let editing = null;
  let variants = [{ label: 'افتراضي', price_override: '', is_in_stock: true }];

  const draw = async () => {
    await requireAdmin();
    const { supabase } = await import('../supabase-client.js');
    
    // Fetch products
    let products = [];
    try {
      const res = await supabase.from(TABLES.products).select('*, product_variants(*)').is('deleted_at', null);
      if (res.data) products = res.data;
    } catch (e) {
      console.error(e);
    }

    root.innerHTML = `
      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-[#1A237E]">إدارة المنتجات والمخزون</h1>
        <p class="text-sm text-[#75777E] mt-1">إضافة وتعديل وحذف المنتجات وخيارات الأنواع والأسعار.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Form Column (Right logically / Left physically in RTL) -->
        <div class="lg:col-span-1">
          <form class="bg-white border border-[#9E9E9E]/20 rounded-2xl p-6 shadow-sm flex flex-col gap-4 sticky top-24" id="product-form">
            <h2 class="font-bold text-lg text-[#1A237E] pb-2 border-b border-[#9E9E9E]/10">
              ${editing ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </h2>

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">اسم المنتج</label>
              <input class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none" name="name" placeholder="مثال: طقم كنب زاوية مودرن" value="${editing?.name || ''}" required>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">وصف المنتج</label>
              <textarea class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none h-24" name="description" placeholder="اكتب تفاصيل ومواصفات المنتج..." required>${editing?.description || ''}</textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">القسم (الروم)</label>
              <select class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none" name="section_id" required>
                ${sections.map(s => `<option value="${s.id}" ${editing?.section_id === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">السعر الأساسي (ج.م)</label>
              <input class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none" name="base_price" type="number" min="0" placeholder="0" value="${editing?.base_price || ''}" required>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">صورة المنتج</label>
              <input class="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#0056B3]/10 file:text-[#0056B3] hover:file:bg-[#0056B3]/20" name="image" type="file" accept="image/jpeg,image/png,image/webp">
              <p class="text-[10px] text-[#75777E] mt-1">اختياري: اتركه فارغاً إذا لم تكن هناك صورة.</p>
            </div>

            <!-- Variants Editor -->
            <div class="mt-2">
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-bold text-[#1A237E]">خيارات الأنواع (الألوان/المقاسات)</span>
                <button type="button" class="text-xs text-[#0056B3] font-bold hover:underline" id="add-variant">+ إضافة نوع</button>
              </div>
              <div class="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1" id="variants-list">
                ${variants.map((v, i) => `
                  <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2 relative group">
                    <input class="w-1/2 rounded-lg border-gray-300 text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0056B3]" data-v="${i}" data-k="label" value="${v.label}" placeholder="النوع (أبيض)" required>
                    <input class="w-1/3 rounded-lg border-gray-300 text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0056B3]" data-v="${i}" data-k="price_override" value="${v.price_override || ''}" type="number" placeholder="سعر بديل">
                    
                    <!-- Stock Toggler -->
                    <button type="button" class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${v.is_in_stock ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}" data-stock="${i}" title="${v.is_in_stock ? 'متوفر' : 'غير متوفر'}">
                      <span class="material-symbols-outlined text-[16px]">${v.is_in_stock ? 'check_circle' : 'do_not_disturb_on'}</span>
                    </button>

                    <button type="button" class="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors" data-remove="${i}" title="حذف النوع">
                      <span class="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="flex gap-2 mt-4 pt-4 border-t border-[#9E9E9E]/10">
              <button class="flex-grow bg-[#0056B3] hover:bg-[#004491] active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-1 shadow-md">
                <span class="material-symbols-outlined text-sm">save</span>
                <span>حفظ المنتج</span>
              </button>
              ${editing ? `
                <button type="button" class="bg-gray-100 hover:bg-gray-200 text-[#1A237E] font-bold py-2.5 px-4 rounded-xl transition-all text-sm" id="cancel-edit">
                  إلغاء
                </button>
              ` : ''}
            </div>
          </form>
        </div>

        <!-- Products List Column -->
        <div class="lg:col-span-2">
          <div class="bg-white border border-[#9E9E9E]/20 rounded-2xl shadow-sm overflow-hidden">
            <div class="p-4 bg-gray-50 border-b border-[#9E9E9E]/10 flex justify-between items-center">
              <h3 class="font-bold text-[#1A237E] text-sm">قائمة المنتجات الحالية</h3>
              <span class="text-xs text-[#75777E]">${products.length} منتج</span>
            </div>

            <div class="overflow-x-auto w-full">
              <table class="w-full text-right text-sm">
                <thead class="bg-gray-50 border-b border-[#9E9E9E]/20 text-[#75777E] font-bold">
                  <tr>
                    <th class="p-4 w-16">الصورة</th>
                    <th class="p-4">اسم المنتج</th>
                    <th class="p-4">القسم</th>
                    <th class="p-4">السعر</th>
                    <th class="p-4">الأنواع</th>
                    <th class="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#9E9E9E]/10 text-[#1A237E]">
                  ${products.map(p => {
                    const section = sections.find(s => s.id === p.section_id);
                    const activeVariants = p.product_variants ? p.product_variants.filter(v => !v.deleted_at) : [];
                    return `
                      <tr class="hover:bg-gray-50 transition-colors">
                        <td class="p-4">
                          <div class="w-12 h-12 rounded-lg border border-[#9E9E9E]/10 overflow-hidden bg-gray-100">
                            <img class="w-full h-full object-cover" src="${p.primary_image_url || '../../public/assets/placeholder.svg'}" alt="${p.name}">
                          </div>
                        </td>
                        <td class="p-4 font-bold">
                          <div>${p.name}</div>
                          <div class="text-xs text-[#75777E] mt-0.5 line-clamp-1">${p.description || ''}</div>
                        </td>
                        <td class="p-4">
                          <span class="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">${section?.name || 'غير محدد'}</span>
                        </td>
                        <td class="p-4 font-bold text-[#0056B3]">${formatPrice(p.base_price)}</td>
                        <td class="p-4 text-xs text-[#75777E]">
                          ${activeVariants.length} أنواع
                        </td>
                        <td class="p-4">
                          <div class="flex items-center justify-center gap-2">
                            <button class="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-[#0056B3]/10 transition-colors" data-edit="${p.id}" title="تعديل">
                              <span class="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button class="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors" data-delete="${p.id}" title="حذف">
                              <span class="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    `;

    // Dynamic variant triggers
    root.querySelector('#add-variant').onclick = () => {
      variants.push({ label: '', price_override: '', is_in_stock: true });
      drawVariantsList();
    };

    function drawVariantsList() {
      const container = root.querySelector('#variants-list');
      container.innerHTML = variants.map((v, i) => `
        <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2 relative group">
          <input class="w-1/2 rounded-lg border-gray-300 text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0056B3]" data-v="${i}" data-k="label" value="${v.label}" placeholder="النوع (أبيض)" required>
          <input class="w-1/3 rounded-lg border-gray-300 text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0056B3]" data-v="${i}" data-k="price_override" value="${v.price_override || ''}" type="number" placeholder="سعر بديل">
          
          <button type="button" class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${v.is_in_stock ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}" data-stock="${i}" title="${v.is_in_stock ? 'متوفر' : 'غير متوفر'}">
            <span class="material-symbols-outlined text-[16px]">${v.is_in_stock ? 'check_circle' : 'do_not_disturb_on'}</span>
          </button>

          <button type="button" class="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors" data-remove="${i}" title="حذف النوع">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      `).join('');

      // Re-bind inline inputs
      container.querySelectorAll('[data-v]').forEach(el => {
        el.oninput = () => variants[el.dataset.v][el.dataset.k] = el.value;
      });

      container.querySelectorAll('[data-stock]').forEach(el => {
        el.onclick = () => {
          const idx = el.dataset.stock;
          variants[idx].is_in_stock = !variants[idx].is_in_stock;
          drawVariantsList();
        };
      });

      container.querySelectorAll('[data-remove]').forEach(el => {
        el.onclick = () => {
          if (variants.length > 1) {
            variants.splice(el.dataset.remove, 1);
            drawVariantsList();
          } else {
            alert('يجب أن يحتوي المنتج على نوع واحد على الأقل.');
          }
        };
      });
    }

    // Cancel editing
    const cancelBtn = root.querySelector('#cancel-edit');
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        editing = null;
        variants = [{ label: 'افتراضي', price_override: '', is_in_stock: true }];
        draw();
      };
    }

    // Bind Edit/Delete buttons
    root.querySelectorAll('[data-edit]').forEach(b => {
      b.onclick = async () => {
        const prod = products.find(p => p.id === b.dataset.edit);
        if (prod) {
          const detail = await fetchProductDetails(prod.id);
          editing = detail;
          variants = detail.variants.map(v => ({
            id: v.id,
            label: v.label,
            price_override: v.price_override || '',
            is_in_stock: v.is_in_stock
          }));
          draw();
        }
      };
    });

    root.querySelectorAll('[data-delete]').forEach(b => {
      b.onclick = async () => {
        if (confirm('هل تريد حذف المنتج حذفاً آمناً؟')) {
          try {
            await softDeleteProduct(b.dataset.delete);
            draw();
          } catch (error) {
            alert(error.message);
          }
        }
      };
    });

    // Form Submission
    const form = root.querySelector('#product-form');
    form.onsubmit = async e => {
      e.preventDefault();
      await requireAdmin();
      const rawData = Object.fromEntries(new FormData(form));
      const data = {
        ...rawData,
        name: sanitizeInput(rawData.name || ''),
        description: sanitizeInput(rawData.description || '')
      };
      
      try {
        let imageUrl = editing?.primary_image_url || '';
        if (form.image.files[0]) {
          imageUrl = await upload(form.image.files[0]);
        }
        
        const updates = {
          name: data.name,
          description: data.description,
          section_id: data.section_id,
          base_price: Number(data.base_price),
          primary_image_url: imageUrl
        };

        const parsedVariants = variants.map(v => ({
          id: v.id || null,
          label: v.label,
          price_override: v.price_override === '' ? null : Number(v.price_override),
          is_in_stock: v.is_in_stock
        }));

        if (editing) {
          await updateProduct(editing.id, updates, parsedVariants);
          alert('تم تعديل المنتج بنجاح.');
        } else {
          await createProduct(updates, parsedVariants);
          alert('تم إضافة المنتج بنجاح.');
        }
        
        editing = null;
        variants = [{ label: 'افتراضي', price_override: '', is_in_stock: true }];
        draw();
      } catch (error) {
        alert(error.message);
      }
    };
  };

  await draw();
}
