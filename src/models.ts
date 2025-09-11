
interface ModelMap {
  [key: string]: {
    url: string,
    scale: number,
  } 
};

export const models : ModelMap = {
  'userModel' : {
    url: '/models/office_chair/scene.gltf',
    scale: 1,
  },
  'drone' : {
    url: '/models/drone/scene.gltf',
    scale: 1,
  },
  'chair' : {
    url: '/models/office_chair/scene.gltf',
    scale: 1,
  },
  'robot' : {
    url: '/models/robot_a.l.e.x/scene.gltf',
    scale: 1,
  },
  'model': {
    url: 'https://sager-space-data-dev.s3.me-south-1.amazonaws.com/attachments/data_product_details/3d_mesh/16bcfe0e65d81d1f9ea7d12300038f1c-6743b1706f318.glb',
    scale: 1,
  }
}