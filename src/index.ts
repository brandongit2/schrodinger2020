import './index.scss';

const gridWidth = 1000;
const gridHeight = 1000;
const j = 1;
const k = 1.38065e-23;
let T = 298;

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
    if (down > gridWidth * gridHeight) down -= gridWidth * gridHeight;

    return { left, right, up, down };
}

window.addEventListener('load', () => {
    let data: number[] = [];
    for (let i = 0; i < gridHeight; i++) {
        for (let j = 0; j < gridWidth; j++) {
            data.push(Math.round(Math.random()) * 2 - 1);
        }
    }

    let canvas = document.createElement('canvas');
    canvas.width = gridWidth;
    canvas.height = gridHeight;

    document.body.appendChild(canvas);
    let ctx = canvas.getContext('2d');

    let fl = (n: number) => Math.floor(n);
    let cl = (n: number) => Math.ceil(n);

    let setCell = (i: number, spin: number) => {
        ctx.fillStyle = spin === -1 ? 'white' : 'black';
        ctx.fillRect(
            i % gridWidth,
            Math.floor(i / gridWidth),
            1, 1
        );
    }

    ctx.fillStyle = 'black';
    data.forEach((spin, i) => {
        if (spin === 1) setCell(i, spin);
    })

    setInterval(() => {
        let time = performance.now();
        for (let a = 0; a < 1000; a++) {
            let i = Math.floor(Math.random() * data.length);

            let deltaE = 2 * j * data[i] * Object.values(getNeighboringCells(i)).map(i => data[i]).reduce((acc, cur) => acc + cur, 0);

            if (deltaE < 0 || Math.random() <= Math.exp(-deltaE / k / T)) {
                data[i] *= -1;
                setCell(i, data[i]);
            }
        }
        document.getElementById('debug').innerHTML = String(performance.now() - time);
    }, 1);
});
