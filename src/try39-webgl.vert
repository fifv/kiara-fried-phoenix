#version 300 es

/* `in` can be used in gles3, equivalent to attribute */
/**
 * these are attributes, they passed by bindBuffer(), bufferData() and vertexAttribPointer() in cpu side.
 * a buffer normally contains data for all vertices, and opengl will spilt them so each vertex has its own data
 * all info above can be recorded in VAO
 */
in vec4 aVertexPosition;
in vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

out mediump vec4 vColor;
out mediump vec4 vVertexPosition;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor * 1.;
    vVertexPosition = aVertexPosition;
}