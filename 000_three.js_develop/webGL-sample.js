const vertexShader =`
attribute vec3 position;
uniform mat4 mvpMatrix;

void main(void){
    gl_Position = mvpMatrix * vec4(position,1.0);
}
`;
const fragmentShader =`
void main(void){
    gl_FragColor = vec4(1.0,1.0,1.0,1.0);
}
`;

window.addEventListener('load',function(){
init();
});

let canvas,gl;

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

const prg = createProgram(vShader,fShader);

const attLocation = gl.getAttribLocation(prg,'position');
const attStride = 3;

const vertexPositions = [
    0.0,1.5,0.0,
    0.8,0.0,0.0,
    -0.8,0.0,0.0
];

const vbo = createVbo(vertexPositions);
gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
gl.enableVertexAttribArray(attLocation);
gl.vertexAttribPointer(attLocation,attStride,gl.FLOAT,false,0,0);

const m = new matIV();
const mMatrix = m.identity(m.create());
const vMatrix = m.identity(m.create());
const pMatrix = m.identity(m.create());
const mvpMatrix = m.identity(m.create());

m.lookAt([0.0,0.0,3.0],[0,0,0],[0,1,0],vMatrix);

m.perspective(90,canvas.width/canvas.height,0.1,100,pMatrix);

m.multiply(pMatrix,vMatrix,mvpMatrix);
m.multiply(mvpMatrix,mMatrix,mvpMatrix);

const uniLocation = gl.getUniformLocation(prg,'mvpMatrix');
gl.uniformMatrix4fv(uniLocation,false,mvpMatrix);

gl.drawArrays(gl.TRIANGLES,0,3);

gl.flush();
}

function createShader(shaderType,shaderText){
const shader = gl.createShader(shaderType);
gl.shaderSource(shader,shaderText);
gl.compileShader(shader);
return shader;
}

function createProgram(vs,fs){
const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
gl.useProgram(program);
return program;
}

function createVbo(data){
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER,null);
return vbo;
}