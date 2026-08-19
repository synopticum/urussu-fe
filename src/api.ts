export interface Dot {
    id: string;
    title: string;
    shortDescription: string;
    layer: string;
    coordinates: [number, number];
}

const API = 'http://localhost:8081/api/v1';

export async function fetchDots(): Promise<Dot[]> {
    const loginRes = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'asdfasdf' }),
    });
    const { token } = await loginRes.json();

    const dotsRes = await fetch(`${API}/dots`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const { dots } = await dotsRes.json();
    return dots;
}
