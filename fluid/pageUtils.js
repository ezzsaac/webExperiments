export const canvas = document.getElementById("Canvas")
const templateButton = document.getElementById("Button");
const templateSlider = document.getElementById("Slider");
const templateSelect = document.getElementById("Select");
const numberField = document.getElementById("numberField");




export function addButtonTemplate(text, onClick) {
    const dynamicOptions = document.getElementById("dynamicOptions");
    const button = document.createElement("button");
    button.className = "Button";
    button.textContent = text;
    button.addEventListener("click", onClick);

    dynamicOptions.appendChild(button);
}

export function addSliderTemplate(labelText, min, max, value, step, onInput) {
    const dynamicOptions = document.getElementById("dynamicOptions");
    const container = document.createElement("div");
    container.style.marginBottom = "10px";

    const label = document.createElement("div");
    label.className = "sliderLabel";
    label.textContent = `${labelText}: ${value}`;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = Number(min);
    slider.max = Number(max);
    slider.step = Number(step);
    slider.className = "Slider";
    slider.value = Number(value);

    slider.addEventListener("input", () => {
        label.textContent = `${labelText}: ${slider.value}`;
        onInput(slider.value);
    });

    container.appendChild(label);
    container.appendChild(slider);

    dynamicOptions.appendChild(container);
}

export function addSelectTemplate(labelText, optionsArray, onChange) {
    const dynamicOptions = document.getElementById("dynamicOptions");
    const container = document.createElement("div");

    const label = document.createElement("label");
    label.textContent = labelText;

    const select = document.createElement("select");
    select.className = "Select";

    optionsArray.forEach(optionValue => {
        const option = document.createElement("option");
        option.value = optionValue;
        option.textContent = optionValue;
        select.appendChild(option);
    });

    select.addEventListener("change", () => {
        onChange(select.value);
    });

    container.appendChild(label);
    container.appendChild(select);

    dynamicOptions.appendChild(container);
}

function resizeCanvas() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const width = Math.floor(windowWidth / 20) * 20 - 20;
    const height = Math.floor(windowHeight / 20) * 20 - 20;

    canvas.width = width;
    canvas.height = height;
}

function minimizeOptions() {
    var x = document.getElementById("optionFields");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
window.minimizeOptions = minimizeOptions;

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "Header")) {
        document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        let newTop = elmnt.offsetTop - pos2;
        let newLeft = elmnt.offsetLeft - pos1;

        const wrapper = elmnt.parentElement;
        const maxLeft = wrapper.clientWidth - elmnt.offsetWidth;
        const maxTop = wrapper.clientHeight - elmnt.offsetHeight;

        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newLeft > maxLeft) newLeft = maxLeft;
        if (newTop > maxTop) newTop = maxTop;

        elmnt.style.left = newLeft + "px";
        elmnt.style.top = newTop + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

dragElement(document.getElementById("options"));
