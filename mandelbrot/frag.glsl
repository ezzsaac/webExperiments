#version 300 es

precision mediump float;

uniform float u_zoom;
uniform vec2 u_resolution;
uniform vec2 u_center;
uniform vec2 u_camera;
uniform float u_time;
uniform int u_fractalMode;
uniform int u_colorMode;
uniform int u_maxIters;
uniform float u_timeStep;

out vec4 outColor;

float remap(float x, float a, float b, float c, float d) {
    return c + (x - a) * (d - c) / (b - a);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv = uv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    uv = uv / u_zoom + u_camera;

    float a = uv.x;
    float b = uv.y;

    float ca;
    float cb;
    if (u_fractalMode == 0) {
        ca = a;
        cb = b;
    }

    if (u_fractalMode == 1) {
        ca = u_center.x;
        cb = u_center.y;
    }

    int n = 0;

    for (int i = 0; i < u_maxIters; i++) {
        float aa = a * a - b * b;
        float bb = 2.0 * a * b;

        a = aa + ca;
        b = bb + cb;

        if (a * a + b * b > 4.0) {
            break;
        }

        n = i;
    }

    if (u_colorMode == 0) {
        float color = remap(float(n), 0.0, float(u_maxIters), 0.0, 1.0);
        outColor = vec4(vec3(color), 1.0);
    }

    if (u_colorMode == 1) {
        float sm = float(n);

        if (n < u_maxIters) {
            float log_zn = log(a * a + b * b) / 2.0;
            float nu = log(log_zn / log(2.0)) / log(2.0);
            sm = float(n) + 1.0 - nu;
        }

        float t = sm / float(u_maxIters);
        vec3 col = vec3(0.5 + 0.5 * cos(3.0 + t * 6.2831),
                        0.5 + 0.5 * cos(3.0 + t * 6.2831 + 2.0),
                        0.5 + 0.5 * cos(3.0 + t * 6.2831 + 4.0));

        outColor = vec4(col, 1.0);
    }

    if (u_colorMode == 2) {
        float sm = float(n);

        if (n < u_maxIters) {
            float log_zn = log(a * a + b * b) / 2.0;
            float nu = log(log_zn / log(2.0)) / log(2.0);
            sm = float(n) + 1.0 - nu;
        }

        float t = sm / float(u_maxIters);
        vec3 col =
            vec3(0.5 + 0.5 * cos(3.0 + t * 6.2831 + u_time * u_timeStep),
                 0.5 + 0.5 * cos(3.0 + t * 6.2831 + 2.0 + u_time * u_timeStep),
                 0.5 + 0.5 * cos(3.0 + t * 6.2831 + 4.0 + u_time * u_timeStep));

        outColor = vec4(col, 1.0);
    }

    if (n == u_maxIters - 1) {
        outColor = vec4(0.0, 0.0, 0.0, 1.0); // black
        return;
    }
}
