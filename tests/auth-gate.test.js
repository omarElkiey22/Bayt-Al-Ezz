import { expect, test, describe, vi, beforeEach } from 'vitest';
import { requireAdmin, redirectIfSignedIn } from '../src/js/admin/auth-gate.js';
import { supabase } from '../src/js/supabase-client.js';

vi.mock('../src/js/supabase-client.js', () => ({
  supabase: {
    auth: {
      getSession: vi.fn()
    },
    rpc: vi.fn()
  }
}));

describe('Auth Gate logic', () => {
  let locationReplaceSpy;

  beforeEach(() => {
    vi.resetAllMocks();
    globalThis.window = { location: { replace: vi.fn() } };
    locationReplaceSpy = globalThis.window.location.replace;
  });

  test('requireAdmin redirects to login.html if no session', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } });
    
    await expect(requireAdmin()).rejects.toThrow('Not authenticated');
    expect(locationReplaceSpy).toHaveBeenCalledWith('login.html');
  });

  test('requireAdmin returns true if session exists and is_admin() RPC resolves truthy', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: { user: 'foo' } } });
    supabase.rpc.mockResolvedValueOnce({ data: true });

    const result = await requireAdmin();
    expect(result).toBe(true);
    expect(supabase.rpc).toHaveBeenCalledWith('is_admin');
    expect(locationReplaceSpy).not.toHaveBeenCalled();
  });

  test('requireAdmin redirects to login.html if session exists but is_admin() RPC resolves falsy', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: { user: 'foo' } } });
    supabase.rpc.mockResolvedValueOnce({ data: false });

    await expect(requireAdmin()).rejects.toThrow('Not authorized');
    expect(locationReplaceSpy).toHaveBeenCalledWith('login.html');
  });

  test('redirectIfSignedIn redirects to dashboard.html if session exists', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: { user: 'foo' } } });
    
    await expect(redirectIfSignedIn()).rejects.toThrow('Already authenticated');
    expect(locationReplaceSpy).toHaveBeenCalledWith('dashboard.html');
  });
});
