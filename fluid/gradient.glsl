#version 300 es

precision highp float;

in vec2 uv;

uniform sampler2D uVelocity;

uniform sampler2D uPressure;

uniform vec2 texelSize;

out vec4 fragColor;

void main() {

    float pL = texture(uPressure, uv - vec2(texelSize.x, 0.0)).r;

    float pR = texture(uPressure, uv + vec2(texelSize.x, 0.0)).r;

    float pB = texture(uPressure, uv - vec2(0.0, texelSize.y)).r;

    float pT = texture(uPressure, uv + vec2(0.0, texelSize.y)).r;

    vec2 velocity = texture(uVelocity, uv).xy;

    vec2 gradient =
        vec2((pR - pL) / (2.0 * texelSize.x), (pT - pB) / (2.0 * texelSize.y));

    velocity -= gradient;

    fragColor = vec4(velocity, 0.0, 1.0);
}
