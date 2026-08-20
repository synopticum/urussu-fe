import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { state } from './login/state';

export const Route = createRootRoute({
    beforeLoad: ({ location }) => {
        const isPublic = location.pathname === '/login' || location.pathname.startsWith('/errors/');

        if (!state.isAuthenticated() && !isPublic) {
            throw redirect({ to: '/login' });
        }
    },
    component: Outlet,
});
