var FLAG="FLAG{H0LY_v4ult_hunt3r}";
function unlocked(){try{return localStorage.getItem("holy_vault")==="1"}catch(e){return false}}
function trophies(){
  var a={},s={};try{a=JSON.parse(localStorage.getItem("holy_ach")||"{}")}catch(e){}
  try{s=JSON.parse(localStorage.getItem("holy_seals")||"{}")}catch(e){}
  var L={term:"TERMINAL ACCESS",first:"FIRST FLAG",flagc:"FLAG CAPTURED",recon:"RECON COMPLETE",root:"ROOT ACCESS",researcher:"SECURITY RESEARCHER",pgp:"PGP VERIFIED",holy:"HOLY BADGE"};
  var h=Object.keys(L).map(function(k){return (a[k]?"✓":"□")+" "+L[k]}).join("<br>");
  var n=["e1","e2","e3","e4"].filter(function(k){return s[k]}).length;
  return h+"<br>MIDNIGHT SEALS: "+"■".repeat(n)+"□".repeat(4-n)+" ("+n+"/4)";
}
function room(){
  document.getElementById("app").innerHTML=
  '<span class="k">VAULT // UNLOCKED — FLAG ACCEPTED</span>'+
  "<h1>The <span>Vault</span></h1>"+
  "<p class='sub'>You found the flag. This room is the behind-the-scenes of the portfolio — everything here is real process, no theater.</p>"+
  "<h2>🏆 Trophy case (this browser)</h2><div class='card trophy'>"+trophies()+"</div>"+
  "<h2>🔧 Behind the scenes</h2><div class='card'><ul><li>Hand-written HTML/CSS/JS — zero frameworks, zero build step.</li><li>One config file drives certs, experience, skills, labs, resume.</li><li>Every dashboard metric is labeled simulation. Always.</li><li>Hosted free on GitHub Pages. Total JS: ~60KB.</li></ul></div>"+
  "<h2>🖥 Setup</h2><div class='card'><ul><li>Kali Linux + Ubuntu (home lab VMs)</li><li>Burp Suite · Nmap · Wireshark · Amass · theHarvester</li><li>VS Code · Bash · Python · Git</li></ul></div>"+
  "<h2>🧰 Favorite tools</h2><div class='card mono' style='font-size:13px'>nmap // burp // wireshark // ffuf // hydra(lab) // bloodhound(lab) // obsidian(notes)</div>"+
  "<h2>🎨 Wallpapers (pure CSS)</h2><div class='grid'>"+
  "<div class='wp' style='background:radial-gradient(circle at 30% 20%,#FF3355,#05070A 70%)'>MIDNIGHT RED</div>"+
  "<div class='wp' style='background:radial-gradient(circle at 70% 30%,#FFB020,#05070A 70%)'>GOLDEN MODE</div>"+
  "<div class='wp' style='background:linear-gradient(135deg,#0b1118,#10161D 60%,#3d0a10)'>SOC FLOOR</div></div>"+
  "<h2>📦 Personal projects</h2><div class='card'><ul><li><b>HOLSERA</b> — secure-transaction concept (see the Lab).</li><li><b>This portfolio</b> — the codebase is the project.</li><li><b>Field notes</b> — write-ups in progress, published as finished.</li></ul></div>"+
  "<a class='back' href='index.html'>← BACK TO THE SITE</a>";
}
function lock(){
  document.getElementById("app").innerHTML=
  '<span class="k">VAULT // LOCKED</span>'+
  "<h1>Locked<span>.</span></h1>"+
  "<p class='sub'>This room opens only with proof. A flag sleeps somewhere in the main page's source — bring it here or submit it in the terminal (<span class='mono'>flag FLAG{...}</span>).</p>"+
  "<input id='fin' placeholder='FLAG{...}' autocomplete='off' spellcheck='false'>"+
  "<button id='fgo'>UNLOCK →</button><div class='err' id='ferr'></div>"+
  "<a class='back' href='index.html'>← BACK TO THE SITE</a>";
  document.getElementById("fgo").onclick=function(){
    var v=document.getElementById("fin").value.trim();
    if(v===FLAG){try{localStorage.setItem("holy_vault","1")}catch(e){}room();}
    else{document.getElementById("ferr").textContent="✗ Wrong flag. Read the source, not the tea leaves.";}
  };
}
if(unlocked()){room();}else{lock();}