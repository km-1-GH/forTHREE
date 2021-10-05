import * as THREE from '../three.js/module/three.module.js';
import { OrbitControls } from '../three.js/module/OrbitControls.js';

 // renderer  
 const renderer = new THREE.WebGLRenderer({
  antialias: true,
  // alpha: true
});
renderer.setClearColor(new THREE.Color(), 0);
renderer.setSize(640, 480);
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0px';
renderer.domElement.style.left = '0px';
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
// scene
const scene = new THREE.Scene();
//camera
// const camera = new THREE.PerspectiveCamera();
const camera = new THREE.PerspectiveCamera(50,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0, 0, 1);
scene.add(camera);
// light-Directional & Ambient
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 50, 10);
scene.add(light);
const ambient = new THREE.AmbientLight(0xffffff);
scene.add(ambient);
// resize 
window.onload = function() {
  resize();
};
window.addEventListener('resize', () => {
  resize();
});
function resize() {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
}
let triangle;
let uniforms;
let step = 0;

const vertexShader = `
  attribute vec3 color;
  attribute vec3 displacement;
  varying vec3 vColor;
  void main(){
    vColor = color;
    vec3 vv = position + displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vv,1.0);
  }
`;

const fragmentShader = `
  uniform float step;
  varying vec3 vColor;
  void main(){
    float r = vColor.r + cos(step/50.0);
    float g = vColor.g + cos(step/60.0);
    float b = vColor.b + cos(step/70.0);
    gl_FragColor = vec4(r,g,b,1.0);
  }
`;

const positions = new Float32Array([
  2.5, 0.0, -5.0,
  0, 5.0, -5.0,
  -2.5, 0.0, -5.0,
]);
const colors = new Float32Array([
  1.0, 0.0, 0.0,
  0.0, 0.0, 1.0,
  0.0, 1.0, 0.0,
]);

const displacement = new Float32Array(3 * 3);

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

geometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 3));

uniforms = {
  step: {type: 'f', value: 1.0}
};

const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: uniforms,
  side: THREE.DoubleSide,
});

triangle = new THREE.Mesh(geometry, material);
scene.add(triangle);

//// controls
const controls = new OrbitControls(camera, renderer.domElement);

//// render
let frame = 0;
function render() {
  requestAnimationFrame(render);
  frame++;
  if (frame % 2 === 0) {
    return;
  }
  step += 1;
  uniforms.step.value = step;
  triangle.geometry.attributes.displacement.array[0] = 1.25 * Math.sin(step / 10);
  triangle.geometry.attributes.displacement.array[4] = 1.25 * Math.sin(step / 15);
  triangle.geometry.attributes.displacement.array[6] = -1.25 * Math.sin(step / 20);
  triangle.geometry.attributes.displacement.needsUpdate = true;
  renderer.render(scene, camera);
}
render();
