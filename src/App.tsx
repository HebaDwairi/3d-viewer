import { Canvas} from '@react-three/fiber';
import { useGLTF, Bvh, Bounds, Html } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { button, useControls } from 'leva';
import { models } from './models';
import Model from './components/Model';
import Loader from './components/Loader';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/Addons.js';
import { CameraControls } from "@react-three/drei";
import { useAnnotations } from './hooks/useAnnotations';
import { exportJson } from './utils/exportJson';
import { importJson } from './utils/importJson';

Object.keys(models).forEach((k) => useGLTF.preload(models[k].url));


const App = () => {

  const [userModel, setUserModel] = useState<GLTF | null>(null);
  const { menu, setMenu, deleteAnnotation, annotations, setAnnotations } = useAnnotations();
  const fileRef = useRef<HTMLInputElement>(null);
  const annotationsRef = useRef(annotations);
  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations]);

  const modelOpt = useMemo(() => ({
    modelName: {
      options: Object.keys(models),
      value: 'userModel',
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
      options: ['point', 'line', 'polygon'],
      label: 'Drawing Mode',
      value: 'point'
    },
    color: {
      label: 'Drawing Color',
      value: '#00dee1'
    },
    show: {
      label: 'Show Annotations',
      value: true
    },
    export: button(() => {
      exportJson(annotationsRef.current);
    }),
    import: button(() => {
      fileRef.current?.click();
    }),
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
      });
    }
    reader.readAsArrayBuffer(file);
      
}




  return (
    <div className="h-screen w-screen">
      
      <Canvas onClick={() => {
        if(menu.open) setMenu({...menu, open: false});
      }}
      >
        <color attach='background' args={[sceneControls.background]}/>
        <CameraControls ref={controls} />
        <ambientLight args={['white', sceneControls.ambientLightIntensity]} />
        <directionalLight 
          args={['white', sceneControls.directionalLightIntensity]} 
          position={[sceneControls.x, sceneControls.y, sceneControls.z]} 
        />
        <Suspense fallback={<Loader />}>
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
                <Bvh firstHitOnly>
                  <Model
                    options={modelControls}
                    annotationOptions={annotationControls}
                    userGltf={userModel}
                    controlsRef={controls}
                  />
                </Bvh>  
              )
            }
          </Bounds>
        </Suspense>
      </Canvas>
      {
        menu.open && 
        <div style={{
          position: 'absolute',
          top: menu.position.y - 10,
          left: menu.position.x + 10,
          zIndex: 100,
          
        }}
        className='bg-gray-200 rounded text-gray-500 p-0 border-2 border-gray-300'
        >
          
          <button className='border-b-1 border-gray-300 py-2 p-1 hover:bg-gray-400 hover:text-white rounded transition-colors'
            onClick={() => {
              deleteAnnotation(menu.selectedObject);
              setMenu({...menu, open: false});
            }}>Delete</button>
        </div>
      }
      <input 
        hidden
        
        onChange={(e) => {
          const data = importJson(e);
          //console.log(data);
          
          setAnnotations(data);
        }}
        ref={fileRef}
        type='file'
      />
    </div>
  )
}




export default App;
