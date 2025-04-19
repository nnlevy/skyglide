// index.js  — v1 “SkyGlide” cozy‑bird game, single‑file Worker
const SKY   = '#bde0fe';     // pastel sky‑blue
const CLOUD = '#ffffffaa';   // semi‑transparent white
const BIRD  = '#ffafcc';     // soft coral‑pink

const html = /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SkyGlide 🕊️</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    html,body{margin:0;height:100%;overflow:hidden;background:${SKY};font-family:sans-serif}
    canvas{display:block}
    .hint{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);
          font-size:0.9rem;color:#fff9;text-shadow:0 0 3px #0007}
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <div class="hint">click / space to flap</div>
  <script>
    const c=document.getElementById('c'),x=c.getContext('2d');
    let W,H; const resize=()=>{W=c.width=innerWidth;H=c.height=innerHeight};
    addEventListener('resize',resize); resize();

    const clouds=[...Array(20)].map(()=>({x:Math.random()*W,y:Math.random()*H,r:40+Math.random()*40}));
    let y=H/2, v=0, g=0.25, lift=-6;

    const flap=()=>v=lift;
    addEventListener('click',flap);
    addEventListener('keydown',e=>e.code==='Space'&&flap());

    (function loop(){
      x.fillStyle='${SKY}';x.fillRect(0,0,W,H);

      // Clouds
      x.fillStyle='${CLOUD}';
      clouds.forEach(cu=>{
        cu.x-=0.5; if(cu.x<-cu.r){cu.x=W+cu.r;cu.y=Math.random()*H}
        x.beginPath();x.arc(cu.x,cu.y,cu.r,0,Math.PI*2);x.fill();
      });

      // Bird physics
      v+=g; y+=v;
      if(y>H-30){y=H-30;v=0} if(y<30){y=30;v=0}

      // Bird
      x.fillStyle='${BIRD}';
      x.beginPath();x.moveTo(80,y);x.lineTo(50,y+15);x.lineTo(50,y-15);x.closePath();x.fill();

      requestAnimationFrame(loop);
    })();
  </script>
</body>
</html>`;

export default {
  fetch(req) {
    const path=new URL(req.url).pathname;
    if (path==='/'||path==='/index.html')
      return new Response(html,{headers:{'content-type':'text/html;charset=utf-8'}});
    return new Response('Not Found',{status:404});
  }
};
