import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

export default function WalkControls({ teleportTarget, onTeleportDone }) {
  const { camera, gl } = useThree();
  const keys = useRef({});
  const speed = 0.07;

  // Handle teleport
  useEffect(() => {
    if (teleportTarget) {
      camera.position.set(teleportTarget.x, teleportTarget.y + 1.7, teleportTarget.z);
      onTeleportDone?.();
    }
  }, [teleportTarget, camera, onTeleportDone]);

  useEffect(() => {
    const onKeyDown = (e) => (keys.current[e.code] = true);
    const onKeyUp = (e) => (keys.current[e.code] = false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame(() => {
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const k = keys.current;
    if (k['KeyW'] || k['ArrowUp'])    camera.position.addScaledVector(forward, speed);
    if (k['KeyS'] || k['ArrowDown'])  camera.position.addScaledVector(forward, -speed);
    if (k['KeyA'] || k['ArrowLeft'])  camera.position.addScaledVector(right, -speed);
    if (k['KeyD'] || k['ArrowRight']) camera.position.addScaledVector(right, speed);
    if (k['Space'])  camera.position.y += speed * 0.6;
    if (k['ShiftLeft'] || k['ShiftRight']) camera.position.y -= speed * 0.6;
  });

  return (
    <PointerLockControls
      domElement={gl.domElement}
      maxPolarAngle={Math.PI * 0.85}
      minPolarAngle={Math.PI * 0.15}
    />
  );
}
