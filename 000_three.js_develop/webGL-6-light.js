

const vertexShader =`
attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
uniform mat4 mvpMatrix;
uniform mat4 invMatrix;
uniform vec3 lightDirection;
varying vec4 vColor;

void main(void){
    vec3 invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
    float diffuse = clamp(dot(normal, invLight), 0.1, 1.0);
    vColor = color * vec4(vec3(diffuse), 1.0);
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

    function createShader(shaderType, shaderText) {
      const shader = gl.createShader(shaderType);
      gl.shaderSource(shader, shaderText);
      gl.compileShader(shader);
      return shader;
    }

const prg = createProgram(vShader,fShader);

    function createProgram(vs, fs) {
      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.useProgram(program);
      return program;
    }

const attLocation = [];
attLocation[0] = gl.getAttribLocation(prg,'position');
attLocation[1] = gl.getAttribLocation(prg,'normal');
attLocation[2] = gl.getAttribLocation(prg,'color');
const attStride = [];
attStride[0] = 3;
attStride[1] = 3;
attStride[2] = 4;

const torusData = torus(6, 12, 1.0, 2.0);
const position = torusData[0];
const normal = torusData[1];
const color = torusData[2];
const index = torusData[3];

const position_vbo = createVbo(position);
const normal_vbo = createVbo(normal);
const color_vbo = createVbo(color);

    function createVbo(data) {
      const vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      return vbo;
    }

set_attribute([position_vbo, normal_vbo, color_vbo], attLocation, attStride);

    function set_attribute(vbo, attL, attS) {
      for (let i in vbo) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
        gl.enableVertexAttribArray(attL[i]);
        gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
      }
    }

const ibo = create_ibo(index);

    function create_ibo(data) {
      const ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      return ibo;
    }

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

const uniLocation = [];
uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix');
uniLocation[2] = gl.getUniformLocation(prg, 'lightDirection');

const m = new matIV();
const mMatrix = m.identity(m.create());
const vMatrix = m.identity(m.create());
const pMatrix = m.identity(m.create());
const tmpMatrix = m.identity(m.create()); //p*m を入れておく
const mvpMatrix = m.identity(m.create());
const invMatrix = m.identity(m.create());

m.lookAt([0.0, 0.0, 20.0],[0, 0, 0],[0, 1, 0], vMatrix);
m.perspective(45, canvas.width / canvas.height, 0.1, 100, pMatrix);
m.multiply(pMatrix, vMatrix, tmpMatrix);

const lightDirection = [1, 1, 1];

let count = 0;

// gl.enable(gl.DEPTH_TEST);
// gl.depthFunc(gl.LEQUAL);
// gl.enabel(gl.CULL_FACE);


let frame = 0;
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
  m.identity(mMatrix);
  m.rotate(mMatrix, rad, [0, 1, 1], mMatrix);
  m.multiply(tmpMatrix, mMatrix, mvpMatrix);

  m.inverse(mMatrix, invMatrix);

  gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
  gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
  gl.uniform3fv(uniLocation[2], lightDirection);

  gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

  gl.flush();
}

animate();

function torus(row, column, irad, orad) {
  const pos = [];
  const col = [];
  const idx = [];
  const nor = [];

  for (let i = 0; i <= row; i++) {
    const r = Math.PI * 2 / row * i; //360 / 分割数 * i
    const rr = Math.cos(r); //各円のcos
    const ry = Math.sin(r); //各円のsin
    
    for (let ii = 0; ii <= column; ii++) {
      const tr = Math.PI * 2 / column * ii; //360 / 分割数 * ii
      const tx = (rr * irad + orad) * Math.cos(tr); //各円の中心座標xにおけるcos
      const ty = ry * irad; //各円の内側端の座標y
      const tz = (rr * irad + orad) * Math.sin(tr); //各円の中心座標xにおけるsin
      const rx = rr * Math.cos(tr);
      const rz = rr * Math.sin(tr);
      pos.push(tx, ty, tz);
      nor.push(rx, ry, rz);
      const tc = hsva(360 / column * ii, 1, 1, 1);
      col.push(tc[0], tc[1], tc[2], tc[3]);
    }
  }
  for (let i = 0; i < row; i++) {
    for (let ii = 0; ii < column; ii++) {
      const r = (column + 1) * i + ii;
      idx.push(r, r + column + 1, r + 1);
      idx.push(r + column + 1, r + column + 2, r + 1);
    }
  }
  return [pos, nor, col, idx];
}

function hsva(h, s, v, a) {
  if (s > 1 || v > 1 || a > 1) {return;}
  const th = h % 360;
  const i = Math.floor(th / 60);
  const f = th / 60 - i;
  const m = v * (1 - s);
  const n = v * (1 - s * f);
  const k = v * (1 - s * (1 - f));
  const color = [];
  if (!s > 0 && !s < 0) {
    color.push(v, v, v, a);
  } else {
    const r = [v, n, m, m, k, v];
    const g = [k, v, v, n, m, m];
    const b = [m, m, k, v, v, n];
    color.push(r[i], g[i], b[i], a);
  }
  return color;
}
