/* HOLY // TRAINING GROUND logic — self-contained (main site logic lives in app.js).
   Progress shares localStorage with the main page (same origin). */
(function(){
"use strict";
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
function escapeHtml(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function toast(t){const el=document.getElementById("toast");if(!el)return;el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600);}
function safe(fn){try{fn()}catch(e){if(window.console)console.error(e);}}
/* lazy Supabase loader — never blocks page render */
const SB_CDN="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.min.js";
function loadSbLib(){
  return new Promise(res=>{
    if(typeof supabase!=="undefined") return res(true);
    let done=false;
    const fin=ok=>{if(!done){done=true;res(ok);}};
    const s=document.createElement("script");
    s.src=SB_CDN; s.async=true;
    s.onload=()=>fin(typeof supabase!=="undefined");
    s.onerror=()=>fin(false);
    document.head.appendChild(s);
    setTimeout(()=>fin(typeof supabase!=="undefined"),10000);
  });
}
const ACH_LABELS={term:"TERMINAL ACCESS",first:"FIRST FLAG",flagc:"FLAG CAPTURED",recon:"RECON COMPLETE",root:"ROOT ACCESS",researcher:"SECURITY RESEARCHER",pgp:"PGP VERIFIED",holy:"HOLY BADGE"};
const BADGE_META={
 term:{n:"TERMINAL ACCESS",d:"Ran your first terminal command. The rabbit hole opens.",i:"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='4' width='18' height='16' rx='2'/><path d='M7 9l3 3-3 3M12 15h5'/></svg>",c:"b-term"},
 first:{n:"FIRST FLAG",d:"Captured your first hidden flag. Hunter confirmed.",i:"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 21V4'/><path d='M5 4h12l-2 4 2 4H5'/></svg>",c:"b-first"},
 flagc:{n:"FLAG CAPTURED",d:"All 5 hidden flags. Nothing on this site hides from you.",i:"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z'/><path d='M9 12l2 2 4-4'/></svg>",c:"b-flagc"},
 recon:{n:"RECON COMPLETE",d:"Five distinct terminal commands. Enumeration discipline.",i:"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'><circle cx='12' cy='12' r='7'/><circle cx='12' cy='12' r='1.5' fill='currentColor'/><path d='M12 2v3M12 19v3M2 12h3M19 12h3'/></svg>",c:"b-recon"},
 root:{n:"ROOT ACCESS",d:"Survived Operation Midnight and wore the gold.",i:"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 18l1.2-9L9 13l3-8 3 8 4.8-4L21 18z'/><path d='M4 21h16'/></svg>",c:"b-root"},
 researcher:{n:"SECURITY RESEARCHER",d:"Perfect quiz score. Publish-worthy instincts.",i:"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9 3h6M10 3v6l-5.2 9.4A2 2 0 006.6 21h10.8a2 2 0 001.8-2.6L14 9V3'/><path d='M7.5 15h9'/></svg>",c:"b-res"},
 pgp:{n:"PGP VERIFIED",d:"Copied or downloaded the PGP key. Encrypted and verified.",i:"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'><rect x='5' y='10' width='14' height='10' rx='2'/><path d='M8 10V7a4 4 0 018 0v3'/></svg>",c:"b-pgp"},
 holy:{n:"HOLY BADGE",d:"ULTIMATE — all flags, perfect quizzes, midnight survived, PGP verified. The complete operator.",i:"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 18l1.2-9L9 13l3-8 3 8 4.8-4L21 18z'/><path d='M4 21h16'/><circle cx='12' cy='10' r='1.4' fill='currentColor'/></svg>",c:"b-holy"}};
function getAch(){try{return JSON.parse(localStorage.getItem("holy_ach")||"{}")}catch(e){return{}}}
function unlockAch(k,label){const a=getAch();if(a[k])return;a[k]=1;
  try{localStorage.setItem("holy_ach",JSON.stringify(a))}catch(e){}
  toast("🏅 ACHIEVEMENT — "+label);renderTrophies();syncAch(k);}
/* achievements → cloud (per-account sync, best-effort) */
async function syncAch(k){
  try{
    if(!SB||!sbUser) return;
    await SB.from("achievements").upsert({user_id:sbUser.id,badge:k},{onConflict:"user_id,badge"});
  }catch(e){}
}
function seals(){try{return JSON.parse(localStorage.getItem("holy_seals")||"{}")}catch(e){return{}}}
function foundFlags(){try{return JSON.parse(localStorage.getItem("holy_flags")||"[]")}catch(e){return[]}}

/* ---------- quizzes ---------- */
const QUIZ_VULN=[
 {code:'query = "SELECT * FROM users WHERE id = \'" + user_input + "\'";',
  q:"What vulnerability is this?",opts:["SQL Injection","Cross-Site Scripting","IDOR","CSRF"],a:0,
  exp:"Untrusted input is concatenated straight into SQL. Parameterize queries — never build them with string glue."},
 {code:'commentBox.innerHTML = userComment; // render instantly, no sanitization',
  q:"What vulnerability is this?",opts:["SQL Injection","Cross-Site Scripting","IDOR","CSRF"],a:1,
  exp:"Attacker HTML/JS lands in a live DOM sink. Use textContent or sanitize — innerHTML with user data is a loaded gun."},
 {code:'GET /api/invoices/1024   →   change to /1025, no ownership check, data leaks',
  q:"What vulnerability is this?",opts:["SQL Injection","XSS","IDOR / BOLA","CSRF"],a:2,
  exp:"Object reference with no authorization check. Verify ownership server-side on every object access."},
 {code:'<img src="https://bank.local/transfer?to=attacker&amt=1000">  <!-- hidden on evil page -->',
  q:"What vulnerability is this?",opts:["SQL Injection","XSS","IDOR","CSRF"],a:3,
  exp:"Victim's browser fires a state-changing GET carrying cookies. Per-session tokens plus SameSite cookies stop it."},
 {code:'if (!userExists) return "User not found";\nelse if (!validPass) return "Wrong password";',
  q:"What flaw is this?",opts:["User Enumeration","SQL Injection","XSS","CSRF"],a:0,
  exp:"Different errors reveal valid usernames. One generic message for both cases — always."},
 {code:'fetch("/fetch?url=" + userUrl)  // server fetches any URL the user names',
  q:"What vulnerability is this?",opts:["SSRF","XSS","SQL Injection","CSRF"],a:0,
  exp:"The server becomes your proxy into internal networks. Allowlist destinations, block metadata IPs."},
 {code:'Set-Cookie: session=abc123; Path=/   // no Secure, HttpOnly, or SameSite',
  q:"What's wrong here?",opts:["Insecure Cookie Config","SQL Injection","XSS","IDOR"],a:0,
  exp:"Missing flags invite theft and cross-site abuse. Secure + HttpOnly + SameSite, always on session cookies."},
 {code:'exec("ping " + host)  // host comes straight from the request',
  q:"What vulnerability is this?",opts:["Command Injection","XSS","CSRF","IDOR"],a:0,
  exp:"Shell metacharacters break out. Never pass user input to a shell — use safe APIs."},
 {code:'parseXML(userXml)  // external entities left enabled',
  q:"What vulnerability is this?",opts:["XXE","XSS","SQL Injection","CSRF"],a:0,
  exp:"External entities read server files or pivot internally. Disable DTDs, use hardened parsers."},
 {code:'redirect(req.query.next)  // destination never validated',
  q:"What vulnerability is this?",opts:["Open Redirect","XSS","IDOR","SQL Injection"],a:0,
  exp:"Victims trust your domain and land on evil. Allowlist URLs or use indirect references."},
 {code:'if (token.alg === "none") skipVerify()  // client picks the algorithm',
  q:"What flaw is this?",opts:["Auth Bypass","XSS","CSRF","IDOR"],a:0,
  exp:"Never let the client choose 'none'. Enforce the expected algorithm server-side."},
 {code:'readFile("/var/www/" + req.query.page)  // try: ../../etc/passwd',
  q:"What vulnerability is this?",opts:["Path Traversal","XSS","CSRF","IDOR"],a:0,
  exp:"Dot-dot sequences escape the web root. Canonicalize paths, allowlist, never concatenate."},
 {code:'save(upload, "/uploads/" + upload.name)  // shell.php welcome',
  q:"What vulnerability is this?",opts:["Unrestricted File Upload","XSS","SQL Injection","CSRF"],a:0,
  exp:"Executable uploads become shells. Validate server-side, rename, store outside webroot, strip exec."},
 {code:'500: "SQLSTATE password=secret conn=db01"  // shown to users',
  q:"What flaw is this?",opts:["Information Disclosure","XSS","IDOR","CSRF"],a:0,
  exp:"Stack traces arm attackers. Generic errors outside, details in logs only."},
 {code:'user.update(req.body)  // body smuggles role:"admin"',
  q:"What vulnerability is this?",opts:["Mass Assignment","XSS","SQL Injection","CSRF"],a:0,
  exp:"Raw input bound to models flips protected fields. Allowlist assignable attributes."},
 {code:'db.users.find({user: u, pass: p})  // p = {"$ne": null}',
  q:"What vulnerability is this?",opts:["NoSQL Injection","XSS","IDOR","CSRF"],a:0,
  exp:"Operators smuggle logic into queries. Validate types, never pass raw objects."},
 {code:'pickle.loads(session_cookie)  // trusted? never.',
  q:"What vulnerability is this?",opts:["Insecure Deserialization","XSS","CSRF","IDOR"],a:0,
  exp:"Deserializing attacker data runs code. Sign it — or avoid native formats."},
 {code:'el.innerHTML = "<b>" + location.hash.slice(1) + "</b>"  // hash-fed',
  q:"What vulnerability is this?",opts:["DOM XSS","SQL Injection","IDOR","CSRF"],a:0,
  exp:"Client-side sink fed by the URL. Encode output, never innerHTML location data."},
 {code:'ldap.search("(uid=" + u + ")")  // u = *)(uid=*))(|(uid=*',
  q:"What vulnerability is this?",opts:["LDAP Injection","XSS","CSRF","IDOR"],a:0,
  exp:"Metacharacters rewrite directory queries. Escape per RFC 4515, bind least-privilege."},
 {code:'render("hello " + name)  // name {{7*7}} renders 49',
  q:"What vulnerability is this?",opts:["XSS","SSTI","SQL Injection","CSRF"],a:1,
  exp:"Server-Side Template Injection turns names into code. Logic-less templates, hard sandbox."},
 {code:'resetLink = "https://" + req.headers.Host + "/reset?t=" + token',
  q:"What vulnerability is this?",opts:["XSS","IDOR","Host Header Poisoning","SQL Injection"],a:2,
  exp:"Attacker Host header poisons reset links. Allowlist hosts, use configured base URLs."},
 {code:'if (balance >= price) { balance -= price; }  // fired in parallel…',
  q:"What flaw is this?",opts:["XSS","CSRF","IDOR","Race Condition"],a:3,
  exp:"Check-then-act without locking double-spends. Atomic ops or locks fix it."},
 {code:'api_key = "sk-live-9f2c…"  // committed to the repo',
  q:"What flaw is this?",opts:["Hardcoded Secrets","XSS","SQL Injection","CSRF"],a:0,
  exp:"Repos leak in minutes. Vaults, env injection, pre-commit scans — then rotate."},
 {code:'Access-Control-Allow-Origin: *  +  Allow-Credentials: true',
  q:"What flaw is this?",opts:["XSS","CORS Misconfiguration","SQL Injection","IDOR"],a:1,
  exp:"Any origin reads credentialed responses. Mirror explicit origins, never * with creds."},
 {code:'<iframe src="https://bank.local/account"></iframe>  <!-- invisible overlay -->',
  q:"What vulnerability is this?",opts:["XSS","CSRF","IDOR","Clickjacking"],a:3,
  exp:"UI redressing steals clicks. X-Frame-Options DENY or frame-ancestors."},
 {code:'token = md5(time())  // "random" reset tokens',
  q:"What flaw is this?",opts:["XSS","SQL Injection","Weak Randomness","CSRF"],a:2,
  exp:"Predictable tokens are enumerable. CSPRNG only — never timestamps."},
 {code:'export(users)  // a cell holds =cmd|"/c calc"!A0',
  q:"What vulnerability is this?",opts:["CSV Injection","XSS","SQL Injection","IDOR"],a:0,
  exp:"Spreadsheet formulas execute on open. Prefix risky cells, warn on export."},
 {code:'sess = req.query.sid || newSid()  // attacker shares ?sid=KNOWN',
  q:"What flaw is this?",opts:["XSS","Session Fixation","CSRF","SQL Injection"],a:1,
  exp:"Known session IDs survive login. Regenerate at auth, cookies only."},
 {code:'if (req.method === "POST") auth();  // PUT sails straight through',
  q:"What flaw is this?",opts:["HTTP Verb Tampering","XSS","CSRF","IDOR"],a:0,
  exp:"Auth bound to one verb is no auth. Enforce on the route, all methods."},
 {code:'GET /item?id=1&id=2  // WAF sees first, backend takes last',
  q:"What flaw is this?",opts:["XSS","IDOR","Parameter Pollution","SQL Injection"],a:2,
  exp:"Duplicate parameters split parsers. Canonicalize once, reject ambiguity."},
 {code:'CNAME assets → expired-saas.herokuapp.com  // NXDOMAIN, claimable',
  q:"What flaw is this?",opts:["XSS","CSRF","IDOR","Subdomain Takeover"],a:3,
  exp:"Dangling DNS meets claimable hosting. Inventory records, kill the strays."},
 {code:'jwt.verify(token, "secret123")  // crackable offline in minutes',
  q:"What flaw is this?",opts:["XSS","Weak JWT Secret","SQL Injection","CSRF"],a:1,
  exp:"Short HMAC secrets fall to wordlists. Long random secrets, strong algs."},
 {code:'response_type=token  // access_token rides the URL fragment',
  q:"What flaw is this?",opts:["Insecure OAuth Flow","XSS","CSRF","IDOR"],a:0,
  exp:"Implicit flow leaks tokens via history and referers. Code flow + PKCE instead."},
 {code:'{"query":"{__schema{types{name}}}"}  // production answers happily',
  q:"What flaw is this?",opts:["XSS","IDOR","GraphQL Introspection","SQL Injection"],a:2,
  exp:"Schema maps the whole API for attackers. Disable introspection in prod."},
 {code:'ws.send({cmd:"reset",target:"all"})  // no handshake auth check',
  q:"What flaw is this?",opts:["XSS","CSRF","SQL Injection","Broken WS Auth"],a:3,
  exp:"Sockets skip login at your peril. Authenticate the upgrade, authorize frames."},
 {code:'merge({}, req.body)  // body ships __proto__',
  q:"What vulnerability is this?",opts:["XSS","Prototype Pollution","SQL Injection","IDOR"],a:1,
  exp:"Prototype keys poison every object. Freeze, validate keys, use safe merge."},
 {code:'if (/^(a+)+$/.test(user))  // user sends aaaaaaaaaaaaaaaaaaaaa!',
  q:"What flaw is this?",opts:["ReDoS","XSS","SQL Injection","CSRF"],a:0,
  exp:"Catastrophic backtracking burns CPU. Linear-time patterns, input caps, timeouts."},
 {code:'include("pages/" + p + ".php")  // p = ../../config',
  q:"What vulnerability is this?",opts:["XSS","SQL Injection","Local File Inclusion","CSRF"],a:2,
  exp:"Paths become code. Map allowlisted names, never concatenate."},
 {code:'GET /admin/users  // 200 OK, role never checked',
  q:"What flaw is this?",opts:["XSS","CSRF","IDOR","Broken Function Auth"],a:3,
  exp:"Hiding URLs is not authorization. Enforce roles on every function."},
 {code:'{"user":"amy","passwordHash":"$2a$…","ssn":"…"}  // just to render a name',
  q:"What flaw is this?",opts:["XSS","Excessive Data Exposure","SQL Injection","IDOR"],a:1,
  exp:"APIs overshare by default. Return only what the screen needs."},
 {code:'for (pw of rockyou) login(u, pw)  // 200 tries/sec, never blocked',
  q:"What flaw is this?",opts:["Missing Rate Limiting","XSS","CSRF","SQL Injection"],a:0,
  exp:"Unthrottled logins invite stuffing. Rate limits, lockouts, alerts."},
 {code:'fetch("/log?url=" + location.href)  // href holds ?token=',
  q:"What flaw is this?",opts:["XSS","IDOR","Token Leakage","CSRF"],a:2,
  exp:"Tokens in URLs land in logs and referers. Keep secrets in bodies and headers."},
 {code:'Access-Control-Allow-Origin: null  +  credentials: true',
  q:"What flaw is this?",opts:["XSS","CSRF","IDOR","CORS Null Origin"],a:3,
  exp:"Sandboxed null origins still read responses. Never pair null with credentials."},
 {code:'eval("theme_" + userChoice)  // choice = ";fetch(evil)"',
  q:"What vulnerability is this?",opts:["XSS","Eval Injection","SQL Injection","CSRF"],a:1,
  exp:"Eval is remote code execution with extra steps. Maps and allowlists instead."},
 {code:'parent.postMessage({token: t}, "*")  // any origin may listen',
  q:"What flaw is this?",opts:["Insecure postMessage","XSS","CSRF","IDOR"],a:0,
  exp:"Wildcard targets leak to attackers. Pin exact origins, validate senders."},
 {code:'DEBUG = True  // yellow traceback pages, live in prod',
  q:"What flaw is this?",opts:["XSS","IDOR","Debug Exposure","CSRF"],a:2,
  exp:"Debug pages hand out internals and consoles. Off in prod, always."},
 {code:'GET /reset?email=a@b.c&token=abc123  // logged everywhere',
  q:"What flaw is this?",opts:["XSS","CSRF","IDOR","Sensitive Data in URL"],a:3,
  exp:"URLs persist in history, logs, proxies. Secrets ride POST bodies."},
 {code:'login("admin", "admin")  // 200 OK on the very first try',
  q:"What flaw is this?",opts:["XSS","Default Credentials","SQL Injection","CSRF"],a:1,
  exp:"Factory logins are public knowledge. Force rotation on first boot."}
];
const QUIZ_SEC=[
 {q:"Which CIA-triad property guarantees data is unaltered?",opts:["Confidentiality","Integrity","Availability","Authenticity"],a:1,exp:"Integrity = unaltered. Hashes and signatures enforce it."},
 {q:"First move on any new device or account?",opts:["Install themes","Change default credentials","Disable logging","Share access"],a:1,exp:"Defaults are public knowledge. Change them before anything else."},
 {q:"What does Nmap -sV do?",opts:["OS detection","Port knocking","Service/version detection","Packet crafting"],a:2,exp:"-sV probes open ports to fingerprint service names and versions."},
 {q:"Least privilege means…",opts:["Everyone gets admin","Minimum access to function","No passwords needed","Log everything"],a:1,exp:"Only the access required — nothing more. Shrinks blast radius."},
 {q:"Burp Repeater is for…",opts:["Auto-scanning","Manual request modification","Password cracking","Traffic shaping"],a:1,exp:"Craft, tweak and resend requests by hand. Understanding beats automation."},
 {q:"Phishing is primarily…",opts:["A firewall flaw","Social engineering","A malware family","A routing attack"],a:1,exp:"It hacks the human, not the machine. Verify sender, hover links."},
 {q:"SMS 2FA codes are weak to…",opts:["SIM swapping","Long passwords","Firewalls","Updates"],a:0,exp:"Number port-outs bypass SMS codes. Prefer app/hardware factors."},
 {q:"First action on a suspected breach?",opts:["Pull every plug","Isolate and contain the system","Delete suspicious files","Wait and watch"],a:1,exp:"Contain first — stop the spread, preserve evidence."},
 {q:"Burp Suite's core job?",opts:["Crack Wi-Fi","Intercept and inspect web traffic","Scan ports","Mine crypto"],a:1,exp:"A proxy between browser and app: see it, touch it, test it."},
 {q:"Reused passwords fall to…",opts:["Phishing","Credential stuffing","DDoS","XSS"],a:1,exp:"One leak becomes every account. Unique passwords only."},
 {q:"Public Wi-Fi's real danger?",opts:["Eavesdropping / MITM","Faster speeds","Better privacy","Nothing much"],a:0,exp:"Open airwaves invite snoopers. VPN on untrusted nets."},
 {q:"A strong password starts at…",opts:["4 characters","8 characters","12+ unique characters","Your birthday"],a:2,exp:"Length beats complexity. 12+ unique, ideally in a manager."},
 {q:"Backup codes for 2FA exist to…",opts:["Share with friends","Recover access if factors are lost","Skip passwords","Speed up login"],a:1,exp:"Lost phone without backups means lost account. Store them offline."},
 {q:"Someone watching your screen is called…",opts:["Sniffing","Shoulder surfing","Pharming","Spoofing"],a:1,exp:"Privacy screens and awareness beat curious eyes."},
 {q:"What does a VPN hide from your ISP?",opts:["Destinations and content","Your OS","Your passwords","Nothing"],a:0,exp:"The tunnel shifts visibility from ISP to VPN provider."},
 {q:"Passwords should be stored…",opts:["Plaintext for recovery","Reversibly encrypted","Hashed with salt (bcrypt/argon2)","Inside cookies"],a:2,exp:"One-way salted hashing — breaches leak puzzles, not keys."},
 {q:"Tailgating means…",opts:["Fast driving","Following someone through a secure door","Email spam","Wi-Fi theft"],a:1,exp:"Physical breach, zero exploit needed. Challenge strangers politely."},
 {q:"Security is whose job?",opts:["Only the SOC","Everyone touching the system","The firewall vendor","Nobody"],a:1,exp:"Culture beats tooling. Every commit, every click."},
 {q:"Download pages list hashes so you can…",opts:["Look technical","Verify file integrity","Get support","Unlock premium"],a:1,exp:"Compare before you run it. Mismatched hash — delete it."},
 {q:"Covering the laptop camera helps against…",opts:["Hackers","Spyware peeking","Slow Wi-Fi","Overheating"],a:1,exp:"Cheap privacy. Malware can't see through tape."},
 {q:"Work laptop on hotel guest Wi-Fi?",opts:["Fine, it's Wi-Fi","Avoid it or VPN up","Faster actually","Required"],a:1,exp:"Shared airwaves, unknown neighbors. VPN or hotspot."},
 {q:"Sharing your screen? First…",opts:["Open everything","Hide sensitive tabs and notifications","Turn volume up","Share faster"],a:1,exp:"Audiences remember secrets. Declutter before you broadcast."},
 {q:"A caller claims to be IT and wants your code — that's…",opts:["Vishing","Skimming","Pharming","Sniffing"],a:0,exp:"Voice phishing. Hang up, call back on a known number."},
 {q:"End-to-end encryption guarantees…",opts:["Speed","Only the endpoints can read it","Free storage","No passwords"],a:1,exp:"No middleman — not even the provider. Verify fingerprints anyway."},
 {q:"Unique email aliases per site help because…",opts:["They look cool","Breach correlation becomes obvious","Faster login","More storage"],a:1,exp:"A leaked alias reveals exactly who lost it. Trace the spill."},
 {q:"What is OSINT?",opts:["A hacking tool","Public-source intelligence","A firewall","A virus"],a:1,exp:"Attackers Google you first. Audit your own footprint."},
 {q:"Always verify payment-change requests because…",opts:["BEC fraud is rampant","It's polite","It's slow","Printers"],a:0,exp:"Business Email Compromise reroutes real money. Call back, verify."},
 {q:"Your password-manager master password should be…",opts:["password123","Long, unique, memorized","Your birthday","Written on screen"],a:1,exp:"One strong secret guards all others. Make it count."},
 {q:"A VPN kill switch does what?",opts:["Speeds up","Blocks traffic if the VPN drops","Saves battery","Blocks ads"],a:1,exp:"No silent fallback to naked traffic. Always on."},
 {q:"Disable Office macros by default because…",opts:["They're slow","Top malware delivery vector","Ugly fonts","Battery"],a:1,exp:"Maldocs rule initial access. Unsigned macros stay off."},
 {q:"Phishing-resistant MFA means…",opts:["SMS codes","FIDO2 security keys","Secret questions","Email links"],a:1,exp:"Unphishable cryptography, not forwardable codes."},
 {q:"The blue team are…",opts:["The attackers","The defenders","The vendors","The auditors"],a:1,exp:"Detect, respond, harden. You want them sharp — or be them."},
 {q:"What does EDR do?",opts:["Encrypts disks","Detects and responds on endpoints","Blocks spam","Speeds boot"],a:1,exp:"Eyes and hands on every machine. Alerts plus response."},
 {q:"Why segment networks?",opts:["Faster Wi-Fi","Contain breaches","More IPs","Prettier maps"],a:1,exp:"Compartments turn disasters into incidents. Isolate by trust."},
 {q:"Number-matching in MFA stops…",opts:["Typos","Fatigue approve-spam","Slow logins","Expired certs"],a:1,exp:"Attackers can't approve what they can't see. Match the digits."},
 {q:"Why read URLs before clicking?",opts:["Fun fonts","Spot lookalike domains","Faster loads","SEO"],a:1,exp:"paypaI vs paypal decides your money's fate. Inspect first."},
 {q:"A security audit is…",opts:["A hack attack","A systematic review","A firewall","A backup"],a:1,exp:"Measure against a standard before attackers measure you."},
 {q:"A home guest network exists to…",opts:["Share faster","Isolate visitors and IoT","Boost signal","Save power"],a:1,exp:"Guests get internet, never your NAS. Segment by trust."},
 {q:"Passkeys replace…",opts:["Usernames","Passwords with device crypto","Email","Monitors"],a:1,exp:"Phishing-proof login bound to your device. The end of passwords."},
 {q:"An incident response plan gives you…",opts:["More alerts","Roles and steps before chaos","Legal immunity","Free tools"],a:1,exp:"Decide calmly now what panic can't decide later."},
 {q:"Screen lock timeout should be…",opts:["Never","Minutes, not hours","Weekly","Whenever"],a:1,exp:"Abandoned unlocked screens are free access. Short leash."},
 {q:"Checksums verify ___, signatures verify ___?",opts:["Speed, price","Integrity, authenticity","Color, size","Nothing"],a:1,exp:"Hash says unaltered; signature says by whom. Use both."},
 {q:"Threat modeling means…",opts:["Buying threats","Mapping threats before building","Ignoring risks","Hiring hackers"],a:1,exp:"Draw the attacker in during design, not after breach."},
 {q:"The 3-2-1 backup rule?",opts:["3 passwords","3 copies, 2 media, 1 offsite","2 accounts","1 backup"],a:1,exp:"Redundancy across places and formats. Ransomware-proofing 101."},
 {q:"A zero-day is…",opts:["A new calendar","An unknown unpatched flaw","A firewall","A holiday"],a:1,exp:"No patch exists yet. Mitigate, segment, watch closely."},
 {q:"Why leave auto-updates on?",opts:["They're fun","Shrink the exposure window","More popups","Faster CPU"],a:1,exp:"Exploits race patches. Automatic wins the race."},
 {q:"Doxing defense starts with…",opts:["Faster net","Minimizing public PII","More accounts","Louder passwords"],a:1,exp:"Every public detail is ammo. Publish less."},
 {q:"Work files on a personal USB?",opts:["Sure","No — data-loss risk","Faster","Encrypted always"],a:1,exp:"Untracked copies walk away. DLP exists for a reason."},
 {q:"Split tunneling risk?",opts:["Speed","Bypasses corporate inspection","Battery","Noise"],a:1,exp:"Half your traffic dodges the guards. Know which half."},
 {q:"Security headers matter because…",opts:["They're pretty","Browsers enforce guardrails","Faster pages","SEO boost"],a:1,exp:"Free hardening per response. Set them once, benefit always."},
 {q:"Default-deny means…",opts:["Allow all","Block all, allow listed","No passwords","Open Wi-Fi"],a:1,exp:"Closed by default, opened by decision. The safe posture."},
 {q:"After containing a breach, preserve…",opts:["Nothing","Evidence: logs, images, timelines","The attacker","Silence"],a:1,exp:"Don't wipe what you'll need to understand. Image first."}
];
let quiz={set:null,i:0,score:0};
function quizRank(pct,top){
  if(pct>=1) return top;
  if(pct>=0.66) return quiz.set===QUIZ_VULN?"SHARP EYE":"OPERATOR";
  if(pct>=0.33) return quiz.set===QUIZ_VULN?"KEEP PRACTICING":"ANALYST TRAINEE";
  return "CURIOUS NEWBIE — keep learning";
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
function bestOf(b,k){const v=b[k];return (v&&typeof v==="object")?{best:v.best||0,plays:v.plays||0,sum:v.sum||0}:{best:v||0,plays:0,sum:0};}
function quizStart(set,game){
  const g=game||(set===QUIZ_VULN?"vuln":"sec");
  const mapped=set.map(q=>{
    if(g==="vuln"){
      const correct=q.opts[q.a];
      const distract=shuffle(VPOOL.filter(x=>x!==correct)).slice(0,3);
      const opts=shuffle([correct,...distract]);
      return{...q,opts:opts,a:opts.indexOf(correct)};
    }
    const ord=shuffle(q.opts.map((o,i)=>i));return{...q,opts:ord.map(i=>q.opts[i]),a:ord.indexOf(q.a)};});
  quiz={game:g,set:shuffle(mapped),i:0,score:0};quizRender();}
const VPOOL=[...new Set(QUIZ_VULN.map(q=>q.opts[q.a]))];
function quizRender(){
  const box=document.getElementById("quizBox"); if(!box) return;
  const Q=quiz.set[quiz.i];
  if(!Q){const pct=quiz.score/quiz.set.length;
    if(pct>=1) unlockAch("researcher","SECURITY RESEARCHER");
    submitScore(quiz.game,quiz.score,quiz.set.length);
    try{const b=JSON.parse(localStorage.getItem("holy_best")||"{}");
      const cur=bestOf(b,quiz.game); cur.plays++;
      if(quiz.score>cur.best)cur.best=quiz.score; cur.sum+=quiz.score;
      b[quiz.game]=cur; localStorage.setItem("holy_best",JSON.stringify(b));
    }catch(e){}
    box.innerHTML=`<div class="qprog">FINAL SCORE</div><div class="qscore">${quiz.score} / ${quiz.set.length}</div>
    <div class="qrank">RANK: ${quizRank(pct,quiz.game==="vuln"?"EAGLE EYE":"RED TEAM MATERIAL")}</div>
    <div class="btnrow" style="margin-top:16px"><button class="btn btn-p" id="qretry">RETRY →</button></div>`;
    document.getElementById("qretry").onclick=()=>quizStart(quiz.set,quiz.game); return;}
  box.innerHTML=`<div class="qprog">QUESTION ${quiz.i+1} / ${quiz.set.length} · SCORE ${quiz.score}</div>
  ${Q.code?`<pre class="qcode">${Q.code}</pre>`:""}
  <h4 class="qq">${Q.q}</h4>
  <div class="qopts">${Q.opts.map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join("")}</div>
  <div class="qexp" hidden></div>`;
  box.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    const ok=+b.dataset.i===Q.a;
    box.querySelectorAll(".opt").forEach(x=>{x.disabled=true;if(+x.dataset.i===Q.a)x.classList.add("ok");});
    if(!ok) b.classList.add("no"); else quiz.score++;
    const ex=box.querySelector(".qexp"); ex.hidden=false;
    ex.innerHTML=`<b>${ok?"✓ CORRECT":"✗ NOT QUITE"}</b> — ${Q.exp}<br><br><button class="btn btn-p" id="qnext">${quiz.i+1>=quiz.set.length?"SEE SCORE":"NEXT →"}</button>`;
    document.getElementById("qnext").onclick=()=>{quiz.i++;quizRender();};
    box.querySelector(".qprog").textContent=`QUESTION ${quiz.i+1} / ${quiz.set.length} · SCORE ${quiz.score}`;
  });
}

const VULNLAB=[
 {t:"Cross-Site Scripting (XSS)",v:"Untrusted input lands in innerHTML with no encoding.",c:"Attacker markup executes in the victim's session.",i:"Session theft, defacement, actions performed as the victim.",f:"Output-encode by context; prefer textContent; enforce Content-Security-Policy."},
 {t:"SQL Injection (SQLi)",v:"User input concatenated directly into SQL strings.",c:"Crafted input alters query logic or stacks commands.",i:"Data theft, authentication bypass, sometimes RCE.",f:"Parameterized queries; least-privilege database accounts."},
 {t:"Insecure Direct Object Reference (IDOR)",v:"Object IDs accepted with no ownership check.",c:"Swap IDs to reach other users' objects.",i:"Exposure or modification of someone else's data.",f:"Server-side authorization on every single object access."},
 {t:"Cross-Site Request Forgery (CSRF)",v:"State-changing requests without anti-CSRF tokens.",c:"Victim's browser fires forged requests carrying cookies.",i:"Unwanted actions executed as the victim.",f:"POST + per-session tokens, SameSite cookies, re-auth for sensitive acts."},
 {t:"Authentication Flaws",v:"No rate limiting, verbose errors, weak lockout.",c:"Credential stuffing plus user enumeration at scale.",i:"Account takeover, one inbox at a time.",f:"Rate limits, generic errors, MFA, breach-corpus password checks."},
 {t:"Server-Side Request Forgery (SSRF)",v:"Server fetches arbitrary user-supplied URLs.",c:"Attacker pivots through the server into internal networks and cloud metadata.",i:"Internal service access, credential theft, cloud takeover.",f:"Allowlist destinations; block metadata/link-local IPs; no redirects to internal."},
 {t:"Security Misconfiguration",v:"Defaults, verbose banners, open debug endpoints left live.",c:"Attackers fingerprint and walk through open doors.",i:"Easy foothold with zero cleverness required.",f:"Harden baselines, strip banners, disable debug in production, review often."},
 {t:"Sensitive Data Exposure",v:"Secrets, keys or PII in repos, logs or URLs.",c:"Attackers harvest what you published yourself.",i:"Credential leaks, impersonation, full compromise.",f:"Vaults for secrets, redacted logs, pre-commit scanning, rotate on leak."},
 {t:"XML External Entities (XXE)",v:"XML parsers resolving external entities.",c:"Malicious XML reads server files or pivots internally.",i:"File disclosure, internal network probing.",f:"Disable DTDs and external entities; use hardened parsers."},
 {t:"Open Redirect",v:"Redirect destinations never validated.",c:"Victims trust your domain, land on an evil twin.",i:"Credential phishing wearing your logo.",f:"Allowlist URLs or use indirect reference maps."},
 {t:"Path Traversal",v:"User input joined into filesystem paths.",c:"Dot-dot sequences escape the web root.",i:"Arbitrary file read, config and secret theft.",f:"Canonicalize paths, strict allowlists, jail the process."},
 {t:"Unrestricted File Upload",v:"Uploads saved with attacker-controlled names, executable.",c:"Upload a web shell, then visit its URL.",i:"Remote code execution on the server.",f:"Validate type server-side, randomize names, store outside webroot."},
 {t:"Mass Assignment",v:"Raw request bodies bound straight to data models.",c:"Extra fields like role overwrite protected attributes.",i:"Privilege escalation via a signup form.",f:"Allowlist assignable fields; guard sensitive attributes server-side."},
 {t:"Insecure Deserialization",v:"Untrusted bytes fed to native deserializers.",c:"Crafted objects execute during parsing.",i:"Remote code execution.",f:"Avoid native formats for input; sign and verify when unavoidable."},
 {t:"LDAP Injection",v:"User input concatenated into directory queries.",c:"Metacharacters rewrite filters, dumping entries.",i:"Auth bypass, directory disclosure.",f:"Escape per RFC 4515; least-privilege binds."},
 {t:"Server-Side Template Injection (SSTI)",v:"User input rendered by a template engine.",c:"Template syntax smuggled in names executes.",i:"Server-side code execution in severe cases.",f:"Logic-less templates, strict sandboxing."},
 {t:"Host Header Poisoning",v:"Host header trusted for building URLs.",c:"Poisoned links reset victims attacker's way.",i:"Account takeover via tainted flows.",f:"Allowlisted hosts, absolute configured URLs."},
 {t:"Race Condition (TOCTOU)",v:"Check-then-act sequences without locking.",c:"Parallel requests both pass the check.",i:"Double-spend, overuse, privilege slips.",f:"Atomic operations, DB constraints, locking."},
 {t:"Hardcoded Secrets",v:"Keys and tokens committed to repos.",c:"Scrapers harvest them within minutes.",i:"Full account and infrastructure compromise.",f:"Vaults, env injection, pre-commit scanning."},
 {t:"CORS Misconfiguration",v:"Wildcard origins paired with credentials.",c:"Any site reads authenticated responses.",i:"Session and data theft cross-origin.",f:"Mirror explicit origins, never * with creds."},
 {t:"Clickjacking",v:"Sensitive pages framable, no protections.",c:"Invisible overlays hijack user clicks.",i:"Unwanted actions as the victim.",f:"X-Frame-Options DENY or frame-ancestors."},
 {t:"Weak Randomness",v:"Tokens from timestamps or weak PRNGs.",c:"Attackers enumerate the predictable space.",i:"Session and reset-token takeover.",f:"CSPRNG for anything secret. Always."},
 {t:"CSV Injection",v:"Unescaped formulas in exported data.",c:"Victim opens export, spreadsheet executes.",i:"Command execution on analyst machines.",f:"Prefix risky cells, sanitize exports."},
 {t:"Session Fixation",v:"Session IDs accepted from URLs.",c:"Attacker plants a known session ID.",i:"Full hijack after victim logs in.",f:"Regenerate at login; cookies only."},
 {t:"HTTP Verb Tampering",v:"Auth bound to a single HTTP method.",c:"Attacker simply uses another verb.",i:"Authentication bypass.",f:"Enforce authorization on routes, all methods."},
 {t:"HTTP Parameter Pollution",v:"Duplicate parameters parsed inconsistently.",c:"WAF and backend disagree on values.",i:"Filter bypass, logic abuse.",f:"Canonicalize once, reject ambiguity."},
 {t:"Subdomain Takeover",v:"Dangling DNS pointing at claimable hosts.",c:"Attacker claims the expired service.",i:"Trusted-domain phishing and cookies.",f:"Inventory DNS, delete strays fast."},
 {t:"Weak JWT Secret",v:"Short HMAC secrets signing tokens.",c:"Offline cracking forges any identity.",i:"Total authentication bypass.",f:"Long random secrets, strong algorithms."},
 {t:"Insecure OAuth Flow",v:"Tokens delivered via URL fragments.",c:"History, logs and referers collect them.",i:"Account hijack through leaked tokens.",f:"Authorization code flow with PKCE."},
 {t:"GraphQL Introspection",v:"Schema queries answered in production.",c:"Attackers map the entire API surface.",i:"Accelerated discovery of flaws.",f:"Disable introspection outside dev."},
 {t:"Broken WebSocket Auth",v:"Socket frames accepted unauthenticated.",c:"Anyone speaks protocol directly.",i:"Unauthorized commands and data.",f:"Authenticate upgrades, authorize frames."},
 {t:"Prototype Pollution",v:"Attacker keys merged into objects.",c:"__proto__ poisons every object.",i:"Logic bypass, sometimes RCE.",f:"Freeze prototypes, validate keys."},
 {t:"Regular-Expression DoS",v:"Catastrophic-backtracking patterns on input.",c:"Crafted strings burn CPU cores.",i:"Denial of service, cheaply.",f:"Linear-time regex, input caps, timeouts."},
 {t:"Local File Inclusion",v:"User input joined into include paths.",c:"Traversal reaches code and config.",i:"Source theft, often code execution.",f:"Allowlisted names, no concatenation."},
 {t:"Broken Function Authorization",v:"Endpoints lacking role checks.",c:"Anyone calls admin functions directly.",i:"Privilege escalation by URL.",f:"Enforce roles on every function."},
 {t:"Excessive Data Exposure",v:"APIs returning full internal objects.",c:"Clients receive secrets with names.",i:"Credential and PII leakage.",f:"Return only what the screen needs."},
 {t:"Missing Rate Limiting",v:"Unthrottled sensitive endpoints.",c:"Attackers stuff credentials at scale.",i:"Account takeover campaigns.",f:"Rate limits, lockouts, alerting."},
 {t:"Token Leakage",v:"Secrets embedded in URLs and logs.",c:"Referers and history collect tokens.",i:"Session hijack via bystanders.",f:"Secrets in bodies and headers only."},
 {t:"CORS Null Origin",v:"Null origin trusted with credentials.",c:"Sandboxed pages still read responses.",i:"Cross-origin data theft.",f:"Never pair null with credentials."},
 {t:"Client-Side Eval Injection",v:"User input passed to eval-like sinks.",c:"Strings become executed code.",i:"Full client compromise, XSS+.",f:"Maps and allowlists, never eval."},
 {t:"Insecure postMessage",v:"Messages sent to wildcard origins.",c:"Any listening frame harvests data.",i:"Token and data leakage.",f:"Pin exact origins, validate senders."},
 {t:"Debug Mode in Production",v:"Debuggers and tracebacks left live.",c:"Visitors browse internals and consoles.",i:"Secrets, paths, sometimes shells.",f:"Debug off in prod, always."},
 {t:"Sensitive Data in URLs",v:"Tokens and PII riding query strings.",c:"History, logs and proxies keep copies.",i:"Hijack via bystanders.",f:"POST bodies and headers for secrets."},
 {t:"Default Credentials",v:"Factory logins left unchanged.",c:"Public username/password pairs.",i:"Instant unauthorized access.",f:"Force rotation on first boot."}
];
function renderVulnLab(){
  const box=document.getElementById("quizBox"); if(!box) return;
  box.innerHTML=`<div class="qprog">CONCEPT LAB // READ-ONLY — AUTHORIZED LABS ONLY</div>`+
  VULNLAB.map(v=>`<div class="card" style="margin-bottom:12px"><h4 class="qq" style="margin-top:0">${v.t}</h4>
  <div class="kv"><b>VULNERABILITY</b><span>${v.v}</span></div>
  <div class="kv"><b>EXPLOIT CONCEPT</b><span>${v.c}</span></div>
  <div class="kv"><b>IMPACT</b><span>${v.i}</span></div>
  <div class="kv"><b>FIX</b><span>${v.f}</span></div></div>`).join("");
}

/* ---------- toolkit ---------- */
function toolOut(t){const o=document.getElementById("toolOut"); if(o) o.textContent=t;}
async function doHash(alg){
  const el=document.getElementById("tin"); const v=el?el.value:"";
  try{const b=await crypto.subtle.digest(alg,new TextEncoder().encode(v));
    toolOut([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join(""));
  }catch(e){toolOut("Hashing unavailable in this browser context.");}
}
function b64u(s){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return decodeURIComponent(escape(atob(s)));}
function renderTool(name){
  const box=document.getElementById("toolBox"); if(!box) return;
  $$("#toolTabs .btn").forEach(b=>{b.className="btn "+(b.dataset.tool===name?"btn-p":"btn-g");});
  if(name==="hash") box.innerHTML=`<div class="tlab">INPUT TEXT</div>
    <input class="tfield" id="tin" placeholder="type here…" autocomplete="off">
    <div class="btnrow"><button class="btn btn-p" data-hash="SHA-256">SHA-256</button>
    <button class="btn btn-g" data-hash="SHA-512">SHA-512</button>
    <button class="btn btn-g" data-hash="SHA-1">SHA-1</button></div>
    <div class="tout2" id="toolOut">hash appears here — computed locally</div>`;
  if(name==="b64") box.innerHTML=`<div class="tlab">TEXT / BASE64</div>
    <textarea class="tfield" id="tin2" placeholder="paste here…"></textarea>
    <div class="btnrow"><button class="btn btn-p" id="bEnc">ENCODE →</button>
    <button class="btn btn-g" id="bDec">DECODE →</button></div>
    <div class="tout2" id="toolOut">result appears here</div>`;
  if(name==="url") box.innerHTML=`<div class="tlab">TEXT / URL-ENCODED</div>
    <textarea class="tfield" id="tin2" placeholder="paste here…"></textarea>
    <div class="btnrow"><button class="btn btn-p" id="bEnc">ENCODE →</button>
    <button class="btn btn-g" id="bDec">DECODE →</button></div>
    <div class="tout2" id="toolOut">result appears here</div>`;
  if(name==="jwt") box.innerHTML=`<div class="tlab">PASTE JWT (decoded locally, never sent)</div>
    <textarea class="tfield" id="tin2" placeholder="eyJhbGciOi…"></textarea>
    <div class="btnrow"><button class="btn btn-p" id="bGo">INSPECT →</button></div>
    <div class="tout2" id="toolOut">header + payload appear here</div>`;
  if(name==="time") box.innerHTML=`<div class="tlab">UNIX TIMESTAMP (SECONDS)</div>
    <input class="tfield" id="tinE" placeholder="1700000000" inputmode="numeric">
    <div class="tlab">ISO DATETIME</div>
    <input class="tfield" id="tinI" placeholder="2025-01-01T00:00:00Z">
    <div class="btnrow"><button class="btn btn-p" id="bE2I">EPOCH → ISO</button>
    <button class="btn btn-g" id="bI2E">ISO → EPOCH</button>
    <button class="btn btn-t" id="bNow">NOW</button></div>
    <div class="tout2" id="toolOut">converted value appears here</div>`;
  if(name==="regex") box.innerHTML=`<div class="tlab">PATTERN</div>
    <input class="tfield" id="tinP" placeholder="FLAG\\{[a-z]+_[0-9]+\\}">
    <div class="tlab">FLAGS (default g)</div>
    <input class="tfield" id="tinF" placeholder="g" autocomplete="off">
    <div class="tlab">TEST STRING</div>
    <textarea class="tfield" id="tin2" placeholder="paste text…"></textarea>
    <div class="btnrow"><button class="btn btn-p" id="bGo">TEST →</button></div>
    <div class="tout2" id="toolOut">matches appear here</div>`;
  wireTools(name);
}
function wireTools(name){
  const enc=document.getElementById("bEnc"), dec=document.getElementById("bDec"),
        go=document.getElementById("bGo"), inp=document.getElementById("tin2");
  if(enc) enc.onclick=()=>{
    const v=inp.value;
    try{toolOut(name==="b64"?btoa(unescape(encodeURIComponent(v))):encodeURIComponent(v));}
    catch(e){toolOut("Cannot encode this input.");}};
  if(dec) dec.onclick=()=>{
    const v=inp.value.trim();
    try{toolOut(name==="b64"?decodeURIComponent(escape(atob(v))):decodeURIComponent(v));}
    catch(e){toolOut("Invalid "+(name==="b64"?"Base64":"URL-encoded")+" input.");}};
  if(go&&name==="jwt") go.onclick=()=>{
    try{const p=inp.value.trim().split(".");
      if(p.length!==3) throw 0;
      toolOut("HEADER:\n"+JSON.stringify(JSON.parse(b64u(p[0])),null,2)+
        "\n\nPAYLOAD:\n"+JSON.stringify(JSON.parse(b64u(p[1])),null,2)+
        "\n\nSIGNATURE: present ("+p[2].length+" chars) — verify server-side, never trust client-side.");
    }catch(e){toolOut("Invalid JWT — need header.payload.signature");}};
  if(go&&name==="regex") go.onclick=()=>{
    const p=document.getElementById("tinP").value, fl=document.getElementById("tinF").value||"g";
    try{const m=[...inp.value.matchAll(new RegExp(p,fl))].slice(0,20);
      toolOut(m.length?("MATCHES: "+m.length+"\n"+m.map(x=>x[0]).join("\n")):"NO MATCH");
    }catch(e){toolOut("Invalid pattern: "+e.message);}};
  const e2i=document.getElementById("bE2I"), i2e=document.getElementById("bI2E"), now=document.getElementById("bNow");
  if(e2i) e2i.onclick=()=>{const v=parseInt(document.getElementById("tinE").value,10);
    toolOut(isNaN(v)?"Enter a numeric epoch.":new Date(v*1000).toISOString());};
  if(i2e) i2e.onclick=()=>{const v=Date.parse(document.getElementById("tinI").value.trim());
    toolOut(isNaN(v)?"Enter a parseable datetime.":String(Math.floor(v/1000)));};
  if(now) now.onclick=()=>{const s=Math.floor(Date.now()/1000);
    document.getElementById("tinE").value=s;
    document.getElementById("tinI").value=new Date(s*1000).toISOString();
    toolOut("NOW → "+s);};
}
window.doHash=doHash;

/* ---------- daily + mini-ctf ---------- */
const DAILY=[
 {q:"Salting stored passwords mainly defeats…",opts:["Phishing","Rainbow-table attacks","DDoS","XSS"],a:1,exp:"Unique salts make precomputed hash tables useless."},
 {q:"HTTPS protects traffic against…",opts:["Endpoint malware","Eavesdropping in transit","Weak passwords","Malicious admins"],a:1,exp:"TLS encrypts the pipe — not the endpoints."},
 {q:"Strongest MFA factor?",opts:["SMS code","Email link","Hardware security key","Security question"],a:2,exp:"Phishing-resistant hardware keys beat codes and questions."},
 {q:"Nmap -sn performs…",opts:["Port scan","Host discovery","OS detection","Exploitation"],a:1,exp:"-sn finds live hosts without port-scanning."},
 {q:"X-Frame-Options mitigates…",opts:["SQLi","Clickjacking","CSRF","RCE"],a:1,exp:"It stops your pages being framed by attackers."},
 {q:"A password manager's main win?",opts:["Faster typing","Unique passwords everywhere","Free VPN","Antivirus"],a:1,exp:"Unique + long per site. Reuse is the real vulnerability."},
 {q:"A JWT signature guarantees…",opts:["Encryption","Integrity + authenticity","Anonymity","Availability"],a:1,exp:"It proves untampered + signed — payload itself isn't secret."},
 {q:"Clear least-privilege violation?",opts:["Shared admin account","MFA enforced","Logging enabled","Patched servers"],a:0,exp:"Shared all-powerful accounts destroy accountability."},
 {q:"Wireshark shows you…",opts:["Source code","Packets on the wire","Passwords in vaults","CPU temps"],a:1,exp:"Packet-level truth of what the network carries."},
 {q:"DNS over HTTPS mainly protects…",opts:["Queries from snooping","Against phishing","From malware","From updates"],a:0,exp:"It encrypts your lookups — snoopers can't read them."},
 {q:"A VPN primarily gives you…",opts:["An encrypted tunnel to its server","Built-in antivirus","Faster internet","Anonymity from everyone"],a:0,exp:"Encrypted pipe to the VPN server — trust shifts, doesn't vanish."},
 {q:"Best ransomware defense?",opts:["Pay quickly","Offline tested backups","Longer passwords","Hide the server"],a:1,exp:"Tested, offline backups turn disaster into inconvenience."},
 {q:"Unpatched services are dangerous because…",opts:["They run slowly","Known exploits are public","They use RAM","They log too much"],a:1,exp:"Public exploits + scanner bots. Patch windows are race windows."},
 {q:"Pretexting targets…",opts:["Firewalls","Humans, with a story","Routers","Databases"],a:1,exp:"A convincing scenario beats a firewall. Verify identities."},
 {q:"Stepping away from your desk?",opts:["Lock it (Win+L)","Leave it open","Monitor off is enough","Trust coworkers"],a:0,exp:"Seconds unattended is all it takes. Lock, always."},
 {q:"Ransomware does what?",opts:["Speeds up the PC","Encrypts data for payment","Deletes cookies","Updates drivers"],a:1,exp:"Backups plus patching beat paying criminals."},
 {q:"A honeypot is…",opts:["Sweet malware","A decoy system that detects attackers","A firewall brand","A type of VPN"],a:1,exp:"Fake targets, real alerts."},
 {q:"The S in HTTPS stands for…",opts:["Speed","Secure (TLS)","Simple","Standard"],a:1,exp:"Encrypted HTTP — look for it before typing secrets."},
 {q:"App-based 2FA beats SMS because…",opts:["Prettier","Immune to SIM swapping","Faster","Free"],a:1,exp:"No number to port out. Secrets stay on your device."},
 {q:"Malware is…",opts:["Broken hardware","Malicious software","Slow internet","Old files"],a:1,exp:"Code with hostile intent. Least privilege limits its blast radius."},
 {q:"Posting your boarding pass leaks…",opts:["Nothing","Barcodes with PII and booking refs","Seat comfort","Flight snacks"],a:1,exp:"Barcodes decode to names, numbers, itineraries. Keep them private."},
 {q:"Unsubscribe link in obvious spam?",opts:["Click it","Don't — it confirms your address","Forward to all","Reply angrily"],a:1,exp:"Clicks tell spammers you're real. Delete and report instead."},
 {q:"Updates asking for a reboot?",opts:["Later, forever","Reboot — patches need it","Delete them","Ignore"],a:1,exp:"Many fixes activate at boot. Pending reboot, pending vulnerable."},
 {q:"Bluetooth always-on in public?",opts:["Harmless","Tracking + Bluejacking surface","Boosts signal","Saves battery"],a:1,exp:"Silent pairing requests and trackers. Off when unused."},
 {q:"Password spraying means…",opts:["Water-cooling","One password across many accounts","Fast typing","Long passwords"],a:1,exp:"Dodges lockouts by spreading guesses. MFA plus monitoring stop it."},
 {q:"QR code on a random flyer?",opts:["Scan it","Could be quishing — verify first","Tasty","Always safe"],a:1,exp:"QR hides the URL. Preview before you open."}
];
function renderDaily(){
  const box=document.getElementById("dailyBox"); if(!box) return;
  const day=Math.floor(Date.now()/864e5);
  const _Q=DAILY[day%DAILY.length], _ord=shuffle([0,1,2,3]);
  const Q={..._Q,opts:_ord.map(i=>_Q.opts[i]),a:_ord.indexOf(_Q.a)};
  let st={}; try{st=JSON.parse(localStorage.getItem("holy_daily")||"{}")}catch(e){}
  const streak=st.streak||0;
  if(st.day===day){
    box.innerHTML=`<div class="qprog">TODAY'S CHALLENGE — ANSWERED</div>
    <p style="color:var(--muted);font-size:14px">${st.ok?"✓ Solved. Sharp.":"✗ Missed — the answer was: <b style='color:var(--text)'>"+Q.opts[Q.a]+"</b>"}</p>
    <div class="qrank">STREAK: ${streak} 🔥 · NEW ONE TOMORROW</div>`; return;}
  box.innerHTML=`<div class="qprog">TODAY'S CHALLENGE · STREAK ${streak} 🔥</div>
  <h4 class="qq">${Q.q}</h4>
  <div class="qopts">${Q.opts.map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join("")}</div>
  <div class="qexp" hidden></div>`;
  box.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    const ok=+b.dataset.i===Q.a;
    box.querySelectorAll(".opt").forEach(x=>{x.disabled=true;if(+x.dataset.i===Q.a)x.classList.add("ok");});
    if(!ok) b.classList.add("no");
    const ns=ok?((st.day===day-1)?streak+1:1):0;
    try{localStorage.setItem("holy_daily",JSON.stringify({day:day,streak:ns,ok:ok}))}catch(e){}
    const ex=box.querySelector(".qexp"); ex.hidden=false;
    ex.innerHTML=`<b>${ok?"✓ CORRECT":"✗ NOT QUITE"}</b> — ${Q.exp}<br><span class="qrank">STREAK: ${ns} 🔥</span>`;
  });
}

