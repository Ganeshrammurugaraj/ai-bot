const chat = document.getElementById("chat");
const form = document.getElementById("chatForm");
const input = document.getElementById("question");
const errorBox = document.getElementById("error");
const welcome = document.getElementById("welcome");
const temp = document.getElementById("temperature");
const tempValue = document.getElementById("tempValue");
const clearBtn = document.getElementById("clearBtn");

let messages = JSON.parse(localStorage.getItem("gansh_messages") || "[]");

temp.addEventListener("input", () => tempValue.textContent = temp.value);

function save(){localStorage.setItem("gansh_messages", JSON.stringify(messages));}
function render(){
  chat.innerHTML = "";
  welcome.style.display = messages.length ? "none" : "block";
  messages.forEach(m => addMessage(m.role, m.content, false));
}
function addMessage(role, content, saveIt=true){
  const row=document.createElement("div");
  row.className="message "+role;
  row.innerHTML=`<div class="avatar">${role==="user"?"👤":"🤖"}</div><div class="bubble"></div>`;
  row.querySelector(".bubble").textContent=content;
  chat.appendChild(row);
  chat.scrollTop=chat.scrollHeight;
  if(saveIt){messages.push({role,content});save();}
  return row.querySelector(".bubble");
}
async function send(question){
  errorBox.textContent="";
  addMessage("user",question);
  const bubble=addMessage("assistant","Thinking...");
  bubble.classList.add("typing");
  try{
    const res=await fetch("/api/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({messages,temperature:Number(temp.value)})
    });
    const data=await res.json();
    if(!res.ok) throw new Error(data.error || "Request failed");
    bubble.classList.remove("typing");
    bubble.textContent=data.reply;
    messages[messages.length-1].content=data.reply;
    save();
  }catch(e){
    bubble.textContent="Sorry, I could not generate a response.";
    errorBox.textContent=e.message;
    messages.pop();
    save();
  }
}
form.addEventListener("submit",e=>{e.preventDefault();const q=input.value.trim();if(!q)return;input.value="";send(q);});
document.querySelectorAll("[data-question]").forEach(b=>b.addEventListener("click",()=>send(b.dataset.question)));
clearBtn.addEventListener("click",()=>{messages=[];save();render();});
render();
