import { type User } from '@/typedefs/User'

export function isAdmin(user: User | null | undefined): boolean {
	if (!user?.roles) return false
	return user.roles.includes('admin') || user.roles.includes('superadmin')
}

export function isSuperAdmin(user: User | null | undefined): boolean {
	if (!user?.roles) return false
	return user.roles.includes('superadmin')
}
