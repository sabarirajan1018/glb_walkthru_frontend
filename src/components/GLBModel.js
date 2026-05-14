import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function GLBModel({ url }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Ensure double-sided rendering for thin walls
        if (child.material) {
          child.material.side = THREE.DoubleSide;
        }
      }
    });
    // Auto-center the model
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);
    scene.position.y = -box.min.y + box.getCenter(new THREE.Vector3()).y - center.y;
  }, [scene]);

  return <primitive object={scene} />;
}
