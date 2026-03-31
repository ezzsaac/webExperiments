#version 300 es
precision mediump float;

in float vLight;
out vec4 outColor;

void main() {
    vec3 color = vec3(1.0, 1.0, 1.0);
    outColor = vec4(color * vLight, 1.0);
}
