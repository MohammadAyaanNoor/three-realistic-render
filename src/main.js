import GUI from 'lil-gui';
import * as THREE from 'three';
import { DRACOLoader, GLTFLoader, RGBELoader } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const canvas = document.querySelector('.webgl');

const scene = new THREE.Scene();

const gui = new GUI();
const rgbeLoader = new RGBELoader();
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./static/models/draco/');
gltfLoader.setDRACOLoader(dracoLoader);


const textureLoader = new THREE.TextureLoader();
const castleARMTexture = textureLoader.load('./static/textures/castle_brick/castle_brick_broken_06_arm_1k.jpg');
const castlediffTexture = textureLoader.load('./static/textures/castle_brick/castle_brick_broken_06_diff_1k.jpg');
castlediffTexture.colorSpace = THREE.SRGBColorSpace;
const castleNormalTexture = textureLoader.load('./static/textures/castle_brick/castle_brick_broken_06_nor_gl_1k.png');
const woodARMTexture = textureLoader.load('./static/textures/wood_cabin/wood_cabinet_worn_long_arm_1k.jpg');
const wooddiffTexture = textureLoader.load('./static/textures/wood_cabin/wood_cabinet_worn_long_diff_1k.jpg');
wooddiffTexture.colorSpace = THREE.SRGBColorSpace;
const woodNormalTexture = textureLoader.load('./static/textures/wood_cabin/wood_cabinet_worn_long_nor_gl_1k.png');



const directionalLight = new THREE.DirectionalLight('#ffffff',1);
directionalLight.position.set(6.06,6.06,3.854);
scene.add(directionalLight);

gui.add(directionalLight,'intensity',0,10,0.001).name('lightIntensity');
gui.add(directionalLight.position,'x',-10,10,0.001).name('lightX');
gui.add(directionalLight.position,'y',-10,10,0.001).name('lightY');
gui.add(directionalLight.position,'z',-10,10,0.001).name('lightZ');
gui.add(directionalLight.shadow, 'bias',-0.05,0.05,0.001)
gui.add(directionalLight.shadow, 'normalBias',-0.05,0.05,0.001)
directionalLight.castShadow = true;
gui.add(directionalLight,'castShadow').name('castShadow');
directionalLight.shadow.mapSize.width = 512;
directionalLight.shadow.mapSize.height = 512;
directionalLight.shadow.camera.far = 15;
directionalLight.target.position.set(0,1,0)

const directionalLigthCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
scene.add(directionalLigthCameraHelper);
directionalLight.target.updateMatrixWorld();

directionalLight.shadow.bias = -0.002;
directionalLight.shadow.normalBias = 0.034;


rgbeLoader.load(
  './static/teutonic_castle_moat_2k.hdr',
  (environmentMap) =>{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    // environmentMap.colorSpace = THREE.SRGBColorSpace;
    scene.background = environmentMap;
    scene.environment = environmentMap;
    // scene.environmentIntensity = 3;
  }

)
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(8,8),
  new THREE.MeshStandardMaterial({
    side:THREE.DoubleSide,
    map:wooddiffTexture,
    normalMap:woodNormalTexture,
    aoMap:woodARMTexture,
    roughnessMap:woodARMTexture,
    metalnessMap:woodARMTexture
  })
)
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

const wall = new THREE.Mesh(
  new THREE.PlaneGeometry(8,8),
  new THREE.MeshStandardMaterial({
    side:THREE.DoubleSide,
    map:castlediffTexture,
    normalMap:castleNormalTexture,
    aoMap:castleARMTexture,
    roughnessMap:castleARMTexture,
    metalnessMap:castleARMTexture
  })
)
wall.position.set(0,4,-4)
scene.add(wall);


gui.add(scene,'environmentIntensity',0,10,0.001)


const updateAllMaterials = ()=>{
  scene.traverse((child)=>{
    if(child.isMesh && child.material.isMeshStandardMaterial){
      child.castShadow = true;
      child.receiveShadow = true;
    }
  })
}
// gltfLoader.load(
//   './static/models/FlightHelmet/glTF/FlightHelmet.gltf',
//   (gltf) =>{
//     gltf.scene.scale.set(7, 7, 7);
//     gltf.scene.position.set(0, 0, 0);
//     scene.add(gltf.scene);
//     updateAllMaterials();
//   }
// )

gltfLoader.load(
  '../static/models/FirstModel.glb',
  (gltf) =>{
    gltf.scene.scale.set(0.2, 0.2,0.2);
    gltf.scene.position.set(0, 0,0 );
    scene.add(gltf.scene);
    updateAllMaterials();
  }
)


const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize',()=>{
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 7;
camera.position.y = 5;
// camera.lookAt(mesh.position);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias:true //if devicePixelRatio is more than 1, it will cause performance issues
})
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;

const renderOptions = {
  NoToneMapping: THREE.NoToneMapping,
  LinearToneMapping: THREE.LinearToneMapping,
  ReinhardToneMapping: THREE.ReinhardToneMapping,
  CineonToneMapping: THREE.CineonToneMapping,
  ACESFilmicToneMapping: THREE.ACESFilmicToneMapping,
}
gui.add(renderer,'toneMapping',renderOptions).onChange((value)=>{
  renderer.toneMapping = value;
})
gui.add(renderer,'toneMappingExposure',0,10,0.001)



const clock = new THREE.Clock();

function tick(){
  
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}
tick();