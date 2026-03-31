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
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

let t = 1;
let lW = 200;
let radius = 3;
let density = 0.58;
let ylimit = 200;
let rule1 = 0.25;
let rule2 = 0.58;
let rule3 = 0.35;
let rule4 = 0.5;


let zoom = 1;
let camera = {
    yaw: 0,
    pitch: 0,

    lastX: 0,
    lastY: 0,

    dragging: false,
    dist: -460
}

canvas.addEventListener("contextmenu", e => {
    e.preventDefault()
})

canvas.addEventListener("mousedown", e => {
    if (e.button === 0) {
        camera.dragging = true;
        camera.lastX = e.clientX;
        camera.lastY = e.clientY;
    }
});

window.addEventListener("mouseup", () => {
    camera.dragging = false;
});

window.addEventListener("mousemove", e => {
    if (!camera.dragging) return;

    const dx = e.clientX - camera.lastX;
    const dy = e.clientY - camera.lastY;

    const sensitivity = 0.005;

    camera.yaw += dx * sensitivity;
    camera.pitch += dy * sensitivity;

    const limit = Math.PI / 2 - 0.01;
    camera.pitch = Math.max(-0.18, Math.min(limit, camera.pitch));

    camera.lastX = e.clientX;
    camera.lastY = e.clientY;
});
canvas.addEventListener("wheel", e => {

    e.preventDefault()

    const zoomFactor = 1.1

    if (e.deltaY > 0) {
        zoom /= zoomFactor
    } else {
        zoom *= zoomFactor
    }

    zoom = Math.max(0.1, Math.min(zoom, 10))

})


