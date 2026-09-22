import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { vertexShader, fluidShader, displayShader, fluidConfig } from '../utils/FluidShader';

type FluidBackgroundProps = {
  variant?: 'guide' | 'template' | 'policy';
};

const templateConfig = {
  ...fluidConfig,
  color1: '#24120b',
  color2: '#ff8a3d',
  color3: '#ffd166',
  color4: '#2dd4bf',
};

const policyConfig = {
  ...fluidConfig,
  color1: '#071a2b',
  color2: '#168aad',
  color3: '#f4a261',
  color4: '#e76f51',
};

const FluidBackground: React.FC<FluidBackgroundProps> = ({ variant = 'guide' }) => {
  const shaderConfig = variant === 'template' ? templateConfig : variant === 'policy' ? policyConfig : fluidConfig;
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const rtParams = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };

    let fluidTarget1 = new THREE.WebGLRenderTarget(width, height, rtParams);
    let fluidTarget2 = new THREE.WebGLRenderTarget(width, height, rtParams);

    const quadGeometry = new THREE.PlaneGeometry(2, 2);

    const fluidMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(width, height) },
        iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
        uMouseDown: { value: 1.0 },
        iFrame: { value: 0 },
        iPreviousFrame: { value: null },
        uBrushSize: { value: shaderConfig.brushSize },
        uBrushStrength: { value: shaderConfig.brushStrength },
        uFluidDecay: { value: shaderConfig.fluidDecay },
        uTrailLength: { value: shaderConfig.trailLength },
        uStopDecay: { value: shaderConfig.stopDecay },
      },
      vertexShader,
      fragmentShader: fluidShader,
    });

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return new THREE.Vector3(r, g, b);
    };

    const displayMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(width, height) },
        iFluid: { value: null },
        uDistortionAmount: { value: shaderConfig.distortionAmount },
        uColor1: { value: hexToRgb(shaderConfig.color1) },
        uColor2: { value: hexToRgb(shaderConfig.color2) },
        uColor3: { value: hexToRgb(shaderConfig.color3) },
        uColor4: { value: hexToRgb(shaderConfig.color4) },
        uColorIntensity: { value: shaderConfig.colorIntensity },
        uSoftness: { value: shaderConfig.softness },
      },
      vertexShader,
      fragmentShader: displayShader,
    });

    const quad = new THREE.Mesh(quadGeometry, fluidMaterial);
    scene.add(quad);

    const mousePos = new THREE.Vector2(0, 0);
    const smoothedMousePos = new THREE.Vector2(0, 0);
    const mousePrev = new THREE.Vector2(0, 0);
    let frame = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mousePos.set(
        e.clientX - rect.left,
        rect.bottom - e.clientY
      );
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = (time: number) => {
      const t = time * 0.001;

      fluidMaterial.uniforms.iTime.value = t;
      fluidMaterial.uniforms.iFrame.value = frame;

      smoothedMousePos.lerp(mousePos, shaderConfig.mouseSmoothing);

      fluidMaterial.uniforms.iMouse.value.set(
        smoothedMousePos.x,
        smoothedMousePos.y,
        mousePrev.x,
        mousePrev.y
      );

      displayMaterial.uniforms.iTime.value = t;

      const source = fluidTarget1;
      const destination = fluidTarget2;

      fluidMaterial.uniforms.iPreviousFrame.value = source.texture;

      renderer.setRenderTarget(destination);
      renderer.render(scene, camera);

      quad.material = displayMaterial;
      displayMaterial.uniforms.iFluid.value = destination.texture;

      renderer.setRenderTarget(null);
      renderer.render(scene, camera);

      quad.material = fluidMaterial;
      fluidTarget1 = destination;
      fluidTarget2 = source;

      mousePrev.copy(smoothedMousePos);
      frame++;

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    const resizeRenderer = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      fluidTarget1.setSize(w, h);
      fluidTarget2.setSize(w, h);
      fluidMaterial.uniforms.iResolution.value.set(w, h);
      displayMaterial.uniforms.iResolution.value.set(w, h);
    };

    const resizeObserver = new ResizeObserver(resizeRenderer);
    resizeObserver.observe(container);
    window.addEventListener('resize', resizeRenderer);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeRenderer);
      resizeObserver.disconnect();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      fluidTarget1.dispose();
      fluidTarget2.dispose();
      quadGeometry.dispose();
      fluidMaterial.dispose();
      displayMaterial.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

export default FluidBackground;
