const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const button = document.getElementById("second");
const button2 = document.getElementById("first");

let isDrawing = false;
const cellSize = 25;

function blackBG() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid(cellSize) {
	ctx.fillStyle = "white";
	for (let i = cellSize; i < canvas.width; i = i + cellSize) {
		ctx.fillRect(i, 0, 1, canvas.height);
	}
	ctx.fillStyle = "white";
	for (let i = cellSize; i < canvas.height; i = i + cellSize) {
		ctx.fillRect(0, i, canvas.width, 1);
	}
}

function makeMatrix(n, m) {
	let x = new Array(m + 2);
	for (let i = 0; i < m + 2; i++) {
		x[i] = new Array(n + 2);
	}

	for (let i = 0; i < m + 2; i++) {
		for (let j = 0; j < n + 2; j++) {
			x[i][j] = 0;
		}
	}

	return x;
}



function drawCell(x, y, cellSize, matrix) {
	let i = Math.floor(x / cellSize);
	let j = Math.floor(y / cellSize);
	//console.log(i, j);

	if (matrix[j + 1][i + 1] == 0) {
		ctx.fillStyle = "white";
		matrix[j + 1][i + 1] = 1;
		ctx.fillRect(i * cellSize + 1, j * cellSize + 1, cellSize - 1, cellSize - 1);
	} /*else if (matrix[j + 1][i + 1] == 1) {
		ctx.fillStyle = "black";
		matrix[j + 1][i + 1] = 0;
		ctx.fillRect(i * cellSize + 1, j * cellSize + 1, cellSize - 1, cellSize - 1);
	}*/
}

function drawCell2(i, j, alive) {
	if (alive == 1) {
		ctx.fillStyle = "white";
		ctx.fillRect((j - 1) * cellSize + 1, (i - 1) * cellSize + 1, cellSize - 1, cellSize - 1);
	} else if (alive == 0) {
		ctx.fillStyle = "black";
		ctx.fillRect((j - 1) * cellSize + 1, (i - 1) * cellSize + 1, cellSize - 1, cellSize - 1);
	}
}

function cellProcessor(i, j, oldMatrix) {
	let summ = 0;

	summ += oldMatrix[i - 1][j + 1];
	summ += oldMatrix[i - 1][j];
	summ += oldMatrix[i - 1][j - 1];
	summ += oldMatrix[i][j + 1];
	summ += oldMatrix[i][j - 1];
	summ += oldMatrix[i + 1][j + 1];
	summ += oldMatrix[i + 1][j];
	summ += oldMatrix[i + 1][j - 1];

	if (oldMatrix[i][j] === 1) {
		return summ === 2 || summ === 3 ? 1 : 0; // Survival or Death
	} else {
		return summ === 3 ? 1 : 0; // Reproduction
	}
}

function oldMatrixCycler(oldMatrix) {
	let newMatrix = makeMatrix(canvas.width / cellSize, canvas.height / cellSize);

	// Ensure we stay within the padded bounds
	for (let i = 1; i < oldMatrix.length - 1; i++) {
		for (let j = 1; j < oldMatrix[0].length - 1; j++) {
			newMatrix[i][j] = cellProcessor(i, j, oldMatrix);
			//console.log(i, j);
			drawCell2(i, j, newMatrix[i][j]);
		}
	}

	console.table(newMatrix);
	return newMatrix;
}

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

blackBG();
drawGrid(cellSize);

let oldMatrix = makeMatrix(canvas.width / cellSize, canvas.height / cellSize);

canvas.addEventListener('mousedown', (event) => {
	isDrawing = true;
	let xClick = event.clientX - 25;
	let yClick = event.clientY - 25;

	drawCell(xClick, yClick, cellSize, oldMatrix);
})

canvas.addEventListener('mousemove', (event) => {
	if (isDrawing == true) {
		let xClick = event.clientX - 25;
		let yClick = event.clientY - 25;

		drawCell(xClick, yClick, cellSize, oldMatrix);
	}
})

canvas.addEventListener('mouseup', () => {
	isDrawing = false;
})

button.addEventListener('click', () => {
	oldMatrixCycler(oldMatrix);
	oldMatrix = oldMatrixCycler(oldMatrix);
})

let isRunning = false;
button2.addEventListener('click', async () => {
	/*
	for (let i = 0; i < 100; i++) {
		oldMatrix = oldMatrixCycler(oldMatrix); // Process and draw the new state
		await delay(100); // Wait 1000 milliseconds (1 second) before the next iteration
	}*/
	if (isRunning == false) {
		isRunning = true;
	} else if (isRunning == true) { isRunning = false; }

	while (true) {
		if (isRunning == true) {
			oldMatrix = oldMatrixCycler(oldMatrix); // Process and draw the new state
			await delay(100); // Wait 1000 milliseconds (1 second) before the next iteration
		} else if (isRunning == false) { break; }


	}
});