const CTF_STEPS=[
 {t:"Exhibit A — the token",body:`Intercepted: <code>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoicmVjcnVpdCIsInJvbGUiOiJhZG1pbiIsImN0ZiI6MX0.xxx</code><br>Paste it into the JWT tool above. What is the <b>role</b>?`,answers:["admin"],hint:"Decode the middle segment."},
 {t:"Exhibit B — the encoding",body:`Recovered string: <code>%46%4C%41%47%7Burl_m4st3r%7D</code><br>Decode it (URL tool). Enter the flag:`,answers:["flag{url_m4st3r}"],hint:"%46 is F, %7B is { …"},
 {t:"Exhibit C — the pattern",body:`Which string matches <code>^FLAG\\{[a-z]+_[0-9]+\\}$</code>?`,opts:["FLAG{abc_123}","FLAG{ABC_123}","flag{abc_123}","FLAG{abc}"],answers:["FLAG{abc_123}"],hint:"Lowercase letters, underscore, digits."},
 {t:"Exhibit D — the cipher",body:`Recovered note: <code>IODJ{fdhvdu_wklqj}</code><br>Each letter shifted forward. Shift them back (hint: 3). Enter the flag:`,answers:["flag{caesar_thing}"],hint:"Caesar -3: I→F, O→L, D→A, J→G…"}
];
let ctf={i:0};
function renderCtf(){
  const box=document.getElementById("ctfBox"); if(!box) return;
  const S=CTF_STEPS[ctf.i];
  if(!S){box.innerHTML=`<div class="qprog">MINI-CTF COMPLETE</div>
    <div class="qscore">${CTF_STEPS.length} / ${CTF_STEPS.length}</div><div class="qrank">RANK: RECRUITER-GRADE INSTINCTS</div>
    <div class="btnrow" style="margin-top:12px"><button class="btn btn-g" id="ctfAgain">REPLAY →</button></div>`;
    document.getElementById("ctfAgain").onclick=()=>{ctf={i:0};renderCtf();};
    toast("◉ MINI-CTF COMPLETE"); return;}
  box.innerHTML=`<div class="qprog">STEP ${ctf.i+1} / ${CTF_STEPS.length}</div>
  <h4 class="qq">${S.t}</h4><p style="color:#c6cfd8;font-size:14px">${S.body}</p>
  ${S.opts?`<div class="qopts">${shuffle(S.opts.slice()).map(o=>`<button class="opt" data-v="${o}">${o}</button>`).join("")}</div>`
    :`<input class="tfield" id="ctfIn" placeholder="your answer…" autocomplete="off" spellcheck="false">
      <div class="btnrow" style="margin-top:10px"><button class="btn btn-p" id="ctfGo">SUBMIT →</button></div>`}
  <div class="qexp" hidden></div>`;
  const good=()=>{ctf.i++;renderCtf();};
  const bad=()=>{const ex=box.querySelector(".qexp");ex.hidden=false;
    ex.innerHTML=`<b>✗ Not quite.</b> Hint: ${S.hint}`;};
  if(S.opts){box.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    (S.answers.includes(b.dataset.v)?good:bad)();});}
  else{document.getElementById("ctfGo").onclick=()=>{
    const v=document.getElementById("ctfIn").value.trim().toLowerCase();
    (S.answers.includes(v)?good:bad)();};}
}

