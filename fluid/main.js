import {
    loadShaders,
    compileShader,
    createProgram,
    createTexture,
    createFBO,
    createDoubleFBO,
    bindTexture
} from "./webgl2Utils.js"

import {
    canvas,
    addButtonTemplate,
    addSliderTemplate,
    addSelectTemplate
} from "./pageUtils.js"

// varialbles
const vertices = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,

    -1, 1,
    1, -1,
    1, 1
])

let programs = {}

let velocity
let pressure
let divergence

let cWidth = canvas.width
let cHeight = canvas.height

let maxRes = 10
let resolution = 8

let simWidth = cWidth / resolution
let simHeight = cHeight / resolution

let maxIters = 100
let lastTime = performance.now()
let elapsed = 0

let mouseDown = false

let mouseX = 0
let mouseY = 0

let prevMouseX = 0
let prevMouseY = 0

let renderMode = 0
let radius = 0.006

addSelectTemplate("Render Mode", ["Velocity", "Divergence", "Pressure"], (value) => {
    if (value === "Velocity") {
        renderMode = 0
    }

    if (value === "Divergence") {
        renderMode = 1
    }

    if (value === "Pressure") {
        renderMode = 2
    }
});

addSliderTemplate("Itterations", 0, 200, 100, 1, (value) => {
    maxIters = value;
});

addSliderTemplate("Resulution", 0, 5, 3, 1, (value) => {
    resolution = Math.pow(2, value);
});

addSliderTemplate("Splat radius", 0, 0.01, 0.006, 0.0001, (value) => {
    radius = value;
});

// canvas setup
if (!canvas) {
    throw new Error("Canvas not found")
}

const gl = canvas.getContext("webgl2")

const ext = gl.getExtension("EXT_color_buffer_float")

if (!ext) {
    throw new Error("EXT_color_buffer_float not supported")
}

if (!gl) {
    throw new Error("WebGL not supported")
}


// page setup
window.addEventListener("DOMContentLoaded", () => {

})

canvas.addEventListener("contextmenu", e => {
    e.preventDefault()
})

canvas.addEventListener("mousedown", e => {
    mouseDown = true

    prevMouseX = e.offsetX
    prevMouseY = e.offsetY
})

window.addEventListener("mouseup", () => {
    mouseDown = false
})

window.addEventListener("mousemove", e => {

    mouseX = e.offsetX
    mouseY = e.offsetY
})

canvas.addEventListener("wheel", e => {

})


////////////////////////////////////////////////////////////////////


