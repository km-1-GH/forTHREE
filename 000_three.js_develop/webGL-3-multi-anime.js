const vertexShader =`
attribute vec3 position;
attribute vec4 color;
uniform mat4 mvpMatrix;
varying vec4 vColor;

void main(void){
    vColor = color;
    gl_Position = mvpMatrix * vec4(position,1.0);
}
`;
const fragmentShader =`
precision mediump float;
varying vec4 vColor;

void main(void){
    gl_FragColor = vColor;
}
`;

let canvas;
let gl;


canvas = document.getElementById('webgl-canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

gl = canvas.getContext('webgl');

const vShader = createShader(gl.VERTEX_SHADER,vertexShader);
const fShader = createShader(gl.FRAGMENT_SHADER,fragmentShader);

const prg = createProgram(vShader,fShader);

const attLocation = new Array(2);
attLocation[0] = gl.getAttribLocation(prg,'position');
attLocation[1] = gl.getAttribLocation(prg,'color');
const attStride = new Array(2);
attStride[0] = 3;
attStride[1] = 4;

const vertexPositions = [
  0.0,1.5,0.0,
  0.8,0.0,0.0,
  -0.8,0.0,0.0
];

const vertexColor = [
  1.0, 0.0, 0.0, 1.0,
  0.0, 1.0, 0.0, 1.0,
  0.0, 0.0, 1.0, 1.0  
];

const position_vbo = createVbo(vertexPositions);
const color_vbo = createVbo(vertexColor);

set_attribute([position_vbo, color_vbo], attLocation, attStride);

const uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');

const m = new matIV();
const mMatrix = m.identity(m.create());
const vMatrix = m.identity(m.create());
const pMatrix = m.identity(m.create());
const tmpMatrix = m.identity(m.create()); //p*m を入れておく
const mvpMatrix = m.identity(m.create());

m.lookAt([0.0,0.0,3.0],[0,0,0],[0,1,0],vMatrix);
m.perspective(90,canvas.width/canvas.height,0.1,100,pMatrix);
m.multiply(pMatrix, vMatrix, tmpMatrix);

let count = 0;
let frame = 0;


    function createShader(shaderType, shaderText) {
      const shader = gl.createShader(shaderType);
      gl.shaderSource(shader, shaderText);
      gl.compileShader(shader);
      return shader;
    }

    function createProgram(vs, fs) {
      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.useProgram(program);
      return program;
    }

    function createVbo(data) {
      const vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      return vbo;
    }

    function set_attribute(vbo, attL, attS) {
      for (let i in vbo) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
        gl.enableVertexAttribArray(attL[i]);
        gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
      }
    }
  

function animate() {
  frame++
  requestAnimationFrame(animate);
  if (frame % 2 === 0) {
    return;
  }

  gl.clearColor(0.0,0.0,0.0,1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  count++;

  const rad = (count % 360) * Math.PI / 180;
  //モデル１の円周移動
  const x = Math.cos(rad);
  const y = Math.sin(rad);
  m.identity(mMatrix);
  m.translate(mMatrix, [x, y + 1.0, 0.0], mMatrix);

  m.multiply(tmpMatrix, mMatrix, mvpMatrix);
  gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  //モデル２のY軸回転
  m.identity(mMatrix);
  m.translate(mMatrix, [1.0, -1.0, 0.0], mMatrix);
  m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);

  m.multiply(tmpMatrix, mMatrix, mvpMatrix);
  gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  //モデル３の拡大縮小
  const s = Math.sin(rad) + 1.0;
  m.identity(mMatrix);
  m.translate(mMatrix, [-1.0, -1.0, 0.0], mMatrix);
  m.scale(mMatrix, [s, s, 0.0], mMatrix);

  m.multiply(tmpMatrix, mMatrix, mvpMatrix);
  gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  gl.flush();
}

animate();