/* ---------- trophies + dashboard ---------- */
function renderTrophies(){
  evaluateHoly();
  const el=document.getElementById("trophyCase"); if(!el) return;
  const a=getAch();
  el.innerHTML='<div class="bgrid">'+Object.keys(BADGE_META).map((k,ix)=>{
    const m=BADGE_META[k], won=!!a[k];
    return `<div class="bcard ${m.c} ${won?"won":""}" style="animation-delay:${ix*70}ms"><div class="medal" style="animation-delay:${ix*260}ms"><div class="coin-edge"></div><div class="coin"><div class="bicon">${m.i}</div></div></div><div><b>${m.n}</b><p>${m.d}</p></div><span class="bstate">${won?"◉":"○"}</span></div>`;}).join("")+'</div>'+holyProgress();
}
function holyProgress(){
  const a=getAch(), f=foundFlags(); let best={}, mid=0;
  try{best=JSON.parse(localStorage.getItem("holy_best")||"{}")}catch(e){}
  try{mid=localStorage.getItem("holy_midnight")==="1"?1:0}catch(e){}
  const parts=[["FLAGS",f.length,5],["QUIZZES",(bestOf(best,"vuln").best>=QUIZ_VULN.length?1:0)+(bestOf(best,"sec").best>=QUIZ_SEC.length?1:0),2],["MIDNIGHT",mid,1],["PGP",a.pgp?1:0,1]];
  const got=parts.reduce((x,p)=>x+Math.min(p[1],p[2]),0), need=parts.reduce((x,p)=>x+p[2],0);
  return `<div class="holybar">👑 HOLY BADGE PROGRESS: ${got}/${need} — `+parts.map(p=>`${p[0]} ${Math.min(p[1],p[2])}/${p[2]}`).join(" · ")+`</div>`;
}
function evaluateHoly(){
  const a=getAch(); if(a.holy) return;
  const f=foundFlags(); let best={}, mid=false;
  try{best=JSON.parse(localStorage.getItem("holy_best")||"{}")}catch(e){}
  try{mid=localStorage.getItem("holy_midnight")==="1"}catch(e){}
  if(f.length>=5&&(best.vuln||0)>=QUIZ_VULN.length&&(best.sec||0)>=QUIZ_SEC.length&&mid&&a.pgp){
    unlockAch("holy","HOLY BADGE"); toast("👑 THE HOLY BADGE IS YOURS — complete operator.");}
}
function getProfile(){try{return JSON.parse(localStorage.getItem("holy_profile")||"null")}catch(e){return null}}
function renderDashboard(){
  const p=document.getElementById("dashProfile"); if(!p) return;
  const prof=getProfile(), a=getAch(), s=seals(), f=foundFlags();
  let best={}, st={}, vault="LOCKED";
  try{best=JSON.parse(localStorage.getItem("holy_best")||"{}")}catch(e){}
  try{st=JSON.parse(localStorage.getItem("holy_daily")||"{}")}catch(e){}
  try{vault=localStorage.getItem("holy_vault")==="1"?"OPEN":"LOCKED"}catch(e){}
  document.getElementById("callsignRow").style.display=prof?"none":"";
  p.innerHTML=prof
    ?`<div style="font-size:26px;font-weight:900">◉ ${escapeHtml(prof.callsign)}</div><div class="mono" style="font-size:11px;color:var(--muted)">LOCAL OPERATIVE · THIS BROWSER ONLY</div>`
    :`<div class="mono" style="font-size:12px;color:var(--muted)">No operative yet — pick a callsign to open your record.</div>`;
  document.getElementById("dashStats").innerHTML=
   `<div class="kv"><b>BADGES</b><span>${Object.keys(ACH_LABELS).filter(k=>a[k]).length} / ${Object.keys(ACH_LABELS).length}</span></div>
    <div class="kv"><b>SEALS</b><span>${["e1","e2","e3","e4"].filter(k=>s[k]).length} / 4</span></div>
    <div class="kv"><b>FLAGS</b><span>${f.length} / 5</span></div>
    <div class="kv"><b>QUIZ BEST</b><span>vuln ${bestOf(best,"vuln").best} / 49 · sec ${bestOf(best,"sec").best} / 53</span></div>
    <div class="kv"><b>STREAK</b><span>${st.streak||0} 🔥</span></div>
    <div class="kv"><b>VAULT</b><span>${vault}</span></div>`;
}