async function init(gl) {
    const [vertSrc, displaySrc, divergenceSrc, advectSrc, gradientSrc, jacobiSrc, initSrc, splatSrc] = await loadShaders([
        "./vert.glsl",
        "./display.glsl",
        "./divergence.glsl",
        "./advect.glsl",
        "./gradient.glsl",
        "./jacobi.glsl",
        "./init.glsl",
        "./splat.glsl",
    ])

    programs.advect = createProgram(gl, vertSrc, advectSrc)
    programs.display = createProgram(gl, vertSrc, displaySrc)
    programs.divergence = createProgram(gl, vertSrc, divergenceSrc)
    programs.jacobi = createProgram(gl, vertSrc, jacobiSrc)
    programs.gradient = createProgram(gl, vertSrc, gradientSrc)
    programs.initialize = createProgram(gl, vertSrc, initSrc)
    programs.splat = createProgram(gl, vertSrc, splatSrc)

    velocity = createDoubleFBO(gl, simWidth, simHeight, gl.RG16F, gl.RG, gl.HALF_FLOAT)
    pressure = createDoubleFBO(gl, simWidth, simHeight, gl.R16F, gl.RED, gl.HALF_FLOAT)
    divergence = createFBO(gl, simWidth, simHeight, gl.R16F, gl.RED, gl.HALF_FLOAT)

    gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.read.fbo)

    gl.clearColor(0.5, 0.0, 0.0, 1.0)

    gl.clear(gl.COLOR_BUFFER_BIT)


    const vao = gl.createVertexArray()

    gl.bindVertexArray(vao)

    const vbo = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const positionLoc = 0

    gl.enableVertexAttribArray(positionLoc)

    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    function compute(framebuffer) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
        gl.viewport(0, 0, simWidth, simHeight)
        gl.bindVertexArray(vao)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    gl.useProgram(programs.initialize)

    compute(velocity.read.fbo)

    compute(velocity.write.fbo)

    function advectVelocity(dt, elapsed) {

        gl.useProgram(programs.advect)

        bindTexture(gl, velocity.read.texture, 0)

        const timeLoc =
            gl.getUniformLocation(programs.advect, "uTime")

        gl.uniform1f(timeLoc, elapsed)

        const velocityLoc = gl.getUniformLocation(programs.advect, "uVelocity")

        const texelSizeLoc = gl.getUniformLocation(programs.advect, "texelSize")

        const dtLoc = gl.getUniformLocation(programs.advect, "dt")

        gl.uniform1i(velocityLoc, 0)

        gl.uniform2f(
            texelSizeLoc,
            1 / simWidth,
            1 / simHeight
        )

        gl.uniform1f(dtLoc, dt)

        compute(velocity.write.fbo)
        velocity.swap()
    }

    function computeDivergence() {
        gl.useProgram(programs.divergence)

        bindTexture(gl, velocity.read.texture, 0)

        const velocityLoc = gl.getUniformLocation(programs.divergence, "uVelocity")

        const texelSizeLoc = gl.getUniformLocation(programs.divergence, "texelSize")

        gl.uniform1i(velocityLoc, 0)

        gl.uniform2f(
            texelSizeLoc,
            1 / simWidth,
            1 / simHeight
        )

        compute(divergence.fbo)
    }

    function solvePressure(dt) {
        gl.useProgram(programs.jacobi)
        gl.bindFramebuffer(gl.FRAMEBUFFER, pressure.read.fbo)
        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)

        gl.bindFramebuffer(gl.FRAMEBUFFER, pressure.write.fbo)
        gl.clear(gl.COLOR_BUFFER_BIT)
        for (let i = 0; i < maxIters; i++) {

            bindTexture(gl, pressure.read.texture, 0)

            bindTexture(gl, divergence.texture, 1)

            const pressureLoc = gl.getUniformLocation(programs.jacobi, "uPressure")
            const divergenceLoc = gl.getUniformLocation(programs.jacobi, "uDivergence")
            const texelSizeLoc = gl.getUniformLocation(programs.jacobi, "texelSize")

            gl.uniform1i(pressureLoc, 0)
            gl.uniform1i(divergenceLoc, 1)

            gl.uniform2f(
                texelSizeLoc,
                1 / simWidth,
                1 / simHeight
            )

            compute(pressure.write.fbo)

            pressure.swap()
        }
    }

    function projectVelocity(dt) {
        gl.useProgram(programs.gradient)

        bindTexture(gl, velocity.read.texture, 0)

        bindTexture(gl, pressure.read.texture, 1)


        const pressureLoc = gl.getUniformLocation(programs.gradient, "uPressure")
        const velocityLoc = gl.getUniformLocation(programs.gradient, "uVelocity")
        const texelSizeLoc = gl.getUniformLocation(programs.gradient, "texelSize")

        gl.uniform1i(velocityLoc, 0)
        gl.uniform1i(pressureLoc, 1)


        gl.uniform2f(
            texelSizeLoc,
            1 / simWidth,
            1 / simHeight
        )
        compute(velocity.write.fbo)

        velocity.swap()
    }

    function splat(x, y, dx, dy) {

        gl.useProgram(programs.splat)

        bindTexture(gl, velocity.read.texture, 0)

        gl.uniform1i(
            gl.getUniformLocation(programs.splat, "uTarget"),
            0
        )

        gl.uniform2f(
            gl.getUniformLocation(programs.splat, "point"),
            x / cWidth,
            1.0 - y / cHeight
        )

        gl.uniform2f(
            gl.getUniformLocation(programs.splat, "force"),
            dx * 0.001,
            -dy * 0.001
        )

        gl.uniform1f(
            gl.getUniformLocation(programs.splat, "radius"),
            radius / resolution
        )

        compute(velocity.write.fbo)

        velocity.swap()
    }


    function loop(now) {

        const dt = Math.min((now - lastTime) * 0.001, 0.016)

        lastTime = now
        elapsed += dt

        if (mouseDown) {

            const dx = mouseX - prevMouseX
            const dy = mouseY - prevMouseY

            splat(mouseX, mouseY, dx, dy)

            prevMouseX = mouseX
            prevMouseY = mouseY
        }

        advectVelocity(dt, elapsed)

        computeDivergence()

        solvePressure(dt)

        projectVelocity(dt)

        gl.useProgram(programs.display)

        bindTexture(gl, velocity.read.texture, 0)
        bindTexture(gl, divergence.texture, 1)
        bindTexture(gl, pressure.read.texture, 2)

        const renderModeLoc = gl.getUniformLocation(programs.display, "urenderMode")
        gl.uniform1i(gl.getUniformLocation(programs.display, "uVelocity"), 0)
        gl.uniform1i(gl.getUniformLocation(programs.display, "uDivergence"), 1)
        gl.uniform1i(gl.getUniformLocation(programs.display, "uPressure"), 2)
        gl.uniform1i(renderModeLoc, renderMode)


        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, cWidth, cHeight)
        gl.bindVertexArray(vao)
        gl.drawArrays(gl.TRIANGLES, 0, 6)

        requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)
}

init(gl)
