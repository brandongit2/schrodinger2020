/*
CONVENTIONS:
- Right-hand coordinate system.
- All directions are given assuming the observer is facing in the -Z direction with Y up.
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';

import * as global from './global';
import * as util from './util';

const gridWidth = 50; // X direction
const gridHeight = 50; // Y direction
const gridDepth = 50; // Z direction

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

let geom = new THREE.BoxBufferGeometry();
let mat = new THREE.MeshMatcapMaterial({
    // @ts-ignore
    matcap: (new EXRLoader()).setDataType(THREE.UnsignedByteType).load('basic_side.exr')
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
    let light1 = new THREE.DirectionalLight('#0938e0', 2);
    light1.position.set(-20, 10, 0).normalize();
    light1.target.position.set(0, 0, 0);
    scene.add(light1);

    let light2 = new THREE.DirectionalLight('#0938e0', 0.8);
    light2.position.set(10, -20, 0).normalize();
    light2.target.position.set(0, 0, 0);
    scene.add(light2);

    data.forEach(({ spin }, i) => {
        setCell(i, spin);
    })

    function animate() {
        for (let a = 0; a < 10000; a++) {
            let i = Math.floor(Math.random() * data.length);

            let deltaE;
            try {
                deltaE = 2 * (global.j * data[i].spin * util.sum(Object.values(getNeighboringCells(i)).map(i => data[i].spin)) + global.h.value * data[i].spin);
            } catch { console.log(i) }

            if (deltaE < 0 || Math.random() <= Math.exp(-deltaE / global.kT.value)) {
                data[i].spin *= -1;
                setCell(i, data[i].spin);
            }
        }

        renderer.render(scene, camera);
        loop = requestAnimationFrame(animate);
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
    camera.position.set(gridWidth / 2, gridHeight / 2, -gridDepth);

    let controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set((gridWidth - 1) / 2, (gridHeight - 1) / 2, (gridDepth - 1) / 2);
    controls.update();

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
    });
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
    left += layer * gridWidth * gridHeight + row * gridWidth;

    let right = i % (gridWidth * gridHeight) % gridWidth + 1;
    if (right > gridWidth - 1) right -= gridWidth;
    right += layer * gridWidth * gridHeight + row * gridWidth;

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
