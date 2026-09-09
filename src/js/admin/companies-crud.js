import { fetchAllCompaniesAdmin, createCompany, updateCompany, softDeleteCompany } from '../companies-api.js';
import { fetchAllWholesaleSectionsAdmin, createWholesaleSection, updateWholesaleSection, softDeleteWholesaleSection } from '../wholesale-sections-api.js';
import { compressImage } from '../image-compressor.js';
import { slugify, sanitizeInput } from '../utils.js';
import { requireAdmin } from './auth-gate.js';
import { renderCompanyFormFieldValues, renderCompanyRow, renderWholesaleSectionFormFieldValues, renderWholesaleSectionRow } from './admin-templates.js';

// Logo upload helper -- identical in shape to products-crud.js's upload(),
// except the path prefix (companies/ instead of products/); confirms
// research.md Decision 4 (no new storage bucket/policy needed).
async function uploadLogo(file) {
  if (!file) return '';
  const compressed = await compressImage(file);
  const { supabase } = await import('../supabase-client.js');
  const extension = compressed.name.split('.').pop() || 'webp';
  const path = `companies/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('store-assets').upload(path, compressed);
  if (error) throw error;
  return supabase.storage.from('store-assets').getPublicUrl(path).data.publicUrl;
}

export async function initializeCompaniesPage(root) {
  let editing = null;
  let editingWholesaleSection = null;

  const render = async () => {
    await requireAdmin();
    const companies = await fetchAllCompaniesAdmin();
    const wholesaleSections = await fetchAllWholesaleSectionsAdmin();
    const formValues = renderCompanyFormFieldValues(editing);
    const wsFormValues = renderWholesaleSectionFormFieldValues(editingWholesaleSection);

    root.innerHTML = `
      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-[#1A237E]">إدارة الشركات وأقسام الجملة</h1>
        <p class="text-sm text-[#75777E] mt-1">إضافة وتعديل الشركات والعلامات التجارية، وإدارة تصنيفات (أقسام) الجملة المستقلة، لربطها بمنتجات الجملة.</p>
      </div>

      <h2 class="text-lg font-bold text-[#1A237E] mb-4">الشركات</h2>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Form Column -->
        <div class="lg:col-span-1">
          <form class="bg-white border border-[#9E9E9E]/20 rounded-2xl p-6 shadow-sm flex flex-col gap-4 sticky top-24" id="company-form">
            <h2 class="font-bold text-lg text-[#1A237E] pb-2 border-b border-[#9E9E9E]/10">
              ${editing ? 'تعديل شركة' : 'إضافة شركة جديدة'}
            </h2>

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">اسم الشركة</label>
              <input class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none" name="name" placeholder="مثال: شركة الاتحاد" value="${formValues.name}" required>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">وصف الشركة <span class="text-gray-400 font-normal">(اختياري)</span></label>
              <textarea class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none h-20" name="description" placeholder="نبذة عن الشركة...">${formValues.description}</textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">شعار الشركة <span class="text-gray-400 font-normal">(اختياري)</span></label>
              <input class="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#0056B3]/10 file:text-[#0056B3] hover:file:bg-[#0056B3]/20" name="logo" type="file" accept="image/jpeg,image/png,image/webp">
              <p class="text-[10px] text-[#75777E] mt-1">اتركه فارغاً لعرض حرف مختصر بدلاً من الشعار.</p>
            </div>

            <label class="flex items-center gap-2 text-sm font-semibold text-[#1A237E]">
              <input type="checkbox" name="is_active" class="rounded border-gray-300 text-[#0056B3] focus:ring-[#0056B3]" ${editing ? (editing.is_active ? 'checked' : '') : 'checked'}>
              <span>الشركة نشطة (تظهر في تصفح الجملة)</span>
            </label>

            <div class="flex gap-2 mt-4 pt-4 border-t border-[#9E9E9E]/10">
              <button class="flex-grow bg-[#0056B3] hover:bg-[#004491] active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-1 shadow-md">
                <span class="material-symbols-outlined text-sm">save</span>
                <span>حفظ الشركة</span>
              </button>
              ${editing ? `
                <button type="button" class="bg-gray-100 hover:bg-gray-200 text-[#1A237E] font-bold py-2.5 px-4 rounded-xl transition-all text-sm" id="cancel-edit">
                  إلغاء
                </button>
              ` : ''}
            </div>
          </form>
        </div>

        <!-- Companies List Column -->
        <div class="lg:col-span-2">
          <div class="bg-white border border-[#9E9E9E]/20 rounded-2xl shadow-sm overflow-hidden">
            <div class="p-4 bg-gray-50 border-b border-[#9E9E9E]/10 flex justify-between items-center">
              <h3 class="font-bold text-[#1A237E] text-sm">الشركات الحالية</h3>
              <span class="text-xs text-[#75777E]">${companies.length} شركة</span>
            </div>

            <div class="overflow-x-auto w-full">
              <table class="w-full text-right text-sm">
                <thead class="bg-gray-50 border-b border-[#9E9E9E]/20 text-[#75777E] font-bold">
                  <tr>
                    <th class="p-4 w-16">الشعار</th>
                    <th class="p-4">اسم الشركة</th>
                    <th class="p-4">الحالة</th>
                    <th class="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#9E9E9E]/10 text-[#1A237E]" id="admin-companies-tbody">
                  ${companies.length === 0 ? `
                    <tr>
                      <td colspan="4" class="p-8 text-center text-[#75777E]">
                        <span class="material-symbols-outlined text-4xl block mb-2 text-gray-400">store</span>
                        <span>لا توجد شركات مضافة بعد</span>
                      </td>
                    </tr>
                  ` : companies.map(c => renderCompanyRow(c)).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <h2 class="text-lg font-bold text-[#1A237E] mt-10 mb-4 pt-6 border-t border-[#9E9E9E]/10">أقسام الجملة</h2>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Wholesale Section Form Column -->
        <div class="lg:col-span-1">
          <form class="bg-white border border-[#9E9E9E]/20 rounded-2xl p-6 shadow-sm flex flex-col gap-4 sticky top-24" id="wholesale-section-form">
            <h3 class="font-bold text-lg text-[#1A237E] pb-2 border-b border-[#9E9E9E]/10">
              ${editingWholesaleSection ? 'تعديل قسم جملة' : 'إضافة قسم جملة جديد'}
            </h3>

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">اسم القسم</label>
              <input class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none" name="name" placeholder="مثال: أدوات منزلية جملة" value="${wsFormValues.name}" required>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">الترتيب</label>
              <input class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none" name="display_order" type="number" min="0" value="${wsFormValues.display_order}">
            </div>

            <label class="flex items-center gap-2 text-sm font-semibold text-[#1A237E]">
              <input type="checkbox" name="is_active" class="rounded border-gray-300 text-[#0056B3] focus:ring-[#0056B3]" ${editingWholesaleSection ? (editingWholesaleSection.is_active ? 'checked' : '') : 'checked'}>
              <span>القسم نشط (يظهر في نموذج تصنيف المنتج)</span>
            </label>

            <div class="flex gap-2 mt-2">
              <button class="flex-grow bg-[#0056B3] hover:bg-[#004491] active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-1 shadow-md">
                <span class="material-symbols-outlined text-sm">save</span>
                <span>حفظ قسم الجملة</span>
              </button>
              ${editingWholesaleSection ? `
                <button type="button" class="bg-gray-100 hover:bg-gray-200 text-[#1A237E] font-bold py-2.5 px-4 rounded-xl transition-all text-sm" id="cancel-edit-wholesale-section">
                  إلغاء
                </button>
              ` : ''}
            </div>
          </form>
        </div>

        <!-- Wholesale Sections List Column -->
        <div class="lg:col-span-2">
          <div class="bg-white border border-[#9E9E9E]/20 rounded-2xl shadow-sm overflow-hidden">
            <div class="p-4 bg-gray-50 border-b border-[#9E9E9E]/10 flex justify-between items-center">
              <h3 class="font-bold text-[#1A237E] text-sm">أقسام الجملة الحالية</h3>
              <span class="text-xs text-[#75777E]">${wholesaleSections.length} قسم</span>
            </div>

            <div class="overflow-x-auto w-full">
              <table class="w-full text-right text-sm">
                <thead class="bg-gray-50 border-b border-[#9E9E9E]/20 text-[#75777E] font-bold">
                  <tr>
                    <th class="p-4">الترتيب</th>
                    <th class="p-4">اسم القسم</th>
                    <th class="p-4">الحالة</th>
                    <th class="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#9E9E9E]/10 text-[#1A237E]" id="admin-wholesale-sections-tbody">
                  ${wholesaleSections.length === 0 ? `
                    <tr>
                      <td colspan="4" class="p-8 text-center text-[#75777E]">
                        <span class="material-symbols-outlined text-4xl block mb-2 text-gray-400">layers</span>
                        <span>لا توجد أقسام جملة مضافة بعد</span>
                      </td>
                    </tr>
                  ` : wholesaleSections.map((w, index) => renderWholesaleSectionRow(w, index)).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    `;

    // Cancel editing
    const cancelBtn = root.querySelector('#cancel-edit');
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        editing = null;
        render();
      };
    }

    // Bind Edit/Delete buttons -- scoped to each table's own tbody. Both
    // tables render `[data-edit]`/`[data-delete]` buttons with the same
    // attribute names, so an unscoped root.querySelectorAll() here would
    // wire a wholesale-section row's edit button to look itself up in the
    // `companies` array (and vice versa) and silently fail.
    const companiesTbody = root.querySelector('#admin-companies-tbody');
    companiesTbody.querySelectorAll('[data-edit]').forEach(b => {
      b.onclick = () => {
        editing = companies.find(c => c.id === b.dataset.edit);
        render();
      };
    });

    companiesTbody.querySelectorAll('[data-delete]').forEach(b => {
      b.onclick = async () => {
        if (confirm('هل تريد حذف هذه الشركة حذفاً آمناً؟ ستبقى المنتجات المرتبطة بها كما هي دون تغيير.')) {
          try {
            await softDeleteCompany(b.dataset.delete);
            render();
          } catch (error) {
            alert(error.message);
          }
        }
      };
    });

    // Cancel editing (wholesale section)
    const cancelWsBtn = root.querySelector('#cancel-edit-wholesale-section');
    if (cancelWsBtn) {
      cancelWsBtn.onclick = () => {
        editingWholesaleSection = null;
        render();
      };
    }

    const wholesaleSectionsTbody = root.querySelector('#admin-wholesale-sections-tbody');
    wholesaleSectionsTbody.querySelectorAll('[data-edit]').forEach(b => {
      b.onclick = () => {
        editingWholesaleSection = wholesaleSections.find(w => w.id === b.dataset.edit);
        render();
      };
    });

    wholesaleSectionsTbody.querySelectorAll('[data-delete]').forEach(b => {
      b.onclick = async () => {
        if (confirm('هل تريد حذف قسم الجملة هذا حذفاً آمناً؟ ستفقد المنتجات المرتبطة به تصنيفها لهذا القسم فقط، وتبقى بقية بياناتها كما هي.')) {
          try {
            await softDeleteWholesaleSection(b.dataset.delete);
            render();
          } catch (error) {
            alert(error.message);
          }
        }
      };
    });

    // Wholesale section form submission
    const wsForm = root.querySelector('#wholesale-section-form');
    wsForm.onsubmit = async e => {
      e.preventDefault();
      await requireAdmin();
      const rawData = Object.fromEntries(new FormData(wsForm));

      const data = {
        name: sanitizeInput(rawData.name || ''),
        display_order: Number(rawData.display_order) || 0,
        is_active: rawData.is_active === 'on',
      };

      try {
        if (editingWholesaleSection) {
          await updateWholesaleSection(editingWholesaleSection.id, data);
          alert('تم تعديل قسم الجملة بنجاح.');
        } else {
          await createWholesaleSection(data);
          alert('تم إضافة قسم الجملة بنجاح.');
        }

        editingWholesaleSection = null;
        render();
      } catch (error) {
        alert(error.message);
      }
    };

    // Form Submission
    const form = root.querySelector('#company-form');
    form.onsubmit = async e => {
      e.preventDefault();
      await requireAdmin();
      const rawData = Object.fromEntries(new FormData(form));

      let autoSlug = slugify(rawData.name || '');
      if (autoSlug.length < 2) {
        autoSlug = 'co-' + Math.random().toString(36).substring(2, 7);
      } else if (autoSlug.length > 100) {
        autoSlug = autoSlug.substring(0, 100);
      }

      try {
        let logoUrl = editing?.logo_url || '';
        if (form.logo.files[0]) {
          logoUrl = await uploadLogo(form.logo.files[0]);
        }

        const data = {
          name: sanitizeInput(rawData.name || ''),
          description: sanitizeInput(rawData.description || ''),
          slug: autoSlug,
          logo_url: logoUrl || null,
          is_active: rawData.is_active === 'on',
        };

        if (editing) {
          await updateCompany(editing.id, data);
          alert('تم تعديل الشركة بنجاح.');
        } else {
          await createCompany(data);
          alert('تم إضافة الشركة بنجاح.');
        }

        editing = null;
        render();
      } catch (error) {
        alert(error.message);
      }
    };
  };

  await render();
}
