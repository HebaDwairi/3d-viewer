import { Color, Line, Mesh, type Object3D } from "three";

export default function changeMaterialColor (obj: Object3D, color: string | number | Color) {
  obj.traverse((o) => {
    if (o instanceof Mesh || o instanceof Line) {
      o.material.color = new Color(color)
    }
  });
}