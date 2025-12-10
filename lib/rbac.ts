// Middleware for role-based access control
export function checkRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole)
}

export function canAccessOwnData(userId: number, resourceUserId: number): boolean {
  return userId === resourceUserId
}

export function canAccessAsAdmin(userRole: string): boolean {
  return userRole === 'Admin'
}

export function canAccessAsCoach(userRole: string): boolean {
  return userRole === 'Coach' || userRole === 'Admin'
}

export function canAccessAsNurse(userRole: string): boolean {
  return userRole === 'Nurse' || userRole === 'Admin'
}

export function canAccessAsStudent(userRole: string): boolean {
  return userRole === 'Student' || userRole === 'Admin'
}

export const ROLES = {
  ADMIN: 'Admin',
  STUDENT: 'Student',
  COACH: 'Coach',
  NURSE: 'Nurse',
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]

export interface RolePermissions {
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
  scope: 'all' | 'own' | 'assigned'
}

export function getPermissions(role: UserRole, resource: string): RolePermissions {
  // Admin has full access to everything
  if (role === ROLES.ADMIN) {
    return {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      scope: 'all',
    }
  }

  // Student permissions
  if (role === ROLES.STUDENT) {
    if (['goals', 'fitness-logs', 'appointments'].includes(resource)) {
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: false,
        scope: 'own',
      }
    }
    if (resource === 'health-records') {
      return {
        canCreate: false,
        canRead: true,
        canUpdate: false,
        canDelete: false,
        scope: 'own',
      }
    }
  }

  // Coach permissions
  if (role === ROLES.COACH) {
    if (resource === 'training-plans') {
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        scope: 'own',
      }
    }
    if (resource === 'fitness-reviews') {
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: false,
        scope: 'assigned',
      }
    }
    if (resource === 'fitness-logs') {
      return {
        canCreate: false,
        canRead: true,
        canUpdate: false,
        canDelete: false,
        scope: 'assigned',
      }
    }
  }

  // Nurse permissions
  if (role === ROLES.NURSE) {
    if (['appointments', 'medical-records'].includes(resource)) {
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: false,
        scope: 'assigned',
      }
    }
  }

  // Default: no permissions
  return {
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false,
    scope: 'own',
  }
}