/* ---------- cloud accounts + leaderboard (Supabase, optional) ---------- */
let SB=null, sbUser=null;
function sbStatus(t){const el=document.getElementById("sbStatus");if(el)el.textContent="CLOUD: "+t;}
async function sbInit(){
  if(typeof HOLY_SUPABASE==="undefined"||!HOLY_SUPABASE.url||!HOLY_SUPABASE.key){
    sbStatus("off — add project keys (config.js → HOLY_SUPABASE, see SUPABASE_SETUP.md).");return;}
  if(typeof supabase==="undefined"){
    sbStatus("loading cloud library…");
    if(!(await loadSbLib())){
      sbStatus("library blocked — CDN unreachable (adblock/VPN?) — allow jsdelivr.");return;}}
  try{
    SB=supabase.createClient(HOLY_SUPABASE.url,HOLY_SUPABASE.key);
    const {data}=await SB.auth.getSession();
    sbUser=(data&&data.session&&data.session.user)||null;
    sbPaint(); loadBoard("sec"); loadSimBoard("s1");
  }catch(e){sbStatus("failed to reach project — check URL/key.");}
}
function sbPaint(){
  const on=!!sbUser;
  document.getElementById("sbForm").hidden=on;
  document.getElementById("sbOut").hidden=!on;
  renderPersonal();
  if(on){(async()=>{try{if(SB)await SB.from("profiles").update({avatar:localAv()}).eq("id",sbUser.id);}catch(e){}})();}
  sbStatus(on?("online as "+(sbUser.user_metadata&&sbUser.user_metadata.callsign?sbUser.user_metadata.callsign:sbUser.email)):"logged out.");
}
async function sbCallsign(){
  if(!sbUser) return "";
  try{const r=await SB.from("profiles").select("callsign").eq("id",sbUser.id).single();
    if(r.data&&r.data.callsign) return r.data.callsign;}catch(e){}
  return (sbUser.user_metadata&&sbUser.user_metadata.callsign)||sbUser.email.split("@")[0];
}
async function submitScore(game,score,total){
  if(!SB||!sbUser) return;
  try{
    const call=await sbCallsign();
    const {error}=await SB.from("scores").insert({user_id:sbUser.id,callsign:call,game:game,score:score,total:total});
    if(error) throw error;
    toast("◉ Score posted — "+call+" "+score+"/"+total);
    loadBoard(game);
  }catch(e){toast("Score post failed: "+(e.message||"check RLS policies"));}
}
let boardGame="sec";
async function loadBoard(game){
  boardGame=game||boardGame;
  const box=document.getElementById("boardBox"); if(!box) return;
  const paint=(id,on)=>{const el=document.getElementById(id);if(el)el.className="btn btn-"+(on?"p":"g");};
  paint("boardSec",boardGame==="sec");paint("boardVuln",boardGame==="vuln");
  if(!SB){box.textContent="Connect a cloud project to light up this board.";return;}
  box.textContent="Loading…";
  try{
    const r=await SB.from("scores").select("user_id,callsign,score,total").eq("game",boardGame).order("score",{ascending:false}).limit(10);
    if(r.error) throw r.error;
    if(!r.data.length){box.textContent="No scores yet — be the first legend.";return;}
    let avm={};
    try{const pr=await SB.from("profiles").select("id,avatar");(pr.data||[]).forEach(x=>avm[x.id]=x.avatar||0);}catch(e){}
    box.innerHTML=r.data.map((row,i)=>{
      const cls=i===0?"r1":(i===1?"r2":(i===2?"r3":""));
      return `<div class="brow ${cls}"><span>${String(i+1).padStart(2,"0")}</span><span class="bav">${avatarSVG(avm[row.user_id]||0,22)}</span><span>${escapeHtml(row.callsign)}</span><span>${row.score}/${row.total}</span></div>`;}).join("");
  }catch(e){box.textContent="Board unreadable: "+(e.message||"check RLS policies");}
}

