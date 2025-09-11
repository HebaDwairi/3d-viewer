import { useLoader, useThree } from '@react-three/fiber';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { useRef} from 'react';
import { REVISION } from 'three';

export const useGLTFLoader = (
  url: string,
) => {
  const {gl} = useThree();
  const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`;

  const dracoLoaderRef = useRef<DRACOLoader | null>(null);
  if(!dracoLoaderRef.current) {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( `${THREE_PATH}/examples/jsm/libs/draco/` );

    dracoLoaderRef.current = dracoLoader;
  }
  const dracoLoader = dracoLoaderRef.current;


  const ktx2LoaderRef = useRef<KTX2Loader | null>(null);
  if(!ktx2LoaderRef.current) {
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath( `${THREE_PATH}/examples/jsm/libs/basis/` );
    ktx2Loader.detectSupport(gl);
    ktx2LoaderRef.current = ktx2Loader;
  }
  

  const gltf = useLoader(
    GLTFLoader,
    url,
    loader => {
      loader.setDRACOLoader(dracoLoader);
      loader.setKTX2Loader(ktx2LoaderRef.current);
      loader.setMeshoptDecoder(MeshoptDecoder);
    },
  );

  return { gltf };
};
