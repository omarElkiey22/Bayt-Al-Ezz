import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Regression guard for the /cso Finding #1 vulnerability: every RLS write
// (and the invoices read) policy on the sensitive tables was scoped to
// `TO authenticated`, which in Supabase means "any signed-up user", not
// "the merchant admin". This test parses the migration files and asserts
// that the *final* definition of each sensitive policy is gated behind
// public.is_admin() rather than a bare authenticated-role check.
//
// There is no local Supabase/Postgres instance in this environment to run
// a real integration test against live RLS, so this is a static assertion
// on migration SQL text -- it proves the policy text is wrong/right, not
// that Postgres enforces it correctly at runtime. Applying the resulting
// migration against a real (or `supabase start` local) project and
// verifying with two real accounts remains a manual follow-up.

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'supabase', 'migrations');

function finalPolicies() {
  const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  const policyRe = /CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+(?:public\.)?([a-zA-Z_][a-zA-Z0-9_.]*)\s+FOR\s+(\w+)\s+TO\s+(\w+)\s+USING\s*\(([\s\S]*?)\)(?:\s*WITH\s+CHECK\s*\(([\s\S]*?)\))?\s*;/gi;
  const policies = new Map();
  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    let match;
    policyRe.lastIndex = 0;
    while ((match = policyRe.exec(sql))) {
      const [, name, table, op, role, using] = match;
      const key = `${table.toLowerCase()}::${name.toLowerCase()}`;
      policies.set(key, { file, table, name, op, role, using: using.trim() });
    }
  }
  return policies;
}

// The real, currently-live (table, policy name) pairs -- verified by reading
// every migration that touches them. As of 012_admin_role_access_control.sql
// it is the last writer for all eight; before that fix, 011 was last writer
// for everything except the storage bucket policy (untouched since 001).
const SENSITIVE_POLICIES = [
  ['merchant_settings', 'merchant settings writes'],
  ['sections', 'merchant sections writes'],
  ['products', 'merchant products writes'],
  ['product_variants', 'merchant variants writes'],
  ['invoices', 'merchant invoices writes'],
  ['invoices', 'merchant invoices readable'],
  ['customers', 'Admins can manage customers'],
  ['storage.objects', 'merchant asset write'],
];

describe('RLS admin gating (regression guard for /cso Finding #1)', () => {
  const policies = finalPolicies();

  it.each(SENSITIVE_POLICIES)('%s policy "%s" is gated behind public.is_admin()', (table, name) => {
    const key = `${table.toLowerCase()}::${name.toLowerCase()}`;
    const policy = policies.get(key);
    expect(policy, `expected to find policy "${name}" on ${table} in the migrations`).toBeTruthy();
    expect(policy.using.toLowerCase()).toContain('is_admin(');
  });
});
