#version 300 es

precision highp float;

in vec2 uv;

uniform sampler2D uPressure;

uniform sampler2D uDivergence;

uniform vec2 texelSize;

out vec4 fragColor;

void main() {
    float h = texelSize.x;
    float pL = texture(uPressure, uv - vec2(texelSize.x, 0.0)).r;

    float pR = texture(uPressure, uv + vec2(texelSize.x, 0.0)).r;

    float pB = texture(uPressure, uv - vec2(0.0, texelSize.y)).r;

    float pT = texture(uPressure, uv + vec2(0.0, texelSize.y)).r;

    float divergence = texture(uDivergence, uv).r;

    float pressure = (pL + pR + pB + pT - divergence * h * h) * 0.25;

    fragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
