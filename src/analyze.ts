import * as d3 from 'd3';

import * as ising2D from './ising2D';
import * as ising3D from './ising3D';

const graphWidth = 500;
const graphHeight = 200;

class Graph {
    private static margin = {
        top: 10,
        left: 50,
        right: 10,
        bottom: 30
    };

    data: Array<[number, number]> = [];
    svg = d3.create('svg')
        .attr('width', String(graphWidth))
        .attr('height', String(graphHeight));
    xAxis: d3.ScaleLinear<number, number>;
    yAxis: d3.ScaleLinear<number, number>;

    xAccessor: () => number;
    yAccessor: () => number;

    constructor(xMin: number, xMax: number, yMin: number, yMax: number) {
        this.xAxis = d3.scaleLinear()
            .domain([xMin, xMax])
            .range([Graph.margin.left, graphWidth - Graph.margin.right]);
        this.yAxis = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([graphHeight - Graph.margin.bottom, Graph.margin.top]);

        this.svg.append('g')
            .attr('class', 'graph-axis x')
            .attr('transform', `translate(0, ${graphHeight - Graph.margin.bottom})`)
            .call(d3.axisBottom(this.xAxis).ticks(5).tickSizeOuter(0));
        this.svg.append('g')
            .attr('class', 'graph-axis y')
            .attr('transform', `translate(${Graph.margin.left}, 0)`)
            .call(d3.axisLeft(this.yAxis).ticks(6).tickSizeOuter(0));

        this.svg.append('defs')
            .append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('x', Graph.margin.left)
            .attr('y', Graph.margin.top)
            .attr('width', graphWidth - Graph.margin.left - Graph.margin.right)
            .attr('height', graphHeight - Graph.margin.bottom - Graph.margin.top);

        let main = this.svg.append('g')
            .attr('class', 'main')
            .attr('clip-path', 'url(#clip)');

        setInterval(() => {
            this.data.push([this.xAccessor(), this.yAccessor()]);

            main.selectAll('path.line').data([this.data])
                .join('path')
                .attr('class', 'line')
                .attr('fill', 'none')
                .attr('stroke', 'white')
                .attr('stroke-width', 1.5)
                .attr('stroke-linejoin', 'round')
                .attr('stroke-linecap', 'round')
                .attr('d', d3.line()
                    .x(d => this.xAxis(d[0]))
                    .y(d => this.yAxis(d[1]))
                );

            this.xAxis.domain([Date.now() - 10000, Date.now()]);
            d3.selectAll('g.graph-axis.x').call(d3.axisBottom(this.xAxis).ticks(5).tickSizeOuter(0));

            this.yAxis.domain(d3.extent(this.data.map(d => d[1])));
            d3.selectAll('g.graph-axis.y').call(d3.axisLeft(this.yAxis).ticks(6).tickSizeOuter(0));
        }, 10);

        setInterval(() => {
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i][0] < Date.now() - 10000) {
                    this.data.splice(i, 1);
                }
            }
        })
    }

    setX(val: () => number) {
        this.xAccessor = val;
        this.data = [];
    }

    setY(val: () => number) {
        this.yAccessor = val;
        this.data = [];
    }
}

export function init() {
    document.getElementById('analyze-button').addEventListener('click', () => {
        if (document.getElementById('analyze').classList.contains('open')) {
            document.getElementById('arrow').classList.remove('fa-chevron-down');
            document.getElementById('arrow').classList.add('fa-chevron-up');
        } else {
            document.getElementById('arrow').classList.remove('fa-chevron-up');
            document.getElementById('arrow').classList.add('fa-chevron-down');
        }
        document.getElementById('analyze').classList.toggle('open');
    });

    document.getElementById('add-graph').addEventListener('click', addGraph);
}

function addGraph() {
    let container = document.createElement('div');
    container.classList.add('graph-container');

    let xData: { [key: string]: () => number } = {
        'time': Date.now
    };
    let yData: { [key: string]: () => number } = {
        'mean energy (2D)': ising2D.meanEnergy,
        'mean energy (3D)': ising3D.meanEnergy
    };

    let graph = new Graph(-2, 2, -5, 5);

    let str = document.createElement('p');

    function createSpan(txt: string) {
        let span = document.createElement('span');
        span.innerHTML = txt;
        return span;
    }

    function createDropdown(items: string[], onChange: (newValue: string) => void) {
        items.unshift('---');
        let dropdown = document.createElement('select');

        for (let item of items) {
            let option = document.createElement('option');
            option.setAttribute('value', item);
            option.innerHTML = item;
            dropdown.appendChild(option);
        }

        dropdown.addEventListener('change', (evt) => {
            // @ts-ignore
            onChange(evt.target.value);
        })

        return dropdown;
    }

    function updateDropdown1(newValue: string) {
        graph.setY(yData[newValue]);
    }
    function updateDropdown2(newValue: string) {
        graph.setX(xData[newValue])
    }

    str.appendChild(createSpan('Graph '));
    str.appendChild(createDropdown(Object.keys(yData), updateDropdown1));
    str.appendChild(createSpan(' against '));
    str.appendChild(createDropdown(Object.keys(xData), updateDropdown2));
    container.appendChild(str);

    container.appendChild(graph.svg.node());

    document.getElementById('graphs').appendChild(container);
    document.getElementById('graphs').style.height = `${container.clientHeight}px`;
}
