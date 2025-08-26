import { useGLTF } from "@react-three/drei";
import { Mesh } from "three";
import { models } from "../models";



const Model = ({
  options
}: {
  options: {
    modelName: string
    wireframe: boolean
    opacity: number
    visible: boolean,
    scale: number
  }
}) => {
  const modelData = models[options.modelName];

  const gltf = useGLTF(modelData.url).scene;

  gltf.traverse((o) => {
    if (o instanceof Mesh) {
      o.material.wireframe = options.wireframe;
      o.material.transparent = true;
      o.material.opacity = options.opacity;
    }
  })

  return (
    <group
      visible={options.visible}
      scale={options.scale * modelData.scale}
    >
      <primitive object={gltf} />
    </group>
  )
}


export default Model;