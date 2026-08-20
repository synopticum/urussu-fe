import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { state } from './pages/login/state';

state.initAuth();

export default function App() {
    return <RouterProvider router={router} />;
}
