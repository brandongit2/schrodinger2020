import * as analyze from './analyze';
import * as global from './global';
import * as ising2D from './ising2D';
import * as ising3D from './ising3D';

import '@fortawesome/fontawesome-free/scss/fontawesome.scss';
import '@fortawesome/fontawesome-free/scss/solid.scss';
import './index.scss';

function init() {
    ising2D.init();
    analyze.init();
    document.getElementById('three').addEventListener('click', switchTo3D);

    document.getElementById('play-pause').addEventListener('click', () => {
        if (global.isRunning) {
            analyze.pause();
            ising2D.pause();
            ising3D.pause();

            document.getElementById('play-pause').firstElementChild.classList.remove('fa-pause');
            document.getElementById('play-pause').firstElementChild.classList.add('fa-play');
            console.log('pause')
        } else {
            analyze.play();
            ising2D.play();
            ising3D.play();

            document.getElementById('play-pause').firstElementChild.classList.remove('fa-play');
            document.getElementById('play-pause').firstElementChild.classList.add('fa-pause');
            console.log('play')
        }

        global.playPause();
    })
}

function switchTo2D() {
    ising3D.pause();

    document.getElementById('mask').classList.toggle('switch');
    document.getElementById('three').addEventListener('click', switchTo3D);
    document.getElementById('two').removeEventListener('click', switchTo2D);
    document.getElementsByClassName('canvas')[0].remove();

    ising2D.init();

    global.toggle3D();
}

function switchTo3D() {
    ising2D.pause();

    document.getElementById('mask').classList.toggle('switch');
    document.getElementById('two').addEventListener('click', switchTo2D);
    document.getElementById('three').removeEventListener('click', switchTo3D);
    document.getElementsByClassName('canvas')[0].remove();

    ising3D.init();

    global.toggle3D();
}

window.addEventListener('load', () => {
    init();
});
