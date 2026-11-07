const form=document.getElementById("comment-form");
const nameInput=document.getElementById("comment-name");
const contentInput=document.getElementById("comment-content");
const list=document.getElementById("comment-list");
const authArea=document.getElementById("auth-area");
const userBar=document.getElementById("user-bar");
const userAvatar=document.getElementById("user-avatar");
const userName=document.getElementById("user-name");

async function loadMe(){try{const r=await fetch("/api/me");const{user}=await r.json();if(user){userBar.style.display="flex";userAvatar.src=user.picture;userName.textContent=user.name;nameInput.value=user.name;nameInput.readOnly=true;authArea.innerHTML=`<img src="${user.picture}" class="sidebar-user">`}}catch{}}

async function loadComments(){try{const r=await fetch("/api/comments");renderComments(await r.json())}catch{list.innerHTML='<div class="comment-empty">加载失败</div>'}}

function renderComments(c){if(!c.length){list.innerHTML='<div class="comment-empty">还没有留言，来抢沙发</div>';return}
list.innerHTML=c.map(x=>`<div class="comment"><div class="comment-header"><div class="comment-user">${x.user?.picture?`<img src="${x.user.picture}" class="comment-avatar">`:""}<span class="comment-name">${esc(x.name)}</span></div><span class="comment-date">${fmt(x.createdAt)}</span></div><div class="comment-content">${esc(x.content)}</div></div>`).join("")}

function esc(s){const d=document.createElement("div");d.textContent=s;return d.innerHTML}
function fmt(iso){const d=new Date(iso);return`${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`}

form.addEventListener("submit",async e=>{e.preventDefault();const n=nameInput.value.trim(),c=contentInput.value.trim();if(!n||!c)return;try{await fetch("/api/comments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:n,content:c})});contentInput.value="";loadComments()}catch{alert("提交失败")}});

loadMe();loadComments();
