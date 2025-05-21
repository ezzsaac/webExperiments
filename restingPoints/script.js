const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const templateButton = document.getElementById("templateButton");
const templateSlider = document.getElementById("templateSlider");
const templateSelect = document.getElementById("templateSelect");
const numberField = document.getElementById("numberField");

const startStopButton = document.getElementById('startStopButton');
const resetButton = document.getElementById('resetButton');

let animatedPoints = []; // [{x, y}]

let animationId = null;
let isRunning = false;

const scale = 200;
const dt = 0.02;

function resizeCanvas() {
	canvas.width = window.innerWidth - 240 - 50;
	canvas.height = window.innerHeight - 20;
	blackBG();
	drawGrid();

	if (!isRunning) {
		initTrajectories();
	}
}

function blackBG() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
	const step = 200;
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;

	ctx.strokeStyle = "gray";
	ctx.lineWidth = 1;

	ctx.beginPath();

	for (let x = centerX; x <= canvas.width; x += step) {
		ctx.moveTo(x, 0);
		ctx.lineTo(x, canvas.height);
	}
	for (let x = centerX; x >= 0; x -= step) {
		ctx.moveTo(x, 0);
		ctx.lineTo(x, canvas.height);
	}
	for (let y = centerY; y <= canvas.height; y += step) {
		ctx.moveTo(0, y);
		ctx.lineTo(canvas.width, y);
	}
	for (let y = centerY; y >= 0; y -= step) {
		ctx.moveTo(0, y);
		ctx.lineTo(canvas.width, y);
	}

	ctx.stroke();

	ctx.beginPath();
	ctx.strokeStyle = "white";
	ctx.lineWidth = 2;
	ctx.moveTo(centerX, 0);
	ctx.lineTo(centerX, canvas.height);
	ctx.moveTo(0, centerY);
	ctx.lineTo(canvas.width, centerY);
	ctx.stroke();
}

function initTrajectories() {
	animatedPoints = [];

	for (let x0 = -8; x0 <= 0; x0 += 0.5) {
		animatedPoints.push({ x: x0, y: 0.01 });
	}
	for (let x0 = -8; x0 <= 0; x0 += 0.5) {
		animatedPoints.push({ x: x0, y: -0.01 });
	}

	const xMin = -7, xMax = 7;
	const yMin = -7, yMax = 7;
	const step = 0.5;
	for (let x0 = xMin; x0 <= xMax; x0 += step) {
		for (let y0 = yMin; y0 <= yMax; y0 += step) {
			animatedPoints.push({ x: x0, y: y0 });
		}
	}

	const xMin1 = 0.3, xMax1 = 0.7;
	const yMin1 = 0.3, yMax1 = 0.7;
	const step1 = 0.11;
	for (let x0 = xMin1; x0 <= xMax1; x0 += step1) {
		for (let y0 = yMin1; y0 <= yMax1; y0 += step1) {
			animatedPoints.push({ x: x0, y: y0 });
		}
	}
}

function animateTrajectories() {
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;

	animatedPoints = animatedPoints.filter(p => {
		const { x, y } = p;

		const dx = -x + 2 * x * y;
		const dy = y - 2 * x * y;

		const newX = x + dx * dt;
		const newY = y + dy * dt;

		const px = centerX + x * scale;
		const py = centerY - y * scale;
		const newPx = centerX + newX * scale;
		const newPy = centerY - newY * scale;

		ctx.beginPath();
		ctx.moveTo(px, py);
		ctx.lineTo(newPx, newPy);
		ctx.strokeStyle = "red";
		ctx.lineWidth = 2;
		ctx.stroke();

		if (
			newPx < 0 || newPx > canvas.width ||
			newPy < 0 || newPy > canvas.height
		) {
			return false;
		}

		p.x = newX;
		p.y = newY;
		return true;
	});

	if (animatedPoints.length > 0 && isRunning) {
		animationId = requestAnimationFrame(animateTrajectories);
	} else {
		isRunning = false;
		startStopButton.textContent = "Start";
	}
}

function drawPoint(x, y, color = 'white', radius = 4) {
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;

	const px = centerX + x * scale;
	const py = centerY - y * scale;

	ctx.beginPath();
	ctx.arc(px, py, radius, 0, 2 * Math.PI);
	ctx.fillStyle = color;
	ctx.fill();
}

startStopButton.addEventListener('click', () => {
	if (isRunning) {
		isRunning = false;
		startStopButton.textContent = "Start";
		cancelAnimationFrame(animationId);
	} else {
		if (animatedPoints.length === 0) {
			initTrajectories();
		}
		isRunning = true;
		startStopButton.textContent = "Stop";
		animateTrajectories();
	}
});

resetButton.addEventListener('click', () => {
	isRunning = false;
	startStopButton.textContent = "Start";
	cancelAnimationFrame(animationId);
	initTrajectories();
	blackBG();
	drawGrid();
	drawCurrentPoints();
});

resizeCanvas();

window.addEventListener('resize', resizeCanvas);
templateButton.addEventListener('click', templateFunction);

