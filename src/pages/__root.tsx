import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { state } from './login/state';

export const Route = createRootRoute({
    beforeLoad: ({ location }) => {
        if (!state.isAuthenticated() && location.pathname !== '/login') {
            throw redirect({ to: '/login' });
        }
    },
    component: Outlet,
});
