/* ============================================================
   HOLY // CENTRAL DATA ARCHITECTURE
   Edit everything personal here. The entire site + resume
   render from these objects. No other file needs editing
   for routine updates.
   ============================================================ */

const HOLY_PROFILE = {
  name: "HOLY",
  realName: "Khalifa",
  identity: "CYBERSECURITY SPECIALIST",
  slogan: "THINK LIKE AN ATTACKER. BUILD LIKE A DEFENDER.",
  heroStatement: "I don't just use systems. I learn how they fail.",
  heroSupport:
    "Cybersecurity-focused professional exploring offensive security, penetration testing, network defense, web application security and red-team operations.",
  aboutSupport:
    "Exploring cybersecurity through penetration testing, network security, web application security, red-team methodologies, vulnerability research, and secure system design.",
  location: "Cairo, Egypt",
  availability: "OPEN TO OPPORTUNITIES",
  focus: "Cybersecurity",
  specialization: "Offensive Security",
  interests: ["Pentesting", "Red Teaming", "Web Security", "Network Security"],
  modes: ["LEARN", "BUILD", "TEST", "DOCUMENT"],
};

/* Certification status must be one of:
   "VERIFIED" | "IN PROGRESS" | "PLANNED" | "SOON" */
const HOLY_CERTS = [
  {
    id: "ccna",
    index: "01",
    short: "CCNA",
    name: "Cisco Certified Network Associate",
    track: "NETWORKING",
    focus: ["Networking", "Routing", "Switching", "TCP/IP", "Infrastructure", "Network Security Fundamentals"],
    status: "VERIFIED",
    note: "Foundation for all network-level security work.",
  },
  {
    id: "secplus",
    index: "02",
    short: "Security+",
    name: "CompTIA Security+",
    track: "SECURITY FUNDAMENTALS",
    focus: ["Cybersecurity Fundamentals", "Threats", "Risk", "Network Security", "Identity", "Cryptography", "Security Operations"],
    status: "VERIFIED",
    note: "Core defensive and operational security baseline.",
  },
  {
    id: "ejpt",
    index: "03",
    short: "eJPT",
    name: "eLearnSecurity Junior Penetration Tester",
    track: "PRACTICAL PENTESTING",
    focus: ["Reconnaissance", "Enumeration", "Network Pentesting", "Web Security", "Exploitation"],
    status: "VERIFIED",
    note: "First hands-on offensive methodology milestone.",
  },
  {
    id: "pnpt",
    index: "04",
    short: "PNPT",
    name: "Practical Network Penetration Tester",
    track: "PROFESSIONAL PENTESTING",
    focus: ["Network Penetration Testing", "OSINT", "Active Directory", "Professional Reporting", "Pentest Methodology"],
    status: "VERIFIED",
    note: "Scenario-based network pentest + reporting rigor.",
  },
  {
    id: "ceh",
    index: "05",
    short: "CEH",
    name: "Certified Ethical Hacker",
    track: "ETHICAL HACKING",
    focus: ["Ethical Hacking", "Reconnaissance", "Vulnerability Assessment", "Security Fundamentals"],
    status: "VERIFIED",
    note: "Breadth across ethical-hacking domains.",
  },
  {
    id: "crto",
    index: "06",
    short: "CRTO",
    name: "Certified Red Team Operator",
    track: "RED TEAM OPERATIONS",
    focus: ["Red Team Operations", "Adversary Simulation", "Command & Control", "Active Directory", "OPSEC"],
    status: "SOON",
    note: "Adversary simulation with operational discipline.",
    spotlight: true,
  },
  {
    id: "oswe",
    index: "07",
    short: "OSWE",
    name: "Offensive Security Web Expert",
    track: "ADVANCED WEB SECURITY",
    focus: ["Advanced Web Application Security", "Source Code Review", "Web Exploitation"],
    status: "IN PROGRESS",
    note: "Long-term advanced web exploitation milestone.",
  },
];

/* Experience type must be one of:
   "INTERNSHIP" | "TRAINING" | "PROGRAM" | "WORK EXPERIENCE" |
   "INDUSTRY EXPOSURE" | "TARGET" | "PLANNED"
   Status badge: "VERIFIED" | "IN PROGRESS" | "TARGET" | "PLANNED"
   IMPORTANT: only set INTERNSHIP / WORK EXPERIENCE when formally
   confirmed. Never invent dates, managers, or achievements. */