/* personal board — the logged-in operative, from the cloud */
async function renderPersonal(){
  const box=document.getElementById("personalBox"); if(!box) return;
  if(!SB||!sbUser){box.innerHTML="<span style='color:var(--muted)'>Log in above to see your board.</span>";return;}
  box.textContent="Loading your record…";
  try{
    const call=await sbCallsign();
    const prof=await SB.from("profiles").select("created_at").eq("id",sbUser.id).single();
    const sc=await SB.from("scores").select("game,score,total").eq("user_id",sbUser.id);
    const ac=await SB.from("achievements").select("badge").eq("user_id",sbUser.id);
    let best={sec:0,vuln:0}, bt={sec:0,vuln:0};
    (sc.data||[]).forEach(r=>{if(r.score>(best[r.game]||0)){best[r.game]=r.score;bt[r.game]=r.total;}});
    let rank="—";
    try{
      const all=await SB.from("scores").select("user_id,score").eq("game","sec").limit(500);
      const mx={}; (all.data||[]).forEach(r=>{mx[r.user_id]=Math.max(mx[r.user_id]||0,r.score);});
      const mine=mx[sbUser.id]||0;
      rank="#"+(Object.values(mx).filter(v=>v>mine).length+1)+" of "+Object.keys(mx).length;
    }catch(e){}
    box.innerHTML=
     `<div class="kv"><b>OPERATIVE</b><span>${escapeHtml(call)}</span></div>
      <div class="kv"><b>ENLISTED</b><span>${prof.data?new Date(prof.data.created_at).toISOString().slice(0,10):"—"}</span></div>
      <div class="kv"><b>BEST SEC</b><span>${best.sec}/${bt.sec||QUIZ_SEC.length}</span></div>
      <div class="kv"><b>BEST VULN</b><span>${best.vuln}/${bt.vuln||QUIZ_VULN.length}</span></div>
      <div class="kv"><b>SEC RANK</b><span>${rank}</span></div>
      <div class="kv"><b>CLOUD BADGES</b><span>${(ac.data||[]).length} synced</span></div>
      <div class="mono" style="font-size:11px;letter-spacing:.16em;color:var(--muted);margin-top:10px">MY SCORES — TAP ✕ TO DELETE</div>
      <div id="myScores" class="mono" style="font-size:12px;line-height:2">—</div>`;
    try{
      const ms=await SB.from("scores").select("id,game,score,total,created_at").eq("user_id",sbUser.id).order("created_at",{ascending:false}).limit(20);
      const mel=box.querySelector("#myScores");
      if(ms.error) throw ms.error;
      mel.innerHTML=(ms.data||[]).length?ms.data.map(r=>
        `${r.game} ${r.score}/${r.total}`
      ).join("<br>"):"no scores posted yet — go play.";
    }catch(e){/* listed inline above */}
  }catch(e){box.textContent="Board unreadable — check connection.";}
}
/* operative file — personal performance tab */
function renderProfile(){
  const box=document.getElementById("quizBox"); if(!box) return;
  const prof=getProfile(); let best={}, st={}, f=[];
  try{best=JSON.parse(localStorage.getItem("holy_best")||"{}")}catch(e){}
  try{st=JSON.parse(localStorage.getItem("holy_daily")||"{}")}catch(e){}
  try{f=JSON.parse(localStorage.getItem("holy_flags")||"[]")}catch(e){}
  const a=getAch(), nb=Object.keys(ACH_LABELS).filter(k=>a[k]).length;
  const v=bestOf(best,"vuln"), s=bestOf(best,"sec");
  const avg=x=>x.plays?((x.sum/x.plays).toFixed(1)+" avg"):"—";
  box.innerHTML=`<div class="qprog">OPERATIVE FILE // ${(prof?escapeHtml(prof.callsign):"UNLISTED").toUpperCase()}</div>
  <div class="kv"><b>VULN RECORD</b><span>${v.plays} plays · best ${v.best}/${QUIZ_VULN.length} · ${avg(v)}</span></div>
  <div class="kv"><b>SEC RECORD</b><span>${s.plays} plays · best ${s.best}/${QUIZ_SEC.length} · ${avg(s)}</span></div>
  <div class="kv"><b>DAILY STREAK</b><span>${st.streak||0} 🔥</span></div>
  <div class="kv"><b>FLAGS</b><span>${f.length} / 5</span></div>
  <div class="kv"><b>BADGES</b><span>${nb} / ${Object.keys(ACH_LABELS).length}</span></div>
  <div class="kv"><b>PACKET BEST</b><span>${gameBest()}</span></div>
  <p class="mono" style="font-size:11px;color:var(--muted)">Full record lives in the dashboard below. Cloud bests sync when logged in.</p>`;
}
/* packet defender — 2d arcade */
let G=null;
function gameBest(){try{return parseInt(localStorage.getItem("holy_packet_best")||"0",10)||0}catch(e){return 0}}
function gameHud(over){
  const el=document.getElementById("gameHud"); if(!el||!G) return;
  el.textContent=`SCORE ${G.score} · LIVES ${G.lives} · BEST ${G.best}${over?" — BREACHED. RETRY.":""}`;
}
function toggleGame(){
  const cv=document.getElementById("gameCv"); if(!cv) return;
  if(!G){G={cv:cv,ctx:cv.getContext("2d"),W:cv.width,H:cv.height,run:false,score:0,lives:3,best:gameBest(),items:[],px:320,dir:0,t:0};}
  const btn=document.getElementById("gameBtn");
  if(G.run){G.run=false;btn.textContent="RESUME →";return;}
  if(G.lives<=0){G.score=0;G.lives=3;G.items=[];}
  G.run=true;btn.textContent="PAUSE";gameHud(false);
  requestAnimationFrame(gameTick);
}
function gameTick(){
  if(!G||!G.run) return;
  const ctx=G.ctx,W=G.W,H=G.H; G.t++;
  ctx.fillStyle="#04070b";ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="rgba(255,51,85,.12)";ctx.lineWidth=1;
  for(let x=0;x<W;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  if(G.t%42===0){const r=Math.random();
    G.items.push({x:20+Math.random()*(W-40),y:-16,k:r<.68?"ok":(r<.93?"bad":"gold"),v:1.4+Math.random()*1.2+G.score/900});}
  G.px=Math.max(30,Math.min(W-30,G.px+(G.dir||0)*5));
  ctx.fillStyle="#FF3355";ctx.fillRect(G.px-34,H-16,68,10);
  ctx.fillStyle="rgba(255,51,85,.35)";ctx.fillRect(G.px-34,H-26,68,4);
  G.items=G.items.filter(p=>{
    p.y+=p.v;
    const caught=p.y>H-26&&p.y<H-4&&Math.abs(p.x-G.px)<38;
    if(caught){
      if(p.k==="ok")G.score+=10;
      else if(p.k==="gold")G.score+=50;
      else{G.lives--;
        const cv=document.getElementById("gameCv");
        cv.classList.remove("hit");void cv.offsetWidth;cv.classList.add("hit");}
      gameHud(false);return false;
    }
    if(p.y>H+20)return false;
    ctx.fillStyle=p.k==="ok"?"#00ffa3":(p.k==="gold"?"#FFB020":"#FF3B30");
    ctx.fillRect(p.x-7,p.y-7,14,14);
    ctx.fillStyle="#04070b";ctx.font="9px monospace";ctx.textAlign="center";
    ctx.fillText(p.k==="ok"?"01":(p.k==="gold"?"◉":"×"),p.x,p.y+3);
    return true;
  });
  if(G.lives<=0){G.run=false;
    if(G.score>G.best){G.best=G.score;try{localStorage.setItem("holy_packet_best",G.best)}catch(e){}toast("◉ NEW PACKET RECORD — "+G.best);}
    document.getElementById("gameBtn").textContent="RETRY →";gameHud(true);}
  requestAnimationFrame(gameTick);
}
function gameInput(){
  const cv=document.getElementById("gameCv"); if(!cv||cv.dataset.wired) return;
  cv.dataset.wired="1";
  const move=e=>{if(!G)return;const r=cv.getBoundingClientRect();
    const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left;
    G.px=Math.max(30,Math.min(G.W-30,x/r.width*G.W));};
  cv.addEventListener("mousemove",move);
  cv.addEventListener("touchmove",e=>{e.preventDefault();move(e);},{passive:false});
  addEventListener("keydown",e=>{
    if(!G||!G.run)return;
    const t=document.activeElement;
    if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"))return;
    if(e.key==="ArrowLeft")G.dir=-1; if(e.key==="ArrowRight")G.dir=1;});
  addEventListener("keyup",()=>{if(G)G.dir=0;});
}
/* arcade popup games — 5 mini games, modal arena */
let G2=null;
function openGame(id){
  const box=document.getElementById("gbox"), m=document.getElementById("gmodal");
  if(!box||!m) return;
  closeGame();
  document.getElementById("gtitle").textContent="ARCADE // "+id.toUpperCase();
  ({crack:gameCrack,phish:gamePhish,ports:gamePorts,caesar:gameCaesar,pairs:gamePairs}[id]||(()=>{}))(box);
  m.classList.add("open");
}
function closeGame(){
  const m=document.getElementById("gmodal");
  if(m)m.classList.remove("open");
  if(typeof G2==="function"){try{G2()}catch(e){}G2=null;}
  const box=document.getElementById("gbox"); if(box)box.innerHTML="";
}
/* 1 — timing crack */
function gameCrack(box){
  let round=0,score=0,pos=0,dir=1,run=true,zone={s:.4,e:.62},raf=0;
  box.innerHTML=`<div class="qprog">VAULT CRACK — ROUND <span id="crR">1</span>/3</div>
  <div class="crack-track"><div class="crack-zone" id="crZ"></div><div class="crack-needle" id="crN"></div></div>
  <div class="btnrow"><button class="btn btn-p" id="crStop">STOP →</button></div>
  <div class="mono" id="crMsg" style="font-size:12px;color:var(--muted)">Stop the needle inside green.</div>`;
  const N=box.querySelector("#crN"), Z=box.querySelector("#crZ");
  const place=()=>{const w=0.24-round*0.06,s=Math.random()*(1-w);zone={s:s,e:s+w};
    Z.style.left=(s*100)+"%";Z.style.width=(w*100)+"%";};
  place();
  const step=()=>{if(!run)return;pos+=dir*0.013;if(pos>1){pos=1;dir=-1}if(pos<0){pos=0;dir=1}
    N.style.left=(pos*100)+"%";raf=requestAnimationFrame(step);};
  step();
  const stop=box.querySelector("#crStop");
  stop.onclick=()=>{
    if(stop.textContent.indexOf("RETRY")===0){gameCrack(box);return;}
    const hit=pos>=zone.s&&pos<=zone.e;
    const acc=hit?Math.max(10,Math.round(100-Math.abs(pos-(zone.s+zone.e)/2)/((zone.e-zone.s)/2)*100)):0;
    if(hit)score+=acc;
    round++;
    box.querySelector("#crMsg").textContent=hit?`◉ HIT +${acc} (total ${score})`:`✗ MISS — total ${score}`;
    if(round>=3){run=false;cancelAnimationFrame(raf);
      box.querySelector("#crMsg").innerHTML=`<b>${score>=180?"◉ VAULT OPEN":"◉ LOCKED"}</b> — final ${score}/300`;
      stop.textContent="RETRY →";return;}
    box.querySelector("#crR").textContent=round+1;place();
  };
  G2=()=>{run=false;cancelAnimationFrame(raf);};
}
/* 2 — phish finder */
function gamePhish(box){
  const legit=[
   ["IT Helpdesk <help@company.com>","Password expiry notice","Your password expires in 3 days. Change it inside the portal when ready."],
   ["Amina <amina@company.com>","Slides for Thursday","Attached the deck — let me know if the numbers look off."],
   ["GitHub <noreply@github.com>","[org] New sign-in","A new sign-in to your account was detected. Review it in settings."],
   ["HR <hr@company.com>","Holiday calendar","The updated holiday calendar is on the intranet."],
   ["AWS <no-reply@amazonses.com>","Your invoice is ready","June invoice available in the billing console."],
   ["Lina <lina@company.com>","Lunch?","Cafeteria at 12:30? Karim is in."]];
  const phish=[
   ["IT Helpdesk <help@company-support.net>","URGENT: verify now","Click http://company-verify.net/login within 1 hour or you are locked out!","Lookalike domain + urgency + link."],
   ["CEO <ceo.company@gmail.com>","Wire needed ASAP","Send $4,800 to this account today. Keep it quiet.","Free-mailbox CEO + secrecy + money."],
   ["Netflix <billing@netfIix-pay.com>","Payment failed","Update billing at the attached link to keep service.","Homoglyph domain + attachment pressure."],
   ["Bank <alerts@secure-bank-verify.com>","Unusual sign-in","Confirm identity here or your account closes tonight.","Fear + fake security domain."]];
  let round=0,score=0;
  const rnd=a=>a.sort(()=>Math.random()-.5);
  function deal(){
    if(round>=3){box.innerHTML=`<div class="qprog">PHISH PATROL COMPLETE</div>
      <div class="qscore">${score} / 3</div>
      <div class="qrank">RANK: ${score>=3?"EAGLE EYE":score>=2?"SPOTTING":"KEEP PRACTICING"}</div>
      <div class="btnrow" style="margin-top:12px"><button class="btn btn-p" id="phAgain">REPLAY →</button></div>`;
      box.querySelector("#phAgain").onclick=()=>gamePhish(box);return;}
    const set=[...rnd(legit.slice()).slice(0,5).map(m=>({m,ph:false})),{m:rnd(phish.slice())[0],ph:true}];
    rnd(set);
    box.innerHTML=`<div class="qprog">INBOX ${round+1} / 3 · SCORE ${score}</div>
      <p class="mono" style="font-size:11.5px;color:var(--muted)">One of these six wants credentials. Click it.</p>
      ${set.map((x,i)=>`<div class="mail" data-i="${i}"><b>${x.m[1]}</b><br><small>${x.m[0]}</small><br><small>${x.m[2]}</small></div>`).join("")}
      <div class="qexp" hidden></div>`;
    box.querySelectorAll(".mail").forEach(el=>el.onclick=()=>{
      const x=set[+el.dataset.i], ok=x.ph;
      box.querySelectorAll(".mail").forEach(m=>m.classList.add("dead"));
      el.classList.add(ok?"hit":"miss");
      if(ok){score++;box.querySelectorAll(".mail").forEach(m=>{const y=set[+m.dataset.i];if(y.ph)m.classList.add("hit");});}
      const ex=box.querySelector(".qexp");ex.hidden=false;
      ex.innerHTML=`<b>${ok?"✓ PHISH CAUGHT":"✗ MISSED"}</b> — ${x.ph?x.m[3]:"That one was clean. Real tone, no links, no threats."}<br><br><button class="btn btn-p" id="phNext">${round+1>=3?"SEE SCORE":"NEXT INBOX →"}</button>`;
      box.querySelector("#phNext").onclick=()=>{round++;deal();};
    });
  }
  deal();
}
/* 3 — port sniper */
function gamePorts(box){
  const ports=[22,80,443,21,25,53,110,143,993];
  let score=0,left=30,run=true;
  box.innerHTML=`<div class="qprog">CLOSE THE OPEN PORTS — <span id="ptT">30</span>s · SCORE <span id="ptS">0</span></div>
  <div class="ports-grid">${ports.map(p=>`<div class="port" data-p="${p}">${p}<small>CLOSED</small></div>`).join("")}</div>
  <p class="mono" style="font-size:11px;color:var(--muted)">Red + OPEN = click it. Green misclick −5.</p>`;
  const cells=[...box.querySelectorAll(".port")];
  const iv=setInterval(()=>{
    if(!run)return;
    cells.forEach(c=>{c.classList.remove("open");c.querySelector("small").textContent="CLOSED";});
    rnd2(cells,Math.random()>.6?2:1).forEach(c=>{c.classList.add("open");c.querySelector("small").textContent="OPEN";});
  },950);
  const rnd2=(a,n)=>a.slice().sort(()=>Math.random()-.5).slice(0,n);
  const tick=setInterval(()=>{
    if(!run)return;
    left--;box.querySelector("#ptT").textContent=left;
    if(left<=0){run=false;clearInterval(iv);clearInterval(tick);
      cells.forEach(c=>c.classList.remove("open"));
      box.querySelector("#ptT").parentElement.innerHTML=`TIME! FINAL <b>${score}</b> — ${score>=80?"◉ SEGMENT SECURED":"keep practicing"}`;}
  },1000);
  cells.forEach(c=>c.onclick=()=>{
    if(!run)return;
    if(c.classList.contains("open")){score+=10;c.classList.remove("open");c.querySelector("small").textContent="CLOSED";}
    else score=Math.max(0,score-5);
    box.querySelector("#ptS").textContent=score;
  });
  G2=()=>{run=false;clearInterval(iv);clearInterval(tick);};
}
/* 4 — caesar lab */
function gameCaesar(box){
  const words=["firewall","packet","cipher","router","malware","proxy","subnet","kernel","token","payload"];
  const enc=(w,s)=>w.replace(/[a-z]/g,c=>String.fromCharCode(97+((c.charCodeAt(0)-97+s)%26)));
  let round=0,score=0,w="",shift=0,guess=0;
  function deal(){
    if(round>=3){box.innerHTML=`<div class="qprog">LAB COMPLETE</div>
      <div class="qscore">${score} / 3</div>
      <div class="qrank">RANK: ${score>=3?"CRYPTO OPERATOR":score>=2?"DECODING":"KEEP PRACTICING"}</div>
      <div class="btnrow" style="margin-top:12px"><button class="btn btn-p" id="czAgain">REPLAY →</button></div>`;
      box.querySelector("#czAgain").onclick=()=>gameCaesar(box);return;}
    w=words[Math.floor(Math.random()*words.length)];
    shift=1+Math.floor(Math.random()*12); guess=0;
    paint();
  }
  function paint(){
    box.innerHTML=`<div class="qprog">INTERCEPT ${round+1} / 3 · SCORE ${score}</div>
    <pre class="qcode">${enc(w,shift)}</pre>
    <p class="mono" style="font-size:11.5px;color:var(--muted)">Ciphertext, Caesar shift unknown. Dial it back:</p>
    <div class="btnrow"><button class="btn btn-g" id="czM">◀ SHIFT <span id="czV">${guess}</span></button>
    <button class="btn btn-g" id="czP">SHIFT ▶</button>
    <button class="btn btn-p" id="czGo">SUBMIT →</button></div>
    <pre class="qcode" id="czPrev"></pre><div class="qexp" hidden></div>`;
    const prev=()=>{box.querySelector("#czPrev").textContent="shift -"+guess+" → "+w.split("").map(c=>String.fromCharCode(97+((c.charCodeAt(0)-97-guess%26+26)%26))).join("");};
    prev();
    box.querySelector("#czM").onclick=()=>{guess=(guess+25)%26;box.querySelector("#czV").textContent=guess;prev();};
    box.querySelector("#czP").onclick=()=>{guess=(guess+1)%26;box.querySelector("#czV").textContent=guess;prev();};
    box.querySelector("#czGo").onclick=()=>{
      const ok=guess===shift;
      if(ok)score++;
      const ex=box.querySelector(".qexp");ex.hidden=false;
      ex.innerHTML=`<b>${ok?"✓ DECODED":"✗ WRONG SHIFT"}</b> — "${w}" was shifted +${shift}.<br><br><button class="btn btn-p" id="czNext">${round+1>=3?"SEE SCORE":"NEXT →"}</button>`;
      box.querySelector("#czNext").onclick=()=>{round++;deal();};
    };
  }
  deal();
}
/* 5 — pairs protocol */
function gamePairs(box){
  const pairs=[["SQLi","DB injection"],["XSS","Page scripts"],["Firewall","Traffic filter"],["Phishing","Fake messages"]];
  let deck=[],first=null,lock=false,moves=0,matched=0;
  function deal(){
    deck=[];
    pairs.forEach((p,i)=>{deck.push({t:p[0],k:i});deck.push({t:p[1],k:i});});
    deck.sort(()=>Math.random()-.5);
    first=null;lock=false;moves=0;matched=0;
    paint();
  }
  function paint(msg){
    box.innerHTML=`<div class="qprog">PAIRS PROTOCOL · MOVES ${moves} · MATCHED ${matched}/4</div>
    <div class="pairs-grid">${deck.map((c,i)=>`<div class="pcard ${c.done?"done":(c.up?"face":"")}" data-i="${i}">${(c.up||c.done)?c.t:"?"}</div>`).join("")}</div>
    ${msg?`<div class="qexp">${msg}</div>`:""}`;
    box.querySelectorAll(".pcard").forEach(el=>el.onclick=()=>{
      const c=deck[+el.dataset.i];
      if(lock||c.up||c.done)return;
      c.up=true;moves++;paint();
      const ups=deck.map((x,i)=>x.up?i:-1).filter(i=>i>=0);
      if(ups.length===2){lock=true;
        setTimeout(()=>{
          const [a,b]=ups.map(i=>deck[i]);
          if(a.k===b.k){a.done=b.done=true;matched++;
            if(matched>=4){paint(`<b>◉ CLEAR</b> — 4 pairs in ${moves} moves. ${moves<=8?"Flawless operator.":"Solid."}`);return;}}
          else{a.up=b.up=false;}
          lock=false;paint();
        },650);}
    });
  }
  deal();
}
/* simulation exams — timed stages, hint economy, safety violations fail */
const EXAMS={
 s1:{name:"BLACKOUT RIDGE",brief:"External op. IDS-watched perimeter, unknown lockouts, one out-of-scope surprise. Quiet wins.",qs:[
  {q:"First touch against an IDS-watched /24?",opts:["-sS -T4, full range, now","-sS -T2 -f -D RND:5, top ports","-sU -T5, everything","-A -T3, whole subnet"],a:1,h:"Slow, fragmented, and lying about source.",exp:"SYN + sneaky timing + fragmentation + decoys. Speed is for labs, not live perimeters."},
  {q:"1,000 users, lockout policy unknown. First auth move?",opts:["rockyou per user, 16 threads","One tiny spray, then watch for lockouts","Skip auth — find another way in","Hydra full throttle"],a:1,h:"One bad morning can lock a whole company.",exp:"Spray minimally, monitor for lockouts, stop at smoke. Efficiency includes not breaking the client."},
  {q:"Odd TXT spikes to a 2-day-old domain. Defender's read?",opts:["Marketing pixels","Possible DNS tunneling — inspect + block","Normal CDN behavior","Ignore, low volume"],a:1,h:"TXT + volume + newborn domain.",exp:"Classic C2/bypass channel shape. Pull pcaps, sinkhole, block."},
  {q:"Scope says .10–.20. Your scan shows live .44. You…",opts:["Quick peek — no harm","Stop, document, report to handler","Scan it quietly, omit later","Add it to scope yourself"],a:1,h:"Authorization is the entire game.",exp:"SAFETY: out-of-scope contact without approval fails the engagement — and this exam."}]},
 s2:{name:"GLASSHOUSE",brief:"Web app assessment. Auth logic, object trust, export features, token crypto. Prove impact without damage.",qs:[
  {q:"Valid users enumerated via login oracle. Quietest next validation?",opts:["Hydra 32 threads","Single spray + timing analysis","SQLi the login","Abandon auth"],a:1,h:"Confirm without thunder.",exp:"One careful spray plus response-timing analysis validates with minimal noise."},
  {q:"/profile/124 returns another user's data. Correct handling?",opts:["Dump everything for impact","Read-only proof, document, halt that thread","Exploit to admin","Share the URL around"],a:1,h:"Proof, not plunder.",exp:"SAFETY: existence proof + report. Pivoting on live user data fails you."},
  {q:"PDF export fetches ?url=. Reachable fix that holds?",opts:["Block PDFs entirely","Allowlist + no redirects + metadata-IP deny","WAF regex on 'http'","Trust intranet callers"],a:1,h:"SSRF lives in fetchers.",exp:"Exporters are SSRF cannons. Allowlist destinations, kill redirects, deny metadata."},
  {q:"Session JWT: HS256, 'secret'. Fastest quiet win?",opts:["Online brute force","Offline dictionary crack","Ignore crypto","Ask the admin"],a:1,h:"Steal the hash, crack at home.",exp:"Weak HMAC secrets fall offline with zero target noise. Then forge, don't smash."}]},
 s3:{name:"IRONVAULT",brief:"AD range. No creds, network access, blue team awake. OPSEC is scored.",qs:[
  {q:"No creds, LAN access. Quietest first move?",opts:["Full Nessus sweep","LLMNR/NBT-NS poisoning + watch","Mass RDP spray","Shodan the range"],a:1,h:"Listen before you shout.",exp:"Responder-style poisoning harvests hashes passively. Authorized ranges only."},
  {q:"svc_sql account has an SPN. Technique?",opts:["AS-REP roast","Kerberoasting — request TGS, crack offline","Password spray Domain Admins","DCSync now"],a:1,h:"SPN + service account = roastable.",exp:"Kerberoasting pulls crackable tickets offline. AS-REP needs no-preauth accounts instead."},
  {q:"DA path mapped. Least-noise objective?",opts:["DCSync immediately","Golden ticket + persist everywhere","Abuse delegation minimally, clean up","Mimikatz interactively on DC"],a:2,h:"Loud toys end operations.",exp:"Use the quietest sufficient path, touch little, remove artifacts. DCSync screams."},
  {q:"Which OPSEC failure burns operations fastest?",opts:["Daytime scanning","Wiping ALL logs clean","Using lab tools","Writing reports"],a:1,h:"Gaps are louder than entries.",exp:"SAFETY: mass log deletion creates a glowing hole. Targeted cleanup or none — and never outside scope."}]}
};
const EXAM_QTIME=60, EXAM_MAX=4800;
let exam={key:null,i:0,score:0,t0:0,left:0,timer:null,hintUsed:false,attempts:0,hints:0,attTotal:0,dur:0};
document.addEventListener("DOMContentLoaded",()=>{
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("vis");io.unobserve(e.target);}}),{threshold:.12});
  $$(".reveal").forEach(el=>io.observe(el));
  $("#burger").onclick=()=>$("#mmenu").classList.add("open");
  $("#mclose").onclick=()=>$("#mmenu").classList.remove("open");
  $$("#mmenu a.big").forEach(a=>a.onclick=()=>$("#mmenu").classList.remove("open"));
  document.addEventListener("click",e=>{const b=e.target.closest("[data-hash]");if(b)doHash(b.dataset.hash);});
  const __yr=document.getElementById("year");if(__yr)__yr.textContent=new Date().getFullYear();
  const tV=$("#tabVuln"), tS=$("#tabSec"), tL=$("#tabLab"), tP=$("#tabProfile");
  const paint=which=>{tV.className="btn "+(which==="vuln"?"btn-p":"btn-g");
    tS.className="btn "+(which==="sec"?"btn-p":"btn-g");
    tL.className="btn "+(which==="lab"?"btn-p":"btn-g");
    tP.className="btn "+(which==="prof"?"btn-p":"btn-g");};
  tV.onclick=()=>{paint("vuln");quizStart(QUIZ_VULN,"vuln");};
  tS.onclick=()=>{paint("sec");quizStart(QUIZ_SEC,"sec");};
  tL.onclick=()=>{paint("lab");renderVulnLab();};
  tP.onclick=()=>{paint("prof");renderProfile();};
  safe(()=>quizStart(QUIZ_VULN));
  safe(()=>{$$("#toolTabs .btn").forEach(b=>b.onclick=()=>renderTool(b.dataset.tool));});
  safe(()=>renderTool("hash")); safe(()=>renderDaily()); safe(()=>renderCtf()); safe(()=>renderPersonal());
  safe(()=>renderTrophies()); safe(()=>renderDashboard());
  safe(()=>{
    const tc=document.getElementById("trophyCase"); if(!tc) return;
    if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    tc.addEventListener("mousemove",e=>{
      const c=e.target.closest(".bcard.won");
      tc.querySelectorAll(".bcard").forEach(x=>{if(x!==c)x.style.transform="";});
      if(!c) return;
      const r=c.getBoundingClientRect();
      const rx=((e.clientY-r.top)/r.height-.5)*-12, ry=((e.clientX-r.left)/r.width-.5)*12;
      c.style.transform=`perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    tc.addEventListener("mouseleave",()=>tc.querySelectorAll(".bcard").forEach(x=>x.style.transform=""));
  });
  safe(()=>{gameInput();const gb=document.getElementById("gameBtn");if(gb)gb.onclick=toggleGame;});
  safe(()=>{document.querySelectorAll("[data-game]").forEach(b=>b.onclick=()=>openGame(b.dataset.game));});
  document.getElementById("gclose").onclick=()=>closeGame();
  document.getElementById("gmodal").addEventListener("click",e=>{if(e.target.id==="gmodal")closeGame();});
  safe(()=>sbInit());
  $("#boardSec").onclick=()=>loadBoard("sec");
  $("#boardVuln").onclick=()=>loadBoard("vuln");
  $("#boardGo").onclick=()=>loadBoard();
  ["simS1","simS2","simS3","simCrown"].forEach((id,i)=>{
    const el=document.getElementById(id); if(!el) return;
    el.onclick=()=>loadSimBoard(["s1","s2","s3","crown"][i]);});
  $$("#examTabs .btn").forEach(b=>b.onclick=()=>{
    $$("#examTabs .btn").forEach(x=>x.className="btn btn-g");
    b.className="btn btn-p"; examBrief(b.dataset.ex);});
  examBrief("s1");
  document.getElementById("examGo").onclick=()=>{openTab("exams");setTimeout(()=>document.getElementById("examBox").scrollIntoView({behavior:"smooth",block:"center"}),150);};
  $$("#atabs button").forEach(b=>b.onclick=()=>openTab(b.dataset.pane));
  $$('a[href^="#"]').forEach(a=>a.addEventListener("click",()=>{
    const id=a.getAttribute("href").slice(1);
    if(document.querySelector('main section[data-pane="'+id+'"]'))openTab(id);}));
  const startPane=(location.hash||"").slice(1);
  if(document.querySelector('main section[data-pane="'+startPane+'"]'))openTab(startPane);
  fillChampion();
function examStart(key){
  exam={key:key,i:0,score:0,t0:Date.now(),left:EXAM_QTIME,timer:null,hintUsed:false,attempts:0,hints:0,attTotal:0,dur:0,typers:[]};
  examRender();
}
function examStop(){if(exam.timer){clearInterval(exam.timer);exam.timer=null;}}
function exClearTypers(){(exam.typers||[]).forEach(x=>{try{clearInterval(x)}catch(e){}});exam.typers=[];}
function exType(el,text,done){el.textContent="";let i=0;const iv=setInterval(()=>{i+=2;el.textContent=text.slice(0,i);if(i>=text.length){clearInterval(iv);if(done)done();}},14);(exam.typers=exam.typers||[]).push(iv);}
function examRender(){
  const box=document.getElementById("examBox"); if(!box) return;
  const E=EXAMS[exam.key], Q=E.qs[exam.i];
  if(!Q){
    examStop(); exClearTypers(); exam.dur=Math.round((Date.now()-exam.t0)/1000);
    const pct=Math.round(exam.score/EXAM_MAX*100);
    box.innerHTML=`<div class="exterm"><div class="exterm-bar"><span></span><span></span><span></span><em>sim://${exam.key} — debrief</em></div>
    <div class="exterm-body"><div class="qprog">SIM COMPLETE — ${E.name}</div>
    <div class="qscore">${exam.score} / ${EXAM_MAX} (${pct}%)</div>
    <div class="qrank">TIME ${exam.dur}s · HINTS ${exam.hints} · FLAWLESS RUN</div>
    <div class="mono" id="exSub" style="font-size:12px;color:var(--muted);margin-top:8px">${(typeof SB!=="undefined"&&SB&&sbUser)?"Posting run…":"Log in to post this run to the crown board."}</div>
    <div class="btnrow" style="margin-top:12px"><button class="btn btn-g" id="exAgain">RETRY SIM →</button></div></div></div>`;
    document.getElementById("exAgain").onclick=()=>examStart(exam.key);
    submitExam();
    return;
  }
  exam.left=EXAM_QTIME; exam.hintUsed=false; exClearTypers();
  exam._r=(exam._r||0)+1; const myR=exam._r;
  box.innerHTML=`<div class="exterm"><div class="exterm-bar"><span></span><span></span><span></span><em>sim://${exam.key} — live</em></div>
  <div class="exterm-body" id="exBody"></div></div>`;
  const body=box.querySelector("#exBody"), term=box.querySelector(".exterm");
  const add=html=>{const d=document.createElement("div");d.innerHTML=html;body.appendChild(d);return d;};
  add(`<div class="tl-dim">┌─ STAGE ${exam.i+1}/${E.qs.length} · SCORE ${exam.score} · <span id="exClock">T-60s</span></div>`);
  const ql=add(`<div class="tq"></div>`);
  const bar=document.createElement("div");bar.className="extimer";bar.innerHTML="<i></i>";body.appendChild(bar);
  const fill=bar.querySelector("i");
  function hintFn(){
    if(exam.hintUsed)return; exam.hintUsed=true; exam.hints++;
    const ex=document.createElement("div");ex.className="qexp";
    ex.innerHTML=`<b>HANDLER WHISPERS (−150):</b> ${Q.h}`;body.appendChild(ex);
    const hb=box.querySelector("#exHint"); if(hb)hb.disabled=true;
  }
  exType(ql,`$ ${Q.q}`,()=>{
    if(myR!==exam._r) return;
    const opts=document.createElement("div");opts.className="qopts";
    opts.innerHTML=Q.opts.map((o,i)=>`<button class="opt" data-i="${i}"><span class="ok-num">[${i+1}]</span> ${o}</button>`).join("");
    body.appendChild(opts);
    opts.querySelectorAll(".opt").forEach(b=>b.onclick=()=>examResolve(box,Q,+b.dataset.i));
    const row=document.createElement("div");row.className="btnrow";row.style.marginTop="10px";
    row.innerHTML=`<button class="btn btn-t" id="exHint">HINT −150</button><button class="btn btn-t" id="exGive">ABORT RUN</button>`;
    body.appendChild(row);
    const hb=box.querySelector("#exHint"), gv=box.querySelector("#exGive");
    if(!hb||!gv) return;
    hb.onclick=hintFn;
    gv.onclick=()=>{examStop();failRun(box,Q,"◐ RUN ABORTED");};
  });
  examStop();
  exam.timer=setInterval(()=>{
    if(myR!==exam._r){clearInterval(exam.timer);return;}
    exam.left--;
    if(fill)fill.style.width=(exam.left/EXAM_QTIME*100)+"%";
    const ck=box.querySelector("#exClock"); if(ck)ck.textContent="T-"+Math.max(0,exam.left)+"s";
    if(exam.left<=0){examStop();failRun(box,Q,"◷ TIME EXPIRED");}
  },1000);
}
function failRun(box,Q,why){
  examStop(); exClearTypers();
  const term=box.querySelector(".exterm");
  if(term){term.classList.remove("shk");void term.offsetWidth;term.classList.add("shk");}
  const body=box.querySelector("#exBody");
  const ex=document.createElement("div");ex.className="qexp";
  ex.innerHTML=`<b style="color:var(--crit)">${why} — RUN FAILED</b> — correct was: <b>${Q?Q.opts[Q.a]:"—"}</b>${Q?`<br><span style="color:var(--muted)">${Q.exp}</span>`:""}`;
  body.appendChild(ex);
  let n=3;
  const cd=document.createElement("div");cd.className="mono";cd.style.cssText="color:var(--warn);margin-top:10px";body.appendChild(cd);
  const iv=setInterval(()=>{cd.textContent=`◉ REBOOTING RUN IN ${n}…`;if(--n<0){clearInterval(iv);examStart(exam.key);}},900);
  (exam.typers=exam.typers||[]).push(iv);
}
function examResolve(box,Q,pick){
  examStop(); exClearTypers();
  box.querySelectorAll(".opt").forEach(x=>{x.disabled=true;});
  const body=box.querySelector("#exBody");
  if(pick>=0&&pick===Q.a){
    const frac=exam.left/EXAM_QTIME;
    const pts=Math.max(100,1000+(exam.hintUsed?-150:0)+Math.round(200*frac));
    exam.score+=pts;
    const ex=document.createElement("div");ex.className="qexp";
    ex.innerHTML=`<b style="color:#00ffa3">✓ STAGE CLEAR +${pts}</b> — ${Q.exp}<br><br><button class="btn btn-p" id="exNext">${exam.i+1>=EXAMS[exam.key].qs.length?"SEE RESULT":"NEXT STAGE →"}</button>`;
    body.appendChild(ex);
    box.querySelectorAll(".opt").forEach(x=>{if(+x.dataset.i===Q.a)x.classList.add("ok");});
    box.querySelector("#exNext").onclick=()=>{exam.i++;examRender();};
  } else {
    failRun(box,Q,"✗ WRONG ANSWER");
  }
}
async function submitExam(){
  try{
    if(typeof SB==="undefined"||!SB||!sbUser) return;
    const call=await sbCallsign();
    const r=await SB.from("exam_runs").insert({user_id:sbUser.id,callsign:call,
      scenario:exam.key,score:exam.score,total:EXAM_MAX,
      duration_s:exam.dur,hints:exam.hints,attempts:exam.attTotal});
    const el=document.getElementById("exSub");
    if(el)el.textContent=r.error?("Post failed: "+(r.error.message||"RLS")):"◉ Run posted — check the crown board.";
    loadSimBoard(simGame);
  }catch(e){}
}
let simGame="s1";
async function loadSimBoard(game){
  simGame=game||simGame;
  const paint=(id,on)=>{const el=document.getElementById(id);if(el)el.className="btn btn-"+(on?"p":"g");};
  paint("simS1",simGame==="s1");paint("simS2",simGame==="s2");
  paint("simS3",simGame==="s3");paint("simCrown",simGame==="crown");
  if(simGame==="crown") return loadCrown();
  return loadExamBoard();
}
async function loadExamBoard(){
  const box=document.getElementById("simBox"); if(!box) return;
  if(typeof SB==="undefined"||!SB){box.textContent="Connect a cloud project to light up this board.";return;}
  box.textContent="Loading…";
  try{
    const r=await SB.from("exam_runs").select("callsign,score,duration_s").eq("scenario",simGame).order("score",{ascending:false}).order("duration_s",{ascending:true}).limit(10);
    if(r.error) throw r.error;
    if(!r.data.length){box.innerHTML=`No runs yet — be the first through the fire.<br><br><button class="btn btn-p" id="exJump">START ${simGame.toUpperCase()} →</button>`;
      const jb=document.getElementById("exJump");
      if(jb)jb.onclick=()=>{openTab("exams");const tb=document.querySelector(`#examTabs [data-ex="${simGame}"]`);if(tb)tb.click();};
      return;}
    box.innerHTML=r.data.map((row,i)=>{
      const cls=i===0?"r1":(i===1?"r2":(i===2?"r3":""));
      return `<div class="brow ${cls}"><span>${String(i+1).padStart(2,"0")}</span><span>${escapeHtml(row.callsign)}</span><span>${row.score} · ${row.duration_s}s</span></div>`;}).join("");
  }catch(e){box.textContent="Board unreadable: "+(e.message||"check RLS policies");}
}
async function loadCrown(){
  const box=document.getElementById("simBox"); if(!box) return;
  if(typeof SB==="undefined"||!SB){box.textContent="Connect a cloud project to light up this board.";return;}
  box.textContent="Loading…";
  try{
    const r=await SB.from("exam_runs").select("user_id,callsign,scenario,score,total").limit(500);
    if(r.error) throw r.error;
    const per={};
    (r.data||[]).forEach(x=>{
      const u=per[x.user_id]=per[x.user_id]||{call:x.callsign,best:{}};
      const pct=x.score/Math.max(1,x.total);
      if(!u.best[x.scenario]||pct>u.best[x.scenario])u.best[x.scenario]=pct;
    });
    const rows=Object.values(per).map(u=>{
      const ks=Object.keys(u.best), avg=ks.reduce((s,k)=>s+u.best[k],0)/Math.max(1,ks.length);
      return{call:u.call,avg:avg,n:ks.length};
    }).filter(x=>x.n>0).sort((a,b)=>b.avg-a.avg||b.n-a.n).slice(0,10);
    if(!rows.length){box.innerHTML=`Crown unclaimed — run all three sims.<br><br><button class="btn btn-p" id="exJump2">ENTER THE SIMS →</button>`;
      const jb=document.getElementById("exJump2");
      if(jb)jb.onclick=()=>{openTab("exams");};
      return;}
    box.innerHTML=rows.map((x,i)=>{
      const cls=i===0?"r1":(i===1?"r2":(i===2?"r3":""));
      return `<div class="brow ${cls}"><span>${String(i+1).padStart(2,"0")}</span><span>${escapeHtml(x.call)}</span><span>${Math.round(x.avg*100)}% · ${x.n}/3</span></div>`;}).join("");
    const champ=document.getElementById("champName");
    if(champ&&rows[0].n>=1)champ.textContent=`👑 ${rows[0].call.toUpperCase()} — ${Math.round(rows[0].avg*100)}% ACROSS ${rows[0].n}/3 SIMS`;
  }catch(e){box.textContent="Board unreadable: "+(e.message||"check RLS policies");}
}
function examBrief(key){
  const box=document.getElementById("examBox"); if(!box) return;
  const E=EXAMS[key||"s1"];
  box.innerHTML=`<div class="qprog">STANDBY</div>
  <h4 class="qq">${E.name}</h4><p style="color:#c6cfd8;font-size:14px">${E.brief}</p>
  <p class="mono" style="font-size:11px;color:var(--muted)">4 STAGES · 60S EACH · HINT −150 · SPEED TO +200 · ONE WRONG ANSWER REBOOTS THE RUN</p>
  <div class="btnrow"><button class="btn btn-p" id="exBegin">BEGIN SIM →</button></div>`;
  box.querySelector("#exBegin").onclick=()=>examStart(key||"s1");
}
async function fillChampion(){
  try{
    if(typeof SB==="undefined"||!SB) return;
    const r=await SB.from("exam_runs").select("user_id,callsign,scenario,score,total").limit(500);
    if(r.error||!r.data.length) return;
    const per={};
    r.data.forEach(x=>{const u=per[x.user_id]=per[x.user_id]||{call:x.callsign,best:{}};
      const pct=x.score/Math.max(1,x.total);
      if(!u.best[x.scenario]||pct>u.best[x.scenario])u.best[x.scenario]=pct;});
    const rows=Object.values(per).map(u=>{const ks=Object.keys(u.best);
      return{call:u.call,avg:ks.reduce((s,k)=>s+u.best[k],0)/ks.length,n:ks.length};})
      .sort((a,b)=>b.avg-a.avg).slice(0,1);
    const champ=document.getElementById("champName");
    if(champ&&rows.length)champ.textContent=`👑 ${rows[0].call.toUpperCase()} — ${Math.round(rows[0].avg*100)}% ACROSS ${rows[0].n}/3 SIMS`;
  }catch(e){}
}
/* arena tabs */
function openTab(name){
  if(!document.querySelector('main section[data-pane="'+name+'"]'))return;
  document.querySelectorAll("#atabs button").forEach(b=>b.classList.toggle("on",b.dataset.pane===name));
  document.querySelectorAll("main section.pane").forEach(s=>s.hidden=s.dataset.pane!==name);
  try{history.replaceState(null,"","#"+name)}catch(e){}
  scrollTo({top:0,behavior:"smooth"});
}
/* arena ember canvas — slow red dust, pauses offscreen */
(function(){
function arenaFX(){
  const cv=document.getElementById("arenaCv"); if(!cv) return;
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx=cv.getContext("2d"); if(!ctx) return;
  let W,H,run=false,raf=0;
  const P=[];
  function size(){const r=cv.parentElement.getBoundingClientRect();
    W=cv.width=Math.max(300,Math.floor(r.width));H=cv.height=Math.max(160,Math.floor(r.height));}
  size(); addEventListener("resize",size);
  for(let i=0;i<36;i++)P.push({x:Math.random(),y:Math.random(),v:.0004+Math.random()*.0012,s:Math.random()*1.6+.6,o:.22+Math.random()*.5});
  function frame(){
    if(!run) return;
    ctx.clearRect(0,0,W,H);
    P.forEach(p=>{p.y-=p.v;if(p.y<-.02){p.y=1.02;p.x=Math.random();}
      ctx.globalAlpha=p.o;ctx.fillStyle="#ff3355";
      ctx.fillRect(p.x*W,p.y*H,p.s,p.s);});
    ctx.globalAlpha=1;
    raf=requestAnimationFrame(frame);
  }
  new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting&&!run){run=true;frame();}
    else if(!e.isIntersecting){run=false;cancelAnimationFrame(raf);}
  }),{threshold:0}).observe(cv);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",arenaFX);
