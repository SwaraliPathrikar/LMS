import { UserRole } from '@/types/library';

/**
 * Role-Based Access Control (RBAC) utility functions
 * Provides permission checking and access control helpers
 */

export type Permission = 
  | 'view_dashboard'
  | 'manage_resources'
  | 'manage_members'
  | 'approve_requests'
  | 'manage_circulation'
  | 'view_reports'
  | 'manage_settings'
  | 'manage_fees'
  | 'view_audit_logs'
  | 'manage_access_control';

// Define role-based permissions
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'view_dashboard',
    'manage_resources',
    'manage_members',
    'approve_requests',
    'manage_circulation',
    'view_reports',
    'manage_settings',
    'manage_fees',
    'view_audit_logs',
    'manage_access_control',
  ],
  librarian: [
    'view_dashboard',
    'manage_resources',
    'manage_members',
    'manage_circulation',
    'view_reports',
    'manage_settings',
    'manage_fees',
  ],
  citizen: [
    'view_dashboard',
  ],
};

/**
 * Check if a user role has a specific permission
 */
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return rolePermissions[role]?.includes(permission) ?? false;
};

/**
 * Check if a user role has any of the specified permissions
 */
export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(role, permission));
};

/**
 * Check if a user role has all of the specified permissions
 */
export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(role, permission));
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: UserRole): Permission[] => {
  return rolePermissions[role] ?? [];
};

/**
 * Check if a role can access a specific feature
 */
export const canAccessFeature = (role: UserRole, feature: string): boolean => {
  const featurePermissions: Record<string, Permission[]> = {
    'resource-management': ['manage_resources'],
    'member-management': ['manage_members'],
    'request-approval': ['approve_requests'],
    'circulation': ['manage_circulation'],
    'reports': ['view_reports'],
    'settings': ['manage_settings'],
    'fees': ['manage_fees'],
    'audit-logs': ['view_audit_logs'],
    'access-control': ['manage_access_control'],
  };

  const requiredPermissions = featurePermissions[feature] ?? [];
  return hasAllPermissions(role, requiredPermissions);
};
