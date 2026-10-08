/* HOLY // FIELD NOTES — full article bodies.
   Keys match the `article` field in config.js → HOLY_WRITEUPS. */

const HOLY_ARTICLES = {
note1: `<div class="article">
<p>Network segmentation is the practice of dividing a network into smaller, isolated sections. Instead of allowing every device to communicate freely with every other device, devices are separated based on their purpose and trust level.</p>
<table><tr><th>Network</th><th>Devices</th><th>Purpose</th></tr>
<tr><td>Main / Trusted</td><td>Laptop, PC, NAS</td><td>Personal devices</td></tr>
<tr><td>IoT</td><td>Cameras, smart TV, smart plugs</td><td>Smart devices</td></tr>
<tr><td>Guest</td><td>Visitors' phones / laptops</td><td>Internet access</td></tr>
<tr><td>Lab</td><td>Virtual machines, test systems</td><td>Security testing</td></tr></table>
<p>The main security benefit is <b>containment</b>. If one device becomes compromised, segmentation can prevent an attacker from easily reaching other important devices.</p>
<h4>Why Segment a Home Network?</h4>
<p>Not every device deserves the same level of trust. A personal laptop might contain password-manager data, browser sessions, SSH keys and credentials — while an IoT device may run outdated firmware with weak authentication and poor logging. There is little reason for a smart plug to have unrestricted access to a laptop or NAS.</p>
<h4>VLANs</h4>
<p>A VLAN (Virtual Local Area Network) divides a physical network into multiple logical networks.</p>
<table><tr><th>VLAN</th><th>Network</th><th>Purpose</th></tr>
<tr><td>VLAN 10</td><td>192.168.10.0/24</td><td>Trusted devices</td></tr>
<tr><td>VLAN 20</td><td>192.168.20.0/24</td><td>IoT</td></tr>
<tr><td>VLAN 30</td><td>192.168.30.0/24</td><td>Guest</td></tr>
<tr><td>VLAN 40</td><td>192.168.40.0/24</td><td>Security lab</td></tr></table>
<p>VLANs organize and isolate — but creating VLANs alone does not secure a network. Traffic between VLANs must be controlled through routing and firewall policies.</p>
<h4>Firewall Rules</h4>
<p>Follow least privilege: devices communicate across networks only with legitimate reason.</p>
<table><tr><th>Source</th><th>Destination</th><th>Policy</th></tr>
<tr><td>Trusted</td><td>Internet</td><td>Allow</td></tr>
<tr><td>IoT</td><td>Internet</td><td>Allow</td></tr>
<tr><td>Guest</td><td>Internet</td><td>Allow</td></tr>
<tr><td>Guest</td><td>Trusted</td><td>Block</td></tr>
<tr><td>IoT</td><td>Trusted</td><td>Block</td></tr>
<tr><td>Guest</td><td>IoT</td><td>Block</td></tr>
<tr><td>Lab</td><td>Internet</td><td>Allow</td></tr>
<tr><td>Lab</td><td>Trusted</td><td>Restricted</td></tr></table>
<h4>Guest Network Isolation</h4>
<ul><li>Guests get Internet access — nothing more.</li><li>No access to PCs, NAS, management interfaces, or sensitive IoT.</li><li>Critical when unknown devices join your Wi-Fi.</li></ul>
<h4>IoT Security</h4>
<p>IoT is hard to secure: old firmware, default credentials, exposed services, weak updates, limited logging. Isolate instead of trust — IoT network gets Internet but cannot initiate connections to the trusted network (PC, laptop, NAS, server).</p>
<h4>DNS Filtering</h4>
<p>DNS filtering blocks malicious, phishing, malware, tracking and suspicious domains — but it is one layer, not a solution. Bypassable via direct IPs, alternative DNS, DNS-over-HTTPS/TLS, or compromised legitimate sites.</p>
<h4>Traffic Baselines</h4>
<p>Know what normal looks like: laptops talk to DNS, updates, cloud and mail; cameras talk to vendor cloud, DNS and NTP. A camera contacting an unexpected destination deserves investigation.</p>
<h4>Firmware Updates</h4>
<p>Keep routers, APs, switches, NAS, cameras and servers updated — firmware fixes authentication, RCE, privesc and service flaws. Maintain a device inventory and check versions periodically.</p>
<h4>Defense in Depth</h4>
<p>Combine VLANs, firewall rules, strong passwords, MFA, updates, DNS filtering, monitoring, logging, isolation and secure Wi-Fi. Multiple layers, one goal.</p>
</div>`,
note2: `<div class="article">
<p>Burp Suite is a platform for testing web applications. Its most important capability: inspecting HTTP/HTTPS traffic between browser and application — so for authorized testing I can see exactly what the browser sends and how the server responds.</p>
<h4>Understanding HTTP Requests</h4>
<pre>GET /profile?id=123 HTTP/1.1
Host: lab.local
Cookie: session=abc123
User-Agent: Mozilla/5.0</pre>
<p>Study the method (GET/POST/PUT/PATCH/DELETE), path, parameters, headers (Host, Cookie, Authorization, Content-Type) and body, e.g.:</p>
<pre>{
  "username": "alice",
  "password": "example"
}</pre>
<h4>Burp Proxy</h4>
<p>Intercepting a lab login reveals the endpoint, parameters, headers, auth mechanism and server response:</p>
<pre>POST /login HTTP/1.1
Host: lab.local
Content-Type: application/x-www-form-urlencoded
username=alice&amp;password=password123</pre>
<h4>Mapping the Application</h4>
<p>Before testing, understand the app: pages, forms, APIs, parameters, auth, cookies, roles, uploads, admin areas. This is <b>attack-surface mapping</b>.</p>
<h4>HTTP History</h4>
<p>Review generated requests instead of guessing how the app works — history shows its actual behavior.</p>
<h4>Repeater</h4>
<p>Send a request to Repeater and modify it repeatedly. The point isn't changing <code>id=123</code> to <code>124</code> — it's asking: does the app verify the user is <b>authorized</b> for that object? That's IDOR/BOLA reasoning.</p>
<h4>Comparing Responses</h4>
<p>Compare status code, body, length, headers, redirects, errors and timing. Two <code>200 OK</code> responses returning different users' profiles in an authorized lab signals an authorization problem worth investigating.</p>
<h4>Authentication vs Authorization</h4>
<p>Authentication = who you are. Authorization = what you're allowed to do. Strong authentication can coexist with broken authorization.</p>
<h4>Cookies</h4>
<p>Session cookies need <code>Secure</code> (HTTPS only), <code>HttpOnly</code> (no JS access) and <code>SameSite</code> (CSRF reduction).</p>
<h4>Input Handling</h4>
<p>Ask of every input — validated? encoded? safely processed? Vulnerability classes: SQLi, XSS, command injection, path traversal, SSRF, template injection. Only against explicitly authorized systems.</p>
<h4>My Basic Burp Workflow</h4>
<ol><li>Start an authorized lab.</li><li>Route the browser through Burp.</li><li>Browse normally; review history.</li><li>Identify interesting endpoints, parameters, auth.</li><li>Send targets to Repeater; change one variable at a time.</li><li>Compare responses, form a hypothesis, test it.</li><li>Record evidence and result.</li></ol>
<p>Understand behavior first — never blindly fire payloads.</p>
</div>`,
note3: `<div class="article">
<p>Nmap identifies live hosts, open ports, services, versions and OS info on an authorized network. An open port isn't a vulnerability — it's a listening service asking: what runs here, why is it exposed, and is it configured securely?</p>
<h4>Common Ports</h4>
<table><tr><th>Port</th><th>Service</th></tr>
<tr><td>22</td><td>SSH</td></tr><tr><td>53</td><td>DNS</td></tr>
<tr><td>80</td><td>HTTP</td></tr><tr><td>443</td><td>HTTPS</td></tr>
<tr><td>445</td><td>SMB</td></tr><tr><td>3306</td><td>MySQL</td></tr>
<tr><td>3389</td><td>RDP</td></tr></table>
<h4>Port States</h4>
<p><b>Open</b> = service accepting connections. <b>Closed</b> = reachable, nothing listening. <b>Filtered</b> = firewall blocking determination.</p>
<h4>Host Discovery</h4>
<pre>nmap -sn 192.168.1.0/24</pre>
<p>Finds live hosts without a port scan — then investigate what's relevant to the authorized assessment.</p>
<h4>Basic &amp; Version Scans</h4>
<pre>nmap 192.168.1.10
nmap -sV 192.168.1.10
nmap -O 192.168.1.10
nmap -A 192.168.1.10</pre>
<p>Version output feeds advisory/CVE research — treat it as evidence, not gospel. <code>-A</code> is noisy: OS + version + scripts + traceroute, so use it carefully on fragile systems.</p>
<h4>Targeted Ports &amp; NSE</h4>
<pre>nmap -p 22,80,443 192.168.1.10
nmap -p 1-1000 192.168.1.10
nmap --script &lt;script&gt; 192.168.1.10</pre>
<p>Choose the scan for the question — not the most aggressive by default. NSE scripts extend into enumeration and auditing.</p>
<h4>Timing &amp; Documentation</h4>
<p>Aggressive scans trigger IDS/IPS, flood logs and can hurt fragile services. And a scan forgotten is a scan wasted — document target, purpose, command, ports, services, findings, next steps. Save output with <code>-oN</code> / <code>-oX</code> for comparison and tooling.</p>
<h4>Reconnaissance Report Template</h4>
<pre>RECONNAISSANCE REPORT
Target: [IP / hostname]
Authorization: [lab / owned / approved]
Date: [date]   Objective: [purpose]
Host Discovery: […]   Open Ports: […]
Services/Versions: […]   OS: […]   Technologies: […]
Interesting Findings: […]
Next Investigation: […]
Commands Used: […]   Evidence: […]   Conclusion: […]</pre>
<h4>Key Takeaways</h4>
<p><b>Network defense:</b> segmentation contains breaches — combine VLANs, firewall rules, DNS filtering, updates and monitoring. <b>Web security:</b> understand HTTP, map the surface, test auth vs authz in Repeater, document everything. <b>Reconnaissance:</b> discover, identify, research, document. One mindset: understand first, test methodically, write it down.</p>
</div>`,
};
