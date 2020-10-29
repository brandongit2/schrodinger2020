import Slider from './Slider';

export const j = 300;
export let kT = new Slider('Temperature', 1, 2000, 297.15, 'K');
export let h = new Slider('Field Strength', -100, 100, 0, 'T');
export let speed = new Slider('Speed', 1, 10, 5);
