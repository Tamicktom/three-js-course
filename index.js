import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let defaultAnimation;
let scaleUpAnimation;
let scaleDownAnimation;

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

const app = document.querySelector('#app');
app.appendChild(renderer.domElement);

const scaleUpButton = document.querySelector('#scale-up');
const scaleDownButton = document.querySelector('#scale-down');
const resetButton = document.querySelector('#reset');

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

//make the mesh glow
const glow = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
  color: "#fff",
  side: THREE.BackSide
}));
glow.scale.setScalar(1.01);
mesh.add(glow);

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

// create light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x080820, 1);
scene.add(hemiLight);

const light = new THREE.DirectionalLight(0xffffff, 0.3);
light.position.set(5, 5, 5);
scene.add(light);

// create particles (colorfull triangles) that rotate around the sphere
const particles = new THREE.Group();
scene.add(particles);

const particleGeo = new THREE.TetrahedronGeometry(0.01, 0);
const particleMat = new THREE.MeshStandardMaterial({
  color: 0xffffff
});

for (let i = 0; i < 5000; i++) {
  const particle = new THREE.Mesh(particleGeo, particleMat);
  particles.add(particle);

  const [x, y, z] = Array(3).fill().map(() => (Math.random() - 0.5) * 10);
  particle.position.set(x, y, z);
}

function defaultAnime() {
  defaultAnimation = requestAnimationFrame(defaultAnime);

  mesh.rotation.y += 0.005;

  //make the line be a little bit bigger than the mesh
  line.scale.setScalar(1.001);

  //make the particles rotate around the sphere
  particles.rotation.y += 0.001;

  renderer.render(scene, camera);
  controls.update();
}

function scaleUpAnime() {
  scaleUpAnimation = requestAnimationFrame(scaleUpAnime);

  mesh.scale.x += 0.01;
  mesh.scale.y += 0.01;
  mesh.scale.z += 0.01;

  renderer.render(scene, camera);
  controls.update();
}

function scaleDownAnime() {
  scaleDownAnimation = requestAnimationFrame(scaleDownAnime);

  mesh.scale.x -= 0.01;
  mesh.scale.y -= 0.01;
  mesh.scale.z -= 0.01;

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

defaultAnime();

function onWindowResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
}

window.addEventListener('resize', onWindowResize);

scaleUpButton.addEventListener('click', () => {
  cancelAnimationFrame(defaultAnimation);
  cancelAnimationFrame(scaleDownAnimation);
  scaleUpAnimation = requestAnimationFrame(scaleUpAnime);
});

scaleDownButton.addEventListener('click', () => {
  cancelAnimationFrame(defaultAnimation);
  cancelAnimationFrame(scaleUpAnimation);
  scaleDownAnimation = requestAnimationFrame(scaleDownAnime);
});

resetButton.addEventListener('click', () => {
  cancelAnimationFrame(scaleUpAnimation);
  cancelAnimationFrame(scaleDownAnimation);
  defaultAnime();
});