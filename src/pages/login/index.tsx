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
        <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-[#fffaf0] p-4">
            <form
                onSubmit={onSubmit}
                className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-8 shadow-sm"
            >
                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => (state.email = e.target.value)}
                    className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-black placeholder-neutral-400 outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    required
                    value={password}
                    onChange={(e) => (state.password = e.target.value)}
                    className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-black placeholder-neutral-400 outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? 'Входим…' : 'Войти'}
                </button>
                {error && <div className="text-center text-sm text-red-600">{error}</div>}
            </form>
        </div>
    );
};

export const Route = createFileRoute('/login/')({
    component: LoginPage,
});
