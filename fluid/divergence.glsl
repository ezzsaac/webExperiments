#version 300 es

precision highp float;

in vec2 uv;

uniform sampler2D uVelocity;
uniform vec2 texelSize;

out vec4 fragColor;

void main() {
    vec2 vL = texture(uVelocity, uv - vec2(texelSize.x, 0.0)).xy;

    vec2 vR = texture(uVelocity, uv + vec2(texelSize.x, 0.0)).xy;

    vec2 vB = texture(uVelocity, uv - vec2(0.0, texelSize.y)).xy;

    vec2 vT = texture(uVelocity, uv + vec2(0.0, texelSize.y)).xy;

    float divergence = (vR.x - vL.x) / (2.0 * texelSize.x) +
                       (vT.y - vB.y) / (2.0 * texelSize.y);

    fragColor = vec4(divergence, 0.0, 0.0, 1.0);
}
