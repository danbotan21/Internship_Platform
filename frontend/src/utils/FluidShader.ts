export const vertexShader = `
varying vec2 vUv;
void main () {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const fluidShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec4 iMouse;
uniform float uMouseDown;
uniform int iFrame;
uniform sampler2D iPreviousFrame;
uniform float uBrushSize;
uniform float uBrushStrength;
uniform float uFluidDecay;
uniform float uTrailLength;
uniform float uStopDecay;
varying vec2 vUv;

vec2 ur;

float distToSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p-a, ba = b-a;
    float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
    return length(pa - ba*h);
}

vec4 samplePrev(vec2 v, float ox, float oy) {
    vec2 uv = clamp((v + vec2(ox, oy)) / ur, 0.0, 1.0);
    return texture2D(iPreviousFrame, uv);
}

vec4 samplePrevSimple(vec2 v) {
    vec2 uv = clamp(v / ur, 0.0, 1.0);
    return texture2D(iPreviousFrame, uv);
}

float triangleArea(vec2 a, vec2 b, vec2 c) {
    return abs((a.x*(b.y-c.y) + b.x*(c.y-a.y) + c.x*(a.y-b.y)) * 0.5);
}

void main () {
    vec2 U = vUv * iResolution;
    ur = iResolution.xy;

    if (iFrame < 1) {
        float w = 0.5 + sin(0.2 * U.x) * 0.5;
        float q = length(U - 0.5 * ur);
        gl_FragColor = vec4(0.1 * exp(-0.001 * q * q), 0.0, 0.0, w);
    } else {
        vec2 v = U;
        vec2 A = v + vec2(1.0, 1.0);
        vec2 B = v + vec2(1.0, -1.0);
        vec2 C = v + vec2(-1.0, 1.0);
        vec2 D = v + vec2(-1.0, -1.0);

        for (int i = 0; i < 8; i++) {
            v -= samplePrevSimple(v).xy;
            A -= samplePrevSimple(A).xy;
            B -= samplePrevSimple(B).xy;
            C -= samplePrevSimple(C).xy;
            D -= samplePrevSimple(D).xy;
        }

        vec4 me = samplePrevSimple(v);
        vec4 n = samplePrev(v, 1.0, 1.0);
        vec4 e = samplePrev(v, 1.0, 0.0);
        vec4 s = samplePrev(v, 0.0, -1.0);
        vec4 w = samplePrev(v, -1.0, 0.0);

        vec4 ne = 0.25 * (n + e + s + w);
        me = mix(me, ne, vec4(0.15, 0.15, 0.95, 0.0));

        float areaVal = triangleArea(A, B, C) + triangleArea(B, C, D);
        me.z = me.z - 0.01 * (areaVal - 4.0);

        vec4 pr = vec4(e.z, w.z, n.z, s.z);
        me.xy = me.xy + 100.0 * vec2(pr.x - pr.y, pr.z - pr.w) / ur;
        me.xy *= uFluidDecay;
        me.z *= uTrailLength;

        if (uMouseDown > 0.5) {
            vec2 mousePos = iMouse.xy;
            vec2 mousePrev = iMouse.zw;
            vec2 mouseVel = mousePos - mousePrev;
            float velMagnitude = length(mouseVel);
            float q = distToSegment(U, mousePos, mousePrev);
            vec2 m = mousePos - mousePrev;
            float mLen = length(m);
            if (mLen > 0.0) m = min(mLen, 10.0) * m / mLen;

            float brushSizeFactor = 1e-4 / uBrushSize;
            float strengthFactor = 0.03 * uBrushStrength;

            float falloff = exp(-brushSizeFactor * q * q * q);
            falloff = pow(falloff, 0.5);

            me.xyz += strengthFactor * falloff * vec3(m, 10.0);

            if (velMagnitude < 2.0) {
                float distToCursor = length(U - mousePos);
                float influence = exp(-distToCursor * 0.01);
                float cursorDecay = mix(1.0, uStopDecay, influence);
                me.xy *= cursorDecay;
                me.z *= cursorDecay;
            }
        }
        gl_FragColor = clamp(me, -0.4, 0.4);
    }
}
`;

export const displayShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform sampler2D iFluid;
uniform float uDistortionAmount;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform float uColorIntensity;
uniform float uSoftness;
varying vec2 vUv;

void main() {
    vec2 fragCoord = vUv * iResolution;
    vec4 fluid = texture2D(iFluid, vUv);
    vec2 fluidVel = fluid.xy;

    float mr = min(iResolution.x, iResolution.y);
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / mr;

    uv += fluidVel * (0.5 * uDistortionAmount);

    float d = -iTime * 0.5;
    float a = 0.0;
    for (float i = 0.0; i < 8.0; ++i) {
        a += cos(i - d - a * uv.x);
        d += sin(uv.y * i + a);
    }
    d += iTime * 0.5;

    float mixer1 = cos(uv.x * d) * 0.5 + 0.5;
    float mixer2 = cos(uv.y * a) * 0.5 + 0.5;
    float mixer3 = sin(d + a) * 0.5 + 0.5;

    float smoothAmount = clamp(uSoftness * 0.1, 0.0, 0.9);
    mixer1 = mix(mixer1, 0.5, smoothAmount);
    mixer2 = mix(mixer2, 0.5, smoothAmount);
    mixer3 = mix(mixer3, 0.5, smoothAmount);

    vec3 col = mix(uColor1, uColor2, mixer1);
    col = mix(col, uColor3, mixer2);
    col = mix(col, uColor4, mixer3 * 0.4);

    col *= uColorIntensity;

    gl_FragColor = vec4(col, 1.0);
}
`;

export const fluidConfig = {
    brushSize: 25.0,
    brushStrength: 0.5,
    distortionAmount: 2.5,
    fluidDecay: 0.98,
    trailLength: 0.8,
    stopDecay: 0.85,
    color1: "#002211",
    color2: "#00ff88",
    color3: "#aaff00",
    color4: "#00ffcc",
    colorIntensity: 1.0,
    softness: 1.0,
    mouseSmoothing: 0.1,
};
