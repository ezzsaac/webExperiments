const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

function sinWave() {
	ctx.strokeStyle = "blue";
	ctx.beginPath();
	for (let x = 0; x < canvas.width; x++) {
		ctx.moveTo(x, canvas.height / 2 - 100 * Math.sin(0.01 * (x - (canvas.width / 2))));
		ctx.lineTo(x, canvas.height / 2 - 100 * Math.sin(0.01 * (x - (canvas.width / 2 - 1))));
		ctx.stroke();
	}
}

function parabola() {
	ctx.strokeStyle = "blue";
	ctx.beginPath();
	for (let x = 0; x < canvas.width; x++) {
		ctx.moveTo(x, canvas.height / 2 - 0.01 * (x - (canvas.width / 2)) ** 2);
		ctx.lineTo(x, canvas.height / 2 - 0.01 * (x - (canvas.width / 2 - 1)) ** 2);
		ctx.stroke();
	}
}

function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, canvas.height / 2, canvas.width, 1);
	ctx.fillRect(canvas.width / 2, 0, 1, canvas.height);
}

function printVal() {
	console.log(document.getElementById('f1').value);
}

function funcSelect() {
	const selectedElement = document.getElementById('f1');
	const selectedValue = selectedElement.value;

	if (selectedValue === "sin") {
		sinWave();
		console.log(document.getElementById('f1').value);
	} else if (selectedValue === "parabola") {
		parabola();
		console.log(document.getElementById('f1').value);
	}
}

clearCanvas();
