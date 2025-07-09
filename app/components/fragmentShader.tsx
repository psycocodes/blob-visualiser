const fragmentShader = `
precision highp float;

uniform float u_intensity;
uniform float u_time;
uniform int u_theme; 
uniform vec3 u_color1; 
uniform vec3 u_color2;

in vec2 vUv;
in float vDisplacement;

void main() {
    float distort = 2.0 * vDisplacement * u_intensity * sin(u_time + vUv.x * 10.0);
    float mask = (1.0 - distort) * length(vUv - 0.5) * 2.0;
    mask = clamp(mask, 0.0, 1.0);
    vec3 gradientColor = mix(u_color1, u_color2, vUv.y);
    vec3 finalColor = mix(u_color1, u_color2, mask);
    gl_FragColor = vec4(finalColor, 1.0);
}
`;
export default fragmentShader;
