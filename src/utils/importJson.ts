import type { ChangeEvent } from "react";
import type { Annotations } from "../interfaces/shapes";
import { Vector3 } from "three";
import type { IPolygon, IPoint, ILine } from "../interfaces/shapes";

export const importJson = (e: ChangeEvent<HTMLInputElement>) => {
  const annotations : Annotations = {
    points: [],
    lines: [],
    polygons: []
  };


  if(!e.target.files) return annotations;
  const fileReader = new FileReader();
  fileReader.readAsText(e.target.files[0], "UTF-8");
      
  
  fileReader.onload = (e) => {

    const data = JSON.parse(e.target?.result as string);
    //console.log(data);


    annotations.points = (data.points instanceof Array ? data.points : []).map((p: IPoint) => ({
      id: p.id,
      value: new Vector3(p.value.x, p.value.y, p.value.z)
    }));

    annotations.lines = (data.lines instanceof Array ? data.lines : []).map((l: ILine) => ({
      id: l.id,
      u: new Vector3(l.u.x, l.u.y, l.u.z),
      v: new Vector3(l.v.x, l.v.y, l.v.z)
    }));

    annotations.polygons = (data.polygons instanceof Array ? data.polygons : []).map((p: IPolygon) => ({
      id: p.id,
      points: p.points.map(p => new Vector3(p.x, p.y, p.z))
    }));
  }

  return annotations;
};