import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, useGLTF } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import { useControls } from 'leva';
import { models } from './models';
import Model from './components/Model';
import Loader from './components/Loader';
import Background from './components/Background';

Object.keys(models).forEach((k) => useGLTF.preload(models[k].url));


const App = () => {

  const modelOpt = useMemo(() => ({
    modelName: {
      options: Object.keys(models),
      value: 'chair',
      label: 'Model'
    },
    wireframe: {
      value: false,
      label: 'Wireframe'
    },
    visible: {
      value: true,
      label: 'Visible'
    },
    opacity: {
      value: 1,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'Opacity'
    },
    scale: {
      value: 1,
      min: 0,
      max: 3,
      step: 0.01,
      label: 'scale'
    }
  }), []);

  const sceneOpt = useMemo(() => ({
    ambientLightIntensity: {
      value: 2,
      min: 0,
      max: 2,
      step: 0.01,
      label: 'Ambient Intensity'
    },
    directionalLightIntensity: {
      value: 2,
      min: 0,
      max: 10,
      step: 0.1,
      label: 'Directional Intensity'
    },
    x: {
      value: 1,
      min: -10,
      max: 10,
      step: 0.1,
      label: 'X Light Position'
    },
    y: {
      value: 2,
      min: -10,
      max: 10,
      step: 0.1,
      label: 'Y Light Position '
    },
    z: {
      value: 0,
      min:-10,
      max: 10,
      step: 0.1,
      label: 'Z Light Position '
    },
    background: { 
      value: 'white' ,
      label: 'Background'
    }
  }), []);

  const modelControls = useControls('Model', modelOpt);
  const sceneControls = useControls('Scene', sceneOpt);

  
  return (
    <div className="h-screen w-screen">
      <Canvas camera={{position: [0, 1.5, 3]}}  >
        <Background color={sceneControls.background} />
        <OrbitControls enableDamping={true}/>
        <ambientLight args={['white', sceneControls.ambientLightIntensity]} />
        <directionalLight 
          args={['white', sceneControls.directionalLightIntensity]} 
          position={[sceneControls.x, sceneControls.y, sceneControls.z]} 
        />
        <Suspense fallback={<Loader />}>
          <Center>
            <Model options={modelControls} />
          </Center>
        </Suspense>
      </Canvas>
    </div>
  )
}




export default App;
