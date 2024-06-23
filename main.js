const settings = {
    width: NaN,
    height: NaN,
    resolution: 5,
};

const cellType = {
    dead: 0,
    normal: 1,
    fungi: 2,
    whiteGlobule: 3,
}

const cellColor = {
    [cellType.dead]: '#270049',
    [cellType.normal]: '#5aff00',
    [cellType.fungi]: '#9b00df',
    [cellType.whiteGlobule]: 'white',
}

const cellProb = {
    [cellType.whiteGlobule]: 0.2,
    [cellType.fungi]: 0.2,
    [cellType.normal]: 0.2,
    [cellType.dead]: 0.4,
}

function prob(prob) {
    return Math.random() < prob;
}

function randomCell() {
    for (const type of Object.keys(cellProb)) {
        if (prob(cellProb[type])) {
            return Number(type);
        }
    }
    return cellType.dead;
}

function makeGrid(cols, rows) {
    return new Array(cols)
        .fill(null)
        .map(() => new Array(rows)
            .fill(null)
            .map(() => randomCell())
        )
}

function drawGrid(ctx, grid, cols, rows) {
    ctx.clearRect(0, 0, cols, rows);
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const cell = grid[i][j];
            const color = cellColor[cell];
            ctx.fillStyle = color;
            ctx.fillRect(i * settings.resolution, j * settings.resolution, settings.resolution, settings.resolution);
        }
    }
}

function applyRules(currentCell, neighbors) {

    // normal born
    if (currentCell === cellType.dead && neighbors[cellType.normal] === 3) {
        return cellType.normal;
    }

    // fungi born
    if (currentCell === cellType.dead && neighbors[cellType.fungi] === 3) {
        return cellType.fungi;
    }

    // normal death
    if (currentCell === cellType.normal && (neighbors[cellType.normal] < 2 || neighbors[cellType.normal] > 3)) {
        return cellType.dead;
    }

    // fungi death
    if (currentCell === cellType.fungi && (neighbors[cellType.fungi] < 2 || neighbors[cellType.fungi] > 3)) {
        return cellType.dead;
    }

    // normal death by fungi neighbors
    if (currentCell === cellType.normal && neighbors[cellType.fungi] > 2) {
        return cellType.dead;
    }

    // fungi death by white globule neighbors
    if (currentCell === cellType.fungi && neighbors[cellType.whiteGlobule] > 2) {
        return cellType.dead;
    }

    // white globule born
    if (currentCell === cellType.dead && neighbors[cellType.whiteGlobule] === 3) {
        return cellType.whiteGlobule;
    }

    // white globule death
    if (currentCell === cellType.whiteGlobule && (neighbors[cellType.whiteGlobule] < 2 || neighbors[cellType.whiteGlobule] > 3)) {
        return cellType.dead;
    }

    // neutral
    return currentCell;
}

function computeNextGeneration(currentGeneration, cols, rows) {

    const copy = currentGeneration.map((row) => [...row]);

    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            const currentCell = copy[col][row];
            const neighbors = {
                [cellType.normal]: 0,
                [cellType.fungi]: 0,
                [cellType.whiteGlobule]: 0,
                [cellType.dead]: 0,
            };

            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    if (i === 0 && j === 0) {
                        continue;
                    }
                    const x = col + i;
                    const y = row + j;

                    if (x >= 0 && y >= 0 && x < cols && y < rows) {
                        const currentNeighbor = copy[x][y];
                        if (currentNeighbor !== cellType.dead) {
                            neighbors[currentNeighbor] += 1;
                        }
                    }
                }
            }

            copy[col][row] = applyRules(currentCell, neighbors);
        }
    }

    return copy;
}

async function loop(ctx, currentGeneration, cols, rows) {
    // compute next generation
    const nextGeneration = computeNextGeneration(currentGeneration, cols, rows);

    // draw entire matrix
    drawGrid(ctx, nextGeneration, cols, rows);

    // call loop again
    requestAnimationFrame(() => {
        loop(ctx, nextGeneration, cols, rows);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const offset = settings.resolution * 5;
    settings.width = window.innerWidth - offset;
    settings.height = window.innerHeight - offset;


    const cols = Math.floor(settings.width / settings.resolution);
    const rows = Math.floor(settings.height / settings.resolution);

    canvas.width = settings.width;
    canvas.height = settings.height;

    const firstGeneration = makeGrid(cols, rows);

    void loop(ctx, firstGeneration, cols, rows);

});
