import { describe, it, expect, vi, beforeAll } from 'vitest';

// supabase-client.js has two things that make it awkward to import for
// real in a Vitest 'node' environment: (1) a static top-level import of
// the Supabase SDK from a remote CDN URL, which Node's ESM loader refuses
// outright ("Only URLs with a scheme in: file and data are supported");
// and (2) module-top-level reads of `window`/`localStorage` to decide
// mock-vs-real mode and resolve API credentials (a bare
// `localStorage.getItem(...)` with no `typeof` guard), neither of which
// exists as a global here. Mock the CDN specifier and stub both globals
// before importing dynamically, rather than adding a browser-environment
// dependency just for this one module.
vi.mock('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.4/+esm', () => ({
  createClient: () => ({}),
}));

let MockQueryBuilder;

beforeAll(async () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
  globalThis.window = { location: { hostname: 'localhost', search: '' } };

  ({ MockQueryBuilder } = await import('../src/js/supabase-client.js'));
});

// Regression guard for the .gt()/.not() support added so fetchActiveCompanies()
// and fetchProductsByCompany() (companies-api.js) work against the local mock
// Supabase client -- this is real parsing/comparison logic with no other test
// coverage anywhere in the repo.

describe('MockQueryBuilder.gt', () => {
  it('keeps only rows strictly greater than the threshold', async () => {
    globalThis.localStorage.setItem('sb_mock_gt_products', JSON.stringify([
      { id: '1', wholesale_price: 0 },
      { id: '2', wholesale_price: 5 },
      { id: '3', wholesale_price: null },
    ]));

    const { data } = await new MockQueryBuilder('gt_products').select('*').gt('wholesale_price', 0).execute();
    expect(data.map(r => r.id)).toEqual(['2']);
  });
});

describe('MockQueryBuilder.not', () => {
  const seed = () => {
    globalThis.localStorage.setItem('sb_mock_not_products', JSON.stringify([
      { id: 'a', section_id: 's1' },
      { id: 'b', section_id: 's2' },
      { id: 'c', section_id: null },
    ]));
  };

  it("excludes rows whose column is in a '(a,b,c)' list", async () => {
    seed();
    const { data } = await new MockQueryBuilder('not_products').select('*').not('section_id', 'in', '(s1,s2)').execute();
    expect(data.map(r => r.id)).toEqual(['c']);
  });

  it('treats an empty list as excluding nothing', async () => {
    seed();
    const { data } = await new MockQueryBuilder('not_products').select('*').not('section_id', 'in', '()').execute();
    expect(data.map(r => r.id).sort()).toEqual(['a', 'b', 'c']);
  });

  it('excludes null when negating is-null', async () => {
    seed();
    const { data } = await new MockQueryBuilder('not_products').select('*').not('section_id', 'is', null).execute();
    expect(data.map(r => r.id).sort()).toEqual(['a', 'b']);
  });
});
