const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const stepButton = document.getElementById("stepButton");
const clearButton = document.getElementById("clearButton");
const templateSlider = document.getElementById("templateSlider");
const templateSelect = document.getElementById("templateSelect");
const ruleNumberField = document.getElementById("ruleNumber");
const stepsNumberField = document.getElementById("stepsNumber");

const cellSize = 20;
let cWidth = canvas.width;
let cHeight = canvas.height;

function blackBG() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
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

function makeArray(l) {
	let x = new Array(l);

	for (let i = 0; i < l; i++) {
		x[i] = 0;
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

function decToBin(num) {
	let bin = num.toString(2);
	return bin.padStart(8, "0");
}

function wolfram(a, b, c, ruleNumber) {
	let abc = a.toString() + b.toString() + c.toString();

	let ruleNumberBin = decToBin(ruleNumber);

	if (abc == "111") { return ruleNumberBin[0] }
	else if (abc == "110") { return ruleNumberBin[1] }
	else if (abc == "101") { return ruleNumberBin[2] }
	else if (abc == "100") { return ruleNumberBin[3] }
	else if (abc == "011") { return ruleNumberBin[4] }
	else if (abc == "010") { return ruleNumberBin[5] }
	else if (abc == "001") { return ruleNumberBin[6] }
	else if (abc == "000") { return ruleNumberBin[7] }
}

function processCells(i, matrix, ruleNumber) {
	let currLayer = matrix[i];
	let currLen = currLayer.length;
	let a = 0;
	let b = 0;
	let c = 0;
	let nextLayer = new Array(currLen).fill(0);

	for (let k = 0; k < currLen; k++) {
		if (k == 0) {
			a = currLayer[(currLen - 1)];
			b = currLayer[k];
			c = currLayer[k + 1];

			nextLayer[k] = parseInt(wolfram(a, b, c, ruleNumber));
		} else if (k == (currLen - 1)) {
			a = currLayer[k - 1];
			b = currLayer[k];
			c = currLayer[0];

			nextLayer[k] = parseInt(wolfram(a, b, c, ruleNumber));
		} else {
			a = currLayer[k - 1];
			b = currLayer[k];
			c = currLayer[k + 1];

			nextLayer[k] = parseInt(wolfram(a, b, c, ruleNumber));
		}
	}

	return nextLayer;
}

function drawCells(matrix) {
	let n = matrix.length;
	let m = matrix[0].length;
	ctx.fillStyle = "white";


	for (let i = 0; i < m; i++) {
		for (let j = 0; j < n; j++) {
			if (matrix[j][i] === 1) {
				ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
			}
		}
	}

}

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

blackBG();

let currMatrix = makeMatrix(cWidth / cellSize, cHeight / cellSize);
currMatrix[0][40] = 1;

let flag = false;

stepButton.addEventListener('click', async () => {
	let ruleNumber = parseInt(ruleNumberField.value);
	let stepAmount = parseInt(stepsNumberField.value);

	drawCells(currMatrix);
	await delay(20);
	for (let i = 1; i < currMatrix.length; i++) {
		currMatrix[i] = processCells(i - 1, currMatrix, ruleNumber);
		await delay(20);
		drawCells(currMatrix);
	}
	await delay(20);
	if (flag == true) {
		for (let j = 0; j < stepAmount; j++) {
			blackBG();
			for (let k = 0; k < currMatrix.length - 1; k++) {
				currMatrix[k] = currMatrix[k + 1];
			}
			currMatrix[currMatrix.length - 1] = processCells(currMatrix.length - 2, currMatrix, ruleNumber);
			drawCells(currMatrix);
			await delay(20);

		}
	}
	flag = true;

});

clearButton.addEventListener('click', () => {
	currMatrix = makeMatrix(cWidth / cellSize, cHeight / cellSize);
	currMatrix[0][40] = 1;

	blackBG();
});
