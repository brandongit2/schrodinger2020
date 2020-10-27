/*
CONVENTIONS:
- Right-hand coordinate system.
- All directions are given assuming the observer is facing in the -Z direction with Y up.
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as global from './global';
import * as util from './util';

const gridWidth = 5; // X direction
const gridHeight = 5; // Y direction
const gridDepth = 5; // Z direction

interface Cell {
    spin: number,
    energy: number
}

// X then Y then Z
let data: Cell[] = [];

let loop: number;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;

let geom = new THREE.BoxBufferGeometry(1, 1, 1);
let mat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    opacity: 0.3,
    transparent: true,
    side: THREE.DoubleSide
});
let box = new THREE.InstancedMesh(geom, mat, gridWidth * gridHeight * gridDepth);
let dummyMatrix = new THREE.Matrix4();

export function init() {
    // Initial population of lattice with random spins
    for (let i = 0; i < gridDepth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            for (let k = 0; k < gridWidth; k++) {
                data.push({
                    spin: Math.round(Math.random()) * 2 - 1,
                    energy: 0
                });
            }
        }
    }

    // Then calculate energies
    // for (let i = 0; i < data.length; i++) {
    //     data[i].energy = calcEnergy(i);
    // }

    setUpCanvas();
    scene.add(box);

    // Lights
    let light = new THREE.PointLight(0x0000ff, 100);
    light.position.set(-200, 100, 200);
    scene.add(light)

    data.forEach(({ spin }, i) => {
        setCell(i, spin);
    })

    function animate() {
        loop = requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}

export function terminate() {
    window.cancelAnimationFrame(loop);
}

function setUpCanvas() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0px';
    document.getElementById('content').appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 10000);

    let controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set((gridWidth - 1) / 2, (gridHeight - 1) / 2, (gridDepth - 1) / 2);
    controls.update();
}

function setCell(i: number, spin: number) {
    if (spin === 1) {
        dummyMatrix.setPosition(
            i % (gridWidth * gridHeight) % gridHeight,
            Math.floor(i % (gridWidth * gridHeight) / gridHeight),
            Math.floor(i / (gridWidth * gridHeight))
        );
    } else {
        dummyMatrix.setPosition(100000, 0, 0); // Out of view
    }

    box.setMatrixAt(i, dummyMatrix);
    box.instanceMatrix.needsUpdate = true;
}

function getNeighboringCells(i: number) {
    let layer = Math.floor(i / gridWidth / gridHeight);
    let row = Math.floor(i % (gridWidth * gridHeight) / gridWidth);

    let left = i % (gridWidth * gridHeight) % gridWidth - 1;
    if (left < 0) left += gridWidth;
    left += layer * gridWidth * gridHeight * row * gridWidth;

    let right = i % (gridWidth * gridHeight) % gridWidth + 1;
    if (right > gridWidth - 1) right -= gridWidth;
    right += layer * gridWidth * gridHeight * row * gridWidth;

    let up = i % (gridWidth * gridHeight) + gridWidth;
    if (up > gridWidth * gridHeight - 1) up -= gridWidth * gridHeight;
    up += layer * gridWidth * gridHeight;

    let down = i % (gridWidth * gridHeight) - gridWidth;
    if (down < 0) down += gridWidth * gridHeight;
    down += layer * gridWidth * gridHeight;

    let forward = i - gridWidth * gridHeight;
    if (forward < 0) forward += gridWidth * gridHeight * gridDepth;

    let backward = i + gridWidth * gridHeight;
    if (backward > gridWidth * gridHeight * gridDepth - 1) backward -= gridWidth * gridHeight * gridDepth;

    return { left, right, up, down, forward, backward };
}

function calcEnergy(i: number) {
    let neighborSpins = Object.values(getNeighboringCells(i)).map(idx => data[idx].spin);
    return -global.j * data[i].spin * util.sum(neighborSpins);
}
