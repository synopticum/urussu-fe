export interface Dot {
    id: string;
    title: string;
    shortDescription: string;
    layer: string;
    coordinates: [number, number]; // [latitude, longitude]
}

export interface MapObject {
    id: string;
    house: string;
    street: string;
    description: string;
    coordinates: { latitude: number; longitude: number }[];
}

const API = 'http://localhost:8081/api/v1';

async function login(): Promise<string> {
    const loginRes = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'remove@remove.com', password: 'removeremove' }),
    });
    const { token } = await loginRes.json();
    return token;
}

export async function fetchDots(): Promise<Dot[]> {
    const token = await login();

    const dotsRes = await fetch(`${API}/dots`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const { dots } = await dotsRes.json();
    return dots;
}

export async function fetchObjects(): Promise<MapObject[]> {
    const token = await login();

    const objectsRes = await fetch(`${API}/objects`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await objectsRes.json();
    return Array.isArray(data) ? data : data.objects;
}
