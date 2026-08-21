import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { authStore } from '@/stores';

export const Route = createRootRoute({
    beforeLoad: ({ location }) => {
        const isPublic = location.pathname === '/login' || location.pathname.startsWith('/errors/');

        if (!authStore.isAuthenticated() && !isPublic) {
            throw redirect({ to: '/login' });
        }
    },
    component: Outlet,
});
