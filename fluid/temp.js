// ======================================================
// main.js
// ======================================================

// ------------------------------------------------------
// IMPORTS
// ------------------------------------------------------

import { loadShaders } from "./shaderLoader.js"



// ------------------------------------------------------
// CANVAS + WEBGL
// ------------------------------------------------------

const canvas = document.querySelector("canvas")

const gl = canvas.getContext("webgl2")

if (!gl) {
    throw new Error("WebGL2 not supported")
}

gl.getExtension("EXT_color_buffer_float")



// ------------------------------------------------------
// RESOLUTION
// ------------------------------------------------------

canvas.width = window.innerWidth
canvas.height = window.innerHeight



// ------------------------------------------------------
// GLOBALS
// ------------------------------------------------------

let programs = {}

let velocity
let pressure
let divergence

let quadVAO

let simulationWidth = 512
let simulationHeight = 512

let dt = 0.016
let pressureIterations = 20



// ======================================================
// INITIALIZATION
// ======================================================

async function init() {

    // --------------------------------------------------
    // LOAD SHADERS
    // --------------------------------------------------

    const shaders = await loadShaders({

        vertex: "./shaders/fullscreen.vert",

        advect: "./shaders/advect.frag",

        divergence: "./shaders/divergence.frag",

        jacobi: "./shaders/jacobi.frag",

        gradientSubtract: "./shaders/gradientSubtract.frag",

        display: "./shaders/display.frag"

    })



    // --------------------------------------------------
    // CREATE PROGRAMS
    // --------------------------------------------------

    programs.advect =
        createProgram(
            shaders.vertex,
            shaders.advect
        )

    programs.divergence =
        createProgram(
            shaders.vertex,
            shaders.divergence
        )

    programs.jacobi =
        createProgram(
            shaders.vertex,
            shaders.jacobi
        )

    programs.gradientSubtract =
        createProgram(
            shaders.vertex,
            shaders.gradientSubtract
        )

    programs.display =
        createProgram(
            shaders.vertex,
            shaders.display
        )



    // --------------------------------------------------
    // FULLSCREEN QUAD
    // --------------------------------------------------

    quadVAO = createFullscreenQuad()



    // --------------------------------------------------
    // CREATE TEXTURES + FBOs
    // --------------------------------------------------

    velocity = createDoubleFBO(
        simulationWidth,
        simulationHeight,
        gl.RG16F,
        gl.RG,
        gl.HALF_FLOAT
    )

    pressure = createDoubleFBO(
        simulationWidth,
        simulationHeight,
        gl.R16F,
        gl.RED,
        gl.HALF_FLOAT
    )

    divergence = createFBO(
        simulationWidth,
        simulationHeight,
        gl.R16F,
        gl.RED,
        gl.HALF_FLOAT
    )



    // --------------------------------------------------
    // START LOOP
    // --------------------------------------------------

    requestAnimationFrame(loop)
}



// ======================================================
// MAIN LOOP
// ======================================================

function loop() {

    // --------------------------------------------------
    // SIMULATION
    // --------------------------------------------------

    advectVelocity()

    computeDivergence()

    solvePressure()

    projectVelocity()



    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    render()



    requestAnimationFrame(loop)
}



// ======================================================
// SIMULATION PASSES
// ======================================================

function advectVelocity() {

    gl.useProgram(programs.advect)

    // bind uniforms
    // bind textures
    // render into velocity.write

    blit(velocity.write.fbo)

    velocity.swap()
}



function computeDivergence() {

    gl.useProgram(programs.divergence)

    // bind velocity texture

    blit(divergence.fbo)
}



function solvePressure() {

    gl.useProgram(programs.jacobi)

    for (let i = 0; i < pressureIterations; i++) {

        // bind pressure.read
        // bind divergence

        blit(pressure.write.fbo)

        pressure.swap()
    }
}



