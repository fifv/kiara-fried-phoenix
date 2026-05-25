#version 300 es

in mediump vec4 vColor;

out mediump vec4 myColor;

void main() {
    // myColor = vec4(0.3, 0.6, 0.8, 1.0);
    myColor = vColor;
}