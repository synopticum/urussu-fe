import { proxy } from 'valtio';

export const state = proxy({
    view: 'info' as 'info' | 'comments',
});
