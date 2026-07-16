import { fetchAllSectionsAdmin, createSection, updateSection, softDeleteSection } from '../sections-api.js';
import { slugify, sanitizeInput } from '../utils.js';
import { requireAdmin } from './auth-gate.js';

const ICONS = ['laundry.svg', 'kitchen-shelving.svg', 'paper-goods.svg', 'bathroom.svg', 'women.svg', 'men.svg', 'reception.svg', 'baby.svg', 'footwear.svg', 'vanity.svg', 'garage.svg', 'cleaning.svg', 'Gift_Home.svg', 'Medications.svg'];
const ICON_DIRECTORY = '../../../public/assets/icons/';
const DEFAULT_ICON = 'laundry.svg';

function iconSource(iconName) {
  return `${ICON_DIRECTORY}${ICONS.includes(iconName) ? iconName : DEFAULT_ICON}`;
}

export async function initializeSectionsPage(root) {
  let editing = null;

  const render = async () => {
    await requireAdmin();
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
              <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">الأيقونة (اختر من القائمة)</label>
              <input type="hidden" name="icon_name" id="selected-icon-input" value="${ICONS.includes(editing?.icon_name) ? editing.icon_name : DEFAULT_ICON}" required>
              <div class="grid grid-cols-4 gap-2" id="icon-picker">
                ${ICONS.map(icon => {
                  const isSelected = editing?.icon_name === icon || (!editing && icon === DEFAULT_ICON);
                  const isGift = icon === 'Gift_Home.svg';
                  const baseClass = isGift
                    ? `icon-btn p-2 border-2 rounded-xl flex flex-col items-center justify-center transition-all relative ${isSelected ? 'border-[#1E2154] bg-[#1E2154]/10 ring-1 ring-[#1E2154]' : 'border-amber-400 hover:bg-amber-50 hover:border-amber-500'}`
                    : `icon-btn p-2 border rounded-xl flex items-center justify-center transition-all ${isSelected ? 'border-[#0056B3] bg-[#0056B3]/10 ring-1 ring-[#0056B3]' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`;
                  return `
                  <button type="button" data-icon="${icon}" class="${baseClass}" title="${isGift ? 'موضع خاص: قسم عروض البيت (المثلث العلوي)' : icon}">
                    ${isGift ? `<span class="absolute -top-1.5 right-1 text-[8px] font-bold bg-amber-400 text-white px-1 rounded leading-tight">مميز</span>` : ''}
                    <img src="${iconSource(icon)}" class="w-16 h-16 object-contain pointer-events-none" alt="${icon}">
                  </button>
                `}).join('')}
              </div>
              ${ICONS.includes(editing?.icon_name) && editing?.icon_name === 'Gift_Home.svg' || !editing ? '' : ''}
              <p class="text-[10px] text-amber-600 mt-1.5 flex items-center gap-1">
                <span class="text-sm">⚠️</span>
                اختيار أيقونة يضع القسم في موقع خاص داخل مثلث البيت (الأعلى).
              </p>
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
                        <img src="${iconSource(s.icon_name)}" class="w-16 h-16 rounded object-contain" alt="">
                      </td>
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

    const form = root.querySelector('#section-form');

    // Icon picker listener
    root.querySelectorAll('.icon-btn').forEach(btn => {
      btn.onclick = () => {
        root.querySelectorAll('.icon-btn').forEach(b => {
          b.classList.remove('border-[#0056B3]', 'bg-[#0056B3]/10', 'ring-1', 'ring-[#0056B3]');
          b.classList.add('border-gray-200', 'hover:bg-gray-50', 'hover:border-gray-300');
        });
        btn.classList.add('border-[#0056B3]', 'bg-[#0056B3]/10', 'ring-1', 'ring-[#0056B3]');
        btn.classList.remove('border-gray-200', 'hover:bg-gray-50', 'hover:border-gray-300');
        root.querySelector('#selected-icon-input').value = btn.dataset.icon;
      };
    });

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
        ...rawData,
        name: sanitizeInput(rawData.name || ''),
        slug: autoSlug,
      };
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
        if (confirm('هل تريد حذف هذا القسم نهائياً؟ سيتم حذف القسم والمنتجات غير النشطة التابعة له، ولا يمكن حذفه إذا كان يحتوي على منتجات نشطة.')) {
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
