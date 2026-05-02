const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const content = document.getElementById("contentLayer");
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

resize();
window.addEventListener("resize", resize);

logo.onclick = e => {
  e.stopPropagation();
  scene.classList.toggle("is-open");
  burst();
};

document.addEventListener("click", () => {
  scene.classList.remove("is-open");
  content.classList.remove("is-visible");
});

document.querySelectorAll(".menu-item").forEach(btn=>{
  btn.onclick = e=>{
    e.stopPropagation();
    scene.classList.remove("is-open");
    loadContent(btn.dataset.target);
  };
});

/* Energy arcs */
drawArc("arc-squad", 500,500,500,260);
drawArc("arc-fixtures", 500,500,720,640);
drawArc("arc-gallery", 500,500,280,640);

function drawArc(id,x1,y1,x2,y2){
  const p=document.getElementById(id);
  p.setAttribute("d",`M${x1},${y1} Q${(x1+x2)/2},${(y1+y2)/2-80} ${x2},${y2}`);
}

/* Particles */
let particles=[];
function burst(){
  for(let i=0;i<24;i++){
    particles.push({
      x:canvas.width/2,
      y:canvas.height/2,
      vx:(Math.random()-.5)*6,
      vy:(Math.random()-.5)*6,
      life:30
    });
  }
}

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles=particles.filter(p=>p.life>0);
  particles.forEach(p=>{
    p.x+=p.vx;
    p.y+=p.vy;
    p.life--;
    ctx.fillStyle=`rgba(245,166,35,${p.life/30})`;
    ctx.beginPath();
    ctx.arc(p.x,p.y,2,0,Math.PI*2);
    ctx.fill();
  });
  requestAnimationFrame(animate);
}
animate();

function resize(){
  canvas.width=innerWidth;
  canvas.height=innerHeight;
}

/* Load real JSON */
async function loadContent(type){
  content.classList.add("is-visible");
  if(type==="squad"){
    const d=await fetch("assets/data/squad.json").then(r=>r.json());
    content.innerHTML=`<h1>Squad</h1>`+
      d.items.map(p=>`<p>${p.name} — ${p.role}</p>`).join("");
  }
  if(type==="fixtures"){
    const d=await fetch("assets/data/fixtures.json").then(r=>r.json());
    const f=d.tournaments.flatMap(t=>t.fixtures);
    content.innerHTML=`<h1>Fixtures</h1>`+
      f.map(m=>`<p>${m.teamA} vs ${m.teamB} • ${m.date} • ${m.time}</p>`).join("");
  }
  if(type==="gallery"){
    content.innerHTML=`<h1>Gallery</h1><p>Coming soon.</p>`;
  }
}