async function init() {
    let cubeCount = 0;
    let y = 0;
    function resetSimulation() {
        cubeCount = 0;
        y = 0;

        currentLayer = randomLayer2(lW, density);

        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(instanceArray.length));
    }
    window.addEventListener("DOMContentLoaded", () => {

        addButtonTemplate("Grow", () => {
            resetSimulation();
        });


        addSliderTemplate("Radius", 1, 10, 3, 1, (value) => {
            radius = value;
        });

        addSliderTemplate("Density", 0, 1, 0.3, 0.01, (value) => {
            density = value;
        });

        addSliderTemplate("Y limit", 10, 1000, 200, 1, (value) => {
            ylimit = value;
        });

        addSliderTemplate("Rule 1", 0.0, 1.0, rule1, 0.01, (value) => {
            rule1 = parseFloat(value);
        });

        addSliderTemplate("Rule 2", 0, 1, rule2, 0.01, (value) => {
            rule2 = parseFloat(value);
        });

        addSliderTemplate("Rule 3", 0, 1, rule3, 0.01, (value) => {
            rule3 = parseFloat(value);
        });

        addSliderTemplate("Rule 4", 0, 1, rule4, 0.01, (value) => {
            rule4 = parseFloat(value);
        });
    })

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

    function emptyLayer(size) {
        return Array(size).fill().map(() =>
            Array(size).fill(0)
        );
    }

    function randomLayer(size, density) {
        return Array(size).fill().map(() =>
            Array(size).fill().map(() =>
                Math.random() < density ? 1 : 0
            )
        );
    }

    function randomLayer2(size, baseDensity) {
        const half = size / 2;

        return Array.from({ length: size }, (_, x) =>
            Array.from({ length: size }, (_, z) => {

                const dx = x - half;
                const dz = z - half;

                const dist2 = dx * dx + dz * dz;
                const maxDist2 = half * half * 2;

                let falloff = 1 - (dist2 / maxDist2);
                falloff = Math.max(0, falloff);

                falloff = Math.pow(falloff, 2);

                const density = baseDensity * falloff;

                return Math.random() < density ? 1 : 0;
            })
        );
    }

    function procces(prevLayer, r, decay, rule1, rule2, rule3, rule4) {
        let lW = prevLayer.length;
        let nextLayer = emptyLayer(lW);

        const maxNeighbors = (2 * r + 1) ** 2 - 1;

        for (let i = 0; i < lW; i++) {
            for (let j = 0; j < lW; j++) {

                let sum = 0;

                for (let k = -r; k <= r; k++) {
                    for (let l = -r; l <= r; l++) {

                        if (k === 0 && l === 0) continue;

                        let x = (i + k + lW) % lW;
                        let y = (j + l + lW) % lW;

                        sum += prevLayer[x][y];
                    }
                }

                const localDensity = sum / maxNeighbors;


                if (prevLayer[i][j] === 1) {
                    nextLayer[i][j] = (localDensity > rule1 && localDensity < rule2) ? 1 : 0;
                } else {
                    nextLayer[i][j] = (localDensity > rule3 && localDensity < rule4) ? 1 : 0;
                }
                if (nextLayer[i][j] === prevLayer[i][j]) {
                    if (Math.random() < 0.05) {
                        nextLayer[i][j] = 0;
                    }
                }
                if (Math.random() < decay * 0.01) {
                    nextLayer[i][j] = 0;
                }
            }
        }

        return nextLayer;
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

    const positions = new Float32Array([
        // front
        -1, -1, 1, 1, -1, 1, 1, 1, 1,
        -1, -1, 1, 1, 1, 1, -1, 1, 1,
        // back
        -1, -1, -1, -1, 1, -1, 1, 1, -1,
        -1, -1, -1, 1, 1, -1, 1, -1, -1,
        // left
        -1, -1, -1, -1, -1, 1, -1, 1, 1,
        -1, -1, -1, -1, 1, 1, -1, 1, -1,
        // right
        1, -1, -1, 1, 1, -1, 1, 1, 1,
        1, -1, -1, 1, 1, 1, 1, -1, 1,
        // top
        -1, 1, -1, -1, 1, 1, 1, 1, 1,
        -1, 1, -1, 1, 1, 1, 1, 1, -1,
        // bottom
        -1, -1, -1, 1, -1, -1, 1, -1, 1,
        -1, -1, -1, 1, -1, 1, -1, -1, 1
    ]);

    const normals = new Float32Array([
        // front
        0, 0, 1, 0, 0, 1, 0, 0, 1,
        0, 0, 1, 0, 0, 1, 0, 0, 1,
        // back
        0, 0, -1, 0, 0, -1, 0, 0, -1,
        0, 0, -1, 0, 0, -1, 0, 0, -1,
        // left
        -1, 0, 0, -1, 0, 0, -1, 0, 0,
        -1, 0, 0, -1, 0, 0, -1, 0, 0,
        // right
        1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0,
        // top
        0, 1, 0, 0, 1, 0, 0, 1, 0,
        0, 1, 0, 0, 1, 0, 0, 1, 0,
        // bottom
        0, -1, 0, 0, -1, 0, 0, -1, 0,
        0, -1, 0, 0, -1, 0, 0, -1, 0
    ]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);


    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);


    const normBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);


    const instanceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);

    const maxCubes = lW * lW * 200;
    const instanceArray = new Float32Array(maxCubes * 3);

    gl.bufferData(gl.ARRAY_BUFFER, instanceArray, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(2, 1);

    let currentLayer = randomLayer2(lW, density);


    function perspective(fov, aspect, near, far) {
        const f = 1 / Math.tan(fov / 2);
        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) / (near - far), -1,
            0, 0, (2 * far * near) / (near - far), 0
        ]);
    }


    function translate(ax, ay, az, x, y, z) {
        const ca = Math.cos(ax), sa = Math.sin(ax);
        const cb = Math.cos(ay), sb = Math.sin(ay);
        const cg = Math.cos(az), sg = Math.sin(az);

        return new Float32Array([
            cb * cg, cb * sg, -sb, 0,
            sa * sb * cg - ca * sg, sa * sb * sg + ca * cg, sa * cb, 0,
            ca * sb * cg + sa * sg, ca * sb * sg - sa * cg, ca * cb, 0,
            x, y, z, 1
        ]);
    }

    function viewMatrix(camera) {
        const cx = Math.cos(camera.pitch);
        const sx = Math.sin(camera.pitch);
        const cy = Math.cos(camera.yaw);
        const sy = Math.sin(camera.yaw);
        const d = camera.dist;

        return new Float32Array([
            cy, 0, -sy, 0,
            sx * sy, cx, sx * cy, 0,
            cx * sy, -sx, cx * cy, 0,
            0, 0, d, 1
        ]);
    }

    const uProj = gl.getUniformLocation(program, "projection");
    const uView = gl.getUniformLocation(program, "view");
    const uModel = gl.getUniformLocation(program, "model");
    const uLight = gl.getUniformLocation(program, "lightDir");
    const uAmbient = gl.getUniformLocation(program, "ambient");

    const len = Math.hypot(1, -1, 0);
    gl.uniform3fv(uLight, new Float32Array([1 / len, -1 / len, 0 / len]));
    gl.uniform1f(uAmbient, 0.3);

    function loop(time) {
        t = time * 0.001;

        if (y <= ylimit) {
            const half = Math.floor(lW / 2);
            let addedThisFrame = 0;

            for (let x = 0; x < lW; x++) {
                for (let z = 0; z < lW; z++) {
                    if (currentLayer[x][z] === 1) {

                        const i = cubeCount * 3;

                        instanceArray[i + 0] = (x - half) * 2;
                        instanceArray[i + 1] = y - 100;
                        instanceArray[i + 2] = (z - half) * 2;

                        cubeCount++;
                        addedThisFrame++;
                    }
                }
            }

            let decay = y / ylimit;
            currentLayer = procces(currentLayer, radius, decay, rule1, rule2, rule3, rule4);

            gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);

            if (addedThisFrame > 0) {
                gl.bufferSubData(
                    gl.ARRAY_BUFFER,
                    (cubeCount - addedThisFrame) * 3 * 4,
                    instanceArray.subarray(
                        (cubeCount - addedThisFrame) * 3,
                        cubeCount * 3
                    )
                );
            }

            y++;
        }


        gl.clearColor(0.0, 0.0, 0.0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const proj = perspective(Math.PI / 3, canvas.width / canvas.height, 0.1, 10000);
        const view = translate(camera.pitch, 0, 0, 0, 0, -460 * zoom);
        const model = translate(0, camera.yaw, 0, 0, 15, 0);

        gl.uniformMatrix4fv(uProj, false, proj);
        gl.uniformMatrix4fv(uView, false, view);
        gl.uniformMatrix4fv(uModel, false, model);

        gl.bindVertexArray(vao);
        const count = cubeCount;

        gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, count);
        requestAnimationFrame(loop)
    }

    loop()
}

init()
