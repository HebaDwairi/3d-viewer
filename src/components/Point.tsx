import { Vector3 } from "three";
import createTextLabelTexture from "../utils/createTextLabelTexture";

const Point = (
  { point, color, size } 
   : 
  { 
    point: Vector3, 
    color: string, 
    size: number 
  }) => {

  const texture = createTextLabelTexture(`( ${point.x.toFixed(1)}, ${point.y.toFixed(1)} , ${point.z.toFixed(1)} )`, 21);
    
  return(
  <>
    <mesh position={point} >
      <meshBasicMaterial color={color}/>
      <sphereGeometry args={[size]} />
    </mesh>
    <sprite
      position={new Vector3(point.x, point.y + size * 2.5, point.z)}
      scale={size * 20}
    >
      <spriteMaterial 
        map={texture} 
        transparent={true}
        depthTest={false}
      />
    </sprite>
  
  </>
  );
}

export default Point;