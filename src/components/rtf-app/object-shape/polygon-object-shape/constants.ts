// Corner rounding, in world units (degrees): each vertex is trimmed back
// along both adjacent edges and replaced by a curve, like a CSS
// border-radius. Clamped per corner to half of the shorter adjacent edge
// so rounding on tiny or sliver shapes never overlaps itself. Polygons and
// paths use different radii.
export const CORNER_RADIUS = 0.05;
