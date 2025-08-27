import { Html, useBounds, useGLTF } from "@react-three/drei";
import { Group, Mesh } from "three";
import { models } from "../models";
import { useEffect, useRef, useState } from "react";
import * as THREE from 'three'
import { useThree } from "@react-three/fiber";
import type { GLTF } from "three/examples/jsm/Addons.js";


const Model = ({
  options, userGltf, annotationOptions
}: {
  options: {
    modelName: string
    wireframe: boolean
    opacity: number
    visible: boolean,
    scale: number
  },
  userGltf?: GLTF,
  annotationOptions: {
    mode: string,
    color: string
  }
}) => {
  const modelData = models[options.modelName];
console.log(annotationOptions);

  let gltf = useGLTF(modelData.url);
  if(userGltf && options.modelName === "userModel") gltf = userGltf;
  
  
  const ref = useRef<Group | null>(null);


  const bounds = useBounds()

  useEffect(() => {
    if (ref.current) {
      bounds.refresh(ref.current).fit();
    }
  }, [bounds, ref, gltf])

  gltf.scene.traverse((o) => {
    if (o instanceof Mesh) {
      o.material.wireframe = options.wireframe;
      o.material.transparent = true;
      o.material.opacity = options.opacity;
    }
  })

  const {scene} = useThree();

  const [points, setPoints] = useState<THREE.Vector3[]>([]);

  const drawPoint = (p: THREE.Vector3) => {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.005), new THREE.MeshBasicMaterial({color:annotationOptions.color}));
    sphere.position.set(p.x, p.y, p.z);
    scene.add(sphere);
  }

  const drawLine = (p: THREE.Vector3) => {
    drawPoint(p);
    if(points.length === 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints( [...points, p] );
      const line = new THREE.Line( geometry,new THREE.MeshBasicMaterial({color:annotationOptions.color}) );
      scene.add(line);
      setPoints([]);
    }
    else {
      setPoints([p]);
    }
  }

  const drawPolygon = (p: THREE.Vector3, close: boolean) => {
    drawPoint(p);
    const newPoint = close ? points[0] : p; 
    
    if(close) {
      const geometry = new THREE.BufferGeometry().setFromPoints( [...points, newPoint] );
      const line = new THREE.Line( geometry,new THREE.MeshBasicMaterial({color:annotationOptions.color}) );
      scene.add(line);
      setPoints([]); 
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
      <primitive object={gltf.scene} />
    </group>
  )
}


export default Model;