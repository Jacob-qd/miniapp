import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import router, { __testing } from '../userManagement.js';

describe('userManagement route helpers', () => {
  const {
    flattenMenuIds,
    findMenuNode,
    removeMenuNode,
    ensureRoleActionConsistency,
    recalcRoleMenuCoverage,
    buildOverview,
    sanitizeUserResponse,
    resetState,
    getState
  } = __testing;

  beforeEach(() => {
    resetState();
  });

  it('flattens menu ids including nested entries without duplicates', () => {
    const { menus } = getState();
    const ids = flattenMenuIds(menus);

    assert(ids.includes('dashboard'));
    assert(ids.includes('dashboard-realtime'));
    assert(ids.includes('consultations'));
    assert.strictEqual(new Set(ids).size, ids.length);
  });

  it('finds nested menu nodes and returns the parent reference', () => {
    const { menus } = getState();
    const info = findMenuNode(menus, 'dashboard-realtime');

    assert(info);
    assert.strictEqual(info?.node.id, 'dashboard-realtime');
    assert.strictEqual(info?.parent?.id, 'dashboard');
  });

  it('removes menu nodes while keeping siblings intact', () => {
    const { menus } = getState();
    const removed = removeMenuNode(menus, 'dashboard-analysis');

    assert.strictEqual(removed, true);
    const dashboard = findMenuNode(menus, 'dashboard');
    assert.strictEqual(dashboard?.node.children?.some(child => child.id === 'dashboard-analysis'), false);
    assert.strictEqual(dashboard?.node.children?.some(child => child.id === 'dashboard-realtime'), true);
  });

  it('trims role action permissions to the allowed subset', () => {
    ensureRoleActionConsistency('solutions', ['view', 'publish']);
    const { roles } = getState();

    const admin = roles.find(role => role.id === 'role-admin');
    const ops = roles.find(role => role.id === 'role-ops');

    assert.deepEqual(admin?.action_permissions.solutions, ['view', 'publish']);
    assert.deepEqual(ops?.action_permissions.solutions, ['view', 'publish']);
  });

  it('removes menu references from roles after deletion and recalculation', () => {
    const state = getState();
    const removed = removeMenuNode(state.menus, 'consultations');
    assert.strictEqual(removed, true);

    ensureRoleActionConsistency('consultations', []);
    recalcRoleMenuCoverage();

    const support = state.roles.find(role => role.id === 'role-support');
    assert.ok(support);
    assert(!support.menu_ids.includes('consultations'));
    assert.strictEqual(support.action_permissions.consultations, undefined);
  });

  it('builds overview metrics that reflect state changes', () => {
    const base = buildOverview();
    const state = getState();
    const newUser = {
      id: 'user-spec',
      username: 'spec-user',
      email: 'spec@example.com',
      role_id: state.roles[0]?.id ?? 'role-admin',
      status: 'inactive' as const,
      department: 'QA',
      position: 'Reviewer',
      login_count: 0,
      created_at: new Date().toISOString(),
      remark: 'added by test'
    };

    state.users.push(newUser);

    const next = buildOverview();
    assert.strictEqual(next.totalUsers, base.totalUsers + 1);
    assert.strictEqual(next.pendingUsers, base.pendingUsers + 1);
    assert(next.recentUsers.map(user => user.id).includes('user-spec'));
  });

  it('sanitizes user responses by normalising optional fields', () => {
    const user = {
      id: 'user-sanitize',
      username: 'sanitize',
      email: 'sanitize@example.com',
      role_id: 'role-admin',
      status: 'active' as const,
      login_count: 3,
      created_at: new Date().toISOString(),
      remark: undefined,
      tags: undefined
    };

    const sanitized = sanitizeUserResponse(user);
    assert.deepEqual(sanitized.tags, []);
    assert.strictEqual(sanitized.login_count, 3);
  });

  it('restores the initial state snapshot when resetState is invoked', () => {
    const state = getState();
    state.users.length = 0;
    state.roles.length = 0;
    state.menus.length = 0;

    resetState();

    assert(getState().users.length > 0);
    assert(getState().roles.length > 0);
    assert(getState().menus.length > 0);
  });

  it('keeps the router export available for runtime usage', () => {
    assert.ok(router);
  });
});
