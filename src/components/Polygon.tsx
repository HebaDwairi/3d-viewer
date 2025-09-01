import type { IPolygon } from "../interfaces/shapes";
import Point from "./Point";
import changeMaterialColor from "../utils/changeMaterialColor";
import { useAnnotations } from "../hooks/useAnnotations";
import { Vector2 } from "three";
import { Line } from "@react-three/drei";

const Polygon = (
  { p, color, size, disableEvents } 
   : 
  { 
    p: IPolygon,
    color: string,
    size: number,
    disableEvents?: boolean,
  }) => {

  const { setMenu } = useAnnotations();
  return(
    <group 
      renderOrder={10} 
      userData={{ id: p.id }}
      onPointerOver={(e) => {
        if(disableEvents) return;
        changeMaterialColor(e.eventObject, 'red');
      }}
      onPointerOut={(e) => {
        if(disableEvents) return;
        changeMaterialColor(e.eventObject, color);
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
        if(disableEvents || !setMenu) return;
        changeMaterialColor(e.eventObject, 'red');
        setMenu({open: true, selectedObject: e.eventObject.userData.id, position: new Vector2(e.clientX, e.clientY)});
      }}
    >
      <Line 
        points={p.points} 
        color={color} 
        transparent={true} 
        opacity={1} 
        depthTest={false}
      />
      
      {p.points.map((point, i) => (
        <Point 
          key={p.id + i + 1}
          point={point} 
          color={color} 
          size={size}
        />))
      }
    </group>
  );
}
export default Polygon;