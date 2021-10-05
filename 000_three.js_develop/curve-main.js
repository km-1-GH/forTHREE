'use strict';
{
  // renderer  
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    // alpha: true
  });
  renderer.setClearColor(new THREE.Color(), 0);
  renderer.setSize(640, 480);
  // renderer.setSize(window.innerWidth,window.innerHeight);
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
  ////  Mesh
  const segmentLen = 1;
  const nbrOfPoints = 10;
  const points = [];
  const turbulence = 0.5;

  const points2 = [];
  for (let i = 0; i < nbrOfPoints; i++) {
    points.push(
      i * segmentLen, 
      Math.random() * (turbulence * 2) - turbulence,
      -10 + (Math.random() * (turbulence * 2) - turbulence)
    );
    points2.push(
      new THREE.Vector3(
        i * segmentLen, 
        Math.random() * (turbulence * 2) - turbulence,
       -10 + (Math.random() * (turbulence * 2) - turbulence)
      )
    );
  }

  const lineG = new MeshLine();
  lineG.setPoints(points);
  // lineG.setPoints(points, p => 2 - p * 2); //先細りのテープ
  // lineG.setPoints(points, p => 2 + Math.sin(20 * p)); //太くなったり細くなったりのテープ

  const lineM = new MeshLineMaterial({
    color: 0xffcc00,
    transparent: true,
    lineWidth: 0.5,
    dashArray : 2, //実線の長さ(2倍がfull)
    dashOffset: 0,  
    dashRatio: 0.5, //visibleの長さ(0.99~0.5がfull)
  });

  const line = new THREE.Mesh(lineG, lineM);
  scene.add(line);
  line.position.x = -1 * segmentLen * nbrOfPoints / 2; 

  // const curve = new THREE.CatmullRomCurve3( [
  //   new THREE.Vector3( -10, 0, 10 ),
  //   new THREE.Vector3( -5, 5, 5 ),
  //   new THREE.Vector3( 0, 0, 0 ),
  //   new THREE.Vector3( 5, -5, 5 ),
  //   new THREE.Vector3( 10, 0, 10 )
  // ] );
  const curve = new THREE.CatmullRomCurve3(points2);
  const points3 = curve.getPoints( 50 );
  const geometry = new THREE.BufferGeometry().setFromPoints( points3 );
  
  const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
  
  // Create the final object to add to the scene
  const curveObject = new THREE.Line( geometry, material );
  scene.add(curveObject);


  ////  Operation 
  function lineUpdate() {
    // if (line.material.uniforms.dashOffset.value < -2) {
    //   return;
    // }
    line.material.uniforms.dashOffset.value -= 0.01;
  }

  ////  controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  ////  function render
  let frame = 0;
  function render() {
    requestAnimationFrame(render);
    frame++;
    if (frame % 2 === 0) {
      return;
    }
    lineUpdate();
    renderer.render(scene, camera);
  }
  render();
}