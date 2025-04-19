// index.js  – SkyGlide 3‑D v2 (single‑file Worker)

/* ---------------------- HTML sent to browser ---------------------- */
const html = `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><title>SkyGlide 🕊️</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
 html,body{margin:0;height:100%;overflow:hidden;background:#bde0fe;font-family:sans-serif}
 #score{position:fixed;top:1rem;left:1rem;font-size:1.2rem;color:#fff;text-shadow:0 0 4px #000}
 .hint{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);
       font-size:0.9rem;color:#fff9;text-shadow:0 0 3px #000}
 canvas{display:block}
</style></head><body>
<div id="score">Score 0</div>
<div class="hint">arrow keys = steer | space = flap</div>
<script type="module">
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

/* --- Scene setup --- */
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xbde0fe, 50, 600);

const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, .1, 1000);
camera.position.set(0,2,5);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);
document.body.appendChild(renderer.domElement);
addEventListener('resize',()=>renderer.setSize(innerWidth,innerHeight));

/* Skybox + ground grid */
scene.add(new THREE.Mesh(
  new THREE.SphereGeometry(500,32,32),
  new THREE.MeshBasicMaterial({color:0xbde0fe,side:THREE.BackSide})
));
const grid=new THREE.GridHelper(1000,100,0x88ddff,0x88ddff);
grid.position.y=-2;scene.add(grid);

/* Bird (simple cone) */
const bird=new THREE.Mesh(
  new THREE.ConeGeometry(.5,1.5,8),
  new THREE.MeshStandardMaterial({color:0xffafcc,flatShading:true})
);
bird.rotation.z=Math.PI/2;scene.add(bird);
scene.add(new THREE.HemisphereLight(0xffffff,0x444444,1));

/* Collectible goodies */
const goodies=[], goodMat=new THREE.MeshBasicMaterial({color:0xffff66,emissive:0xffffaa});
for(let i=0;i<20;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.3,16,16),goodMat);
  resetGoodie(m,true); goodies.push(m); scene.add(m);}
function resetGoodie(m,initial=false){
  m.position.set((Math.random()-.5)*20,1+Math.random()*6, - (initial?Math.random()*100:100+Math.random()*50));
}

/* Audio (wind loop + chirp) */
const wind=new Audio("https://cdn.jsdelivr.net/gh/anars/blank-audio@master/250-milliseconds-of-silence.mp3");
wind.loop=true;wind.volume=.3;wind.play();
const chirp=new Audio("https://freesound.org/data/previews/415/415209_5121236-lq.mp3");

/* Controls */
const keys={};addEventListener('keydown',e=>keys[e.code]=true);
addEventListener('keyup',e=>keys[e.code]=false);
let pitch=0,yaw=0,vel=1,score=0;

function control(dt){
  if(keys.ArrowUp)   pitch=Math.min(pitch+.02,.6);
  if(keys.ArrowDown) pitch=Math.max(pitch-.02,-.6);
  if(keys.ArrowLeft) yaw+=.04;
  if(keys.ArrowRight)yaw-=.04;
  if(keys.Space){vel=Math.min(vel+.2,2.5); if(chirp.paused){chirp.currentTime=0;chirp.play();}}
}

function animate(){
  requestAnimationFrame(animate);
  control(.016);
  vel=Math.max(vel-.01,1);          // simple drag

  bird.rotation.set(0,pitch,yaw,"ZXY");
  const dir=new THREE.Vector3(-Math.cos(yaw), pitch, Math.sin(yaw)).normalize();
  bird.position.addScaledVector(dir,vel*.16);

  camera.position.copy(bird.position).add(new THREE.Vector3(0,2,6).applyAxisAngle(new THREE.Vector3(0,1,0),yaw));
  camera.lookAt(bird.position);

  if(bird.position.length()>480) bird.position.set(0,2,0); // sky wrap

  goodies.forEach(g=>{
    g.position.z+=vel*.16;                 // move toward bird
    if(g.position.distanceTo(bird.position)<1){
      score++; document.getElementById('score').textContent='Score '+score;
      resetGoodie(g);
    }
    if(g.position.z>bird.position.z+10) resetGoodie(g);
  });

  renderer.render(scene,camera);
}
animate();
</script></body></html>`;

/* ---------------------- Cloudflare Worker ---------------------- */
export default {
  fetch(request) {
    const p=new URL(request.url).pathname;
    if(p==='/'||p==='/index.html')
      return new Response(html,{headers:{'content-type':'text/html;charset=utf-8'}});
    return new Response('Not Found',{status:404});
  }
};
