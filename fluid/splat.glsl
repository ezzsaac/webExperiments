#version 300 es

precision highp float;

in vec2 uv;

uniform sampler2D uTarget;

uniform vec2 point;
uniform vec2 force;

uniform float radius;

out vec4 fragColor;

void main() {

    vec2 current = texture(uTarget, uv).xy;

    float d = distance(uv, point);

    float influence = exp(-d * d / radius);

    current += force * influence;

    fragColor = vec4(current, 0.0, 1.0);
}