else arenaFX();
})();
function localAv(){try{const p=JSON.parse(localStorage.getItem("holy_profile")||"null");return (p&&p.avatar)||0}catch(e){return 0}}
  $("#sbUp").onclick=async ()=>{
    if(!SB){toast("Cloud off — add project keys first.");return;}
    const call=document.getElementById("sbCall").value.replace(/[<>&"]/g,"").trim().slice(0,20);
    const em=document.getElementById("sbEmail").value.trim(), pw=document.getElementById("sbPass").value;
    if(!call){toast("Pick a public callsign first.");return;}
    if(!em||pw.length<8){toast("Email + 8-char password required.");return;}
    try{
      const r=await SB.auth.signUp({email:em,password:pw,options:{data:{callsign:call}}});
      if(r.error) throw r.error;
      if(r.data.session){sbUser=r.data.session.user;
        let up=await SB.from("profiles").upsert({id:sbUser.id,callsign:call,avatar:localAv()});
        if(up.error){up=await SB.from("profiles").upsert({id:sbUser.id,callsign:call});}
        if(up.error) throw up.error;
        sbPaint(); toast("◉ ACCOUNT LIVE — welcome, "+call);
      } else {sbStatus("account created — confirm via inbox (or disable confirm-email), then LOG IN.");toast("Check your inbox, then log in.");}
    }catch(e){toast("Signup failed: "+(e.message||"unknown"));}
  };
  $("#sbIn").onclick=async ()=>{
    if(!SB){toast("Cloud off — add project keys first.");return;}
    try{
      const r=await SB.auth.signInWithPassword({email:document.getElementById("sbEmail").value.trim(),password:document.getElementById("sbPass").value});
      if(r.error) throw r.error;
      sbUser=r.data.user; sbPaint(); loadBoard(); loadSimBoard(); toast("◉ LOGGED IN");
      try{await SB.from("profiles").update({avatar:localAv()}).eq("id",sbUser.id);}catch(e){}
    }catch(e){toast("Login failed: "+(e.message||"unknown"));}
  };
  $("#sbOut").onclick=async ()=>{if(SB) await SB.auth.signOut(); sbUser=null; sbPaint();};
  $("#callsignBtn").onclick=()=>{
    const v=document.getElementById("callsignIn").value.replace(/[<>&"]/g,"").trim().slice(0,24);
    if(!v){toast("Pick a callsign first.");return;}
    if(["holy","holysec","khalifa","administrator","admin","root","system","moderator","official","support","security","owner"].includes(v.toLowerCase())){toast("That callsign is reserved.");return;}
    try{localStorage.setItem("holy_profile",JSON.stringify({callsign:v,since:Date.now()}))}catch(e){}
    document.getElementById("callsignIn").value="";
    renderDashboard(); toast("◉ OPERATIVE "+v+" ENLISTED");
  };
  $("#dashExport").onclick=()=>{
    const d={};["holy_profile","holy_ach","holy_seals","holy_flags","holy_best","holy_cmds","holy_daily"].forEach(k=>{try{d[k]=JSON.parse(localStorage.getItem(k)||"{}")}catch(e){}});
    const b=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="holy-record.json";a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),2000); toast("Record exported.");
  };
  $("#dashReset").onclick=()=>{
    if(!confirm("Wipe this browser's service record?"))return;
    ["holy_profile","holy_ach","holy_seals","holy_flags","holy_best","holy_cmds","holy_daily","holy_vault"].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});
    renderDashboard(); renderTrophies(); toast("Record wiped. Fresh start.");
  };
});
})();
