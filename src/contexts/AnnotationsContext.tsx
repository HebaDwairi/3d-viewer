
import { createContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Vector2, type Vector3 } from 'three';
import type { Annotations } from '../interfaces/shapes';

interface ContextMenu {
  open: boolean,
  selectedObject: number,
  position: Vector2
}

export type ShapeType = 'point' | 'line' | 'polygon';

interface AnnotationsContextType {
  annotations: Annotations,
  setAnnotations: Dispatch<SetStateAction<Annotations>>,
  menu: ContextMenu,
  setMenu: Dispatch<SetStateAction<ContextMenu>>,
  addPoint: (p: Vector3, type: ShapeType) => void,
  closePolygon: () => void,
  deleteAnnotation: (id: number) => void,
  isDrawing: boolean,
  currentShape: {
    id: number,
    type: ShapeType,
    points: Vector3[]
  } | null
}




const AnnotationsContext = createContext<AnnotationsContextType | undefined>(undefined);


export const AnnotationsContextProvider = ({ children }: { children: ReactNode }) => {
  const [annotations, setAnnotations] = useState<Annotations>({
    points: [],
    lines: [],
    polygons: [],
  });
  const [menu, setMenu] = useState<ContextMenu>({
    open: false,
    position: new Vector2(0, 0),
    selectedObject: 0
  });
  const [currentShape, setCurrentShape] = useState<{
    id: number,
    type: ShapeType,
    points: Vector3[]
  } | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);

  const startShape = (type: ShapeType) => {
    if(isDrawing) {
      throw new Error('The current shape is not done yet');
    }

    const newShape = {
      id: Math.random(),
      type: type,
      points: []
    };
    setCurrentShape(newShape);
    setIsDrawing(true);

    return newShape;
  }

  const addPoint = (p: Vector3, type: ShapeType) => {
    let curr = currentShape;
    if(!curr) {
      curr = startShape(type);
    }


    const updatedPoints = [...currentShape?.points ?? [], p];
    
  
    switch(curr.type) {
      case 'point': {
        const point = {
          id: curr.id,
          value: updatedPoints[0]
        }
      
        setAnnotations(prev => ({...prev, points: [...prev.points, point]}));
        setIsDrawing(false);
        setCurrentShape(null);      
        break;
      }
      case 'line': {
        setCurrentShape({
          ...curr,
          points: updatedPoints
        });
        if(updatedPoints.length === 2){
          const line  = {
            id: curr.id,
            u: updatedPoints[0],
            v: updatedPoints[1]
          }
          setAnnotations(prev => ({...prev, lines: [...prev.lines, line]}));
          setIsDrawing(false);
          setCurrentShape(null);    
        }
        break;
      }
      case 'polygon': {
        setCurrentShape({
          ...curr,
          points: updatedPoints
        }); 
        break;
      }
    }
  }

  const closePolygon = () => {
    if(currentShape?.type !== 'polygon') {
      throw new Error('Current shape is not a polygon');
    }

    const polygon = {
      id : currentShape.id,
      points: [...currentShape.points, currentShape.points[0]]
    }
    setAnnotations(prev => ({...prev, polygons: [...prev.polygons, polygon]}));

    setIsDrawing(false);
    setCurrentShape(null);
  }

  const deleteAnnotation = (id: number) => {
    setAnnotations(prev => ({
      ...prev,
      points: prev.points.filter(pt => pt.id !== id),
      lines: prev.lines.filter(ln => ln.id !== id),
      polygons: prev.polygons.filter(pg => pg.id !== id),
    }));
  };


  return (
    <AnnotationsContext.Provider 
      value={{ 
        menu,
        setMenu,
        annotations, 
        setAnnotations,
        isDrawing,
        addPoint,
        closePolygon, 
        currentShape,
        deleteAnnotation
      }}
    >
      {children}
    </AnnotationsContext.Provider>
  );
};



export default AnnotationsContext;