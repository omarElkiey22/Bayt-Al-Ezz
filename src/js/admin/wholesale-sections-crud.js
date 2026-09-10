import { fetchAllWholesaleSectionsAdmin, createWholesaleSection, updateWholesaleSection, softDeleteWholesaleSection } from '../wholesale-sections-api.js';
import { sanitizeInput } from '../utils.js';
import { requireAdmin } from './auth-gate.js';
import { renderWholesaleSectionFormFieldValues, renderWholesaleSectionRow } from './admin-templates.js';
import { renderIconPickerHTML, wireIconPicker } from './icon-picker.js';

// Feature 005, US2: moved out of companies-crud.js (not copied) -- feature
// 004 originally stacked this CRUD onto the companies admin page for
// expediency (research.md Decision 8, contracts/admin-ui.md). Unchanged in
// capability from its companies.html incarnation: full CRUD (create,
// rename, reorder, activate/deactivate, soft-delete), unlike retail
// sections' edit-only sections-crud.js -- wholesale sections are a
// merchant-defined taxonomy with no fixed house-hero zone count to respect.

export async function initializeWholesaleSectionsPage(root) {
  let editingWholesaleSection = null;

  const render = async () => {
    await requireAdmin();
    const wholesaleSections = await fetchAllWholesaleSectionsAdmin();
    const wsFormValues = renderWholesaleSectionFormFieldValues(editingWholesaleSection);

    root.innerHTML = `
      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-[#1A237E]">إدارة أقسام الجملة</h1>
        <p class="text-sm text-[#75777E] mt-1">إضافة وتعديل وترتيب تصنيفات (أقسام) الجملة المستقلة، لربطها بمنتجات الجملة.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Wholesale Section Form Column -->
        <div class="lg:col-span-1">
          <form class="bg-white border border-[#9E9E9E]/20 rounded-2xl p-6 shadow-sm flex flex-col gap-4 sticky top-24" id="wholesale-section-form">
            <h2 class="font-bold text-lg text-[#1A237E] pb-2 border-b border-[#9E9E9E]/10">
              ${editingWholesaleSection ? 'تعديل قسم جملة' : 'إضافة قسم جملة جديد'}
            </h2>

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

            <div>
              ${renderIconPickerHTML(editingWholesaleSection?.icon_name, {})}
            </div>

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
                    <th class="p-4">الأيقونة</th>
                    <th class="p-4">الحالة</th>
                    <th class="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#9E9E9E]/10 text-[#1A237E]" id="admin-wholesale-sections-tbody">
                  ${wholesaleSections.length === 0 ? `
                    <tr>
                      <td colspan="5" class="p-8 text-center text-[#75777E]">
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

    // Icon picker listener
    wireIconPicker(root, '#selected-icon-input');

    // Cancel editing
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
        icon_name: rawData.icon_name,
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
  };

  await render();
}
