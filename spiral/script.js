const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const templateButton = document.getElementById("templateButton");
const templateSlider = document.getElementById("templateSlider");
const drawSpiralButton = document.getElementById("drawSpiralButton");
const cellSizeField = document.getElementById("cellSizeId");
const spiralAngleId = document.getElementById("spiralAngleId");
const xCell = document.getElementById("xId");
const yCell = document.getElementById("yId");

const canvasW = canvas.width;
const canvasH = canvas.height;

function drawDot(x, y, r) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.fillStyle = "white";
	ctx.fill();
	ctx.lineWidth = 0;
	ctx.strokeStyle = "white";
	ctx.stroke();
}

function drawCell(phi, l, c) {
	let x = l * Math.cos(Math.PI * (phi / 180)) + 800;
	let y = l * Math.sin(Math.PI * (phi / 180)) + 450;
	//drawDot(x, y, 2);
	let i = Math.floor(x / c);
	let j = Math.floor(y / c);
	ctx.fillStyle = "white";
	ctx.fillRect(i * c + 1, j * c + 1, c - 1, c - 1);
	ctx.fillStyle = "black";
	ctx.fillRect(i * c + 4, j * c + 4, c - 7, c - 7);

	console.log(i, j);
}

function blackBG() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	blackBG();
}

function drawGrid(cellSize) {
	ctx.fillStyle = "#222222";
	for (let i = cellSize; i < canvas.width; i = i + cellSize) {
		ctx.fillRect(i, 0, 1, canvas.height);
	}
	ctx.fillStyle = "#222222";
	for (let i = cellSize; i < canvas.height; i = i + cellSize) {
		ctx.fillRect(0, i, canvas.width, 1);
	}
}

function makeMatrix(n, m) {
	let x = new Array(m);
	for (let i = 0; i < m; i++) {
		x[i] = new Array(n);
	}

	for (let i = 0; i < m; i++) {
		for (let j = 0; j < n; j++) {
			x[i][j] = 0;
		}
	}

	return x;
}

blackBG();


drawGridButton.addEventListener(("click"), () => {
	let cellSize = parseInt(cellSizeField.value);
	console.log(cellSize);
	console.log(canvasW, canvasH);
	let gridMatrix = makeMatrix(canvasW / cellSize, canvasH / cellSize);
	drawGrid(cellSize);
})

drawSpiralButton.addEventListener(("click"), () => {
	let cellSize = parseInt(cellSizeField.value);
	let angle = spiralAngleId.value;
	for (let i = 0; i < parseInt(angle); i++) {
		drawCell(i, i / 3, cellSize);
	}
	console.log(angle);
})
