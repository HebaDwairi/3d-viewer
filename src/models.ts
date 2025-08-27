
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
}