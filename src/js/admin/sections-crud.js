import { fetchAllSectionsAdmin, updateSection, softDeleteSection } from '../sections-api.js';
import { slugify, sanitizeInput, escapeHtml } from '../utils.js';
import { requireAdmin } from './auth-gate.js';
import { renderSectionFormFieldValues, renderSectionRow } from './admin-templates.js';
import { iconSource, renderIconPickerHTML, wireIconPicker } from './icon-picker.js';

// Feature 005, US3: ICONS/ICON_DIRECTORY/DEFAULT_ICON/iconSource() and the
// picker's markup/click-handling now live in the shared icon-picker.js
// (research.md Decision 5) -- this file just calls into it, so both this
// page and wholesale-sections-crud.js reuse the exact same picker instead
// of a duplicated copy. Pure extraction: no visible/functional change to
// this page (verified byte-identical, see the T019 verification harness).

// FR-004: this page manages the existing fixed set of retail sections only
// -- rename/reorder/enable-disable/soft-delete -- there is no "create new
// section" path here at all (the house hero's zone count is fixed). See
// spec.md User Story 3 / contracts/admin-ui.md section 2.
export async function initializeSectionsPage(root) {
  let editing = null;

  const render = async () => {
    await requireAdmin();
    const sections = await fetchAllSectionsAdmin();

    // Re-resolve `editing` against the freshly-fetched list every render
    // (its stored reference may be stale after an update, or gone entirely
    // after a soft-delete) and default to the first section when nothing
    // is currently selected -- there is no "blank add-new" state to fall
    // back to any more.
    if (editing) {
      editing = sections.find(s => s.id === editing.id) || null;
    }
    if (!editing && sections.length > 0) {
      editing = sections[0];
    }

    const formValues = renderSectionFormFieldValues(editing);

    root.innerHTML = `
      <!-- Page Title -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-[#1A237E]">إدارة الأقسام (الرومات)</h1>
          <p class="text-sm text-[#75777E] mt-1">تعديل وترتيب وتفعيل وحذف أقسام المتجر التفاعلية الحالية -- لا يمكن إضافة قسم جديد من هنا.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Form Column (Left physically in RTL / Right logically) -->
        <div class="lg:col-span-1">
          ${!editing ? `
            <div class="bg-white border border-[#9E9E9E]/20 rounded-2xl p-6 shadow-sm text-center text-sm text-[#75777E]">
              اختر قسمًا للتعديل من القائمة.
            </div>
          ` : `
          <form class="bg-white border border-[#9E9E9E]/20 rounded-2xl p-6 shadow-sm flex flex-col gap-4 sticky top-24" id="section-form">
            <h2 class="font-bold text-lg text-[#1A237E] pb-2 border-b border-[#9E9E9E]/10">
              تعديل قسم: ${escapeHtml(editing.name)}
            </h2>

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">اسم القسم (بالعربية)</label>
              <input class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none" name="name" placeholder="مثال: رفايع المطبخ" value="${formValues.name}" required>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">الكلمة التعريفية للقسم (الوصف)</label>
              <textarea class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none h-20" name="description" placeholder="مثال: المجموعات المختارة بعناية لأثاثك المنزلي.">${formValues.description || 'المجموعات المختارة بعناية لأثاثك المنزلي.'}</textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">الترتيب</label>
              <input class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none" name="display_order" type="number" min="0" value="${editing.display_order ?? 0}">
            </div>

            <label class="flex items-center gap-2 text-sm font-semibold text-[#1A237E]">
              <input type="checkbox" name="is_active" class="rounded border-gray-300 text-[#0056B3] focus:ring-[#0056B3]" ${editing.is_active ? 'checked' : ''}>
              <span>القسم نشط (يظهر في واجهة المتجر)</span>
            </label>

            <div>
              ${renderIconPickerHTML(editing.icon_name, { special: { icon: 'Gift_Home.svg', label: 'مميز', hint: 'اختيار أيقونة يضع القسم في موقع خاص داخل مثلث البيت (الأعلى).' } })}
            </div>

            <div class="flex gap-2 mt-2">
              <button class="flex-grow bg-[#0056B3] hover:bg-[#004491] active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-1 shadow-md">
                <span class="material-symbols-outlined text-sm">save</span>
                <span>حفظ القسم</span>
              </button>
              <button type="button" class="bg-gray-100 hover:bg-gray-200 text-[#1A237E] font-bold py-2.5 px-4 rounded-xl transition-all text-sm" id="cancel-edit">
                إلغاء
              </button>
            </div>
          </form>
          `}
        </div>

        <!-- List Column -->
        <div class="lg:col-span-2">
          <div class="bg-white border border-[#9E9E9E]/20 rounded-2xl shadow-sm overflow-hidden">
            <div class="p-4 bg-gray-50 border-b border-[#9E9E9E]/10 flex justify-between items-center">
              <h3 class="font-bold text-[#1A237E] text-sm">الأقسام الحالية</h3>
              <span class="text-xs text-[#75777E]">${sections.length} قسم</span>
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
                <tbody class="divide-y divide-[#9E9E9E]/10 text-[#1A237E]">
                  ${sections.map((s, index) => renderSectionRow(s, index, iconSource(s.icon_name), s.is_active)).join('')}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    `;

    const form = root.querySelector('#section-form');

    if (form) {
      // Icon picker listener
      wireIconPicker(root, '#selected-icon-input');

      form.onsubmit = async e => {
        e.preventDefault();
        await requireAdmin();
        const rawData = Object.fromEntries(new FormData(form));
        let autoSlug = slugify(rawData.name || '');
        if (autoSlug.length < 2) {
          autoSlug = 'sec-' + Math.random().toString(36).substring(2, 7);
        } else if (autoSlug.length > 100) {
          autoSlug = autoSlug.substring(0, 100);
        }
        const data = {
          name: sanitizeInput(rawData.name || ''),
          description: sanitizeInput(rawData.description || 'المجموعات المختارة بعناية لأثاثك المنزلي.'),
          slug: autoSlug,
          icon_name: rawData.icon_name,
          display_order: Number(rawData.display_order) || 0,
          is_active: rawData.is_active === 'on',
        };
        try {
          // FR-004: editing is always an existing row here -- there is no
          // create branch. See the module-level comment above.
          await updateSection(editing.id, data);
          render();
        } catch (error) {
          alert(error.message);
        }
      };

      // Cancel editing -- discards any unsaved typed changes by
      // re-rendering the form from the stored `editing` row's actual
      // values. There is no "add new" state to fall back to, so this no
      // longer clears `editing`.
      const cancelBtn = root.querySelector('#cancel-edit');
      if (cancelBtn) {
        cancelBtn.onclick = () => render();
      }
    }

    root.querySelectorAll('[data-edit]').forEach(b => {
      b.onclick = () => {
        editing = sections.find(s => s.id === b.dataset.edit);
        render();
      };
    });

    root.querySelectorAll('[data-delete]').forEach(b => {
      b.onclick = async () => {
        if (confirm('هل تريد حذف هذا القسم؟ سيتم إخفاؤه فقط، ولا يمكن حذفه إذا كان يحتوي على منتجات نشطة.')) {
          try {
            await softDeleteSection(b.dataset.delete);
            if (editing?.id === b.dataset.delete) editing = null;
            render();
          } catch (error) {
            alert(error.message);
          }
        }
      };
    });
  };

  render();
}
