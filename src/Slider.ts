const sliderWidth = 150;
const sliderHeight = 20;

export default class Slider {
    value: number;
    min: number;
    max: number;
    private units: string;
    private inside: HTMLElement;
    private valueText: HTMLElement;

    constructor(name: string, min: number, max: number, value: number, units: string = '') {
        this.value = value;
        this.min = min;
        this.max = max;
        this.units = units;

        let outside = document.createElement('div');
        outside.style.position = 'relative';
        outside.style.width = `${sliderWidth}px`;
        outside.style.height = `${sliderHeight}px`;
        outside.style.margin = '0px 10px';
        outside.style.background = '#222';

        outside.addEventListener('mousedown', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();

            let change = (evt: MouseEvent) => {
                if (evt.buttons === 1) {
                    let newValue = this.value + evt.movementX * (max - min) / sliderWidth / 2;
                    if (newValue < min) newValue = min;
                    if (newValue > max) newValue = max;
                    this.value = newValue;
                    this.update();
                }
            }
            window.addEventListener('mousemove', change)

            window.addEventListener('mouseup', () => {
                window.removeEventListener('mousemove', change);
            });
        });

        this.valueText = document.createElement('span');
        this.valueText.style.position = 'absolute';
        this.valueText.style.top = '50%';
        this.valueText.style.left = '5px';
        this.valueText.style.transform = 'translate(0px, -50%)';
        // @ts-ignore
        this.valueText.style.mixBlendMode = 'difference';
        this.valueText.innerHTML = `${value} ${units}`;
        outside.appendChild(this.valueText);

        this.inside = document.createElement('div');
        this.inside.style.background = 'white';
        this.inside.style.height = '100%';
        outside.appendChild(this.inside);

        let label = document.createElement('span');
        label.innerHTML = `${name}: `;

        let container = document.createElement('div');
        container.setAttribute('class', 'control');
        container.appendChild(label);
        container.appendChild(outside);

        document.getElementById('controls').appendChild(container);
        this.update();
    }

    update() {
        this.inside.style.width = `${(this.value - this.min) / (this.max - this.min) * sliderWidth}px`;
        this.valueText.innerHTML = `${Math.round(this.value * 1e3) / 1e3} ${this.units}`;
    }
}
