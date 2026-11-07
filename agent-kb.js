/* HOLY // Orb Agent knowledge base — local retrieval, no network, no third parties.
 *
 * Ground rules:
 *   - Facts about this site and Khalifa are grounded in config.js / page content.
 *     Nothing is invented; unpublished personal details are refused honestly.
 *   - Cybersecurity entries are standard, accurate, defensive-leaning educational
 *     material — authorized-testing framing throughout.
 *   - The flag hunt is described, never spoiled (values live in the site source).
 *
 * API:  HOLY_KB.ask(query) -> { entry } | null
 *       HOLY_KB.fallback() -> string
 */
var HOLY_KB = (function () {
  "use strict";

  var STOP = new Set([
    "a","an","the","is","are","was","were","be","been","being","am","do","does","did",
    "what","which","who","whom","whose","how","why","when","where","can","could","will",
    "would","should","shall","may","might","must","i","me","my","mine","we","our","ours",
    "you","your","yours","he","she","they","them","their","it","its","this","that","these",
    "those","of","in","on","at","to","for","with","from","by","as","into","onto","over",
    "under","about","than","then","so","if","or","and","not","no","yes","just","any","some",
    "more","most","also","very","too","up","out","off","all","each","every","both","many",
    "much","own","same","such","only","other","another","before","after","during","without",
    "within","there","here","please","tell","give","show","explain","make","get","has","have",
    "had","been","am","let","us","something","anything","thing","things","one","two","well",
    "now","still","even","back","way","lot","bit","go","going","went","come","take","want",
    "need","know","think","say","said","say","does","done","did","really","actually","maybe",
    "between","vs","am","does"
  ]);

  function norm(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9+#]+/g, " ").replace(/\s+/g, " ").trim();
  }
  function stem(t) {
    if (t.length > 4 && t.endsWith("ies")) return t.slice(0, -3) + "y";
    if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss") && !t.endsWith("us")) return t.slice(0, -1);
    return t;
  }
  function tokens(s) {
    return norm(s).split(" ").filter(function (t) { return t && !STOP.has(t); });
  }

  var ENTRIES = [

  /* ══════════════════════════ SMALL TALK ══════════════════════════ */
  { id:"greeting", cat:"site", title:"Greeting",
    keys:["hello","hi","hey","greetings"],
    answer:"Hello. I'm the orb agent — I answer questions about this site, about Khalifa (working as HOLY), and about cybersecurity. What would you like to know?" },

  { id:"thanks", cat:"site", title:"Thanks",
    keys:["thanks","thank you","appreciate"],
    answer:"Any time. Ask me anything else — I'm local, so I never get tired and never phone home." },

  { id:"agent-help", cat:"site", title:"What can you do",
    keys:["help","capabilities","commands","features"],
    match:["what can you do","what do you do","how do you work","how does this work","introduce yourself"],
    answer:"I run entirely in your browser — a local knowledge base, zero network calls. Try asking:\n• \"what certifications do you have\"\n• \"what internships did you do\"\n• \"what is XSS\"\n• \"how do I get into cybersecurity\"\n• \"what's in the vault\"\n• \"what does the terminal do\"" },

  /* ══════════════════════════ THE SITE ══════════════════════════ */
  { id:"site-overview", cat:"site", title:"What this site is",
    keys:["site","website","portfolio","homepage","about this site","holy"],
    gen:["web"],
    answer:"This is HOLY — Khalifa's personal cybersecurity portfolio, built around an offensive-security focus: penetration testing, network defense, web application security, red teaming and research.\nMain areas: About, Credentials, Experience, Arsenal, Operations, Lab, Field Notes, Research, Terminal and Contact — plus the Arena (playground.html), Courses (coming soon), the Vault flag hunt, and this Orb page.",
    link:{ label:"OPEN HOME →", href:"index.html" } },

  { id:"pages", cat:"site", title:"Pages and navigation",
    keys:["pages","navigation","menu","sections","links","where can i find"],
    answer:"Pages on this site:\n• index.html — home: about, credentials, experience, arsenal, operations, SOC, lab, field notes, research, terminal, contact\n• playground.html — the Arena: quiz, toolkit, daily challenge, mini-CTF, exams, dashboard\n• courses.html — study tracks (coming soon)\n• vault.html — flag-gated room\n• orb.html — this page (Liquid Glass Orb)\n• disclosure.html / privacy.html / credits.html — policies" },

  { id:"terminal", cat:"site", title:"The terminal",
    keys:["terminal","command","commands","shell","whoami","prompt","cli"],
    answer:"The terminal on the home page is fully simulated — it never executes real shell commands. Real commands you can try: help, whoami, about, skills, certs, experience, projects, arsenal, status, contact, seals, achievements, flag and clear. It has history (↑↓) and Tab autocomplete.",
    link:{ label:"OPEN TERMINAL →", href:"index.html#terminal" } },

  { id:"vault-flags", cat:"site", title:"Vault and flag hunt",
    keys:["vault","flag","flags","hunt","easter egg","easter eggs","treasure","proof"],
    answer:"vault.html opens only with proof: five flags sleep across this site (source files included — HTML, JS, config, 404). Submit one in the vault, or in the terminal with: flag FLAG{...}. The first flag opens the vault room. I won't spoil the values — hunting is the point.\nThere are other secrets too: the footer hints at an 8+2 code from 1986, a triple knock, and a konami sequence.",
    link:{ label:"OPEN VAULT →", href:"vault.html" } },

  { id:"arena", cat:"site", title:"Arena / playground",
    keys:["arena","playground","quiz","quizzes","toolkit","challenge","challenges","minictf","mini-ctf","dashboard","exams","simulation exams","games","practice"],
    answer:"playground.html is the training ground: a security quiz, spot-the-vuln, browser-local toolkit utilities (password checker, hash tools, etc.), a daily challenge, a mini-CTF, timed simulation exams, achievements, and a service record dashboard that lives in this browser only. Accounts and the leaderboard are optional (Supabase); everything else works offline.",
    link:{ label:"OPEN ARENA →", href:"playground.html" } },

  { id:"courses", cat:"site", title:"Courses page",
    keys:["courses","course","tracks","study","learning material","classes","lessons"],
    answer:"courses.html is honest-by-design: COMING SOON. The planned tracks are Network+ Field Notes, Security+ Study Track, eJPT Lab Journal and Web Hacking Playbook — each will publish only when it genuinely exists. Nothing is listed as launched before it's real.",
    link:{ label:"OPEN COURSES →", href:"courses.html" } },

  { id:"labs", cat:"site", title:"The labs",
    keys:["lab","labs","experiments","home lab","practical"],
    answer:"Six lab cards on the home page, all authorized/educational:\n1. Home Network Defense — router hardening, segmentation, monitoring\n2. Web Application Security — Burp, auth/session/access-control flaws on local vulnerable apps\n3. Network Recon — Nmap/Wireshark playbooks on owned subnets\n4. Active Directory — isolated forest, attack paths paired with detections\n5. Red Team Lab — adversary lifecycle concepts, OPSEC, detections\n6. HOLSERA — his own secure-escrow concept project (design stage)",
    link:{ label:"OPEN THE LAB →", href:"index.html#lab" } },

  { id:"writeups", cat:"site", title:"Field notes / write-ups",
    keys:["notes","writeups","write-ups","articles","blog","published","field notes"],
    answer:"Three published field notes: \"Segmenting My Home Network\" (network defense), \"My First Burp Suite Workflow\" (web security), and \"Nmap Scans I Actually Reuse\" (reconnaissance). The section only lists PUBLISHED notes as published — more are marked SOON until they exist.",
    link:{ label:"FIELD NOTES →", href:"index.html#notes" } },

  { id:"credentials-page", cat:"site", title:"Credentials section",
    keys:["credentials","roadmap","cert grid","statuses"],
    answer:"The Credentials section renders the certification roadmap from config.js → HOLY_CERTS with honest statuses (VERIFIED / IN PROGRESS / SOON / PLANNED). No certificate numbers, scores, dates or badges appear until they're real. Edit statuses in config.js.",
    link:{ label:"CREDENTIALS →", href:"index.html#credentials" } },

  { id:"experience-page", cat:"site", title:"Experience section",
    keys:["industry exposure","timeline"],
    answer:"Every experience entry renders from config.js → HOLY_EXPERIENCE with strict typing (INTERNSHIP · TRAINING · PROGRAM · …) and status badges. Nothing claims employment unless its type and status say so. Recommendations (HOLY_QUOTES) stay empty until a real supervisor permits a quote." },

  { id:"research-board", cat:"site", title:"Research board",
    keys:["research","exploring","research board","living board"],
    answer:"A living research board with stages LEARNING · DEEP DIVE · EXPERIMENT · DOCUMENTED. Current topics: web app security, network pentesting, red team ops, active directory, Linux security, vulnerability research, secure architecture, cloud security, detection engineering, digital forensics.",
    link:{ label:"RESEARCH →", href:"index.html#research" } },

  { id:"contact", cat:"site", title:"Contact",
    keys:["contact","email","reach","get in touch","hire","talk","message","pgp","fingerprint"],
    answer:"Ways to reach Khalifa:\n• Contact form on the home page (name + email used only to reply — never stored, never a list)\n• Email: HVoid9@proton.me (also the PGP identity)\n• GitHub: github.com/theholykhalifa\n• PGP fingerprint: 689B D5F7 560E A3E6 B246 EE16 588B 7097 6549 7307 — always verify before trusting the key.\nStatus: OPEN TO OPPORTUNITIES — research, projects, authorized labs, discussion.",
    link:{ label:"CONTACT →", href:"index.html#contact" } },

  { id:"privacy", cat:"site", title:"Privacy",
    keys:["privacy","cookies","cookie","tracking","track me","analytics","gdpr","data","storage","personal data","spy"],
    gen:["site"],
    answer:"privacy.html has the full policy. Short version: no cookies, no analytics, no tracking, no ads. Storage is browser-local only (localStorage/sessionStorage — your profile, quiz progress, preferences). Fonts are served by the site itself. Optional cloud accounts, the scoreboard and the consent-gated visit counter use Supabase. Data deletion: a wipe button in your profile for everything in this browser, plus a prefilled email request for cloud rows.",
    link:{ label:"PRIVACY POLICY →", href:"privacy.html" } },

  { id:"disclosure", cat:"site", title:"Responsible disclosure",
    keys:["disclosure","report a bug","vulnerability","vulnerabilities","bug","security issue","responsible","safe harbor","cve"],
    answer:"disclosure.html is the responsible disclosure policy for this site: what's in scope, how to report privately, ground rules (no mass scanning, no data access, good faith), and what he commits to — acknowledgment, no legal action for good-faith reports, and credit if wanted. Found something? Report it privately first.",
    link:{ label:"DISCLOSURE POLICY →", href:"disclosure.html" } },

  { id:"credits", cat:"site", title:"Credits and licenses",
    keys:["credits","license","licences","attribution","fonts","open source","oss","who made"],
    answer:"credits.html lists everything: images (logo, operator portrait, avatar) are self-made by the owner; fonts Inter and JetBrains Mono are SIL OFL and self-hosted first-party from this site (no third-party font request); software includes supabase-js (Apache 2.0), the Liquid Glass Orb renderer (ReactDrops Component License 1.0, license retained in source), and psrdnoise2 GLSL (MIT). Content is his own.",
    link:{ label:"CREDITS →", href:"credits.html" } },

  { id:"resume", cat:"site", title:"Security profile / resume",
    keys:["resume","cv","security profile","download","profile pdf","curriculum"],
    answer:"\"⤓ DOWNLOAD SECURITY PROFILE\" (hero or terminal section) opens his digital resume — generated live from config.js: certifications, experience, arsenal, research. Because it renders from config, it can never drift from what the site claims.",
    link:{ label:"OPEN HOME →", href:"index.html" } },

  { id:"palette", cat:"site", title:"Command palette",
    keys:["palette","shortcut","keyboard","ctrl","cmd","command k","hotkey"],
    answer:"Press ⌘/Ctrl + K anywhere on the home page to open the command palette — type a section or action (about, lab, terminal…) and hit Enter, arrow keys to navigate, Esc to close. It's the operator-style way around the site." },

  { id:"recruiter", cat:"site", title:"Recruiter view",
    keys:["recruiter","recruiter view","hr view","clean view"],
    answer:"The ◉ RECRUITER VIEW button (hero) strips the theatrical HUD down to a plain, printable view of the facts — for people who just want the resume without the terminal fantasy. EXIT RECRUITER VIEW brings the theatrics back." },

  { id:"language", cat:"site", title:"Arabic toggle",
    keys:["arabic","language","translate","عربي","english","bilingual"],
    answer:"The عربي button in the navigation switches the interface chrome (nav, headings, buttons) to Arabic. Technical body copy stays English by design — that's how security work is written." },

  { id:"admin", cat:"site", title:"Admin page",
    keys:["admin","administrator","login","dashboard admin"],
    answer:"admin.html exists as a local demo gate (client-side hash check) that unlocks demo data in one browser. It's honestly labeled: any client-side gate is bypassable — real access control needs a backend. It guards nothing real." },

  { id:"simulations", cat:"site", title:"Simulations",
    keys:["simulation","simulations","simulated","fake","real time","real-time","telemetry","soc","radar","live data"],
    answer:"The telemetry panel, threat radar, SOC dashboard, ticker metrics and event logs are labeled SIMULATION — fictional UI for interface demonstration, never live security operations. Every simulated number on this site carries the label." },

  { id:"maintenance", cat:"site", title:"Maintenance mode",
    keys:["maintenance","under construction","offline","down"],
    gen:["site"],
    answer:"Maintenance mode exists in config.js (HOLY_MAINTENANCE) but is currently off — the site is fully up. When on, it parks everything behind an under-construction screen (bypassable with ?live=1 by design, since it's a display state, not security)." },

  { id:"orb-page", cat:"site", title:"This orb page",
    keys:["orb","liquid glass","glass orb","this page","webgl","shader","reactdrops","avatar orb","sphere"],
    answer:"This page renders the Liquid Glass Orb — a WebGL fluid-glass renderer (shaders, presets and defaults vendored from the ReactDrops component under its license). It's the agent interface: idle shows organic glass distortion; thinking runs concentric ripples; speaking follows your voice envelope. 250px, circular, reduced-motion aware. You're talking to it right now." },

  { id:"accounts", cat:"site", title:"Accounts and leaderboard",
    keys:["account","signup","sign up","login","leaderboard","scores","cloud","supabase"],
    answer:"Accounts are optional: the Arena lets you sign up (email + password) to sync progress and appear on the scoreboard via Supabase. The site works fully without one — profile, quiz and dashboard data stay in this browser. The published anon key is designed to be public; row-level security governs what it can touch." },

  /* ══════════════════════════ KHALIFA / HOLY ══════════════════════════ */
  { id:"who-is-holy", cat:"about", title:"Who is Khalifa / HOLY",
    keys:["khalifa","holy","who","yourself","your name","operator","identity","bio","about you"],
    match:["who are you","who is khalifa","tell me about yourself"],
    gen:["name"],
    answer:"My name is Khalifa; I do security work under the name HOLY. Cybersecurity specialist in the making — drawn to the uncomfortable questions: how does this break, who can get in, and how do we stop them?\nPath: networking foundations (CCNA) → security fundamentals (Security+) → practical pentesting (eJPT, PNPT) → IT/Security internships at Hassan Allam, Microsoft, Kaspersky and Huawei → now pushing toward red-team operations (CRTO) and advanced web exploitation (OSWE).\nHow I work: curiosity first, discipline always — authorized targets only, every test documented, every finding paired with a fix. I don't collect tools; I build judgment." },

  { id:"location", cat:"about", title:"Location",
    keys:["location","based","live","lives","city","country","cairo","egypt"],
    match:["where are you from","where do you live","which country","what city"],
    answer:"Cairo, Egypt (from config.js → HOLY_PROFILE.location). Everything on this site is remote-friendly — labs run in owned/controlled environments." },

  { id:"slogan", cat:"about", title:"Slogan and mindset",
    keys:["slogan","motto","tagline","mantra","mindset","philosophy","principles","ethics"],
    answer:"Slogan: THINK LIKE AN ATTACKER. BUILD LIKE A DEFENDER.\nHero statement: \"I don't just use systems. I learn how they fail.\"\nPrinciples: curiosity · discipline · continuous learning · practical labs · responsible testing · documentation. Operating modes: LEARN · BUILD · TEST · DOCUMENT. Mantras on the site: ASSUME NOTHING, VERIFY EVERYTHING, REDUCE THE ATTACK SURFACE, LEAST PRIVILEGE, LOG EVERYTHING, DOCUMENT EVERYTHING, SECURITY IS A PROCESS." },

  { id:"availability", cat:"about", title:"Availability",
    keys:["available","availability","hiring","hire","job","jobs","opportunity","opportunities","open to","internship offer","recruiter"],
    answer:"Status: OPEN TO OPPORTUNITIES. Open to: Junior SOC Roles · Pentest Internships · Security Projects. The contact section responds to: research · projects · authorized labs · discussion. Best contact: the form on the home page or HVoid9@proton.me.",
    link:{ label:"CONTACT →", href:"index.html#contact" } },

  { id:"certs", cat:"about", title:"Certifications",
    keys:["certifications","certificates","certs","certified","ccna","security+","security plus","ejpt","e-jpt","pnpt","ceh","crto","oswe","exams","badge"],
    answer:"Verified: CCNA (networking foundation) · CompTIA Security+ (defensive baseline) · eJPT (first hands-on offensive milestone) · PNPT (network pentest + reporting rigor) · CEH (breadth across ethical-hacking domains).\nIn progress: OSWE (advanced web exploitation — source-code review).\nPlanned/soon: CRTO (red-team operations, adversary simulation with OPSEC discipline).\nHonest rule: no numbers, scores or dates shown until they're real." },

  { id:"internships", cat:"about", title:"Internships and experience",
    keys:["internship","internships","intern","experience","companies","worked","employment","hassan allam","microsoft","kaspersky","huawei","jobs held"],
    match:["tell me about your internships","your internships","my internships"],
    answer:"Four completed internships (details on request, per the site's honest-by-design rule):\n• HASSAN ALLAM — IT/Security Intern, 3 months\n• MICROSOFT — Technology Intern, 1 month\n• KASPERSKY — IT/Security Intern, 4 months\n• HUAWEI — IT/Security Intern, 2 months\nPlus ongoing independent training in an owned home lab (Kali, Nmap, Wireshark, Burp, Bash, Python). Journey: 2019 self-learning start → 2024 first two internships → 2025 two more + five certs → 2026 advanced offensive security." },

  { id:"journey", cat:"about", title:"Journey since 2019",
    keys:["journey","history","timeline","since 2019","years","story","progress","how did you start","background"],
    answer:"Seven years from curious self-learner to certified professional:\n2019 — the beginning: YouTube and self-learning into computer security\n2020–2023 — foundations: sustained independent study, networking and security\n2024 — corporate experience: Hassan Allam (3mo) + Microsoft (1mo)\n2025 — professional development: Kaspersky (4mo), Huawei (2mo), and five earned certs (CCNA, Security+, eJPT, PNPT, CEH)\n2026 — advanced offensive security: OSWE prep, red-team skills, portfolio presence" },

  { id:"skills", cat:"about", title:"Skills / arsenal",
    keys:["skills","arsenal","tools","proficient","what can you do technically","stack","technologies","Programming"],
    answer:"Skill matrix with honest proficiency labels (EXPLORING → ADVANCED), no mastery claims:\n• Recon: Nmap (practicing), Amass/Subfinder (learning), DNS enumeration\n• Web: Burp Suite (practicing), OWASP, auth/session/access-control (learning)\n• Network: Wireshark (practicing), TCP/IP/DNS/DHCP (working knowledge), segmentation\n• Linux: Kali (practicing), Bash, permissions, SSH\n• Windows/AD: PowerShell, AD (learning), Kerberos (exploring)\n• Programming: Python/Bash (practicing), JS (learning)\n• Red teaming & defensive: C2 concepts, OPSEC, hardening, logging, monitoring" },

  { id:"goals", cat:"about", title:"Current goals",
    keys:["goals","next","aiming","plans","future","currently working","2026","crto","oswe"],
    answer:"2026 focus (from the journey): OSWE preparation (web security + source-code auditing), red-team skill development toward CRTO, and presenting the work — this portfolio is part of that. Research board is where the live topics sit: web app security (deep dive), network pentesting (experiment), AD/red team/detection/forensics (learning)." },

  { id:"socials", cat:"about", title:"Social links",
    keys:["github","linkedin","social","profiles","links","twitter","x account"],
    answer:"GitHub: github.com/theholykhalifa (linked in the footer). LinkedIn: linked from the footer (placeholder URL in config.js → HOLY_SOCIALS). Email: HVoid9@proton.me. Everything editable lives in config.js → HOLY_SOCIALS." },

  { id:"personal-private", cat:"about", title:"Unpublished personal details",
    keys:["age","birthday","born","salary","pay","phone","address","school","university","degree","education","girlfriend","family","photos"],
    match:["how old are you","where did you study","what is your education"],
    answer:"The site publishes only: name (Khalifa, working as HOLY), city (Cairo, Egypt), focus, certifications, internships, research and contact channels. Personal details like age, salary or formal education aren't published — and I won't invent them. What IS documented: a self-directed journey since 2019, certifications, and real internships." },

  { id:"interests", cat:"about", title:"Interests",
    keys:["interests","hobbies","likes","passion","specialization","focus","offensive security"],
    answer:"Focus: Cybersecurity. Specialization: Offensive Security. Interests: Pentesting · Red Teaming · Web Security · Network Security. Current modes: LEARN · BUILD · TEST · DOCUMENT. Current-mode interests also include Active Directory, recon, privesc, hardening and research (see the tags on the About card)." },

  /* ══════════════════════════ CYBERSECURITY ══════════════════════════ */
  { id:"cyber-basics", cat:"cyber", title:"What cybersecurity is",
    keys:["cybersecurity","cyber security","information security","infosec","security field","what is security"],
    gen:["security"],
    answer:"Cybersecurity is protecting systems, networks and data from unauthorized access, misuse, destruction or disruption. The classic goals are the CIA triad — confidentiality, integrity, availability — plus accountability and non-repudiation. It spans prevention, detection, response and recovery, and it's a process, not a product: assume nothing, verify everything." },

  { id:"cia", cat:"cyber", title:"CIA triad",
    keys:["cia","cia triad","confidentiality","integrity","availability","triad"],
    answer:"The CIA triad is the foundation model of information security:\n• Confidentiality — only authorized people/processes see the data (encryption, access control)\n• Integrity — data stays accurate and untampered (hashing, versioning, logging)\n• Availability — systems are up when needed (redundancy, patching, DDoS defense)\nMost security decisions boil down to balancing these three — you can't max them all out at once." },

  { id:"pentesting", cat:"cyber", title:"Penetration testing",
    keys:["pentest","penetration testing","pen testing","ethical hacking","hack","hacking","pentester","security test"],
    answer:"Penetration testing is authorized, scoped testing that finds and proves real weaknesses before attackers do. The site's methodology: reconnaissance → enumeration → attack-surface mapping → vulnerability analysis → validation → (authorized) exploitation → privilege-escalation analysis → post-exploitation → documentation → remediation. Golden rules: written authorization first, least-intrusive proof, stop at proof of existence, every finding paired with a fix." },

  { id:"redteam", cat:"cyber", title:"Red team vs pentest",
    keys:["red team","redteam","adversary simulation","purple team","blue team","red vs","difference between red"],
    answer:"A pentest is a scoped vulnerability check with a report; a red team is an objective-based adversary simulation — months of OPSEC, C2, initial access, lateral movement and goal achievement (e.g., reach a domain controller), measured against detections. Blue team defends, purple team both. Red-teaming without authorization is just crime; the CRTO path (which Khalifa is pursuing) trains exactly this discipline." },

  { id:"owasp", cat:"cyber", title:"OWASP Top 10",
    keys:["owasp","top 10","top10","web vulnerabilities","web flaws","vulnerability list"],
    answer:"OWASP Top 10 (2021) — the standard awareness doc for web risks:\nA01 Broken Access Control · A02 Cryptographic Failures · A03 Injection · A04 Insecure Design · A05 Security Misconfiguration · A06 Vulnerable Components · A07 Auth Failures · A08 Data Integrity Failures · A09 Logging Failures · A10 SSRF.\nDefensive shape of each: deny-by-default access, strong crypto, parameterized queries, threat modeling, hardened configs, patching, MFA, signed data, monitoring, and validating server-side requests." },

  { id:"xss", cat:"cyber", title:"Cross-site scripting (XSS)",
    keys:["xss","cross site scripting","cross-site scripting","reflected","stored xss","dom xss","script injection"],
    answer:"XSS is injecting attacker-controlled script into pages other users run: reflected (payload in the request), stored (payload saved server-side), DOM-based (client-side sink). Impact: session theft, keylogging, defacement, malware delivery. Defense: context-aware output encoding, Content-Security-Policy, HttpOnly cookies, sanitizing rich input, and templating that auto-escapes. Read the request — the app tells you how it fails." },

  { id:"sqli", cat:"cyber", title:"SQL injection",
    keys:["sql injection","sqli","sql","injection","database injection","union select"],
    answer:"SQLi happens when user input is concatenated into SQL queries, letting an attacker alter logic — dump data, bypass auth, or (with the right setup) reach the OS. Classic types: union-based, boolean/time-based blind, error-based. The fix is boring and total: parameterized queries / prepared statements, least-privilege DB accounts, input validation as defense-in-depth. OR1=1 is the hello-world; real work is in blind and logic-level variants." },

  { id:"csrf", cat:"cyber", title:"CSRF",
    keys:["csrf","cross site request forgery","cross-site request forgery","forgery","state changing"],
    answer:"CSRF tricks a logged-in victim's browser into sending an unwanted request (change email, transfer money) because cookies ride along automatically. Defense: anti-CSRF tokens tied to the session, SameSite cookie attribute, verifying Origin/Stateless, and requiring re-auth for sensitive actions. It targets state-changing endpoints — GET requests that mutate data are an open invitation." },

  { id:"ssrf", cat:"cyber", title:"SSRF",
    keys:["ssrf","server side request forgery","server-side request forgery","internal requests","cloud metadata"],
    answer:"SSRF makes the server issue requests on the attacker's behalf — reaching internal services (localhost admin panels, cloud metadata endpoints like 169.254.169.254) that were never meant to be public. Defense: allowlists for outbound destinations, block link-local/metadata ranges, no user-supplied URLs where possible, egress monitoring. It's A10 in the OWASP Top 10 for good reason — cloud-era blast radius." },

  { id:"authn-authz", cat:"cyber", title:"Authentication vs authorization",
    keys:["authentication","authorization","authn","authz","identity","login security","who are you vs what can you"],
    answer:"Authentication (authn) answers \"who are you?\" — passwords, MFA, passkeys, Kerberos tickets. Authorization (authz) answers \"what may you do?\" — roles, ACLs, deny-by-default, least privilege. Confusing them is the root of most access-control bugs: proving identity ≠ granting access. Test both separately — broken object-level authorization (BOLA) is the #1 API risk." },

  { id:"sessions", cat:"cyber", title:"Session management",
    keys:["session","sessions","session hijacking","session fixation","jwt","tokens","cookies security"],
    answer:"Sessions keep you logged in between requests. Hardening: long random session IDs, regenerate on privilege change, HttpOnly + Secure + SameSite cookies, short lifetimes with refresh, server-side revocation. Attacks: fixation (set the ID pre-login), hijacking (XSS theft, network sniffing), JWT none-algorithm and weak-secret tricks. A logout button without server-side invalidation is theater." },

  { id:"crypto-basics", cat:"cyber", title:"Hashing vs encryption",
    keys:["hashing","hash","encryption","encrypt","decrypt","difference between hashing","sha","md5","bcrypt"],
    answer:"Encryption is two-way (scramble with a key, unscramble with a key) — confidentiality. Hashing is one-way (fixed-size fingerprint) — integrity and password storage. You decrypt encryption; you never decrypt a hash — you compare or crack it. Passwords: use slow hashes (bcrypt/scrypt/Argon2), never MD5/SHA for storage. Data at rest: encrypt. Tamper evidence: hash." },

  { id:"sym-vs-asym", cat:"cyber", title:"Symmetric vs asymmetric crypto",
    keys:["symmetric","asymmetric","aes","rsa","public key","private key","key exchange","pki"],
    answer:"Symmetric (AES, ChaCha20): one shared key — fast, used for bulk data; problem is distributing the key. Asymmetric (RSA, ECC): public/private pair — solves key exchange and signatures, but slow. Real systems combine them: asymmetric to handshake (TLS), symmetric for the session. Digital signatures use the private key to sign, anyone verifies with the public key." },

  { id:"tls", cat:"cyber", title:"TLS / HTTPS",
    keys:["tls","https","ssl","certificate","certificates","padlock","handshake","pki"],
    answer:"TLS gives channels confidentiality, integrity and server authentication. Handshake: negotiate cipher suites → server proves identity with a certificate chain signed by a CA → derive session keys (ECDHE for forward secrecy) → symmetric traffic. What the padlock actually means: you're talking to whoever holds that cert — phishing sites have valid certs too. Always verify the fingerprint for high-value contacts (like the PGP key on this site)." },

  { id:"mfa", cat:"cyber", title:"MFA",
    keys:["mfa","2fa","two factor","multifactor","multi factor","authenticator","totp","passkey","passkeys"],
    answer:"MFA requires two or more of: something you know (password), have (phone/token/key), are (biometrics). Strongest → weakest: FIDO2/passkeys and hardware keys (phishing-resistant) > app-based TOTP > push approvals > SMS (SIM-swap risk). SMS beats nothing, but a password alone in 2026 is a wish. Critical accounts: never reuse the password AND never rely on SMS alone." },

  { id:"passwords", cat:"cyber", title:"Password security",
    keys:["password","passwords","passphrase","credential","credentials","password manager","breach","cracking passwords"],
    answer:"Rules that actually matter: length beats complexity (14+ char passphrases), unique per site (one breach ≠ total compromise), stored in a password manager (so uniqueness is possible), changed on evidence of compromise not on a calendar. Never reuse the password you used for the forum on your email. Offline hashes get cracked with GPU rigs — slow hashing + length + MFA is the counter." },

  { id:"phishing", cat:"cyber", title:"Phishing",
    keys:["phishing","spear phishing","smishing","vishing","scam","social engineering","fake email","baiting"],
    answer:"Phishing is manipulation into handing over credentials or running malware — mass email (phishing), targeted (spear phishing, often using OSINT from public profiles), SMS (smishing), calls (vishing). Spot it: urgency, mismatched domains, unexpected attachments, requests to bypass process. Defenses: MFA (blocks most credential reuse), password managers (won't autofill on lookalike domains), reporting culture, and domain/brand monitoring." },

  { id:"malware", cat:"cyber", title:"Malware types",
    keys:["malware","virus","worm","trojan","trojan horse","spyware","adware","rootkit","botnet","keylogger"],
    answer:"• Virus — attaches to files, needs a host action to spread\n• Worm — self-propagates across networks (no user needed)\n• Trojan — disguises as legit software (the human is the vulnerability)\n• Spyware/keylogger — covert data theft\n• Rootkit — hides in the OS/kernel\n• Botnet — recruited fleet for DDoS/spam\nCommon gates: phishing attachments, cracked software, drive-by downloads. Containment: isolate, image, rotate credentials, review logs — and patch so the gate closes." },

  { id:"ransomware", cat:"cyber", title:"Ransomware",
    keys:["ransomware","ransom","encryption attack","locky","double extortion","backup attack"],
    answer:"Ransomware encrypts your data and often exfiltrates it (double extortion). Response: isolate immediately, preserve evidence, identify the strain, restore from known-good backups, rotate credentials. Prevention: the 3-2-1 backup rule (3 copies, 2 media, 1 offsite/immutable), patching edge services, MFA on VPN/RDP, EDR, least privilege. Paying is no guarantee — and funds future attacks. Detection speed is the real currency: hours of dwell time vs days." },

  { id:"firewall", cat:"cyber", title:"Firewalls",
    keys:["firewall","firewalls","iptables","acl","packet filtering","waf","next gen"],
    answer:"A firewall enforces rules on traffic flow. Generations: packet filtering (IP/port), stateful (tracks connections), application-layer/WAF (inspects HTTP semantics), NGFW (IPS + identity + TLS inspection). Positioning matters — perimeter rules, segmentation rules, egress rules (catching C2 beacons). Default-deny, explicit allow; a firewall with 'any' rules is documentation, not defense." },

  { id:"ids-ips", cat:"cyber", title:"IDS / IPS / SIEM / EDR",
    keys:["ids","ips","intrusion","siem","edr","detection","monitoring","alerts","soc","snort","suricata"],
    answer:"IDS = detects and alerts (out-of-band, passive). IPS = inline and can block. SIEM = aggregates logs across everything, correlates, and surfaces incidents (the SOC's nervous system — rule quality determines value). EDR = endpoint eyes: process trees, behavioral detection, containment actions. Chain them: visibility → correlation → response. Logging everything means nothing if nobody watches the right rules." },

  { id:"vpn", cat:"cyber", title:"VPNs",
    keys:["vpn","vpns","tunnel","openvpn","wireguard","remote access","encrypt traffic"],
    answer:"A VPN creates an encrypted tunnel between you and a gateway — hiding traffic from local eavesdroppers and presenting the gateway's IP to the internet. Corporate VPNs + ZTNA give remote access without exposing services directly. What it does NOT do: make you anonymous, fix malware, or encrypt traffic past the exit node. Free VPNs often monetize your traffic — trust math applies." },

  { id:"dns", cat:"cyber", title:"DNS",
    keys:["dns","domain","domains","nameserver","records","resolution","dnssec","subdomain"],
    answer:"DNS resolves names to IPs (A/AAAA), routes mail (MX), defines policy (TXT/SPF/DKIM/DMARC), and aliases (CNAME). It's the internet's phone book — and attackers love it: spoofing, cache poisoning, tunneling (data exfil over DNS), subdomain takeovers. Hardening: DNSSEC for authenticity, registry lock, monitoring certificate transparency, and stripping unnecessary record exposure. Enumerating a target's DNS is step one of recon." },

  { id:"ports", cat:"cyber", title:"Common ports",
    keys:["port","ports","port numbers","22","80","443","445","3389","3306","8080"],
    answer:"Common ports worth knowing:\n22 SSH · 53 DNS · 80 HTTP · 110/143 mail (POP3/IMAP) · 443 HTTPS · 445 SMB · 3306 MySQL · 3389 RDP · 5432 PostgreSQL · 8080 HTTP-alt.\nSecurity notes: 445 and 3389 are internet-malware favorites (EternalBlue, brute-forced RDP) — never expose them raw. 22 is fine with keys + fail2ban. Knowing what SHOULD be listening is how you spot what shouldn't." },

  { id:"networking-basics", cat:"cyber", title:"Networking basics",
    keys:["tcp","ip","udp","subnet","subnetting","osi","tcpip","handshake","packet","packets","routing","networking"],
    answer:"Core model: TCP/IP — link → IP (addressing/routing) → TCP/UDP (transport) → application. TCP is connection-oriented (3-way handshake: SYN → SYN-ACK → ACK, then ordered reliable streams); UDP is fire-and-forget (fast, no guarantees). Subnetting carves an address space into broadcast domains — smaller segments mean smaller blast radius. OSI's 7 layers exist so people can argue about which one is broken." },

  { id:"http", cat:"cyber", title:"HTTP / web fundamentals",
    keys:["http","https","requests","headers","get","post","rest","web basics","status codes","cookies"],
    match:["how does http","what is http","explain http"],
    answer:"HTTP: request (method + path + headers + body) → response (status + headers + body). Methods: GET read, POST create, PUT/PATCH update, DELETE. Status: 2xx ok, 3xx redirect, 4xx client fault (401 auth, 403 forbidden, 404 missing), 5xx server broke. Security lives in headers: CSP, HSTS, SameSite cookies, frame-ancestors. Everything a web pentest does starts with reading requests line by line — Burp exists for that." },

  { id:"burp", cat:"cyber", title:"Burp Suite",
    keys:["burp","burp suite","proxy","intercept","repeater","intruder","web proxy","http proxy"],
    answer:"Burp Suite is the web tester's workbench: proxy intercepts browser traffic, Repeater replays hand-edited requests, Intruder automates payloads, Decoder handles encodings, Logger keeps receipts. Workflow: map the site passively → intercept interesting requests → read the logic → test manually before any automation → document evidence. Khalifa's own note: mapping, intercepting and actually READING requests against local vulnerable apps comes before any scanner." },

  { id:"nmap", cat:"cyber", title:"Nmap",
    keys:["nmap","port scan","scanning","service detection","host discovery","masscan"],
    answer:"Nmap maps networks: host discovery (-sn), port scan (-sS/-sT), service/version detection (-sV), OS guess (-O), scripts (-sC, NSE). Discipline beats noise: scan only authorized scope, tune timing (-T2/-T3 in shared environments), save output (-oA) for documentation. What it gives you: what's alive, what ports answer, what versions run — the service map everything downstream depends on." },

  { id:"wireshark", cat:"cyber", title:"Wireshark / packet analysis",
    keys:["wireshark","packet capture","pcap","packet analysis","tcpdump","sniffing","capture"],
    answer:"Wireshark captures and dissects packets — follow TCP streams, filter with display filters (tcp.port==443, http.request.method==POST), spot anomalies (retransmits, cleartext creds, beaconing). Defender side: pcaps are evidence — baseline normal traffic, then the odd DNS query or beacon stands out. Capture only on networks you own or have written permission for; promiscuous mode on someone else's LAN is not research." },

  { id:"kali", cat:"cyber", title:"Kali Linux",
    keys:["kali","kali linux","distro","toolbox","parrot"],
    answer:"Kali is a Debian-based distro packed with preinstalled security tools (Nmap, Burp, Metasploit, John, Hashcat…). It's a laboratory toolbox — use it on owned or explicitly authorized targets. Best practice: keep it updated, run it in a VM/segmented lab, and remember the tools are dumb — the methodology (recon → validate → document) is the actual skill." },

  { id:"linux-sec", cat:"cyber", title:"Linux security",
    keys:["linux","permissions","chmod","sudo","suid","ubuntu","unix","shell security"],
    answer:"Linux security essentials: permissions (user/group/other, rwx, sticky bit), least-privilege sudo, secure SSH (keys, no root login), minimal services, patching, and audit logs. Common privesc vectors: SUID binaries, writable scripts run by root, sudo misconfigurations, exposed credentials in history/files. From a defender's view: every one of those is a hardening checklist item — and Khalifa's lab practice is exactly that loop: break it, harden it, document it." },

  { id:"windows-ad", cat:"cyber", title:"Windows / Active Directory",
    keys:["active directory","ad","windows","domain","domain controller","gpo","ldap","kerberos","ntlm","powershell"],
    answer:"Active Directory is the identity backbone of enterprise Windows: domain controllers authenticate users (Kerberos tickets), GPOs enforce policy, groups grant access. Attack surface comes from trust: over-privileged accounts, delegation flaws, stale service accounts, weak ACLs. Defenders' counters: tiered admin model, LAPS, MFA everywhere, protected users group, centralized auth logging. \"Identity is the perimeter\" — Khalifa's AD lab pairs every attack path with its detection." },

  { id:"privesc", cat:"cyber", title:"Privilege escalation",
    keys:["privesc","privilege escalation","escalate","root","administrator","suid","sudo misconfig","token impersonation"],
    answer:"Moving from low-privilege to high-privilege access. Linux: SUID binaries, sudo misconfigs, writable service scripts, kernel exploits, exposed credentials. Windows: unquoted service paths, weak service ACLs, always-install-elevated, token impersonation, stored credentials. The defensive mirror is one list: patch, least privilege, remove SUID oddities, lock down service ACLs, log process creation. In authorized tests, escalation is documented as a PATH with evidence — never left behind." },

  { id:"recon", cat:"cyber", title:"Reconnaissance",
    keys:["recon","reconnaissance","enumeration","passive","active","footprinting","subdomain enumeration","information gathering"],
    answer:"Recon builds the target picture from authorized sources. Passive (no direct contact): WHOIS, DNS records, certificate transparency, subdomain enumeration (Amass, Subfinder), theHarvester, code repos. Active (in scope): host discovery, port scans, service banners. Quality downstream = quality here — a complete asset inventory plus confirmed scope. Reduce your own footprint too: every cert, repo and profile you publish is someone's recon." },

  { id:"vuln-scanning", cat:"cyber", title:"Vulnerability scanning vs pentesting",
    keys:["vulnerability scan","vulnerability scanning","nessus","qualys","scanner","automated scan","false positives"],
    match:["vulnerability scanning vs","scanning vs pentest","scanner vs pentest"],
    answer:"A scanner matches known signatures/configs at scale — broad, fast, noisy with false positives. A pentest validates reachability and impact manually — narrow, deep, with evidence. Scanners feed the pentest's hypothesis list; a pentest explains WHICH findings actually matter. Never equate a scan with a test: 'the scanner said 47 highs' is the start of analysis, not the report." },

  { id:"incident-response", cat:"cyber", title:"Incident response",
    keys:["incident","incident response","ir","breach response","containment","eradication","recovery","playbook"],
    answer:"IR lifecycle: Preparation → Detection & Analysis → Containment → Eradication → Recovery → Lessons Learned. First hour rules: preserve evidence (don't rebuild yet), isolate (network segments, not just unplug if volatile data matters), establish timeline, rotate credentials of compromised identities, and communicate through pre-agreed channels. Every incident should produce detection improvements — that's the 'security is a process' loop in practice." },

  { id:"forensics", cat:"cyber", title:"Digital forensics",
    keys:["forensics","digital forensics","evidence","chain of custody","memory forensics","timeline analysis","imaging"],
    answer:"Forensics recovers and proves what happened: disk/memory imaging (write blockers, hash verification), artifact analysis (event logs, prefetch, browser history, registry), and timeline reconstruction — all under chain of custody so evidence survives scrutiny. Order matters: capture volatile data first (RAM, network state), then disk. Khalifa's research board lists it as LEARNING — evidence handling and timeline thinking." },

  { id:"zero-trust", cat:"cyber", title:"Zero trust",
    keys:["zero trust","never trust always verify","microsegmentation","least privilege","zero-trust"],
    answer:"Zero trust: never trust by location, verify every request explicitly. Principles: verify identity & device, least-privilege access, assume breach, microsegment laterally, inspect/encrypt traffic. It kills the old 'castle-and-moat' model where being on the LAN meant trusted. Implementation is gradual: MFA → device posture → per-app access → segmentation. It's architecture and culture, not a product you buy." },

  { id:"hardening", cat:"cyber", title:"Hardening / attack surface",
    keys:["hardening","attack surface","baselines","cis benchmarks","patching","patches","updates","misconfiguration","secure defaults"],
    answer:"Hardening shrinks what can go wrong: inventory first (you can't secure what you can't see), patch cadence, disable unused services/ports, change defaults, apply CIS-style baselines, close management ports to the internet, and verify with re-scans. Attack surface = everything reachable by an attacker; every component you remove is a component that can't be exploited. Khalifa's home-lab rule: defense starts with inventory." },

  { id:"logging", cat:"cyber", title:"Logging and monitoring",
    keys:["logging","logs","log management","audit","monitoring","event logs","syslog","centralized logging"],
    answer:"Log what matters: authentication events, privilege changes, process creation, network connections, config changes — centrally collected, time-synced, protected from tampering. 'Log everything' only works if logs are searchable and watched (SIEM rules, alerting). Retention beats heroics: you can't reconstruct an incident from logs that rotated out three days ago. And logging is only as good as its coverage — silence is not the same as safety." },

  { id:"api-security", cat:"cyber", title:"API security",
    keys:["api","apis","rest api","graphql","bola","api security","rate limiting","api top 10"],
    answer:"APIs shift the attack surface from pages to objects and endpoints. Top risks (OWASP API Security Top 10): broken object-level authorization (BOLA — changing an ID to see someone else's data), broken auth, excessive data exposure, lack of resources/rate limiting, mass assignment. Defenses: deny-by-default authz per object, schema-validated inputs, rate limits, pagination caps, and never trusting the client's field list." },

  { id:"cloud", cat:"cyber", title:"Cloud security",
    keys:["cloud","aws","azure","gcp","shared responsibility","s3","misconfiguration","iam"],
    answer:"Cloud security runs on the shared responsibility model: the provider secures the infrastructure, you secure what's IN it — identities, config, data, workloads. The classic breaches are config, not hacks: public storage buckets, over-permissive IAM roles, exposed keys, unpatched managed services. Your checklist: least-privilege IAM, no long-lived keys (use roles), encryption on, logging on (CloudTrail/Activity Log), and continuous config assessment." },

  { id:"opsec", cat:"cyber", title:"OPSEC",
    keys:["opsec","operational security","cover","attribution","stealth"],
    answer:"OPSEC in red-teaming means controlling what the defender sees: opsec is respect for the operation AND for the rules. Practically — clean infrastructure, controlled test windows, documented traffic patterns, no persistence left behind, and constant awareness that every beacon has a log line on the other side. In authorized work, 'staying undetected' is a training goal measured against detections, never an excuse to exceed scope." },

  { id:"c2", cat:"cyber", title:"Command & control (C2)",
    keys:["c2","command and control","beacon","implant","covenant","mythic","cobalt"],
    answer:"C2 is the channel between an operator and compromised hosts — beacons, redirects, domains. Defenders look for: periodic outbound connections (jittered or not), unusual DNS patterns, rarely-seen user-agents, connections to fresh domains. Concept-level study (as on this site's red-team lab) always pairs each technique with its detection: egress monitoring, DNS analytics, EDR process lineage. Understanding C2 is how you build the tripwires." },

  { id:"mitre", cat:"cyber", title:"MITRE ATT&CK",
    keys:["mitre","att&ck","attack framework","tactics","techniques","ttp"],
    answer:"ATT&CK is a public knowledge base of adversary TTPs — tactics (the why: initial access, persistence, privilege escalation…), techniques (the how), and groups/malware that use them. Defenders map detections to techniques ('coverage map'); attackers plan paths through it. It's the shared language between red and blue — and the fastest way to stop arguing about names and start measuring coverage." },

  { id:"osint", cat:"cyber", title:"OSINT",
    keys:["osint","open source intelligence","public info","social media recon","shodan","censys"],
    answer:"OSINT is intelligence from publicly available sources: WHOIS, DNS, code repos, job posts, social profiles, Shodan/Censys for exposed services, breach dumps for exposure awareness. It powers recon without touching the target — and it's also how attackers build spear-phishing pretexts. Defensive habit: Google yourself/your org quarterly and shrink what's findable. Khalifa's PNPT track covered OSINT formally." },

  { id:"ctf-advice", cat:"cyber", title:"CTFs and practice",
    keys:["ctf","ctf advice","capture the flag","hackthebox","tryhackme","practice labs","how to practice","picoctf"],
    answer:"CTFs build pattern recognition under safe, legal conditions. Approach: start with web + recon categories (they map directly to real pentesting), read every write-up AFTER your own attempt, keep notes on what worked, and don't shame-stuck — the learning is in the wrong turns. This site has its own: the Arena's mini-CTF, daily challenges, and the five-flag hunt across the source. Tools + repetition + notes = judgment." },

  { id:"career", cat:"cyber", title:"Getting into cybersecurity",
    keys:["career","get into","getting into","how to start","beginner","first job","roadmap","break into","no degree","self taught","advice"],
    match:["how do i get into","how to get into","want to be","become a","start a career","career advice"],
    answer:"A pragmatic path (mirrors Khalifa's own):\n1. Fundamentals — networking (CCNA-level) + Linux + one scripting language\n2. Security baseline — Security+ level: threats, crypto, ops\n3. Pick a direction — blue (SOC/analysis) or red (pentest) — then go deep\n4. Practice legally — home lab, intentionally-vulnerable apps, CTFs\n5. Prove it — one respected practical cert (eJPT/PNPT class) + a write-up portfolio\n6. Document everything — public notes beat claimed skills\nNo degree required; demonstrated judgment is the currency. Authorized targets only, always." },

  { id:"cert-guide", cat:"cyber", title:"Which certifications",
    keys:["which cert","certification advice","certification path","worth it","ccna vs","security+ vs","ejpt vs pnpt","cert path"],
    match:["which certification","which cert should","certification should i"],
    answer:"A sane sequence (the roadmap on this site):\n• CCNA — networking foundation (underpins everything)\n• Security+ — baseline vocabulary for defense/ops roles\n• eJPT — first hands-on offensive cert (guided labs)\n• PNPT — independent pentest + real reporting rigor\n• CEH — breadth/HR-recognition (theory-heavy)\n• CRTO — red-team ops with OPSEC discipline (Khalifa's next)\n• OSWE — advanced web + code auditing (long-term)\nOrder matters less than depth: one cert you can discuss deeply beats five you can't." },

  { id:"report-writing", cat:"cyber", title:"Pentest reporting",
    keys:["report","reporting","documentation","findings","executive summary","remediation","how to write a report"],
    answer:"A report is the product — testing without it is just hacking. Structure: scope & ROE → executive summary (business language) → per-finding: title, severity with rationale, evidence (steps to reproduce), impact, and a concrete fix → appendix with raw data. Rules: every finding paired with remediation, severity justified (CVSS + context), no jargon in the executive part, and findings tracked to closure with retest. This site ships a sample report (fictional findings) and a 7-step engagement workflow." },

  { id:"sudo-curiosity", cat:"cyber", title:"sudo curiosity",
    keys:["sudo","sudo curiosity","easter egg command"],
    match:["sudo curiosity"],
    answer:"The terminal's answer to `sudo curiosity` is the site's whole thesis: curiosity is the sudo that grants access to everything — granted by default here, never revoked. (It's also a real easter egg — the terminal hides more: try `seals`, `achievements`, and the konami sequence.)" },

  /* safety net */
  { id:"no-invent", cat:"about", title:"Refusal to invent",
    keys:["make up","invent","guess","estimate","probably","maybe you know"],
    answer:"I don't guess. Everything I say about Khalifa comes from what this site actually publishes; everything else is standard cybersecurity knowledge. If the site doesn't say it, I say so instead of inventing it." }
  ];

  /* ── build indexes ─────────────────────────────────────────────── */
  ENTRIES.forEach(function (e) {
    e.keySet = new Set();
    (e.keys || []).forEach(function (k) {
      tokens(k).forEach(function (t) { e.keySet.add(t); e.keySet.add(stem(t)); });
      if (k.indexOf(" ") >= 0) { /* phrase handled below via norm */ }
    });
    e.phrases = (e.keys || []).filter(function (k) { return k.indexOf(" ") >= 0; }).map(norm);
    e.matchPhrases = (e.match || []).map(norm).filter(function (m) { return m.length >= 5; });
    e.titleSet = new Set(tokens(e.title).map(stem));
    e.genSet = new Set();
    (e.gen || []).forEach(function (g) { tokens(g).forEach(function (t) { e.genSet.add(t); e.genSet.add(stem(t)); }); });
  });

  var GREET = ["hi","hello","hey","yo","salam","assalamu alaikum","good morning","good evening","howdy","hi there","hello there"];
  var THANKS = ["thanks","thank you","thx","ty","appreciate it","jazak allah","cheers"];
  var BYE = ["bye","goodbye","see you","see you later","good night","cya"];

  function quickMatch(list, qn) {
    for (var i = 0; i < list.length; i++) {
      var g = list[i];
      if (qn === g || qn.startsWith(g + " ")) return true;
    }
    return false;
  }

  // Word-boundary phrase containment: "about you" must NOT match inside
  // "tell me about your website" (the substring bug that hijacked routing).
  function hasPhrase(hay, needle) {
    if (!needle) return false;
    var idx = hay.indexOf(needle);
    while (idx !== -1) {
      var before = idx === 0 || hay.charAt(idx - 1) === " ";
      var end = idx + needle.length;
      var after = end === hay.length || hay.charAt(end) === " ";
      if (before && after) return true;
      idx = hay.indexOf(needle, idx + 1);
    }
    return false;
  }

  function ask(query) {
    var qn = norm(query);
    if (!qn) return null;

    if (quickMatch(GREET, qn)) return { entry: find("greeting") };
    if (quickMatch(THANKS, qn)) return { entry: find("thanks") };
    if (quickMatch(BYE, qn)) return { entry: find("thanks") };

    var qt = tokens(qn).map(stem);
    if (!qt.length) {
      // all stopwords — try match phrases against raw normalized query
      for (var i0 = 0; i0 < ENTRIES.length; i0++) {
        for (var m0 = 0; m0 < ENTRIES[i0].matchPhrases.length; m0++) {
          if (hasPhrase(qn, ENTRIES[i0].matchPhrases[m0])) return { entry: ENTRIES[i0] };
        }
      }
      return null;
    }

    // pass 1: explicit match phrases (word-bounded, keep stopword context)
    for (var i1 = 0; i1 < ENTRIES.length; i1++) {
      var e1 = ENTRIES[i1];
      for (var m1 = 0; m1 < e1.matchPhrases.length; m1++) {
        if (hasPhrase(qn, e1.matchPhrases[m1])) return { entry: e1 };
      }
    }

    // pass 2: scored
    var need = qt.length <= 1 ? 1.4 : (qt.length === 2 ? 1.5 : 2.4);
    var best = null, bestScore = -1;
    for (var i2 = 0; i2 < ENTRIES.length; i2++) {
      var e2 = ENTRIES[i2], s = 0, phraseHits = 0, keyHits = 0;
      for (var p2 = 0; p2 < e2.phrases.length; p2++) {
        if (hasPhrase(qn, e2.phrases[p2])) { s += 2.2; phraseHits++; }
      }
      if (s > 4.4) s = 4.4;
      var seen = new Set();
      for (var t2 = 0; t2 < qt.length; t2++) {
        var t = qt[t2];
        if (seen.has(t)) continue;
        seen.add(t);
        if (e2.keySet.has(t)) { s += 1.5; keyHits++; }
        else if (e2.genSet.has(t)) s += 0.5;
        else if (e2.titleSet.has(t)) s += 0.8;
      }
      if (phraseHits === 0 && keyHits === 0) continue; // weak-only matches never win
      if (s > bestScore) { bestScore = s; best = e2; }
    }
    if (best && bestScore >= need) return { entry: best };
    return null;
  }

  function find(id) {
    for (var i = 0; i < ENTRIES.length; i++) if (ENTRIES[i].id === id) return ENTRIES[i];
    return null;
  }

  function fallback() {
    return "I don't have that in my local knowledge base yet — and I'd rather say so than guess.\nI'm grounded in three areas:\n• THIS SITE — pages, terminal, labs, vault, privacy, credits\n• KHALIFA / HOLY — certifications, internships, journey, contact\n• CYBERSECURITY — web flaws, networking, crypto, tools, career advice\nTry: \"what certifications do you have\" · \"how do I get into cybersecurity\" · \"what's in the vault\"";
  }

  return {
    ask: ask,
    fallback: fallback,
    entries: ENTRIES,
    norm: norm,
    _find: find
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = HOLY_KB;
