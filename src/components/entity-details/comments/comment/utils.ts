const formatter = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeStyle: 'short' });

// Intl renders the long date as "21 августа 2026 г. в 08:58"; spell out "года"
export const formatDate = (value: string) => formatter.format(new Date(value)).replace(' г. ', ' года ');
