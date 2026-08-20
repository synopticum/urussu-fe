// Appends the points to `path` with every vertex rounded. When closed, the
// first/last vertex is rounded too and the path is closed; otherwise the two
// endpoints stay sharp. Quadratic curves with the original vertex as control
// point are tangent to both edges at the trim points, so the path stays smooth.
import { Vector2 } from 'three';
import { Path as ThreePath } from 'three';

export const buildRoundedPath = (path: ThreePath, points: Vector2[], radius: number, closed: boolean) => {
    const n = points.length;
    if (n === 0) return;
    if (n < 3) {
        path.moveTo(points[0].x, points[0].y);
        if (n === 2) path.lineTo(points[1].x, points[1].y);
        return;
    }

    const trimAt = (i: number) => {
        const p = points[i];
        const prev = points[(i - 1 + n) % n];
        const next = points[(i + 1) % n];
        return Math.min(radius, p.distanceTo(prev) / 2, p.distanceTo(next) / 2);
    };
    // Arc endpoints: t back along the incoming edge, t along the outgoing
    const arcStart = (i: number, t: number) =>
        points[i].clone().add(points[(i - 1 + n) % n].clone().sub(points[i]).setLength(t));
    const arcEnd = (i: number, t: number) =>
        points[i].clone().add(points[(i + 1) % n].clone().sub(points[i]).setLength(t));

    if (closed) {
        const first = arcStart(0, trimAt(0));
        path.moveTo(first.x, first.y);
        for (let i = 0; i < n; i++) {
            const t = trimAt(i);
            const start = arcStart(i, t);
            const end = arcEnd(i, t);
            if (i > 0) path.lineTo(start.x, start.y);
            path.quadraticCurveTo(points[i].x, points[i].y, end.x, end.y);
        }
        path.closePath();
    } else {
        path.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < n - 1; i++) {
            const t = trimAt(i);
            const start = arcStart(i, t);
            const end = arcEnd(i, t);
            path.lineTo(start.x, start.y);
            path.quadraticCurveTo(points[i].x, points[i].y, end.x, end.y);
        }
        path.lineTo(points[n - 1].x, points[n - 1].y);
    }
};

// Web Mercator (EPSG:3857), same as Leaflet's default CRS: x = longitude,
// y = ln(tan(pi/4 + lat/2)) — the 180/pi factor keeps x and y in the same
// degree-like units. Northern latitudes are stretched by 1/cos(lat).
export const toWorld = (longitude: number, latitude: number): [number, number] => {
    const latRad = (latitude * Math.PI) / 180;
    return [longitude, Math.log(Math.tan(Math.PI / 4 + latRad / 2)) * (180 / Math.PI)];
};
