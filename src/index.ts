import * as analyze from './analyze';
import * as ising2D from './ising2D';
import * as ising3D from './ising3D';

import './index.scss';

function init() {
    ising2D.init();
    analyze.init();
    document.getElementById('three').addEventListener('click', switchTo3D);
}

function switchTo2D() {
    ising3D.terminate();

    document.getElementById('mask').classList.toggle('switch');
    document.getElementById('three').addEventListener('click', switchTo3D);
    document.getElementById('two').removeEventListener('click', switchTo2D);
    document.getElementById('content').innerHTML = '';

    ising2D.init();
}

function switchTo3D() {
    ising2D.terminate();

    document.getElementById('mask').classList.toggle('switch');
    document.getElementById('two').addEventListener('click', switchTo2D);
    document.getElementById('three').removeEventListener('click', switchTo3D);
    document.getElementById('content').innerHTML = '';

    ising3D.init();
}

window.addEventListener('load', () => {
    init();
});
