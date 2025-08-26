import { Html, useProgress } from "@react-three/drei";

const Loader = () => {
  const { progress } = useProgress();

  return <Html center >
    <h2 style={{fontWeight: 'bold'}}>
      {progress.toFixed(1)} % loaded
    </h2>
  </Html>
}

export default Loader;