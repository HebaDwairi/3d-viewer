import type { Vector3 } from "three";

const Point = (
  { point, color, size } 
   : 
  { 
    point: Vector3, 
    color: string, 
    size: number 
  }) => {
    
  return(
    <mesh position={point} >
      <meshBasicMaterial color={color}/>
      <sphereGeometry args={[size]} />
    </mesh>
  );
}

export default Point;