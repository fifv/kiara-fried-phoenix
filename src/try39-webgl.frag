#version 300 es

in mediump vec4 vColor;
in mediump vec4 vVertexPosition;
uniform mediump vec4 uGlobalColorMultiplier;
uniform mediump vec2 uResolution;

out mediump vec4 myColor;

void main() {
    // mediump vec2 uv = gl_FragCoord.xy / uResolution;
    // mediump vec2 uv = (vVertexPosition.xy + 1.) / 2.;
    mediump vec2 uv = vVertexPosition.xy;

    mediump float d = length(uv);
    d = sin(d * 80.) / 60.;
    d = abs(d);
    // d = step(0.004, d);
    d = smoothstep(0.001, 0.01, d);
    // myColor = vec4(0.3, 0.6, 0.8, 1.0);
    // myColor = vColor * uGlobalColorMultiplier;
    // d *= vColor * uGlobalColorMultiplier;
    // myColor = vec4(d, d, d, 1.0);
    // myColor = vColor * uGlobalColorMultiplier * d;

    myColor = vec4(mix(vColor.rgb, vec3(1.), d), 1.);


    // d = 1. - d;
    // myColor = vec4(mix(vec3(1.), vColor.rgb, d), 1.);
}