const HOLY_EXPERIENCE = [
  {
    org: "Independent Security Lab",
    role: "Self-Directed Cybersecurity Training",
    type: "TRAINING",
    status: "IN PROGRESS",
    date: "Ongoing — self-directed",
    location: "Home Lab / Controlled Environment",
    description:
      "Hands-on offensive and defensive fundamentals in an owned, controlled lab: networking, Linux, web security basics, reconnaissance workflows, traffic analysis and documentation.",
    technologies: ["Kali Linux", "Nmap", "Wireshark", "Burp Suite", "Bash", "Python"],
    achievements: [
      "Built segmented home-lab network for safe experimentation",
      "Documented repeatable recon → enumeration → analysis workflow",
      "Practiced authorized-only testing discipline on owned targets",
    ],
  },
  {
    org: "HASSAN ALLAM",
    role: "IT / Security Intern",
    type: "INTERNSHIP",
    status: "VERIFIED",
    date: "3 months · Completed",
    location: "Available on request",
    description:
      "Completed three-month IT/Security internship. Specific duties, projects and references available on request — expand this card in config.js with confirmed details only.",
    technologies: ["IT Operations", "Security Fundamentals"],
    achievements: ["Completed 3-month internship program"],
  },
  {
    org: "MICROSOFT",
    role: "Technology Intern",
    type: "INTERNSHIP",
    status: "VERIFIED",
    date: "1 month · Completed",
    location: "Available on request",
    description:
      "Completed one-month technology internship. Specific duties, projects and references available on request — expand this card in config.js with confirmed details only.",
    technologies: ["IT Fundamentals", "Technology Operations"],
    achievements: ["Completed 1-month internship program"],
  },
  {
    org: "KASPERSKY",
    role: "IT / Security Intern",
    type: "INTERNSHIP",
    status: "VERIFIED",
    date: "4 months · Completed",
    location: "Available on request",
    description:
      "Completed four-month IT/Security internship. Specific duties, projects and references available on request — expand this card in config.js with confirmed details only.",
    technologies: ["IT Operations", "Security Fundamentals"],
    achievements: ["Completed 4-month internship program"],
  },
  {
    org: "HUAWEI",
    role: "IT / Security Intern",
    type: "INTERNSHIP",
    status: "VERIFIED",
    date: "2 months · Completed",
    location: "Available on request",
    description:
      "Completed two-month IT/Security internship. Specific duties, projects and references available on request — expand this card in config.js with confirmed details only.",
    technologies: ["Networking Basics", "Security Fundamentals"],
    achievements: ["Completed 2-month internship program"],
  },
];

/* Proficiency must be one of:
   "EXPLORING" | "LEARNING" | "PRACTICING" |
   "WORKING KNOWLEDGE" | "ADVANCED" */
const HOLY_ARSENAL = [
  { category: "RECONNAISSANCE", items: [
    ["Nmap", "PRACTICING"], ["Amass", "LEARNING"], ["Subfinder", "LEARNING"],
    ["theHarvester", "LEARNING"], ["Recon-ng", "EXPLORING"], ["WHOIS", "WORKING KNOWLEDGE"],
    ["DNS Enumeration", "PRACTICING"], ["Subdomain Enumeration", "PRACTICING"],
  ]},
  { category: "WEB SECURITY", items: [
    ["Burp Suite", "PRACTICING"], ["OWASP", "LEARNING"], ["HTTP/HTTPS", "WORKING KNOWLEDGE"],
    ["Authentication", "LEARNING"], ["Authorization", "LEARNING"], ["Session Security", "LEARNING"],
    ["API Security", "EXPLORING"], ["XSS", "LEARNING"], ["SQL Injection concepts", "LEARNING"],
    ["CSRF", "LEARNING"], ["Access Control", "LEARNING"],
  ]},
  { category: "NETWORK SECURITY", items: [
    ["Wireshark", "PRACTICING"], ["TCP/IP", "WORKING KNOWLEDGE"], ["DNS", "WORKING KNOWLEDGE"],
    ["DHCP", "WORKING KNOWLEDGE"], ["Routing", "LEARNING"], ["Firewalls", "LEARNING"],
    ["VPN", "LEARNING"], ["Network Segmentation", "PRACTICING"], ["Packet Analysis", "PRACTICING"],
  ]},
  { category: "LINUX", items: [
    ["Kali Linux", "PRACTICING"], ["Ubuntu", "WORKING KNOWLEDGE"], ["Bash", "PRACTICING"],
    ["SSH", "WORKING KNOWLEDGE"], ["Linux Permissions", "PRACTICING"], ["Processes", "LEARNING"],
    ["Networking", "PRACTICING"],
  ]},
  { category: "WINDOWS", items: [
    ["Windows Security", "LEARNING"], ["PowerShell", "LEARNING"], ["Active Directory", "LEARNING"],
    ["Kerberos Concepts", "EXPLORING"], ["Authentication", "LEARNING"], ["Privilege Escalation", "EXPLORING"],
  ]},
  { category: "PROGRAMMING", items: [
    ["Python", "PRACTICING"], ["Bash", "PRACTICING"], ["HTML", "WORKING KNOWLEDGE"],
    ["CSS", "WORKING KNOWLEDGE"], ["JavaScript", "LEARNING"],
  ]},
  { category: "RED TEAMING", items: [
    ["C2 Concepts", "EXPLORING"], ["Active Directory", "LEARNING"], ["Attack Paths", "LEARNING"],
    ["Privilege Escalation", "EXPLORING"], ["OPSEC", "LEARNING"], ["Adversary Simulation", "EXPLORING"],
  ]},
  { category: "DEFENSIVE SECURITY", items: [
    ["Hardening", "LEARNING"], ["Logging", "PRACTICING"], ["Monitoring", "LEARNING"],
    ["Threat Detection", "LEARNING"], ["Incident Analysis", "LEARNING"], ["Attack Surface Reduction", "LEARNING"],
  ]},
];

