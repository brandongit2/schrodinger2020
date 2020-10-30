import Slider from './Slider';

export const j = new Slider('Interaction Strength', -10, 10, 4, 'J');
export let kT = new Slider('Temperature', 1, 30, 10, '');
export let h = new Slider('Field Strength', -8, 8, 0, 'T');

export let isRunning = true;
export function playPause() {
    isRunning = !isRunning;
}

export let in3D = false;
export function toggle3D() {
    in3D = !in3D;
}
