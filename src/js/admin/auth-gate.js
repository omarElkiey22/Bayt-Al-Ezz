import {supabase} from '../supabase-client.js';

export async function requireAdmin() {
  if (!supabase) {
    window.location.replace('login.html');
    throw new Error('Not authenticated');
  }
  const {data:{session}} = await supabase.auth.getSession();
  if (!session) {
    window.location.replace('login.html');
    throw new Error('Not authenticated');
  }
  const {data:isAdmin} = await supabase.rpc('is_admin');
  if (!isAdmin) {
    window.location.replace('login.html');
    throw new Error('Not authorized');
  }
  return true;
}

export async function redirectIfSignedIn() {
  if (!supabase) return;
  const {data:{session}} = await supabase.auth.getSession();
  if (session) {
    window.location.replace('dashboard.html');
    throw new Error('Already authenticated');
  }
}
