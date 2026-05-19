#version 300 es

precision highp float;

in vec2 uv;

uniform sampler2D uVelocity;
uniform vec2 point;
uniform vec2 force;

out vec4 fragColor;

void main() {
    vec2 velocity = texture(uVelocity, uv).xy;

    float d = distance(uv, point);

    float influence = exp(-d * d * 200.0);

    velocity += force * influence;

    fragColor = vec4(velocity, 0.0, 1.0);
}
