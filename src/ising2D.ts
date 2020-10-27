import * as global from './global';
import * as util from './util';

const gridWidth = 256;
const gridHeight = 256;

interface Cell {
    spin: number,
    energy: number
}

let data: Cell[] = [];
let ctx: CanvasRenderingContext2D;
let loop: NodeJS.Timeout;

export function init() {
    // Initial population of lattice with random spins
    for (let i = 0; i < gridHeight; i++) {
        for (let j = 0; j < gridWidth; j++) {
            data.push({
                spin: Math.round(Math.random()) * 2 - 1,
                energy: 0
            });
        }
    }

    // Then calculate energies
    for (let i = 0; i < data.length; i++) {
        data[i].energy = calcEnergy(i);
    }

    setUpCanvas();

    data.forEach(({ spin }, i) => {
        if (spin === 1) setCell(i, spin);
    })

    loop = setInterval(() => {
        for (let a = 0; a < 10000; a++) {
            let i = Math.floor(Math.random() * data.length);

            let deltaE = 2 * (global.j.value * data[i].spin * util.sum(Object.values(getNeighboringCells(i)).map(i => data[i].spin)) + global.h.value * data[i].spin)

            if (deltaE < 0 || Math.random() <= Math.exp(-deltaE / global.kT.value)) {
                data[i].spin *= -1;
                setCell(i, data[i].spin);
            }
        }
    }, 1);
}

export function terminate() {
    clearInterval(loop);
}

function setUpCanvas() {
    let canvas = document.createElement('canvas');
    canvas.width = gridWidth * 2;
    canvas.height = gridHeight * 2;
    canvas.style.position = 'absolute';
    canvas.style.height = '100%';
    canvas.style.maxHeight = '500px';
    canvas.style.left = '50%';
    canvas.style.top = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    document.getElementById('content').appendChild(canvas);
    canvas.style.width = `${canvas.clientHeight}px`;
    window.addEventListener('resize', () => {
        canvas.style.width = `${canvas.clientHeight}px`;
    });

    // Get canvas context
    ctx = canvas.getContext('2d');
}

function setCell(i: number, spin: number) {
    ctx.fillStyle = spin === -1 ? 'black' : 'white';
    ctx.fillRect(
        i % gridWidth * 2,
        Math.floor(i / gridWidth) * 2,
        2, 2
    );
}

function getNeighboringCells(i: number) {
    let row = Math.floor(i / gridWidth);

    let left = i % gridWidth - 1;
    if (left < 0) left += gridWidth;
    left += row * gridWidth;

    let right = i % gridWidth + 1;
    if (right > gridWidth - 1) right -= gridWidth;
    right += row * gridWidth;

    let up = i - gridWidth;
    if (up < 0) up += gridWidth * gridHeight;

    let down = i + gridWidth;
    if (down > gridWidth * gridHeight - 1) down -= gridWidth * gridHeight;

    return { left, right, up, down };
}

function calcEnergy(i: number) {
    let neighborSpins = Object.values(getNeighboringCells(i)).map(idx => data[idx].spin);
    return -global.j * data[i].spin * util.sum(neighborSpins);
}
