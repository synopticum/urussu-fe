import { proxy } from 'valtio';
import { EntityDetailsView } from './types';

export const state = proxy({
    entityId: null as string | null,
    view: 'info' as EntityDetailsView,
    photo: null as { entityId: string; url: string } | null,
});
