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
  const extension = compressed.name.split('.').pop() || 'webp';
  const path = `products/${crypto.randomUUID()}.${extension}`;
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
              <textarea class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none h-24" name="description" placeholder="اكتب تفاصيل ومواصفات المنتج...">${editing?.description || ''}</textarea>
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

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">المقاسات:</label>
              <div id="sizes-container" class="flex flex-col gap-2"></div>
              <button type="button" id="add-size-btn" class="mt-2 text-xs text-[#0056B3] hover:text-[#004491] font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">add</span>
                <span>إضافة مقاس آخر</span>
              </button>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">الألوان:</label>
              <div id="colors-container" class="flex flex-col gap-2"></div>
              <button type="button" id="add-color-btn" class="mt-2 text-xs text-[#0056B3] hover:text-[#004491] font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">add</span>
                <span>إضافة لون آخر</span>
              </button>
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
                    <th class="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#9E9E9E]/10 text-[#1A237E]">
                  ${products.map(p => {
                    const section = sections.find(s => s.id === p.section_id);
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

    // Render Sizes & Colors input rows
    const sizesContainer = root.querySelector('#sizes-container');
    const colorsContainer = root.querySelector('#colors-container');

    const renderRows = (container, list, placeholder, inputClass) => {
      container.innerHTML = '';
      if (!list || list.length === 0) list = [''];
      list.forEach((val) => {
        const row = document.createElement('div');
        row.className = 'flex items-center gap-2';
        row.innerHTML = `
          <input class="flex-grow rounded-xl border border-gray-300 px-4 py-2 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none ${inputClass}" 
                 type="text" placeholder="${placeholder}" value="${val}">
          <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-[#0056B3]/10 transition-colors edit-btn" title="تعديل">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors delete-btn" title="حذف">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        `;
        
        row.querySelector('.edit-btn').onclick = () => {
          row.querySelector('input').focus();
        };
        
        row.querySelector('.delete-btn').onclick = () => {
          row.remove();
        };
        
        container.appendChild(row);
      });
    };

    let initialSizes = editing?.sizes && editing.sizes.length > 0 ? [...editing.sizes] : [''];
    let initialColors = editing?.colors && editing.colors.length > 0 ? [...editing.colors] : [''];

    renderRows(sizesContainer, initialSizes, 'مثال: XL أو ٤٠ سم', 'size-input');
    renderRows(colorsContainer, initialColors, 'مثال: أحمر أو أبيض', 'color-input');

    // Add button handlers
    root.querySelector('#add-size-btn').onclick = () => {
      const row = document.createElement('div');
      row.className = 'flex items-center gap-2';
      row.innerHTML = `
        <input class="flex-grow rounded-xl border border-gray-300 px-4 py-2 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none size-input" 
               type="text" placeholder="مثال: XL أو ٤٠ سم" value="">
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-[#0056B3]/10 transition-colors edit-btn" title="تعديل">
          <span class="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors delete-btn" title="حذف">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      `;
      row.querySelector('.edit-btn').onclick = () => row.querySelector('input').focus();
      row.querySelector('.delete-btn').onclick = () => row.remove();
      sizesContainer.appendChild(row);
      row.querySelector('input').focus();
    };

    root.querySelector('#add-color-btn').onclick = () => {
      const row = document.createElement('div');
      row.className = 'flex items-center gap-2';
      row.innerHTML = `
        <input class="flex-grow rounded-xl border border-gray-300 px-4 py-2 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none color-input" 
               type="text" placeholder="مثال: أحمر أو أبيض" value="">
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-[#0056B3]/10 transition-colors edit-btn" title="تعديل">
          <span class="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors delete-btn" title="حذف">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      `;
      row.querySelector('.edit-btn').onclick = () => row.querySelector('input').focus();
      row.querySelector('.delete-btn').onclick = () => row.remove();
      colorsContainer.appendChild(row);
      row.querySelector('input').focus();
    };

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

        const sizesArray = Array.from(sizesContainer.querySelectorAll('.size-input'))
          .map(input => sanitizeInput(input.value.trim()))
          .filter(val => val !== '');
        
        const colorsArray = Array.from(colorsContainer.querySelectorAll('.color-input'))
          .map(input => sanitizeInput(input.value.trim()))
          .filter(val => val !== '');
        
        const updates = {
          name: data.name,
          description: data.description,
          section_id: data.section_id,
          base_price: Number(data.base_price),
          primary_image_url: imageUrl,
          sizes: sizesArray,
          colors: colorsArray
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
