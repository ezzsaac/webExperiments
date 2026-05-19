#version 300 es

precision highp float;

in vec2 uv;

uniform sampler2D uVelocity;
uniform float dt;
uniform vec2 texelSize;

out vec4 fragColor;

void main() {
    vec2 velocity = texture(uVelocity, uv).xy;

    vec2 prevUV = uv - velocity * dt;
    prevUV = clamp(prevUV, 0.0, 1.0);
    vec2 advectedVelocity = texture(uVelocity, prevUV).xy;

    fragColor = vec4(advectedVelocity * 0.99, 0.0, 1.0);
}
