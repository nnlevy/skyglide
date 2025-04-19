const html = /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>SkyGlide 3D</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
 html,body{margin:0;height:100%;overflow:hidden;background:#bde0fe;font-family:sans-serif}
 #score{position:fixed;top:1rem;left:1rem;font-size:1.2rem;color:#fff;text-shadow:0 0 4px #000}
 .hint{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);font-size:0.9rem;color:#fff9;text-shadow:0 0 3px #000}
 canvas{display:block}
</style>
</head>
<body>
<div id="score">Score 0</div>
<div class="hint">arrow keys = steer | space = flap</div>
<script type="module">
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

/* ---------- Scene setup ---------- */
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xbde0fe, 50, 600);
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
addEventListener('resize',()=>renderer.setSize(innerWidth,innerHeight));

/* Sky & ground */
const skyGeo = new THREE.SphereGeometry(500,32,32);
const skyMat = new THREE.MeshBasicMaterial({color:0xbde0fe, side:THREE.BackSide});
scene.add(new THREE.Mesh(skyGeo, skyMat));

const grid = new THREE.GridHelper(1000, 100, 0x88ddff, 0x88ddff);
grid.position.y = -2;
scene.add(grid);

/* Bird (simple cone) */
const birdMat = new THREE.MeshStandardMaterial({color:0xffafcc, flatShading:true});
const bird = new THREE.Mesh(new THREE.ConeGeometry(0.5,1.5,8), birdMat);
bird.rotation.z = Math.PI/2;
scene.add(bird);

const light = new THREE.HemisphereLight(0xffffff,0x444444,1);
scene.add(light);

/* Goodies */
const goodies = [];
const goodMat = new THREE.MeshBasicMaterial({color:0xffff66, emissive:0xffffaa});
for(let i=0;i<20;i++){
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.3,16,16), goodMat);
  repositionGoodie(m,true);
  goodies.push(m); scene.add(m);
}
function repositionGoodie(m,initial=false){
  m.position.set(
    (Math.random()-0.5)*20,
    1+Math.random()*6,
    - (initial?Math.random()*100: 100+Math.random()*50)
  );
}

/* Audio */
const wind = new Audio("https://cdn.jsdelivr.net/gh/anars/blank-audio@master/250-milliseconds-of-silence.mp3");
wind.loop=true; wind.volume=0.3; wind.play();
const chirp = new Audio("https://freesound.org/data/previews/415/415209_5121236-lq.mp3"); // public-domain chirp

/* Controls */
let pitch=0, yaw=0, vel=0, score=0;
const keys={};
addEventListener('keydown',e=>{keys[e.code]=true});
addEventListener('keyup',e=>{keys[e.code]=false});

function updateControls(dt){
  if(keys["ArrowUp"])   pitch = Math.min(pitch+0.02,  0.6);
  if(keys["ArrowDown"]) pitch = Math.max(pitch-0.02, -0.6);
  if(keys["ArrowLeft"]) yaw += 0.04;
  if(keys["ArrowRight"])yaw -= 0.04;
  if(keys["Space"]){ vel=Math.min(vel+0.2,2.5); if(chirp.paused){chirp.currentTime=0; chirp.play();}}
}

function animate(t){
  requestAnimationFrame(animate);
  const dt=0.016;

  updateControls(dt);

  vel = Math.max(vel-0.01,1);                       // air drag
  bird.rotation.z = pitch;
  bird.rotation.y = yaw;
  const dir = new THREE.Vector3(-Math.cos(yaw), pitch, Math.sin(yaw)).normalize();
  bird.position.addScaledVector(dir, vel*dt*10);
  camera.position.copy(bird.position).add(new THREE.Vector3(0,2,6).applyAxisAngle(new THREE.Vector3(0,1,0), yaw));
  camera.lookAt(bird.position);

  // wrap sky
  if(bird.position.length() > 480) bird.position.set(0,2,0);

  // goodies collision & movement
  goodies.forEach(g=>{
    g.position.z += vel*dt*10;           // appear to move toward bird
    if(g.position.distanceTo(bird.position)<1){
      score++; document.getElementById('score').textContent='Score '+score;
      repositionGoodie(g);
    }
    if(g.position.z > bird.position.z+10) repositionGoodie(g);
  });

  renderer.render(scene,camera);
}
animate();
</script>
</body></html>`;
