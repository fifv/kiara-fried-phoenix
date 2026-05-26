#version 300 es

in mediump vec4 vColor;
in mediump vec4 vVertexPosition;
uniform mediump vec4 uGlobalColorMultiplier;
uniform mediump vec2 uResolution;

out mediump vec4 myColor;

void main() {
    // mediump vec2 uv = gl_FragCoord.xy / uResolution;
    mediump vec2 uv = (vVertexPosition.xy + 1.);
    // myColor = vec4(0.3, 0.6, 0.8, 1.0);
    // myColor = vColor * uGlobalColorMultiplier;
    myColor = vec4(uv, uv.x, 1.0);
}