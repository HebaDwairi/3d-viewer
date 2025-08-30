import { CameraControls,  useBounds, useGLTF } from "@react-three/drei";
import { Group, Mesh } from "three";
import { models } from "../models";
import { useEffect, useRef, useState } from "react";
import * as THREE from 'three'
import type { GLTF } from "three/examples/jsm/Addons.js";
import type { IPoint, ILine, IPolygon } from "../interfaces/shapes";
import Point from "./Point";
import Polygon from "./Polygon";
import Line from "./Line";


interface Annotations {
  points: IPoint[],
  lines: ILine[],
  polygons: IPolygon[]
};



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
  controlsRef: React.RefObject<CameraControls | null>
}) => {
  const modelData = models[options.modelName];
  const [currentShape, setCurrentShape] = useState<{
    id: number,
    type: 'point' | 'line' | 'polygon'
  } | null>(null);
  const [annotations, setAnnotations] = useState<Annotations>({
    points: [],
    lines: [],
    polygons: [],
  });
  const [mousePoint, setMousePoint] = useState<THREE.Vector3>( new THREE.Vector3(0, 0, 0));
  

  const gltf = useGLTF(modelData.url);
  const model = userGltf && options.modelName === "userModel" ? userGltf.scene :  gltf.scene;
  
  const bounds = useBounds();
  const [dotSize, setDotSize] = useState(0);
  
  
  const ref = useRef<Group | null>(null);

  useEffect(() => {
    if (ref.current && controlsRef) {
      controlsRef.current?.fitToBox(ref.current, true);
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
    setAnnotations({
      points: [],
      lines: [],
      polygons: [],
    });

    bounds.refresh(model);
    const size = bounds.getSize().size;
    const dotsSize = Math.abs(Math.log(size.x * size.y * size.z ))* 0.01;


    setDotSize(dotsSize);
  }, [bounds, model]);
  


  const [points, setPoints] = useState<THREE.Vector3[]>([]);

  const drawPoint = (p: THREE.Vector3) => {
    const point = {
      id: Math.random(),
      value: p
    }
    
    setAnnotations(prev => ({...prev, points: [...prev.points, point]}));
  }

  const drawLine = (p: THREE.Vector3) => {
    if(points.length === 1 && currentShape && currentShape.type === 'line') {
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
      if(!currentShape) setCurrentShape({id: Math.random(), type: 'line'});
      setPoints([p]);
    }
  }

  const drawPolygon = (p: THREE.Vector3, close: boolean) => {    
    if(close && currentShape && currentShape?.type === 'polygon') {
      const polygon : IPolygon = {
        id : currentShape.id,
        points: [...points, points[0]]
      }
      setAnnotations(prev => ({...prev, polygons: [...prev.polygons, polygon]}));
      setPoints([]);
      setCurrentShape(null);
    }
    else {
      if(!currentShape) setCurrentShape({id: Math.random(), type: 'polygon'})
      setPoints(points.concat(p));
    } 
  }


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
        if(currentShape?.type === 'polygon') {
          drawPolygon(e.point, true);
        }
      }}
      onPointerMove={(e) => {
        setMousePoint(e.point);
      }}
    >
      
      <primitive object={modelClone} />
    </group>
    {
      currentShape && 
      <Polygon  
        p={{ 
          id: -1,
          points: [...points, mousePoint] 
        }} 
        color='#f1ff2c' 
        size={dotSize}
      /> 
    }
    <group visible={annotationOptions.show}>
      {
        annotations.points.map(p => 
          <Point 
            key={p.id} 
            point={p.value} 
            color={annotationOptions.color} 
            size={dotSize}
          />)
      }
      {
        annotations.lines.map(l => 
          <Line 
            key={l.id}
            l={l}
            color={annotationOptions.color} 
            size={dotSize}
          />)
      }
      {
        annotations.polygons.map(p => 
          <Polygon 
            p={p} 
            color={annotationOptions.color} 
            size={dotSize}
          />
        )
      }
    </group>
    </>
  )
}



export default Model;