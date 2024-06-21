function makeGrid(cols, rows) {
    return new Array(cols)
        .fill(null)
        .map(() => new Array(rows)
            .fill(null)
            .map(() => Number(Math.round(Math.random() * 100) < 20))
        )
}

function drawGrid(ctx, grid, cols, rows, resolution) {
    ctx.clearRect(0, 0, cols, rows);
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const cell = grid[i][j];
            const color = cell ? '#5aff00' : '#270049';
            ctx.fillStyle = color;
            ctx.fillRect(i * resolution, j * resolution, resolution, resolution);
        }
    }
}

function computeNextGeneration(currentGeneration, cols, rows) {

    const copy = currentGeneration.map((row) => [...row]);

    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            const currentCell = copy[col][row];
            let sumNeighbors = 0;

            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    if (i === 0 && j === 0) {
                        continue;
                    }
                    const x = col + i;
                    const y = row + j;

                    if (x >= 0 && y >= 0 && x < cols && y < rows) {
                        const currentNeighbor = copy[x][y];
                        sumNeighbors += currentNeighbor;
                    }
                }
            }

            // apply rules
            if (currentCell === 0 && sumNeighbors === 3) {
                copy[col][row] = 1;
            } else if (currentCell === 1 && (sumNeighbors < 2 || sumNeighbors > 3)) {
                copy[col][row] = 0;
            }
        }
    }

    return copy;
}

function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}

async function loop(ctx, currentGeneration, cols, rows, resolution) {
    // compute next generation
    const nextGeneration = computeNextGeneration(currentGeneration, cols, rows);

    // draw entire matrix
    drawGrid(ctx, nextGeneration, cols, rows, resolution);

    // await delay(200);

    // call loop again
    requestAnimationFrame(() => {
        loop(ctx, nextGeneration, cols, rows, resolution);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const settings = {
        width: 700,
        height: 700,
        resolution: 5,
    };

    const cols = Math.floor(settings.width / settings.resolution);
    const rows = Math.floor(settings.height / settings.resolution);

    canvas.width = settings.width;
    canvas.height = settings.height;

    const firstGeneration = makeGrid(cols, rows);

    loop(ctx, firstGeneration, cols, rows, settings.resolution);

});
