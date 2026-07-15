import {CART_KEY} from './constants.js';
const memory=new Map();
const storage=()=>globalThis.localStorage||{getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)};
let lastActionTime = 0;
function throttleAction(action) {
  return function(...args) {
    const now = Date.now();
    if (now - lastActionTime < 300) return getCartItems();
    lastActionTime = now;
    return action(...args);
  };
}
export function getCartItems(){try{const items=JSON.parse(storage()?.getItem(CART_KEY)||'[]');return Array.isArray(items)?items:[]}catch{return []}}
function save(items){storage()?.setItem(CART_KEY,JSON.stringify(items));return items}
export function addToCart(product_id,variant_id,variant_label,price,variant_image,product_name){const items=getCartItems();const found=items.find(item=>item.variant_id===variant_id);if(found)found.quantity+=1;else items.push({product_id,variant_id,variant_label,price:Math.round(price),variant_image,product_name,quantity:1,is_stale:false});return save(items)}
export const updateQuantity = throttleAction((variantId,newQuantity)=>{const items=getCartItems();const item=items.find(entry=>entry.variant_id===variantId);if(!item)return items;if(Number(newQuantity)<=0)return removeFromCart(variantId);item.quantity=Math.max(1,Math.floor(Number(newQuantity)||1));return save(items)});
export const removeFromCart = throttleAction((variantId)=>{return save(getCartItems().filter(item=>item.variant_id!==variantId))});
export function clearCart(){storage()?.removeItem(CART_KEY)}
export function calculateCartTotals(items){const active=items.filter(item=>!item.is_stale);return {subtotal:active.reduce((sum,item)=>sum+item.price*item.quantity,0),itemCount:active.reduce((sum,item)=>sum+item.quantity,0),hasStaleItems:items.some(item=>item.is_stale)}}
