const content = document.getElementById("content");
let barId = 1;

function renderBar() {
    const barEle = document.getElementById("bar_" + barId);

    let meter = 0;
    const interval = setInterval(() => {
        meter += 2;

        barEle.style.width = meter * 10 + "%";
        barEle.style.backgroundColor = getColor(meter)
        if (meter === 10) {
            clearInterval(interval);

            barId++;
            addProgressBar();
        }
    }, 1000);
}
renderBar();

function addProgressBar() {
    const progressEle = document.createElement("div");
    progressEle.classList.add("progress");

    const barEle = document.createElement("div");
    barEle.classList.add("bar");
    barEle.id = "bar_" + barId
    progressEle.appendChild(barEle);

    content.appendChild(progressEle)
    renderBar();
}

function getColor(value) {
    if (value <= 2) return "red"
    else if (value <= 4) return "orange"
    else if (value <= 6) return "yellow"
    else if (value <= 8) return "lime"
    else return "green"
}