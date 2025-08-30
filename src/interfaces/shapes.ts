import { Vector3 } from "three"

export interface ILine {
  id: number,
  u: Vector3,
  v: Vector3
};

export interface IPolygon {
  id: number,
  points: Vector3[],
};

export interface IPoint {
  id: number,
  value: Vector3
}