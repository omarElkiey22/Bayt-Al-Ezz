export function getQueryParam(param){return new URLSearchParams(window.location.search).get(param)}
export function isValidUUID(value){return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value||'')}
export function slugify(value){return String(value).trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-+|-+$/g,'').replace(/-+/g,'-')}
export function formatPrice(value){return `${Math.round(Number(value)||0)} ج.م`}
export function resolveVariant(variant,product){return {...variant,price:variant.price_override??product.base_price,image:variant.image_url||product.primary_image_url}}
export function buildOrderText(items,date=new Date()){
  const active=items.filter(item=>!item.is_stale);
  const day=String(date.getDate()).padStart(2,'0');
  const month=String(date.getMonth()+1).padStart(2,'0');
  const numbers=['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
  const rows=active.map((item,i)=>{
    const num=numbers[i]||`${i+1}.`;
    const subtotal=item.price*item.quantity;
    return `${num} *${item.product_name}*\n   📌 الاختيار: ${item.variant_label}\n   🔢 الكمية: ${item.quantity} قطعة\n   💰 ${formatPrice(item.price)} × ${item.quantity} = *${formatPrice(subtotal)}*`;
  }).join('\n\n');
  const total=active.reduce((sum,item)=>sum+item.price*item.quantity,0);
  return `🛒 *طلب جديد من بيت العز* 🏠\n━━━━━━━━━━━━━━━━━\n📅 التاريخ: ${day}/${month}/${date.getFullYear()}\n━━━━━━━━━━━━━━━━━\n\n📦 *تفاصيل الطلب:*\n\n${rows}\n\n━━━━━━━━━━━━━━━━━\n💵 *إجمالي قيمة الطلب: ${formatPrice(total)}*\n━━━━━━━━━━━━━━━━━\n\n✅ من فضلك أكد لي تفاصيل الشحن والتوصيل.`;
}
export function makeWhatsAppUrl(number,text){return `https://wa.me/${String(number||'').replace(/\D/g,'')}?text=${encodeURIComponent(text)}`}
export function sanitizeInput(text){return typeof text==='string'?text.replace(/<[^>]*>?/gm,''):text}
