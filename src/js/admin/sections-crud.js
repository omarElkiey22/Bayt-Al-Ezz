import { fetchAllSectionsAdmin, createSection, updateSection, softDeleteSection } from '../sections-api.js';
import { slugify } from '../utils.js';

export async function initializeSectionsPage(root) {
  let editing = null;

  const render = async () => {
    const sections = await fetchAllSectionsAdmin();

    root.innerHTML = `
      <!-- Page Title -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-[#1A237E]">إدارة الأقسام (الرومات)</h1>
          <p class="text-sm text-[#75777E] mt-1">إضافة وتعديل وحذف أقسام المتجر التفاعلية.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Form Column (Left physically in RTL / Right logically) -->
        <div class="lg:col-span-1">
          <form class="bg-white border border-[#9E9E9E]/20 rounded-2xl p-6 shadow-sm flex flex-col gap-4 sticky top-24" id="section-form">
            <h2 class="font-bold text-lg text-[#1A237E] pb-2 border-b border-[#9E9E9E]/10">
              ${editing ? 'تعديل قسم' : 'إضافة قسم جديد'}
            </h2>
            
            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">اسم القسم (بالعربية)</label>
              <input class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none" name="name" placeholder="مثال: رفايع المطبخ" value="${editing?.name || ''}" required>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">الرابط (Slug)</label>
              <input class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none bg-gray-50" name="slug" placeholder="kitchen-shelving" value="${editing?.slug || ''}" required>
              <p class="text-[10px] text-[#75777E] mt-1">يُستخدم كرابط لصفحة القسم.</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">اسم ملف الأيقونة</label>
              <input class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-[#1A237E] focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3] focus:outline-none" name="icon_name" placeholder="kitchen-shelf.svg" value="${editing?.icon_name || ''}" required>
            </div>

            <div class="flex gap-2 mt-2">
              <button class="flex-grow bg-[#0056B3] hover:bg-[#004491] active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-1 shadow-md">
                <span class="material-symbols-outlined text-sm">save</span>
                <span>حفظ القسم</span>
              </button>
              ${editing ? `
                <button type="button" class="bg-gray-100 hover:bg-gray-200 text-[#1A237E] font-bold py-2.5 px-4 rounded-xl transition-all text-sm" id="cancel-edit">
                  إلغاء
                </button>
              ` : ''}
            </div>
          </form>
        </div>

        <!-- List Column -->
        <div class="lg:col-span-2">
          <div class="bg-white border border-[#9E9E9E]/20 rounded-2xl shadow-sm overflow-hidden">
            <div class="p-4 bg-gray-50 border-b border-[#9E9E9E]/10 flex justify-between items-center">
              <h3 class="font-bold text-[#1A237E] text-sm">الأقسام الحالية</h3>
              <span class="text-xs text-[#75777E]">${sections.length} قسم نشط</span>
            </div>

            <div class="overflow-x-auto w-full">
              <table class="w-full text-right text-sm">
                <thead class="bg-gray-50 border-b border-[#9E9E9E]/20 text-[#75777E] font-bold">
                  <tr>
                    <th class="p-4">الترتيب</th>
                    <th class="p-4">اسم القسم</th>
                    <th class="p-4">الرابط</th>
                    <th class="p-4">الأيقونة</th>
                    <th class="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#9E9E9E]/10 text-[#1A237E]">
                  ${sections.map((s, index) => `
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="p-4 font-semibold text-gray-400">#${index + 1}</td>
                      <td class="p-4 font-bold">${s.name}</td>
                      <td class="p-4">
                        <span class="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">${s.slug}</span>
                      </td>
                      <td class="p-4 text-[#75777E] text-xs">${s.icon_name}</td>
                      <td class="p-4">
                        <div class="flex items-center justify-center gap-2">
                          <button class="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-[#0056B3]/10 transition-colors" data-edit="${s.id}" title="تعديل">
                            <span class="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button class="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors" data-delete="${s.id}" title="حذف">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    `;

    // Input slugify listener
    const form = root.querySelector('#section-form');
    form.name.oninput = () => {
      if (!editing) form.slug.value = slugify(form.name.value);
    };

    form.onsubmit = async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      if (editing && data.slug !== editing.slug && !confirm('تغيير الرابط قد يكسر روابط المنتجات القديمة. هل تريد المتابعة؟')) return;
      try {
        if (editing) {
          await updateSection(editing.id, data);
        } else {
          await createSection({ ...data, display_order: sections.length });
        }
        editing = null;
        render();
      } catch (error) {
        alert(error.message);
      }
    };

    // Cancel editing
    const cancelBtn = root.querySelector('#cancel-edit');
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        editing = null;
        render();
      };
    }

    root.querySelectorAll('[data-edit]').forEach(b => {
      b.onclick = () => {
        editing = sections.find(s => s.id === b.dataset.edit);
        render();
      };
    });

    root.querySelectorAll('[data-delete]').forEach(b => {
      b.onclick = async () => {
        if (confirm('هل تريد حذف القسم حذفاً آمناً؟ لن يتم حذف المنتجات ولكنها ستصبح بلا قسم.')) {
          try {
            await softDeleteSection(b.dataset.delete);
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
