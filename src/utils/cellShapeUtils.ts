interface CellShape {
    x: number;
    y: number;
    size: number;
}

export const makeCellShape = (x: number, y: number, size: number): CellShape[] => {
    const cells: CellShape[] = [];
    const halfSize = size / 2;

    // Center cell
    cells.push({ x, y, size });

    // Top cells
    cells.push({ x: x - size, y: y - size, size });
    cells.push({ x, y: y - size, size });
    cells.push({ x: x + size, y: y - size, size });

    // Middle cells
    cells.push({ x: x - size, y, size });
    cells.push({ x: x + size, y, size });

    // Bottom cells
    cells.push({ x: x - size, y: y + size, size });
    cells.push({ x, y: y + size, size });
    cells.push({ x: x + size, y: y + size, size });

    return cells;
};