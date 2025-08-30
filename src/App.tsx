import { Canvas } from '@react-three/fiber';
import { useGLTF, Bvh, Bounds, Html } from '@react-three/drei';
import { Suspense, useMemo, useRef, useState } from 'react';
import { useControls } from 'leva';
import { models } from './models';
import Model from './components/Model';
import Loader from './components/Loader';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/Addons.js';
//import { OrbitControls as OrbitControlsType } from 'three-stdlib';
import { CameraControls } from "@react-three/drei";

Object.keys(models).forEach((k) => useGLTF.preload(models[k].url));


const App = () => {

  const [userModel, setUserModel] = useState<GLTF | null>(null);

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

  const annotationOpt = {
    mode: {
      options: ['Point', 'Line', 'Polygon'],
      label: 'Drawing Mode',
      value: 'Point'
    },
    color: {
      label: 'Drawing Color',
      value: '#00dee1'
    },
    show: {
      label: 'Show Annotations',
      value: true
    }
  };

  const modelControls = useControls('Model', modelOpt);
  const sceneControls = useControls('Scene', sceneOpt);
  const annotationControls = useControls('Annotation', annotationOpt);


  const controls = useRef<CameraControls | null>(null);

  const handleGLBUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    if(!file ) return;
    const reader = new FileReader();

    reader.onload = (e) => {
      const buffer = e.target?.result;
      if(!buffer) {
        alert('failed to load model');
        return;
      };

      const loader = new GLTFLoader();
      loader.parse(buffer, '', (gltf) => {
        setUserModel(gltf);
        
      })
    }
    reader.readAsArrayBuffer(file);
      
  
}


  return (
    <div className="h-screen w-screen">
      
      <Canvas  >
        <color attach='background' args={[sceneControls.background]}/>
        <CameraControls ref={controls} />
        <ambientLight args={['white', sceneControls.ambientLightIntensity]} />
        <directionalLight 
          args={['white', sceneControls.directionalLightIntensity]} 
          position={[sceneControls.x, sceneControls.y, sceneControls.z]} 
        />
        <Suspense fallback={<Loader />}>
          <Bvh firstHitOnly>
            <Bounds>
              {
                !userModel && modelControls.modelName === "userModel" ?
                (
                  <Html center 
                    style={{
                      fontWeight: 'bold',
                      color: 'gray',
                      fontSize: '1.3rem'
                    }}
                  >
                    <h2 >
                      No Model Uploaded Yet
                    </h2>
                    <input 
                        type="file" 
                        className='bg-gray-100 border-2 border-gray-300 p-2 rounded-xl w-36 mt-3' 
                        onInputCapture={handleGLBUpload}
                      />
                  </Html>
                ) : (
                  <Model
                    options={modelControls}
                    annotationOptions={annotationControls}
                    userGltf={userModel}
                    controlsRef={controls}
                  />
                )
              }
            </Bounds>
          </Bvh>
        </Suspense>
      </Canvas>
    </div>
  )
}




export default App;