const HOLY_METHODOLOGY = [
  { n: "01", title: "RECONNAISSANCE", objective: "Build a complete picture of the target from authorized sources without direct engagement.", tools: "WHOIS, DNS records, Amass, Subfinder, theHarvester, Recon-ng", questions: "What domains, subdomains, IPs, people and technologies are visible? What is explicitly in scope?", methodology: "Passive collection → scope validation → asset inventory. No scanning outside written authorization.", output: "Scoped asset inventory + rules of engagement confirmation.", defense: "Reduce public exposure, monitor certificate transparency, manage DNS footprint." },
  { n: "02", title: "ENUMERATION", objective: "Identify live hosts, services and versions inside the authorized scope.", tools: "Nmap, Netcat, DNS enumeration, SMB / SNMP enumeration (lab only)", questions: "What is alive? What ports, services and versions answer?", methodology: "Host discovery → port scan → service/version detection → results logged per host.", output: "Service map with versions and confidence levels.", defense: "Close unused ports, standardize banners, segment services." },
  { n: "03", title: "ATTACK SURFACE MAPPING", objective: "Connect services, apps, trust relationships and entry points into one model.", tools: "Mind maps, Nmap output, Burp site map, Wireshark flows", questions: "Where do authentication, data and trust boundaries meet?", methodology: "Correlate hosts, web routes, auth flows and network paths into a single surface diagram.", output: "Visual attack-surface map prioritized by exposure.", defense: "Segment networks, enforce least privilege, shrink reachable surface." },
  { n: "04", title: "VULNERABILITY ANALYSIS", objective: "Match observed behavior against known weakness classes — without exploiting.", tools: "Manual analysis, OWASP Testing Guide, version research, config review", questions: "Which findings are real, reachable and in scope?", methodology: "Classify by type → check preconditions → rate severity → eliminate false positives.", output: "Prioritized finding list with evidence and severity rationale.", defense: "Patch cadence, secure defaults, continuous config review." },
  { n: "05", title: "VALIDATION", objective: "Confirm each finding with the least intrusive proof possible.", tools: "Burp Repeater, crafted requests, read-only checks, screenshots + logs", questions: "Can this be shown safely without damage or overreach?", methodology: "Reproduce carefully → capture evidence → stop at proof of existence. Never pivot without approval.", output: "Validated findings with reproducible evidence.", defense: "Alert on anomalous validation patterns; review logs for coverage." },
  { n: "06", title: "EXPLOITATION", objective: "Demonstrate impact only where explicitly authorized, in controlled environments.", tools: "Lab-only exploit chains, custom Python / Bash proof-of-concepts", questions: "Is exploitation authorized, reversible and documented?", methodology: "Confirm scope in writing → minimal proof → immediate stop on unexpected behavior.", output: "Controlled impact demonstration with full audit trail.", defense: "Input validation, output encoding, parameterized queries, patching." },
  { n: "07", title: "PRIVILEGE ESCALATION", objective: "Understand how low-privilege access could become high-privilege access.", tools: "Linux permissions review, Windows / AD enumeration (lab), manual misconfiguration review", questions: "Which misconfigurations, tokens or trust paths enable elevation?", methodology: "Enumerate → hypothesize path → validate minimally → document detection.", output: "Escalation path analysis with remediation priority.", defense: "Least privilege, credential hygiene, hardened AD tiers, LAPS, logging." },
  { n: "08", title: "POST-EXPLOITATION", objective: "Assess what an attacker could reach — and how defenders would detect it.", tools: "Log review, persistence-hunting checklists (defensive view), enumeration notes", questions: "What data, systems and persistence options exist? What would trigger alerts?", methodology: "Map reachable assets → identify detection gaps → recommend monitoring — no persistence left behind.", output: "Blast-radius assessment + detection recommendations.", defense: "EDR, centralized logging, canary tokens, egress monitoring." },
  { n: "09", title: "DOCUMENTATION", objective: "Turn technical work into decisions a team can act on.", tools: "Structured reports, evidence packs, severity scales, remediation tables", questions: "Can a defender reproduce, prioritize and fix every finding?", methodology: "Executive summary → per-finding detail (evidence, impact, fix) → appendix with raw logs.", output: "Professional penetration-test style report.", defense: "Track remediation to closure; retest fixes." },
  { n: "10", title: "REMEDIATION", objective: "Leave every environment more secure than it was found.", tools: "Hardening guides, patch verification, config re-checks", questions: "Is the fix complete, verified and non-breaking?", methodology: "Recommend fix → verify → confirm no regression → document residual risk.", output: "Verified remediation record + hardening checklist.", defense: "Security is a process: continuous hardening, logging and review." },
];

