import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { authStore } from '@/stores';

authStore.initAuth();

export default function App() {
    return <RouterProvider router={router} />;
}
