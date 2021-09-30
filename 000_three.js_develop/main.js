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
  //透明なボックスを生成
  let geometry = new THREE.BoxGeometry(40,40,40);
  let material = new THREE.MeshPhongMaterial({color:0xffffff,transparent:true,opacity:0.2});
  const room = new THREE.Mesh(geometry,material);
  scene.add(room);
  room.position.set(0, -5, -20);

  //ボールを生成して、ボックスに追加
  const radius = 0.2;
  let clock = new THREE.Clock();

  geometry = new THREE.SphereGeometry(radius,32,32);
  
  for(let i = 0; i < 400; i++){
    material = new THREE.MeshPhongMaterial({color:0xb6c4c6});
    const object = new THREE.Mesh(geometry,material);

    //ボールの初期位置を設定
    object.position.x = Math.random()*40-20;
    object.position.y = Math.random()*40;
    object.position.z = Math.random()*40-20;

    //速度を設定
    object.userData.velocity = new THREE.Vector3();
    // object.userData.velocity.x = Math.random() * 0.01 - 0.005;
    object.userData.velocity.x = 0;
    object.userData.velocity.y = Math.random() * 0.01 - 0.005;
    object.userData.velocity.z = 0;
    // object.userData.velocity.z = Math.random() * 0.01 - 0.005;

    //ボックスに追加
    room.add(object);
  }
  function animate(){
    const delta = clock.getDelta()*0.8;
    // const range = 20-radius;
    const arr = [];
 
    // if(room){
    for(let i=0; i < room.children.length; i++){
        let object = room.children[i];
        object.position.x += object.userData.velocity.x * delta;
        object.position.y += object.userData.velocity.y * delta;
        object.position.z += object.userData.velocity.z * delta;

        if(object.position.y < radius || object.position.y > 20*2){
            object.position.y = Math.max(object.position.y,radius);
            // object.userData.velocity.x *= 0.98;
            object.userData.velocity.y = -object.userData.velocity.y * 0.8;
            // object.userData.velocity.z *= 0.98;
        }
        // object.userData.velocity.y -= 9.8 * delta;
        object.userData.velocity.y -= 40 * delta;
        arr.push(Math.floor(object.position.y * 100) / 100);
        arr.push(Math.floor(object.userData.velocity.y * 100) / 100);
    }
    // console.log(arr.join(','));
    // }
  }
  ////  Operation ////////////////////////////////////////////////////////////////
  // ///////// controls  ////////////////////////////////////////////////////
  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  //// function render
  
  let frame = 0;
  function render() {
    requestAnimationFrame(render);
    frame++;
    if (frame % 2 === 0) {
      return;
    }
    animate();
    renderer.render(scene, camera);
  }
  render();
}