export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

export const endpoints = {
    login: '/auth/login',
    logout: '/auth/logout',
    getCurrentUser: '/auth/me',

    getUsers: '/users',
    addUser: '/users',
    editUser: '/users/',
    deleteUser: '/users/',
    getUserById: '/users/',

    getRoles: '/roles',
    addRole: '/roles',
    editRole: '/roles/',
    deleteRole: '/roles/',
    getRoleById: '/roles/',

    getPermissions: '/permissions',
    addPermission: '/permissions',
    editPermission: '/permissions/',
    deletePermission: '/permissions/',
    getPermissionById: '/permissions/',
}