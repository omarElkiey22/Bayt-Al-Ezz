import {supabase} from '../supabase-client.js';
export async function requireAdmin(){if(!supabase){location.href='login.html';return false}const {data:{session}}=await supabase.auth.getSession();if(!session){location.href='login.html';return false}return true}
export async function redirectIfSignedIn(){if(!supabase)return;const {data:{session}}=await supabase.auth.getSession();if(session)location.href='dashboard.html'}
