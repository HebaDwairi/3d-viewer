import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useProgress, Html, useGLTF, Center } from '@react-three/drei';
import { Suspense, useEffect, useMemo } from 'react';
import { useControls } from 'leva';
import { Color, Mesh } from 'three';

interface ModelMap {
  [key: string]: {
    url: string,
    scale: number,
  } 
};

const models : ModelMap = {
  'drone' : {
    url: '/models/drone/scene.gltf',
    scale: 0.1,
  },
  'chair' : {
    url: '/models/office_chair/scene.gltf',
    scale: 2,
  },
  'robot' : {
    url: '/models/robot_a.l.e.x/scene.gltf',
    scale: 1.5,
  },
}
Object.keys(models).forEach((k) => useGLTF.preload(models[k].url));

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>
}

function Model({
  options
}: {
  options: {
    modelName: string
    wireframe: boolean
    opacity: number
    visible: boolean,
    scale: number
  }
}) {
  const modelData = models[options.modelName]
  

  const gltf = useGLTF(modelData.url).scene;

  gltf.traverse((o) => {
    if (o instanceof Mesh) {
      o.material.wireframe = options.wireframe
      o.material.transparent = true
      o.material.opacity = options.opacity
    }
  })

  return (
    <group
      visible={options.visible}
      scale={options.scale * modelData.scale}
    >
      <primitive object={gltf} />
    </group>
  )
}

const Background = ({ color }: { color : string }) => {
  const { scene } = useThree();
  
  useEffect(() => {
    scene.background = new Color(color);
  }, [color, scene]);

  return null;
}


function App() {

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
      value: 0,
      min: -10,
      max: 10,
      step: 0.1,
      label: 'X Light Position'
    },
    y: {
      value: 0,
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
        <directionalLight args={['white', sceneControls.directionalLightIntensity]} position={[sceneControls.x, sceneControls.y, sceneControls.z]} />
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
