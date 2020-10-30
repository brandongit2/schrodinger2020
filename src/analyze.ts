import * as d3 from 'd3';

import * as global from './global';
import * as ising2D from './ising2D';
import * as ising3D from './ising3D';

const graphWidth = 500;
const graphHeight = 200;

enum PlotTypes {
    Scatter, Line
}

let margin = {
    top: 10,
    left: 50,
    right: 10,
    bottom: 30
};

let type: PlotTypes = PlotTypes.Line;
let data: Array<[number, number]> = [];
let svg = d3.create('svg')
    .attr('width', String(graphWidth))
    .attr('height', String(graphHeight));
let svgMain = svg.append('g')
    .attr('class', 'main')
    .attr('clip-path', 'url(#clip)');
let xAxis = d3.scaleLinear()
    .domain([-5, 5])
    .range([margin.left, graphWidth - margin.right]);
let yAxis = d3.scaleLinear()
    .domain([-5, 5])
    .range([graphHeight - margin.bottom, margin.top]);
let loop: NodeJS.Timeout;

let xAccessor: () => number;
let yAccessor: () => number;

function meanEnergy() {
    if (global.in3D) {
        return ising3D.meanEnergy();
    } else {
        return ising2D.meanEnergy();
    }
}

function meanMagnetization() {
    if (global.in3D) {
        return ising3D.meanMagnetization();
    } else {
        return ising2D.meanMagnetization();
    }
}

export function init() {
    svg.append('g')
        .attr('class', 'graph-axis x')
        .attr('transform', `translate(0, ${graphHeight - margin.bottom})`)
        .call(d3.axisBottom(xAxis).ticks(5).tickSizeOuter(0));
    svg.append('g')
        .attr('class', 'graph-axis y')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yAxis).ticks(6).tickSizeOuter(0));

    svg.append('defs')
        .append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('x', margin.left)
        .attr('y', margin.top)
        .attr('width', graphWidth - margin.left - margin.right)
        .attr('height', graphHeight - margin.bottom - margin.top);

    document.getElementById('graphs-button').addEventListener('click', () => {
        let arrow = document.getElementById('graphs-button').firstElementChild;
        if (document.getElementById('graphs').classList.contains('open')) {
            arrow.classList.remove('fa-chevron-down');
            arrow.classList.add('fa-chevron-up');
        } else {
            arrow.classList.remove('fa-chevron-up');
            arrow.classList.add('fa-chevron-down');
        }
        document.getElementById('graphs').classList.toggle('open');
    });

    let dropdown = document.getElementById('graphs-dropdown');

    let items: {
        [key: string]: {
            type: PlotTypes,
            xAccessor: () => number,
            yAccessor: () => number
        }
    } = {
        'Mean energy vs. Time': {
            type: PlotTypes.Line,
            xAccessor: Date.now,
            yAccessor: meanEnergy
        },
        'Mean magentization vs. Temperature': {
            type: PlotTypes.Scatter,
            xAccessor: () => global.kT.value,
            yAccessor: meanMagnetization
        }
    };

    for (let item of Object.keys(items)) {
        let option = document.createElement('option');
        option.setAttribute('value', item);
        option.innerHTML = item;
        dropdown.appendChild(option);
    }

    function updateGraph(value: string) {
        type = items[value].type;

        switch (type) {
            case PlotTypes.Line: {
                svgMain.selectAll('circle').remove();
                break;
            }
            case PlotTypes.Scatter: {
                svgMain.selectAll('path').remove();
                break;
            }
        }

        setX(items[value].xAccessor);
        setY(items[value].yAccessor);
    }
    updateGraph(Object.keys(items)[0]);

    dropdown.addEventListener('change', (evt) => {
        // @ts-ignore
        updateGraph(evt.target.value);
    });

    document.getElementById('clear-graph').addEventListener('click', () => {
        data = [];
    });

    document.getElementById('graphs-content').appendChild(svg.node());

    play();
}

function setX(val: () => number) {
    xAccessor = val;
    data = [];
}

function setY(val: () => number) {
    yAccessor = val;
    data = [];
}

export function play() {
    loop = setInterval(() => {
        let x = xAccessor();
        let y = yAccessor();
        if (x && y) data.push([x, y]);

        switch (type) {
            case PlotTypes.Line: {
                svgMain.selectAll('path').data([data])
                    .join('path')
                    .attr('fill', 'none')
                    .attr('stroke', 'white')
                    .attr('stroke-width', 1.5)
                    .attr('stroke-linejoin', 'round')
                    .attr('stroke-linecap', 'round')
                    .attr('d', d3.line()
                        .x(d => xAxis(d[0]))
                        .y(d => yAxis(d[1]))
                    );
                break;
            }
            case PlotTypes.Scatter: {
                svgMain.selectAll('circle').data(data)
                    .join('circle')
                    .attr('fill', 'white')
                    .attr('cx', d => xAxis(d[0]))
                    .attr('cy', d => yAxis(d[1]))
                    .attr('r', 1);
            }
        }

        xAxis.domain(d3.extent(data.map(d => d[0])));
        d3.selectAll('g.graph-axis.x').call(d3.axisBottom(xAxis).ticks(5).tickSizeOuter(0));

        yAxis.domain(d3.extent(data.map(d => d[1])));
        d3.selectAll('g.graph-axis.y').call(d3.axisLeft(yAxis).ticks(6).tickSizeOuter(0));

        // Clear old data points
        if (data.length > 4000) {
            data = data.slice(data.length - 4000, data.length);
        }
    }, PlotTypes.Line ? 10 : 100);
}

export function pause() {
    clearInterval(loop);
}
