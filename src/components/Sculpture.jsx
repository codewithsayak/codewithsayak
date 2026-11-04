import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import SculptureFallback from './SculptureFallback.jsx';

export default function Sculpture({ motion }) {
  const hostRef = useRef(null);
  const motionRef = useRef(motion);
  const redrawRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => { motionRef.current = motion; redrawRef.current?.(); }, [motion]);

  useEffect(() => {
    const host = hostRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    camera.position.set(0, 0, 8.4);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x74243e, metalness: 0.96, roughness: 0.21,
      clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.65,
    });
    const geometry = new THREE.TorusKnotGeometry(1.34, 0.46, 220, 40, 2, 3);
    const knot = new THREE.Mesh(geometry, material);
    const sculpture = new THREE.Group();
    sculpture.add(knot);
    scene.add(sculpture);

    const orbit = new THREE.Group();
    const ringGeometry = new THREE.TorusGeometry(2.55, 0.006, 6, 180);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x9b7b84, transparent: true, opacity: 0.48 });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    const dotGeometry = new THREE.SphereGeometry(0.047, 16, 16);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x6b263b });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.position.set(2.55, 0, 0);
    orbit.add(ring, dot);
    orbit.rotation.set(1.13, 0.2, -0.42);
    scene.add(orbit);

    const keyLight = new THREE.DirectionalLight(0xffe8df, 4);
    keyLight.position.set(-3, 5, 4);
    const fillLight = new THREE.DirectionalLight(0xffffff, 2);
    fillLight.position.set(4, -2, 3);
    scene.add(keyLight, fillLight, new THREE.AmbientLight(0xffffff, 0.3));

    let visible = true;
    let frame = 0;
    let scroll = 0;
    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;
    let firstFrame = true;
    const onScroll = () => { scroll = Math.min(window.scrollY / window.innerHeight, 1.5); };
    const onPointer = (event) => {
      if (event.pointerType === 'touch') return;
      const rect = host.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onLeave = () => { pointerX = 0; pointerY = 0; };
    const onContextLost = (event) => { event.preventDefault(); setFailed(true); setReady(false); };
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: '100px' });
    visibilityObserver.observe(host);
    host.addEventListener('pointermove', onPointer);
    host.addEventListener('pointerleave', onLeave);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    resize();

    const draw = (time = 0) => {
      const moving = motionRef.current;
      currentX += ((moving ? pointerX : 0) - currentX) * 0.045;
      currentY += ((moving ? pointerY : 0) - currentY) * 0.045;
      sculpture.rotation.set(
        0.32 + currentY * 0.16 + (moving ? Math.sin(time * 0.0003) * 0.07 : 0),
        -0.4 + currentX * 0.24 + (moving ? time * 0.000075 + scroll * 1.6 : 0),
        -0.38 + (moving ? scroll * 0.3 : 0),
      );
      sculpture.position.y = moving ? Math.sin(time * 0.00065) * 0.065 : 0;
      orbit.rotation.z = -0.42 + (moving ? time * 0.00004 + scroll * 0.3 : 0);
      renderer.render(scene, camera);
      if (firstFrame) { setReady(true); firstFrame = false; }
    };
    redrawRef.current = () => draw(performance.now());
    const animate = (time) => {
      if (visible && !document.hidden && motionRef.current) draw(time);
      frame = requestAnimationFrame(animate);
    };
    draw(0);
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      host.removeEventListener('pointermove', onPointer);
      host.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      geometry.dispose(); material.dispose();
      ringGeometry.dispose(); ringMaterial.dispose();
      dotGeometry.dispose(); dotMaterial.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      redrawRef.current = null;
    };
  }, []);

  return <div className={`sculpture-canvas ${ready && !failed ? 'is-ready' : ''}`} ref={hostRef} aria-hidden="true">{(!ready || failed) && <SculptureFallback />}</div>;
}
