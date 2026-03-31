import { loadShaders } from "./shaderLoader.js"
import {
    canvas,
    addButtonTemplate,
    addSliderTemplate,
    addSelectTemplate
} from "./pageUtils.js"


if (!canvas) {
    throw new Error("Canvas not found")
}

const gl = canvas.getContext("webgl2")

if (!gl) {
    throw new Error("WebGL not supported")
}

let camera = {
    x: 0, y: 0,
    lastX: 0, lastY: 0,
    dx: 0, dy: 0,
    dragging: false
}
let center = {
    x: 0, y: 0,
    lastX: 0, lastY: 0,
    dx: 0, dy: 0,
    dragging: false
}
let zoom = 1
let aspect = canvas.width / canvas.height
let fractalMode = 0;
let colorMode = 0;
let maxIters = 99;
let timeStep = 1;


window.addEventListener("DOMContentLoaded", () => {
    /*
    addButtonTemplate("Start", () => {
        console.log("Start pressed");
    });
    */

    addSelectTemplate("Fractal Mode", ["Mandelbrot set", "Julia set"], (value) => {
        if (value === "Mandelbrot set") {
            fractalMode = 0
        }

        if (value === "Julia set") {
            fractalMode = 1
        }
    });

    addSelectTemplate("Color Mode", ["Grayscale", "Colors", "Animated"], (value) => {
        if (value === "Grayscale") {
            colorMode = 0
        }

        if (value === "Colors") {
            colorMode = 1
        }

        if (value === "Animated") {
            colorMode = 2
        }
    });

    addSliderTemplate("Itterations", 0, 200, 99, 1, (value) => {
        maxIters = value;
    });

    addSliderTemplate("Time step", 1.0, 10.0, 1.0, 0.05, (value) => {
        timeStep = value;
    });
})



canvas.addEventListener("contextmenu", e => {
    e.preventDefault()
})

canvas.addEventListener("mousedown", e => {
    if (e.button === 0) {
        camera.dragging = true
        camera.lastX = e.clientX
        camera.lastY = e.clientY
    }
    if (e.button === 2) {
        center.dragging = true
        center.lastX = e.clientX
        center.lastY = e.clientY
    }
})

window.addEventListener("mouseup", e => {
    if (e.button === 0) {
        camera.dragging = false
    }
    if (e.button === 2) {
        center.dragging = false
    }

})

window.addEventListener("mousemove", e => {
    if (camera.dragging) {

        camera.dx = e.clientX - camera.lastX
        camera.dy = e.clientY - camera.lastY

        camera.x -= camera.dx / canvas.width * 2 / zoom * aspect
        camera.y += camera.dy / canvas.height * 2 / zoom

        camera.lastX = e.clientX
        camera.lastY = e.clientY
    }

    if (center.dragging && fractalMode === 1) {

        center.dx = e.clientX - center.lastX
        center.dy = e.clientY - center.lastY

        center.x -= center.dx / canvas.width * 2 / zoom * aspect
        center.y += center.dy / canvas.height * 2 / zoom

        center.lastX = e.clientX
        center.lastY = e.clientY
    }
})

canvas.addEventListener("wheel", e => {

    e.preventDefault()

    const zoomFactor = 1.1

    if (e.deltaY > 0) {
        zoom /= zoomFactor
    } else {
        zoom *= zoomFactor
    }

    zoom = Math.max(0.1, Math.min(zoom, 1000))

})

async function init() {
    const [vertSrc, fragSrc] = await loadShaders([
        "./vert.glsl",
        "./frag.glsl"
    ])


    function compile(type, source) {
        const shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader))
        }

        return shader
    }

    const vertShader = compile(gl.VERTEX_SHADER, vertSrc)
    const fragShader = compile(gl.FRAGMENT_SHADER, fragSrc)

    // Create program
    const program = gl.createProgram()
    gl.attachShader(program, vertShader)
    gl.attachShader(program, fragShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program))
    }

    gl.useProgram(program)

    const vertices = new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1
    ])

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const positionLoc = gl.getAttribLocation(program, "position")
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    const timeLoc = gl.getUniformLocation(program, "u_time")
    const resolutionLoc = gl.getUniformLocation(program, "u_resolution")
    const zoomLoc = gl.getUniformLocation(program, "u_zoom")
    const centerLoc = gl.getUniformLocation(program, "u_center")
    const cameraLoc = gl.getUniformLocation(program, "u_camera")
    const fractalModeLoc = gl.getUniformLocation(program, "u_fractalMode")
    const colorModeLoc = gl.getUniformLocation(program, "u_colorMode")
    const maxItersLoc = gl.getUniformLocation(program, "u_maxIters")
    const timeStepLoc = gl.getUniformLocation(program, "u_timeStep")
    const startTime = performance.now()

    function loop() {

        const time = (performance.now() - startTime) * 0.001
        gl.viewport(0, 0, canvas.width, canvas.height)

        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)

        gl.uniform1f(timeLoc, time)
        gl.uniform2f(resolutionLoc, canvas.width, canvas.height)

        gl.uniform1f(zoomLoc, zoom)
        gl.uniform2f(centerLoc, center.x, center.y)
        gl.uniform2f(cameraLoc, camera.x, camera.y)

        gl.uniform1i(fractalModeLoc, fractalMode)
        gl.uniform1i(colorModeLoc, colorMode)

        gl.uniform1i(maxItersLoc, maxIters)

        gl.uniform1f(timeStepLoc, timeStep)

        gl.drawArrays(gl.TRIANGLES, 0, 6)

        requestAnimationFrame(loop)
    }

    loop()
}

init()
