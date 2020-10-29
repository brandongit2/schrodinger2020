export function init() {
    document.getElementById('analyze').addEventListener('click', () => {
        document.getElementById('analyze-content').classList.toggle('visible');
    });
}
