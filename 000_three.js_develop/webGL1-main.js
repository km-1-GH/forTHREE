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

window.addEventListener('load',function(){
  init();
  });
  
let canvas;
let gl;
  
function init(){

  canvas = document.getElementById('webgl-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  gl = canvas.getContext('webgl');
  
  gl.clearColor(0.0,0.0,0.0,1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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

      function createVbo(data) {
        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return vbo;
      }

  gl.bindBuffer(gl.ARRAY_BUFFER, position_vbo);
  gl.enableVertexAttribArray(attLocation[0]);
  gl.vertexAttribPointer(attLocation[0],attStride[0],gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER, color_vbo);
  gl.enableVertexAttribArray(attLocation[1]);
  gl.vertexAttribPointer(attLocation[1],attStride[1],gl.FLOAT,false,0,0);
  
  const m = new matIV();
  const mMatrix = m.identity(m.create());
  const vMatrix = m.identity(m.create());
  const pMatrix = m.identity(m.create());
  const mvpMatrix = m.identity(m.create());
  
  m.lookAt([0.0,0.0,3.0],[0,0,0],[0,1,0],vMatrix);

  m.perspective(90,canvas.width/canvas.height,0.1,100,pMatrix);

  m.multiply(pMatrix, vMatrix, mvpMatrix);
  m.multiply(mvpMatrix, mMatrix, mvpMatrix);

  const uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');
  gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.flush();
}

