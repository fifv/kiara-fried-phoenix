#version 300 es

in lowp vec4 vColor;

out lowp vec4 myColor;

void main() {
    // myColor = vec4(0.3, 0.6, 0.8, 1.0);
    myColor = vColor;
}