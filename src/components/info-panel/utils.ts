import { SelectedEntity } from '../rtf-app/types';

export const getTitle = (selectedEntity: SelectedEntity) => {
    const { type } = selectedEntity;
    let title = '';

    if (type === 'dot' || type === 'path') {
        title = selectedEntity.data.title;
    }

    if (type === 'object') {
        const { street, house } = selectedEntity.data;

        if (!street && !house) {
            title = 'Объект без адреса';
            return title;
        }

        title = `${street}, ${house}`;
    }

    return title;
};