const HOLY_LABS = [
  {
    id: "lab1", index: "LAB 01", title: "HOME NETWORK DEFENSE LAB",
    tagline: "Harden the network you own before testing anyone else's.",
    focus: ["Router Hardening", "Network Segmentation", "Traffic Monitoring", "Device Security", "Logging"],
    tools: "Router admin, Wireshark, Nmap (own network), firewall rules",
    environment: "Owned home network — router, segmented guest/IoT networks, monitoring host. Fully authorized.",
    objective: "Reduce the attack surface of a real home network and build a monitoring baseline.",
    methodology: "Inventory devices → change defaults → segment networks → capture baseline traffic → review logs weekly.",
    challenge: "Consumer routers hide insecure defaults behind friendly wizards.",
    approach: "Hardening checklist applied step by step, each change verified with scans and captures.",
    result: "Segmented, monitored baseline with documented hardening steps.",
    lessons: "Defense starts with inventory. You cannot secure what you cannot see.",
    improvements: "Guest isolation, firmware updates, DNS filtering, centralized log notes.",
  },
  {
    id: "lab2", index: "LAB 02", title: "WEB APPLICATION SECURITY LAB",
    tagline: "Learn how web apps fail — against intentionally vulnerable targets.",
    focus: ["Burp Suite", "HTTP", "Authentication", "Sessions", "Access Control", "OWASP"],
    tools: "Burp Suite, intentionally vulnerable apps (OWASP Juice Shop / DVWA, local only)",
    environment: "Local intentionally-vulnerable applications. Educational environment only.",
    objective: "Understand auth, session and access-control failures at the HTTP layer.",
    methodology: "Map → intercept → test auth/session logic → classify per OWASP → document fixes.",
    challenge: "Real flaws hide in logic, not just payloads.",
    approach: "Manual request analysis before any automation; every finding mapped to a defensive fix.",
    result: "Repeatable web-testing checklist with evidence templates.",
    lessons: "Read the request. The app tells you how it fails.",
    improvements: "Secure session flags, server-side authorization checks, rate limiting.",
  },
  {
    id: "lab3", index: "LAB 03", title: "NETWORK RECON LAB",
    tagline: "See the network the way both defender and attacker see it.",
    focus: ["Nmap", "Wireshark", "DNS", "Enumeration", "Network Mapping"],
    tools: "Nmap, Wireshark, dig / nslookup, subnetting notes",
    environment: "Owned lab subnets and virtual machines. No external scanning.",
    objective: "Produce accurate network maps and service inventories from authorized scans.",
    methodology: "Scope → host discovery → service scan → packet review → map.",
    challenge: "Noisy scans teach bad habits; quiet precision matters.",
    approach: "Compare scan types, timing and packet captures to understand trade-offs.",
    result: "Clean scan playbook with timing, output and documentation standards.",
    lessons: "Enumeration quality determines everything downstream.",
    improvements: "Firewall rules, IDS awareness, scan logging on the defensive side.",
  },
  {
    id: "lab4", index: "LAB 04", title: "ACTIVE DIRECTORY LAB",
    tagline: "Understand identity — the backbone of enterprise networks.",
    focus: ["Windows", "Active Directory", "Kerberos", "Privilege Escalation", "Attack Paths", "Detection"],
    tools: "Virtualized Windows Server + clients, PowerShell, AD enumeration (lab)",
    environment: "Isolated virtualized AD forest built for learning. Fully owned.",
    objective: "Learn authentication flows, trust and common misconfigurations — plus their detections.",
    methodology: "Build forest → enumerate → map attack paths → pair each with a detection.",
    challenge: "AD complexity punishes shortcuts.",
    approach: "Every attack path documented alongside its log source and hardening fix.",
    result: "AD fundamentals map: auth, delegation risks, tiering and logging.",
    lessons: "Identity is the perimeter.",
    improvements: "Tiered admin model, LAPS, Kerberos hardening, centralized auth logging.",
  },
  {
    id: "lab5", index: "LAB 05", title: "RED TEAM LAB",
    tagline: "Think like an adversary. Operate with discipline.",
    focus: ["Adversary Simulation", "C2 Concepts", "OPSEC", "Privilege Escalation", "Detection"],
    tools: "Lab C2 concepts, emulation notes, detection stack (theory + lab)",
    environment: "Controlled emulation against owned lab targets. Concepts only — no real-world operations.",
    objective: "Study adversary lifecycles and OPSEC while designing detections for each step.",
    methodology: "Plan scenario → emulate technique → observe logs → write detection → clean up fully.",
    challenge: "Staying undetected is easy to romanticize and hard to do responsibly.",
    approach: "Every technique paired with assumptions, limitations and blue-team visibility.",
    result: "Scenario library linking techniques to detections.",
    lessons: "OPSEC is respect for the operation — and for the rules.",
    improvements: "EDR tuning, command-line logging, egress review, tabletop exercises.",
  },
  {
    id: "lab6", index: "LAB 06", title: "HOLSERA",
    tagline: "Trust, Engineered Into Every Transaction.",
    category: "CYBERSECURITY · FINTECH · ESCROW · DIGITAL TRUST · FRAUD PREVENTION",
    focus: ["Secure Transaction Concept", "Escrow Logic", "Fraud Prevention", "Digital Trust", "Secure Architecture"],
    tools: "Concept design, threat modeling, secure-architecture notes",
    environment: "Independent concept project by Holy. Design and research stage.",
    objective: "Explore how escrow-style transaction design can reduce fraud through verification and transparency.",
    methodology: "Threat model → transaction-state design → trust-signal mapping → secure-architecture draft.",
    challenge: "Trust cannot be a slogan — it must be engineered into state machines and verification steps.",
    approach: "Security-first product thinking: least privilege, auditability and dispute-safety by design.",
    result: "Concept blueprint for a secure-transaction experience.",
    lessons: "Fraud prevention is user experience plus enforcement.",
    improvements: "Ongoing: verification flows, audit trails, abuse-case modeling.",
    concept: true,
  },
];