function projectVelocity() {

    gl.useProgram(programs.gradientSubtract)

    // bind velocity
    // bind pressure

    blit(velocity.write.fbo)

    velocity.swap()
}



// ======================================================
// FINAL DISPLAY
// ======================================================

function render() {

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.viewport(0, 0, canvas.width, canvas.height)

    gl.useProgram(programs.display)

    // bind display texture

    gl.bindVertexArray(quadVAO)

    gl.drawArrays(gl.TRIANGLES, 0, 6)
}



// ======================================================
// SHADER HELPERS
// ======================================================

function compileShader(type, source) {

    const shader = gl.createShader(type)

    gl.shaderSource(shader, source)

    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        console.error(gl.getShaderInfoLog(shader))
    }

    return shader
}



function createProgram(vertexSource, fragmentSource) {

    const program = gl.createProgram()

    const vs = compileShader(
        gl.VERTEX_SHADER,
        vertexSource
    )

    const fs = compileShader(
        gl.FRAGMENT_SHADER,
        fragmentSource
    )

    gl.attachShader(program, vs)
    gl.attachShader(program, fs)

    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

        console.error(gl.getProgramInfoLog(program))
    }

    return program
}



// ======================================================
// FULLSCREEN QUAD
// ======================================================

function createFullscreenQuad() {

    const vertices = new Float32Array([

        -1, -1,
        1, -1,
        -1, 1,

        -1, 1,
        1, -1,
        1, 1
    ])

    const vao = gl.createVertexArray()

    gl.bindVertexArray(vao)

    const vbo = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)

    gl.bufferData(
        gl.ARRAY_BUFFER,
        vertices,
        gl.STATIC_DRAW
    )

    const positionLoc = 0

    gl.enableVertexAttribArray(positionLoc)

    gl.vertexAttribPointer(
        positionLoc,
        2,
        gl.FLOAT,
        false,
        0,
        0
    )

    return vao
}



// ======================================================
// TEXTURES
// ======================================================

function createTexture(
    width,
    height,
    internalFormat,
    format,
    type
) {

    const tex = gl.createTexture()

    gl.bindTexture(gl.TEXTURE_2D, tex)

    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR
    )

    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MAG_FILTER,
        gl.LINEAR
    )

    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_S,
        gl.CLAMP_TO_EDGE
    )

    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_T,
        gl.CLAMP_TO_EDGE
    )

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        width,
        height,
        0,
        format,
        type,
        null
    )

    return tex
}



// ======================================================
// FRAMEBUFFERS
// ======================================================

function createFramebuffer(texture) {

    const fbo = gl.createFramebuffer()

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)

    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
    )

    return fbo
}



function createFBO(
    width,
    height,
    internalFormat,
    format,
    type
) {

    const texture = createTexture(
        width,
        height,
        internalFormat,
        format,
        type
    )

    const fbo = createFramebuffer(texture)

    return {
        texture,
        fbo,
        width,
        height
    }
}



function createDoubleFBO(
    width,
    height,
    internalFormat,
    format,
    type
) {

    let fbo1 = createFBO(
        width,
        height,
        internalFormat,
        format,
        type
    )

    let fbo2 = createFBO(
        width,
        height,
        internalFormat,
        format,
        type
    )

    return {

        read: fbo1,

        write: fbo2,

        swap() {

            let temp = this.read

            this.read = this.write

            this.write = temp
        }
    }
}



// ======================================================
// UTILITIES
// ======================================================

function bindTexture(unit, texture, location) {

    gl.activeTexture(gl.TEXTURE0 + unit)

    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.uniform1i(location, unit)
}



function blit(framebuffer) {

    gl.bindFramebuffer(
        gl.FRAMEBUFFER,
        framebuffer
    )

    gl.viewport(
        0,
        0,
        simulationWidth,
        simulationHeight
    )

    gl.bindVertexArray(quadVAO)

    gl.drawArrays(gl.TRIANGLES, 0, 6)
}



// ======================================================
// START
// ======================================================

init()
