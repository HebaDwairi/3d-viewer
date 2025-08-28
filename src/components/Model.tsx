import { CameraControls, Html, useBounds, useGLTF } from "@react-three/drei";
import { Group, Mesh } from "three";
import { models } from "../models";
import { useEffect, useRef, useState } from "react";
import * as THREE from 'three'
import { useThree } from "@react-three/fiber";
import type { GLTF } from "three/examples/jsm/Addons.js";

interface Line {
  id: number,
  u: THREE.Vector3,
  v: THREE.Vector3
};

interface Polygon {
  id: number,
  points: THREE.Vector3[],
};

interface Point {
  id: number,
  value: THREE.Vector3
}

interface Annotations {
  points: Point[],
  lines: Line[],
  polygons: Polygon[]
};

const Point = ({ point, color, size } : { point: THREE.Vector3, color: string, size: number }) => {
  return(
    <mesh position={point} >
      <meshBasicMaterial color={color}/>
      <sphereGeometry args={[size]} />
    </mesh>
  );
}


const Model = ({
  options, userGltf, annotationOptions, controlsRef
}: {
  options: {
    modelName: string
    wireframe: boolean
    opacity: number
    visible: boolean,
    scale: number
  },
  userGltf?: GLTF | null,
  annotationOptions: {
    mode: string,
    color: string,
    show: boolean
  },
  controlsRef: React.RefObject<CameraControls> | null
}) => {
  const modelData = models[options.modelName];
  const annotationsRef = useRef<Group | null>(null);
  const [currentShape, setCurrentShape] = useState<{
    id: number,
    type: 'point' | 'line' | 'polygon'
  } | null>(null);
  const [annotations, setAnnotations] = useState<Annotations>({
    points: [],
    lines: [],
    polygons: [],
  });
  console.log(annotations);
  

  const gltf = useGLTF(modelData.url);
  const model = userGltf && options.modelName === "userModel" ? userGltf.scene :  gltf.scene;
  
  const bounds = useBounds();
  const [dotSize, setDotSize] = useState(0);
  
  
  const ref = useRef<Group | null>(null);

  useEffect(() => {
    if (ref.current && controlsRef) {
      controlsRef.current.fitToBox(ref.current, true);
    }
  }, [ref, model, controlsRef]);

  const modelClone = model.clone();
  useEffect(() => {
    modelClone.traverse((o) => {
      if (o instanceof Mesh) {
        o.material.wireframe = options.wireframe;
        o.material.transparent = true;
        o.material.opacity = options.opacity;
      }
    });
  }, [modelClone, options.opacity, options.wireframe]);

  useEffect(() => {
    bounds.refresh(model);
    const size = bounds.getSize().size;
    const dotsSize = Math.abs(Math.log(size.x * size.y * size.z ))* 0.01;

   

    setDotSize(dotsSize);
  }, [bounds, model]);
  

  const {scene} = useThree();

  const [points, setPoints] = useState<THREE.Vector3[]>([]);

  const drawPoint = (p: THREE.Vector3) => {
    //if id is provided its added to the mesh with that id

    // console.log(dotSize);
    // const sphere = new THREE.Mesh(new THREE.SphereGeometry(dotSize), new THREE.MeshBasicMaterial({color:annotationOptions.color}));
    // sphere.position.set(p.x, p.y, p.z);
    // annotationsRef.current?.add(sphere);
    const point = {
      id: Math.random(),
      value: p
    }
    
    
    setAnnotations(prev => ({...prev, points: [...prev.points, point]}));
  }

  const drawLine = (p: THREE.Vector3) => {
    // drawPoint(p);
    // if(points.length === 1) {
    //   const geometry = new THREE.BufferGeometry().setFromPoints( [...points, p] );
    //   const line = new THREE.Line( geometry,new THREE.MeshBasicMaterial({color:annotationOptions.color}) );
    //   scene.add(line);
    //   setPoints([]);
    //   const old = scene.getObjectByName('preview');
    //   if(old) {
    //     scene.remove(old);
    //   }
    // }
    // else {
    //   setPoints([p]);
    // }

    if(points.length === 1 && currentShape?.type === 'line') {
      const line  = {
        id: currentShape.id,
        u: points[0],
        v: p
      }
      setAnnotations(prev => ({...prev, lines: [...prev.lines, line]}));
      setPoints([]);
      setCurrentShape(null);
    }
    else {
      if(!currentShape) setCurrentShape({id: Math.random(), type: 'line'})
      setPoints([p]);
    }
  }

  const drawPolygon = (p: THREE.Vector3, close: boolean) => {
    drawPoint(p);
    const newPoint = close ? points[0] : p; 
    
    if(close) {
      const geometry = new THREE.BufferGeometry().setFromPoints( [...points, newPoint] );
      const line = new THREE.Line( geometry,new THREE.MeshBasicMaterial({color:annotationOptions.color}) );
      annotationsRef.current?.add(line);
      setPoints([]); 

      const old = scene.getObjectByName('preview');
      if(old) {
        scene.remove(old);
      }
    }
    else {
      setPoints(points.concat(newPoint));
    } 
  }


  if(!userGltf && options.modelName === "userModel") 
    return <Html center >
      <h2 style={{fontWeight: 'bold', fontSize: '1.5rem', color:'gray'}}>
        No Model Uploaded Yet
      </h2>
    </Html>;

  return (
    <>
    <group
      ref={ref}
      visible={options.visible}
      scale={options.scale * modelData.scale}
      onClick={(e) => {
        e.stopPropagation();

        switch(annotationOptions.mode) {
          case 'Point': drawPoint(e.point); break;
          case 'Line': drawLine(e.point); break;
          case 'Polygon': drawPolygon(e.point, false); break;
        }
      }}
      onDoubleClick={(e) => {
        drawPolygon(e.point, true);
      }}
      onPointerMove={(e) => {
        if(points.length > 0) {
          const old = scene.getObjectByName('preview');
          if(old) {
            scene.remove(old);
          }
          const geometry = new THREE.BufferGeometry().setFromPoints( [...points, e.point] );
          const line = new THREE.Line( geometry,new THREE.LineDashedMaterial({color:'gray'}) );
          line.name = 'preview';
          scene.add(line);
        }
      }}
    >
      
      <primitive object={modelClone} />
    </group>
    <group ref={annotationsRef} visible={annotationOptions.show}>
      {
        annotations.points.map(p => <Point 
            key={p.id} 
            point={p.value} 
            color={annotationOptions.color} 
            size={dotSize}
          />)
      }
      {
        annotations.lines.map(l => {
          const postions = new Float32Array([l.u.x, l.u.y, l.u.z, l.v.x, l.v.y, l.v.z]);
          
          return(
            <>
              <line key={l.id}>
                <meshBasicMaterial color={annotationOptions.color}/>
                <bufferGeometry attach='geometry'>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[postions, 3]}
                  />
                </bufferGeometry>
              </line>
              <Point 
                point={l.u} 
                color={annotationOptions.color} 
                size={dotSize}
              />
              <Point 
                point={l.v} 
                color={annotationOptions.color} 
                size={dotSize}
              />
            </>
          );
        })
      }
    </group>
    </>
  )
}



export default Model;