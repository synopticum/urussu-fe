import { proxy } from 'valtio';
import { router } from '../../router';
import { AuthServiceService, OpenAPI, type v1LoginResponse } from '@/openapi/client';
import { setUnauthorizedHandler } from '@/openapi/client/core/request';

OpenAPI.BASE = import.meta.env.API_URL;
setUnauthorizedHandler(() => state.handleUnauthorized());

const TOKEN_KEY = 'urussu:token';

class State {
    email = '';
    password = '';
    error: string | null = null;
    loading = false;

    // NOTE: all methods must stay regular methods, not arrow
    // properties — an arrow function would capture the raw (unproxied)
    // instance as `this`, and its assignments would bypass valtio's proxy
    // traps, so nothing re-renders.
    async login() {
        const { token } = (await AuthServiceService.authServiceLogin({
            body: { email: this.email, password: this.password },
        })) as v1LoginResponse;

        if (!token) {
            throw new Error('No token in login response');
        }

        this.setToken(token);
    }

    initAuth(): void {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) OpenAPI.TOKEN = token;
    }

    isAuthenticated(): boolean {
        return Boolean(OpenAPI.TOKEN);
    }

    handleUnauthorized(): void {
        this.clearToken();
        void router.navigate({ to: '/errors/unauthorized' });
    }

    async onSubmit(): Promise<void> {
        this.error = null;
        this.loading = true;

        try {
            await this.login();
            await router.navigate({ to: '/' });
        } catch {
            this.error = 'Login failed. Check your email and password.';
        } finally {
            this.loading = false;
        }
    }

    private setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
        OpenAPI.TOKEN = token;
    }

    private clearToken(): void {
        localStorage.removeItem(TOKEN_KEY);
        OpenAPI.TOKEN = undefined;
    }
}

export const state = proxy(new State());
