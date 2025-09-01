import { CameraControls, useBounds, useGLTF } from "@react-three/drei";
import { Group, Mesh, Vector3 } from "three";
import { models } from "../models";
import { useEffect, useRef, useState } from "react";
import type { GLTF } from "three/examples/jsm/Addons.js";
import Point from "./Point";
import Polygon from "./Polygon";
import Line from "./Line";
import { useAnnotations } from "../hooks/useAnnotations";
import type { ShapeType } from "../contexts/AnnotationsContext";



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
  controlsRef: React.RefObject<CameraControls | null>,
}) => {
  const modelData = models[options.modelName];
  const { annotations, setAnnotations, addPoint, closePolygon, currentShape } = useAnnotations();
  const [mousePoint, setMousePoint] = useState<Vector3>( new Vector3(0, 0, 0));

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
  }, [bounds, model, setAnnotations]);
  


  return (
    <>
    <group
      ref={ref}
      visible={options.visible}
      scale={options.scale}
      onClick={(e) => {
        e.stopPropagation();
         addPoint(e.point, annotationOptions.mode as ShapeType);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        closePolygon();
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        setMousePoint(e.point);
      }}
    >
      <primitive object={modelClone} />
    </group>
    {
      currentShape && 
      <Polygon  
        key={'temp'}
        p={{ 
          id: -1,
          points: [...currentShape.points, mousePoint] 
        }} 
        color='#f1ff2c' 
        size={dotSize}
        disableEvents={true}
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
            key={p.id} 
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