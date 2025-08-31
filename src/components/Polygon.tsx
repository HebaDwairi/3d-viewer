import type { IPolygon } from "../interfaces/shapes";
import Point from "./Point";

const Polygon = ({ p, color, size } : { p: IPolygon, color: string, size: number }) => {
  const points = p.points;
  const positions = new Float32Array(points.flatMap(p => [p.x, p.y, p.z]));

  return(
    <group>
      <line>
        <lineBasicMaterial color={color} depthTest={false} depthWrite={false}/>
        <bufferGeometry attach='geometry'>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
      </line>
      {points.map((point, i) => (
        <Point 
          key={p.id + i}
          point={point} 
          color={color} 
          size={size}
        />))
      }
    </group>
  );
}
export default Polygon;