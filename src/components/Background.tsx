import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Color } from "three";

const Background = ({ color }: { color : string }) => {
  const { scene } = useThree();
  
  useEffect(() => {
    scene.background = new Color(color);
  }, [color, scene]);

  return null;
}

export default Background;