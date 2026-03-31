#version 300 es
layout(location = 0) in vec3 position;
layout(location = 1) in vec3 normal;
layout(location = 2) in vec3 instanceOffset;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform vec3 lightDir;
uniform float ambient;

out float vLight;

void main() {
    vec3 n = mat3(model) * normal;
    vec3 worldPos = position + instanceOffset;

    float diffuse = max(dot(normalize(n), -lightDir), 0.0);
    vLight = ambient + diffuse;

    gl_Position = projection * view * model * vec4(worldPos, 1.0);
}
