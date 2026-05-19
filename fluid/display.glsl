#version 300 es

precision highp float;

in vec2 uv;

uniform sampler2D uVelocity;
uniform sampler2D uDivergence;
uniform sampler2D uPressure;
uniform int urenderMode;

out vec4 fragColor;

void main() {

    vec2 v = texture(uVelocity, uv).xy;

    float speed = length(v);
    float divergence = texture(uDivergence, uv).r;
    float pressure = texture(uPressure, uv).r;

    vec3 color;
    if (urenderMode == 0) {
        color = vec3(speed * 10.0);
    }
    if (urenderMode == 1) {
        color = vec3(abs(divergence) * 10.0);
    }
    if (urenderMode == 2) {
        float p = pressure * 10000.0;

        p = clamp(p, 0.0, 1.0);

        color = vec3(p);
    } else {
        color = vec3(speed * 10.0);
    }
    fragColor = vec4(color, 1.0);
}
