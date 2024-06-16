import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//* Grab the window width and height
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

//* Create a new scene
const renderer = new THREE.WebGLRenderer({
  antalias: true
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

document.body.appendChild(renderer.domElement);

const fov = 75;
const aspect = sizes.width / sizes.height;
const near = 0.1;
const far = 10;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

camera.position.z = 2;

const scene = new THREE.Scene();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

//Sphere
const geo = new THREE.IcosahedronGeometry(0.7, 1);
const mat = generateGradientMaterial('#FEAC5E', '#C779D0', '#4BC0C8', '#C779D0', '#FEAC5E');
const mesh = new THREE.Mesh(geo, mat);

//line that show the axis
const axesHelper = new THREE.AxesHelper(1);
scene.add(axesHelper);

//line that follow the mesh, it show where the sphere has been
const line = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true
}));
scene.add(line);

// clue the line to the mesh
mesh.add(line);

scene.add(mesh);

//create light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x080820, 1);
scene.add(hemiLight);

function animate() {
  requestAnimationFrame(animate);

  mesh.scale.setScalar(1 + Math.sin(Date.now() * 0.001) * 0.1);
  mesh.rotation.y += 0.005;

  //make the line be a little bit bigger than the mesh
  line.scale.setScalar(1.001);

  renderer.render(scene, camera);
  controls.update();
}

/**
 * Generate a gradient between colors to be used as a material
 * @param {string[]} colors - An array of colors to generate a gradient from
 */
function generateGradientMaterial(...colors) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 256;
  canvas.height = 1;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

  //distribute the colors evenly
  const step = 1 / (colors.length - 1);
  colors.forEach((color, i) => {
    gradient.addColorStop(i * step, color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;

  return new THREE.MeshStandardMaterial({
    map: texture,
    flatShading: true
  });
}

animate();

function onWindowResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
}

window.addEventListener('resize', onWindowResize);