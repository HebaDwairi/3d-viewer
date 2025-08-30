import type { ILine } from "../interfaces/shapes";
import Polygon from "./Polygon";

const Line = ({ l, color, size } : { l: ILine, color: string, size: number }) => {
  return (
    <Polygon 
      p={{
        id: l.id,
        points: [l.u, l.v]
      }}
      color={color}
      size={size}
    />
  );
}

export default Line;