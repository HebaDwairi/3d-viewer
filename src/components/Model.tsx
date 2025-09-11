import { CameraControls } from "@react-three/drei";
import { Box3, Group, Mesh, Vector3 } from "three";
import { models } from "../models";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { type GLTF } from "three/examples/jsm/Addons.js";
import Point from "./Point";
import Polygon from "./Polygon";
import { useAnnotations } from "../hooks/useAnnotations";
import type { ShapeType } from "../contexts/AnnotationsContext";
import { useGLTFLoader } from "../hooks/useGltfLoader";
import type { ThreeEvent } from "@react-three/fiber";

const Model = ({
  options, userGltf, annotationOptions, controlsRef, GLTFRef
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
  GLTFRef: React.RefObject<Group | null>,
}) => {
  const modelData = models[options.modelName];
  const { annotations, setAnnotations, addPoint, closeShape, currentShape } = useAnnotations();
  const [mousePoint, setMousePoint] = useState<Vector3>(new Vector3(0, 0, 0));
  const [dotSize, setDotSize] = useState(0);

  const { gltf } = useGLTFLoader(modelData.url);
  

  const model = useMemo(() => {
    const scene = userGltf && options.modelName === "userModel" ? userGltf.scene : gltf.scene;
    return scene.clone();
  }, [gltf.scene, userGltf, options.modelName]);

  const ref = useRef<Group | null>(null);


  useEffect(() => {
    if (!model) return;

    model.traverse((o) => {
      if (o instanceof Mesh) {
        if (o.material.wireframe !== options.wireframe) {
          o.material.wireframe = options.wireframe;
        }
        if (o.material.opacity !== options.opacity) {
          o.material.transparent = options.opacity < 1;
          o.material.opacity = options.opacity;
        }
        o.material.needsUpdate = true;
      }
    });
  }, [model, options.wireframe, options.opacity]);


  useEffect(() => {
    if (ref.current && controlsRef.current && model) {
        controlsRef.current?.fitToBox(ref.current!, true);
    }
  }, [model, controlsRef]);


  useEffect(() => {
    if (!model) return;
    
    setAnnotations({
      points: [],
      lines: [],
      polygons: [],
    });

    const bbox = new Box3().setFromObject(model);
    const size = new Vector3();
    bbox.getSize(size);
    const dotsSize = Math.abs(Math.log(size.x * size.y * size.z)) * 0.01;
    setDotSize(dotsSize);
  }, [model, setAnnotations]);


  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (annotationOptions.mode === 'none') return;
    addPoint(e.point, annotationOptions.mode as ShapeType);
  }, [annotationOptions.mode, addPoint]);

  const handleDoubleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (annotationOptions.mode === 'none') return;
    closeShape();
  }, [annotationOptions.mode, closeShape]);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (annotationOptions.mode === 'none') return;
    setMousePoint(e.point);
  }, [annotationOptions.mode]);


  const renderedAnnotations = useMemo(() => (
    <group visible={annotationOptions.show}>
      {annotations.points.map(p => 
        <Point 
          key={p.id} 
          point={p.value} 
          color={annotationOptions.color} 
          size={dotSize}
        />
      )}
      {annotations.lines.map(l => 
        <Polygon 
          key={l.id}
          p={l}
          color={annotationOptions.color} 
          size={dotSize}
        />
      )}
      {annotations.polygons.map(p => 
        <Polygon
          key={p.id} 
          p={p} 
          color={annotationOptions.color} 
          size={dotSize}
        />
      )}
    </group>
  ), [annotations, annotationOptions.show, annotationOptions.color, dotSize]);

  if (!model) return null;

  return (
    <>
      <group
        ref={ref}
        visible={options.visible}
        scale={options.scale}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onPointerMove={handlePointerMove}
      >
        <primitive object={model} ref={GLTFRef} />
      </group>
      
      {currentShape && (
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
      )}

      {renderedAnnotations}
    </>
  );
};

export default Model;