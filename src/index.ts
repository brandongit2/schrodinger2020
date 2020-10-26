import Slider from './Slider'
import * as util from './util';

import './index.scss';

const gridWidth = 400;
const gridHeight = 400;
const j = 100000;
const curieTemp = 2 * j / (Math.log(1 + Math.sqrt(2)));
let kT = new Slider('Temperature', 1, 2 * curieTemp, 1, 'K');
let h = new Slider('Field Strength', -1.5, 1.5, 0, 'T');

interface Cell {
    spin: number,
    energy: number
}

let data: Cell[] = [];

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
    return -j * data[i].spin * util.sum(neighborSpins);

}

function meanEnergy() {
    return 0.5 * util.sum(data.map(n => n.energy)) / data.length;
}

function meanMag() {
    return util.sum(data.map(n => n.spin)) / data.length;
}

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

window.addEventListener('load', () => {
    // Create canvas element
    let canvas = document.createElement('canvas');
    canvas.width = gridWidth;
    canvas.height = gridHeight;
    document.getElementById('content').appendChild(canvas);
    canvas.style.width = `${canvas.clientHeight}px`;
    window.addEventListener('resize', () => {
        canvas.style.width = `${canvas.clientHeight}px`;
    });

    // Get canvas context
    let ctx = canvas.getContext('2d');

    let setCell = (i: number, spin: number) => {
        ctx.fillStyle = spin === -1 ? 'black' : 'white';
        ctx.fillRect(
            i % gridWidth,
            Math.floor(i / gridWidth),
            1, 1
        );
    }

    data.forEach(({ spin }, i) => {
        if (spin === 1) setCell(i, spin);
    })

    setInterval(() => {
        for (let a = 0; a < 10000; a++) {
            let i = Math.floor(Math.random() * data.length);

            let deltaE = 2 * (j * data[i].spin * util.sum(Object.values(getNeighboringCells(i)).map(i => data[i].spin)) + h.value * data[i].spin)

            if (deltaE < 0 || Math.random() <= Math.exp(-deltaE / kT.value)) {
                data[i].spin *= -1;
                setCell(i, data[i].spin);
            }
        }
    }, 1);
});