const HOLY_RESEARCH = [
  { topic: "Web Application Security", stage: "DEEP DIVE", note: "Auth flows, session handling, access control." },
  { topic: "Network Penetration Testing", stage: "EXPERIMENT", note: "Scoped recon → enumeration playbooks." },
  { topic: "Red Team Operations", stage: "LEARNING", note: "Adversary lifecycle + OPSEC fundamentals." },
  { topic: "Active Directory", stage: "LEARNING", note: "Authentication, trust, attack paths." },
  { topic: "Linux Security", stage: "EXPERIMENT", note: "Permissions, services, hardening." },
  { topic: "Vulnerability Research", stage: "LEARNING", note: "Root-cause analysis over payload collecting." },
  { topic: "Secure Architecture", stage: "DOCUMENTED", note: "Segmentation, least privilege, logging." },
  { topic: "Cloud Security", stage: "LEARNING", note: "Identity, misconfiguration, shared responsibility." },
  { topic: "Detection Engineering", stage: "LEARNING", note: "Pairing every technique with visibility." },
  { topic: "Digital Forensics", stage: "LEARNING", note: "Evidence handling and timeline thinking." },
];

const HOLY_SOCIALS = {
  github: "https://github.com/",
  linkedin: "https://www.linkedin.com/",
  email: "mailto:hello@example.com",
  emailLabel: "hello@example.com",
};

const HOLY_MINDSET = [
  "ASSUME NOTHING.",
  "VERIFY EVERYTHING.",
  "REDUCE THE ATTACK SURFACE.",
  "LEAST PRIVILEGE.",
  "LOG EVERYTHING.",
  "DOCUMENT EVERYTHING.",
  "SECURITY IS A PROCESS.",
];
