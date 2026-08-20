import { FormEvent } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useSnapshot } from 'valtio';
import { state } from './state';

const LoginPage = () => {
    const { email, password, error, loading } = useSnapshot(state);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        state.onSubmit();
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                background: '#fffaf0',
            }}
        >
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 280 }}>
                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => (state.email = e.target.value)}
                    style={{ padding: 8 }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => (state.password = e.target.value)}
                    style={{ padding: 8 }}
                />
                <button type="submit" disabled={loading} style={{ padding: 8 }}>
                    {loading ? 'Logging in…' : 'Log in'}
                </button>
                {error && <div style={{ color: 'crimson' }}>{error}</div>}
            </form>
        </div>
    );
};

export const Route = createFileRoute('/login/')({
    component: LoginPage,
});
