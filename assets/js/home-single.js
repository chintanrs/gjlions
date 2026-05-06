const scene=document.getElementById("scene");
const logoId("overlay");const logo=document.getElementById("logoCore");
const overlayBody=document.getElementById("overlayBody");
const closeBtn=document.getElementById("closeOverlay");

const angles={ squad:-90, gallery:180, fixtures:35 };

logo.onclick=e=>{
  e.stopPropagation();
  scene.classList.toggle("is-open");
  if(scene.classList.contains("is-open")) positionMenu();
};

scene.onclick=()=>scene.classList.remove("is-open");

menuItems.forEach(btn=>{
  btn.onclick=e=>{
    e.stopPropagation();
    openOverlay(btn.dataset.key);
  };
});

function positionMenu(){
  const r=logo.getBoundingClientRect();
  const cx=r.left+r.width/2;
  const cy=r.top+r.height/2;
  const radius=Math.min(180,Math.min(innerWidth,innerHeight)*.32);

  menuItems.forEach(b=>{
    const a=angles[b.dataset.key]*Math.PI/180;
    b.style.left=`${cx+Math.cos(a)*radius}px`;
    b.style.top =`${cy+Math.sin(a)*radius}px`;
  });
}

async function openOverlay(type){
  overlay.classList.add("active");
  scene.classList.remove("is-open");

  if(type==="fixtures"){
    const data=await fetch("assets/data/fixtures.json").then(r=>r.json());
    overlayBody.innerHTML=`
      <h1>Fixtures</h1>
      ${data.tournaments.map(t=>`
        <div class="tournament-title">${t.name} ${t.season}</div>
        ${t.fixtures.map(f=>`
          <div class="fixture">
            <time>${f.date} • ${f.time}</time>
            <div class="teams">${f.teamA} vs ${f.teamB}</div>
            <div class="venue">${f.venue}</div>
          </div>`).join("")}
      `).join("")}
    `;
    return;
  }

  if(type==="squad"){
    const data=await fetch("assets/data/squad.json").then(r=>r.json());
    overlayBody.innerHTML=`
      <h1>Squad</h1>
      ${data.items.map(p=>`
        <div class="fixture">${p.name} — ${p.role}</div>
      `).join("")}
    `;
  }

  if(type==="gallery"){
    overlayBody.innerHTML="<h1>Gallery</h1><p>Coming soon</p>";
  }
}

closeBtn.onclick=()=>overlay.classList.remove("active");
const menuItems=document.querySelectorAll(".menu-item");
