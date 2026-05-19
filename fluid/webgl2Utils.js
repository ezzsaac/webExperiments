export async function loadShaders(paths) {
    const sources = await Promise.all(
        paths.map(p => fetch(p).then(r => r.text()))
    )
    return sources
}

export function compileShader(gl, type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader))
    }

    return shader
}

export function createProgram(gl, vertSrc, fragSrc) {

    const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertSrc)
    const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc)

    const program = gl.createProgram()
    gl.attachShader(program, vertShader)
    gl.attachShader(program, fragShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program))
    }

    return program
}

export function createTexture(gl, width, height, internalFormat, format, type) {

    const tex = gl.createTexture()

    gl.bindTexture(gl.TEXTURE_2D, tex)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

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

export function bindTexture(gl, texture, unit = 0) {
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, texture)
}

export function createFramebuffer(gl, texture) {
    const fbo = gl.createFramebuffer()

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)

    return fbo
}

export function createFBO(gl, width, height, internalFormat, format, type) {
    const texture = createTexture(gl, width, height, internalFormat, format, type)

    const fbo = createFramebuffer(gl, texture)

    return {
        texture,
        fbo,
        width,
        height
    }
}

export function createDoubleFBO(gl, width, height, internalFormat, format, type) {

    const fbo1 = createFBO(gl, width, height, internalFormat, format, type)
    const fbo2 = createFBO(gl, width, height, internalFormat, format, type)

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


