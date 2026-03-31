const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const startStopButton = document.getElementById("startStopButton");
const speedSlider = document.getElementById("speedSlider");
const shapes = document.getElementById("shapes");

class point {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}

function drawBg() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawDot(Point, r) {
	ctx.beginPath();
	ctx.arc(150 * Point.x + 800, 150 * Point.y + 450, r, 0, 2 * Math.PI);
	ctx.fillStyle = "white";
	ctx.fill();
	ctx.lineWidth = 4;
	ctx.strokeStyle = "white";
	ctx.stroke();
}

function drawLine(Point1, Point2) {
	ctx.strokeStyle = "white";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(150 * Point1.x + 800, 150 * Point1.y + 450);
	ctx.lineTo(150 * Point2.x + 800, 150 * Point2.y + 450);
	ctx.stroke();
}

function rotateZ(Point, alpha) {
	let x = Point.x;
	let y = Point.y;
	let z = Point.z;

	let xR = x * Math.cos(Math.PI * (alpha / 180)) + y * Math.sin(Math.PI * (alpha / 180));
	let yR = -x * Math.sin(Math.PI * (alpha / 180)) + y * Math.cos(Math.PI * (alpha / 180));
	let zR = z;
	return new point(xR, yR, zR);
}

function rotateY(Point, alpha) {
	let x = Point.x;
	let y = Point.y;
	let z = Point.z;

	let xR = x * Math.cos(Math.PI * (alpha / 180)) + z * Math.sin(Math.PI * (alpha / 180));
	let yR = y;
	let zR = -x * Math.sin(Math.PI * (alpha / 180)) + z * Math.cos(Math.PI * (alpha / 180));
	return new point(xR, yR, zR);
}

function rotateX(Point, alpha) {
	let x = Point.x;
	let y = Point.y;
	let z = Point.z;

	let xR = x;
	let yR = y * Math.cos(Math.PI * (alpha / 180)) + z * Math.sin(Math.PI * (alpha / 180));
	let zR = -y * Math.sin(Math.PI * (alpha / 180)) + z * Math.cos(Math.PI * (alpha / 180));
	return new point(xR, yR, zR);
}


function delay(time) {
	return new Promise(resolve => setTimeout(resolve, time));
}

function cube(alpha, beta, gamma) {
	let point0 = new point(1, 1, 1);
	let point1 = new point(1, -1, 1);
	let point2 = new point(-1, 1, 1);
	let point3 = new point(-1, -1, 1);
	let point4 = new point(1, 1, -1);
	let point5 = new point(1, -1, -1);
	let point6 = new point(-1, 1, -1);
	let point7 = new point(-1, -1, -1);

	let pointR0 = rotateX(rotateY(rotateZ(point0, gamma), beta), alpha);
	let pointR1 = rotateX(rotateY(rotateZ(point1, gamma), beta), alpha);
	let pointR2 = rotateX(rotateY(rotateZ(point2, gamma), beta), alpha);
	let pointR3 = rotateX(rotateY(rotateZ(point3, gamma), beta), alpha);
	let pointR4 = rotateX(rotateY(rotateZ(point4, gamma), beta), alpha);
	let pointR5 = rotateX(rotateY(rotateZ(point5, gamma), beta), alpha);
	let pointR6 = rotateX(rotateY(rotateZ(point6, gamma), beta), alpha);
	let pointR7 = rotateX(rotateY(rotateZ(point7, gamma), beta), alpha);

	drawBg();

	drawDot(pointR0, 0);
	drawDot(pointR1, 0);
	drawDot(pointR2, 0);
	drawDot(pointR3, 0);
	drawDot(pointR4, 0);
	drawDot(pointR5, 0);
	drawDot(pointR6, 0);
	drawDot(pointR7, 0);

	drawLine(pointR0, pointR1);
	drawLine(pointR0, pointR2);
	drawLine(pointR1, pointR3);
	drawLine(pointR2, pointR3);

	drawLine(pointR4, pointR5);
	drawLine(pointR4, pointR6);
	drawLine(pointR5, pointR7);
	drawLine(pointR6, pointR7);

	drawLine(pointR0, pointR4);
	drawLine(pointR1, pointR5);
	drawLine(pointR2, pointR6);
	drawLine(pointR3, pointR7);
}

function crystal(alpha, beta, gamma) {
	let point0 = new point(1, 1, 0);
	let point1 = new point(1, -1, 0);
	let point2 = new point(-1, 1, 0);
	let point3 = new point(-1, -1, 0);
	let point4 = new point(0, 0, -2);
	let point5 = new point(0, 0, 2);

	let pointR0 = rotateX(rotateY(rotateZ(point0, gamma), beta), alpha);
	let pointR1 = rotateX(rotateY(rotateZ(point1, gamma), beta), alpha);
	let pointR2 = rotateX(rotateY(rotateZ(point2, gamma), beta), alpha);
	let pointR3 = rotateX(rotateY(rotateZ(point3, gamma), beta), alpha);
	let pointR4 = rotateX(rotateY(rotateZ(point4, gamma), beta), alpha);
	let pointR5 = rotateX(rotateY(rotateZ(point5, gamma), beta), alpha);

	drawBg();

	drawDot(pointR0, 0);
	drawDot(pointR1, 0);
	drawDot(pointR2, 0);
	drawDot(pointR3, 0);
	drawDot(pointR4, 0);
	drawDot(pointR5, 0);

	drawLine(pointR0, pointR1);
	drawLine(pointR0, pointR2);
	drawLine(pointR1, pointR3);
	drawLine(pointR2, pointR3);

	drawLine(pointR0, pointR4);
	drawLine(pointR1, pointR4);
	drawLine(pointR2, pointR4);
	drawLine(pointR3, pointR4);

	drawLine(pointR0, pointR5);
	drawLine(pointR1, pointR5);
	drawLine(pointR2, pointR5);
	drawLine(pointR3, pointR5);
}

let isSpinning = false;
let i = 0;
let renderDelay = 0;
let shape = shapes.value;


speedSlider.oninput = function() {
	renderDelay = this.value;
}

startStopButton.addEventListener('click', async () => {
	shape = shapes.value;

	if (isSpinning == false) {
		isSpinning = true;
	} else if (isSpinning == true) {
		isSpinning = false;
	}

	while (true) {
		if (isSpinning == true) {
			if (shape == "cube") {
				cube(i, i, i);
			} else if (shape == "crystal") {
				crystal(80, 0, i);
			}
			i = i + 0.25;
			if (i == 360) {
				i = 0;
			}
			await delay(100 - renderDelay);
		} else if (isSpinning == false) { break; }
	}
});


