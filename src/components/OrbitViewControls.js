import { OrbitControls } from '@react-three/drei';

export default function OrbitViewControls() {
  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.06}
      screenSpacePanning={true}
      minDistance={0.1}
      maxDistance={500}
      maxPolarAngle={Math.PI / 1.8}
    />
  );
}
