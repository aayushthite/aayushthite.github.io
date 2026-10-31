var $ = function(s, r){ return (r || document).querySelector(s); };
var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
function sleep(ms){ return new Promise(function(r){ setTimeout(r, REDUCE ? 0 : ms); }); }

/* ---------- smooth scroll (Lenis) and anchor links ---------- */
var lenis = null;
try { if (window.Lenis && !REDUCE) lenis = new Lenis({ autoRaf: true, lerp: 0.1, smoothWheel: true }); } catch(e){ lenis = null; }
function scrollToTarget(t){
  var el = typeof t === 'string' ? document.getElementById(t.replace(/^#/, '')) : null;
  if (typeof t === 'string' && !el) return;
  if (lenis) lenis.scrollTo(typeof t === 'number' ? t : el, { duration: 1.3 });
  else window.scrollTo({ top: typeof t === 'number' ? t : el.getBoundingClientRect().top + scrollY - 0, behavior: REDUCE ? 'auto' : 'smooth' });
}
document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a) return;
  var h = a.getAttribute('href');
  if (h === '#top' || h === '#'){ e.preventDefault(); scrollToTarget(0); return; }
  if (document.getElementById(h.slice(1))){ e.preventDefault(); scrollToTarget(h); }
});
$('#toTop').addEventListener('click', function(){ scrollToTarget(0); });

/* ---------- nav: progress bar, scrolled state, sliding black indicator, circular menu ---------- */
(function(){
  var nav = $('#nav'), prog = $('#prog'), ind = $('#ind'), list = $('#navList');
  var links = $$('#navList a'), active = null, tick = false;
  function onScroll(){
    tick = false;
    var h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
    nav.classList.toggle('is-scrolled', scrollY > 40);
  }
  addEventListener('scroll', function(){ if (!tick){ tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  function measure(){
    var a = active && links.filter(function(l){ return l.getAttribute('data-id') === active; })[0];
    if (!a){ ind.style.opacity = 0; return; }
    ind.style.transform = 'translateX(' + a.offsetLeft + 'px)'; ind.style.width = a.offsetWidth + 'px'; ind.style.opacity = 1;
  }
  function setActive(id){
    active = id;
    links.forEach(function(l){ var on = l.getAttribute('data-id') === id; l.classList.toggle('is-active', on); if (on) l.setAttribute('aria-current','true'); else l.removeAttribute('aria-current'); });
    measure();
  }
  if ('IntersectionObserver' in window){
    var ids = ['hero','about','skills','work','experience','contact'];
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting) setActive(e.target.id === 'hero' ? null : e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach(function(id){ var el = document.getElementById(id); if (el) io.observe(el); });
  }
  addEventListener('resize', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  var menu = $('#menu'), burger = $('#burger'), close = $('#closeMenu');
  function open(){
    menu.classList.add('is-open'); menu.removeAttribute('inert'); menu.setAttribute('aria-hidden','false'); burger.setAttribute('aria-expanded','true');
    document.documentElement.style.overflow = 'hidden'; if (lenis) lenis.stop(); close.focus({ preventScroll: true });
  }
  function shut(){
    menu.classList.remove('is-open'); menu.setAttribute('inert',''); menu.setAttribute('aria-hidden','true'); burger.setAttribute('aria-expanded','false');
    document.documentElement.style.overflow = ''; if (lenis) lenis.start(); burger.focus({ preventScroll: true });
  }
  burger.addEventListener('click', open);
  close.addEventListener('click', shut);
  $$('a', menu).forEach(function(a){ a.addEventListener('click', function(){ menu.classList.remove('is-open'); menu.setAttribute('inert',''); menu.setAttribute('aria-hidden','true'); burger.setAttribute('aria-expanded','false'); document.documentElement.style.overflow = ''; if (lenis) lenis.start(); }); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && menu.classList.contains('is-open')) shut(); });
  addEventListener('resize', function(){ if (innerWidth >= 768 && menu.classList.contains('is-open')) shut(); });
})();

/* ---------- reveal on scroll ---------- */
(function(){
  var els = $$('.rv, .rv-mask');
  if (!('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('is-in'); }); return; }
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(function(e){ io.observe(e); });
  setTimeout(function(){ els.forEach(function(e){ e.classList.add('is-in'); }); }, 5000);
})();

/* ---------- hero: letters that lift, hanging ID card ---------- */
(function(){
  $$('.split').forEach(function(line){
    function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(c){
        if (c.nodeType === 3){
          var f = document.createDocumentFragment();
          c.textContent.split('').forEach(function(ch){
            if (ch === ' '){ f.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; f.appendChild(s);
          });
          node.replaceChild(f, c);
        } else if (c.nodeType === 1) walk(c);
      });
    }
    walk(line);
  });

  /* decorative barcode */
  (function(){
    var h = 2166136261, x = 0, out = '', seed = 'AAYUSH-THITE-DEVOPS';
    for (var i = 0; x < 196; i++){
      h = Math.imul(h ^ (seed.charCodeAt(i % seed.length) + i), 16777619) >>> 0;
      var w = 1 + (h % 3);
      if (i % 2 === 0) out += '<rect x="' + x + '" y="0" width="' + w + '" height="30" fill="#0d0d0d"/>';
      x += w + 1 + ((h >> 5) % 2);
    }
    $('#barcode').innerHTML = out;
  })();
  if (LOGOS.linux && $('#ctTux')) $('#ctTux').setAttribute('href', LOGOS.linux);
  if (CONFIG.email) $('#idFound').innerHTML = 'If found, say hello &middot; ' + esc(CONFIG.email);

  var card = $('#idCard'), pend = $('#pend'), flipped = false;
  function flip(){ flipped = !flipped; card.classList.toggle('is-flipped', flipped); card.setAttribute('aria-pressed', String(flipped)); $('.idc-front', card).setAttribute('aria-hidden', String(flipped)); $('.idc-back', card).setAttribute('aria-hidden', String(!flipped)); }
  card.addEventListener('click', flip);
  card.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); flip(); } });
  if (REDUCE) return;

  /* pendulum: the pointer pushes the card, a spring brings it back */
  var zone = pend.parentNode, raf = 0, visible = false, angle = 6, vel = 0, prev = performance.now(), impulse = 0, last = null;
  function frame(now){
    var dt = Math.min(.033, (now - prev) / 1000); prev = now;
    vel += impulse; impulse = 0;
    var target = Math.sin(now / 1700) * .9;
    vel += (-34 * (angle - target) - 2.6 * vel) * dt;
    angle += vel * dt; angle = Math.max(-24, Math.min(24, angle));
    pend.style.transform = 'rotate(' + angle.toFixed(3) + 'deg)';
    if (visible) raf = requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function(es){
    visible = es[0].isIntersecting; cancelAnimationFrame(raf);
    if (visible){ prev = performance.now(); raf = requestAnimationFrame(frame); }
  }).observe(zone);
  zone.addEventListener('pointermove', function(e){
    if (e.pointerType !== 'mouse') return;
    var now = performance.now();
    if (last){ var dt = Math.max(8, now - last.t), vx = (e.clientX - last.x) / dt; impulse += Math.max(-14, Math.min(14, vx * 7)); }
    last = { x: e.clientX, t: now };
  });
  zone.addEventListener('pointerleave', function(){ last = null; });
})();

/* ---------- about: buttons ---------- */
(function(){
  function btn(label, url, primary){
    var cls = 'btn ' + (primary ? 'btn-primary' : 'btn-secondary');
    return url ? '<a class="' + cls + '" href="' + esc(url) + '" target="_blank" rel="noopener">' + label + '</a>' : '<span class="' + cls + ' is-off" aria-disabled="true">' + label + '</span>';
  }
  $('#aboutBtns').innerHTML = btn('Résumé &darr;', CONFIG.resume, true) + btn('GitHub &#8599;', CONFIG.github, false) + btn('LinkedIn &#8599;', CONFIG.linkedin, false);
})();

/* ---------- skills: orbiting tool blocks ---------- */
var SK = [
  ['Gi','Git','Git','CI/CD','core','',      'Tracks every change to code and config, and sits under every pipeline here.',['All my builds']],
  ['Gh','GitHub','GitHub','CI/CD','core','github','Hosts repositories and triggers builds when code changes.',['Practice build repositories']],
  ['Mv','Maven','Maven','CI/CD','core','','Compiles, tests and packages Java projects into deployable artifacts.'],
  ['Je','Jenkins','Jenkins','CI/CD','core','jenkins','Automation server that runs build, test and deploy pipelines.',['NovaBank pipeline']],
  ['Sq','SonarQube','SonarQube','CI/CD','core','','Scans code for bugs and security issues before it ships.'],
  ['Ji','Jira','Jira','CI/CD','add','jira','Tracks work items and ties tasks to releases (basic use).'],
  ['Dc','Docker Compose','Compose','Containers','core','docker','Defines and runs multi-container apps from a single file.',['Local multi-container runs']],
  ['Do','Docker','Docker','Containers','core','docker','Packages an app and its dependencies into a portable image.',['NovaBank images','Local GitOps platform']],
  ['Ku','Kubernetes','Kubernetes','Containers','core','kubernetes','Schedules, scales and heals containers across a cluster.',['NovaBank environments','Local kind cluster']],
  ['He','Helm','Helm','Containers','add','','Packages Kubernetes manifests into reusable, configurable charts.'],
  ['Er','ECR','ECR','Containers','add','aws','AWS registry for storing and pulling container images.'],
  ['Ec','ECS','ECS','Containers','add','aws','AWS service for running containers without hand-managing servers.'],
  ['Ek','EKS','EKS','Containers','add','aws','Managed Kubernetes control plane on AWS.'],
  ['Tf','Terraform','Terraform','IaC & config','core','terraform','Describes infrastructure as code and applies it repeatably.'],
  ['An','Ansible','Ansible','IaC & config','core','ansible','Configures servers and deploys software with playbooks.'],
  ['E2','EC2','EC2','Cloud','core','aws','Virtual servers on AWS.',['NovaBank cloud layout']],
  ['Vp','VPC','VPC','Cloud','core','aws','Private network with subnets, routes and security rules.',['NovaBank cloud layout']],
  ['S3','S3','S3','Cloud','core','aws','Object storage for files, artifacts and backups.'],
  ['Ef','EFS','EFS','Cloud','core','aws','Shared network file system for multiple instances.'],
  ['Ia','IAM','IAM','Cloud','core','aws','Users, roles and permissions that control who can do what.'],
  ['Rd','RDS','RDS','Cloud','core','aws','Managed relational databases such as MySQL and PostgreSQL.'],
  ['Sn','SNS','SNS','Cloud','core','aws','Pub/sub notifications to email, SMS and other services.'],
  ['Az','Azure','Azure','Cloud','add','azure','Microsoft cloud, studied for multi-cloud exposure.'],
  ['Cw','CloudWatch','CloudWatch','Monitoring','core','aws','AWS metrics, logs and alarms.'],
  ['Ct','CloudTrail','CloudTrail','Monitoring','core','aws','Audit log of API activity in an AWS account.'],
  ['Pr','Prometheus','Prometheus','Monitoring','add','prometheus','Scrapes and stores time-series metrics.',['GitOps platform']],
  ['Gr','Grafana','Grafana','Monitoring','add','grafana','Dashboards and alerts on top of metrics.',['GitOps platform']],
  ['Li','Linux','Linux','Foundations','core','linux','The operating system under nearly every server and container.'],
  ['Sh','Shell scripting','Shell','Foundations','core','bash','Bash scripts that automate repetitive operations.'],
  ['Py','Python','Python','Foundations','add','python','General-purpose scripting for automation, APIs and data work.',['Automation scripts','Anomaly detection']],
  ['Ga','GitHub Actions','Actions','CI/CD','core','githubactions','Workflow automation inside GitHub: builds, tests and deploys on every push.',['Practice build repositories']],
  ['Aw','AWS','AWS','Cloud','core','aws','Amazon Web Services, the cloud platform my labs and projects run on.',['NovaBank cloud layout']],
  ['Sd','SDLC','SDLC','Ways of working','core','','The software development life cycle: plan, build, test, release and maintain, with each role owning a stage.',['All my builds']],
  ['Tc','Team collaboration','Teamwork','Ways of working','core','','Working across developers, leads, QA and UAT so every release has clear owners.',['NovaBank pipeline']],
  ['Vm','Azure Virtual Machines','VMs','Cloud','core','azure','Virtual servers on Azure, the counterpart to EC2.'],
  ['Vn','Azure Virtual Network','VNet','Cloud','core','azure','Private network with subnets and security rules, the counterpart to VPC.'],
  ['Bl','Azure Blob Storage','Blob Storage','Cloud','core','azure','Object storage for files and backups, the counterpart to S3.'],
  ['Af','Azure Files','Files','Cloud','core','azure','Managed file shares for multiple machines, the counterpart to EFS.'],
  ['Ei','Microsoft Entra ID','Entra ID','Cloud','core','azure','Identity and access management for users and apps, the counterpart to IAM.'],
  ['As','Azure SQL Database','SQL Database','Cloud','core','azure','Managed relational database, the counterpart to RDS.'],
  ['Eg','Azure Event Grid','Event Grid','Cloud','core','azure','Routes events and notifications between services, similar to SNS.'],
  ['Ak','AKS','AKS','Containers','core','azure','Managed Kubernetes on Azure, the counterpart to EKS.'],
  ['Ar','Azure Container Registry','ACR','Containers','core','azure','Registry for container images, the counterpart to ECR.'],
  ['Ac','Azure Container Instances','ACI','Containers','core','azure','Runs containers without managing servers, similar to ECS.'],
  ['Am','Azure Monitor','Monitor','Monitoring','core','azure','Metrics, logs and alerts on Azure, the counterpart to CloudWatch.'],
  ['Ad','Azure DevOps','Azure DevOps','CI/CD','core','azuredevops','Repos, pipelines and boards in one service, an alternative to GitHub with Actions or Jenkins.']
].map(function(r, i){ return {i:i+1, s:r[0], n:r[1], sh:r[2], c:r[3], l:r[4], logo:r[5], d:r[6], u:r[7] || ['Course labs']}; });

var LOGO_OV = {"Git": "git", "Maven": "maven", "SonarQube": "sonarqube", "Helm": "helm", "ECR": "ecr", "ECS": "ecs", "EKS": "eks", "EC2": "ec2", "VPC": "vpc", "S3": "s3", "EFS": "efs", "IAM": "iam", "RDS": "rds", "SNS": "sns", "CloudWatch": "cw", "CloudTrail": "ct", "Azure Virtual Machines": "vm", "Azure Virtual Network": "vnet", "Azure Blob Storage": "blob", "Azure Files": "afiles", "Microsoft Entra ID": "entra", "Azure SQL Database": "sqldb", "Azure Event Grid": "evgrid", "AKS": "aks", "Azure Container Registry": "acr", "Azure Container Instances": "aci", "Azure Monitor": "azmon"};
SK.forEach(function(s){ if (LOGO_OV[s.n]) s.logo = LOGO_OV[s.n]; });
var ICONS = {
  term: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9l3 3-3 3M13 15h4"/>',
  cicd: '<path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9"/><path d="M18.5 3v4.5H14M5.5 21v-4.5H10"/>',
  box: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12L4 7.5M12 12v9"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12.5l9 5 9-5"/><path d="M3 16.5l9 5 9-5"/>',
  cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 17.7 8.6 4 4 0 0 1 17 18z"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>'
};
var FLOW = [
  { t: 'Linux & Scripting', tag: 'The foundation under everything', icon: 'term', live: 'Shell scripts ready', groups: [{ tools: ['Linux','Shell scripting'] }] },
  { t: 'CI/CD & Version Control', tag: 'Build, test and ship code', icon: 'cicd', live: 'Commit, build, tests pass', groups: [{ tools: ['Git','GitHub','GitHub Actions','Jenkins','Maven','SonarQube','Jira'] }] },
  { t: 'Containers', tag: 'Package and run apps anywhere', icon: 'box', live: 'Image built and pushed', groups: [{ tools: ['Docker','Kubernetes','Helm','ECS','ECR','EKS','ACI','ACR','AKS'] }] },
  { t: 'Infrastructure as Code', tag: 'Create infrastructure from code', icon: 'layers', live: 'Infrastructure provisioned', groups: [{ tools: ['Terraform','Ansible'] }] },
  { t: 'Cloud Platforms', tag: 'Where it all runs', icon: 'cloud', live: 'Release deployed', groups: [{ big: true, tools: ['AWS','Azure'] }] },
  { t: 'Monitoring & Logging', tag: 'See what is happening', icon: 'chart', live: 'Healthy, feedback loops back', groups: [{ tools: ['Prometheus','Grafana','CloudWatch','CloudTrail','Monitor'] }] }
];
var CLOUD = { 'AWS': ['EC2','VPC','S3','EFS','IAM','RDS','SNS'], 'Azure': ['VMs','VNet','Blob Storage','Files','Entra ID','SQL Database','Event Grid'] };
var EQ = { 'EC2': 'Azure Virtual Machines', 'VPC': 'Azure Virtual Network', 'S3': 'Azure Blob Storage', 'EFS': 'Azure Files', 'IAM': 'Microsoft Entra ID', 'RDS': 'Azure SQL Database', 'SNS': 'Azure Event Grid', 'EKS': 'AKS', 'ECR': 'Azure Container Registry', 'ECS': 'Azure Container Instances', 'CloudWatch': 'Azure Monitor', 'Jenkins': 'Azure DevOps', 'GitHub Actions': 'Azure DevOps' };
(function(){
  var root = $('#fl'), tip = $('#sgTip'), shown = null, ht = 0;
  var byName = {}, bySh = {}; SK.forEach(function(s){ byName[s.n] = s; bySh[s.sh] = s; });
  var rev = {}; Object.keys(EQ).forEach(function(k){ if (!rev[EQ[k]]) rev[EQ[k]] = k; });
  var two = function(n){ return String(n).padStart(2, '0'); };
  function svg(k){ return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + '</svg>'; }
  function chip(n, k, node, big){
    var s = byName[n] || bySh[n]; if (!s) return null;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'fl-c' + (big ? ' big' : '');
    b.style.setProperty('--k', k); b.style.setProperty('--bd', (3.6 + (k * 7 + node * 3) % 5 * .5).toFixed(1) + 's');
    b.innerHTML = (s.logo && LOGOS[s.logo] ? '<img src="' + LOGOS[s.logo] + '" alt="">' : '<span class="sy">' + esc(s.s) + '</span>') + '<span>' + esc(s.sh) + '</span>';
    b.setAttribute('aria-label', s.n + ': ' + s.d);
    b.addEventListener('mouseenter', function(){ clearTimeout(ht); show(b, s); });
    b.addEventListener('mouseleave', function(){ clearTimeout(ht); ht = setTimeout(hide, 140); });
    b.addEventListener('focus', function(){ show(b, s); });
    b.addEventListener('blur', hide);
    b.addEventListener('click', function(e){ e.stopPropagation(); if (shown === b) hide(); else show(b, s); });
    return b;
  }
  var bar = document.createElement('div'); bar.className = 'fl-bar';
  bar.innerHTML = '<p class="fl-cap"><i></i>Scroll to run one release, end to end</p>';
  root.appendChild(bar);
  var track = document.createElement('div'); track.className = 'fl-track';
  var nodes = [];
  FLOW.forEach(function(f, i){
    var node = document.createElement('div'); node.className = 'fl-node';
    node.innerHTML = '<div class="fl-ico">' + svg(f.icon) + '</div><p class="fl-k">' + two(i + 1) + '</p><h3>' + esc(f.t) + '</h3><p class="fl-tag">' + esc(f.tag) + '</p><p class="fl-live"><i></i><span>' + esc(f.live) + '</span></p>';
    var k = 0;
    f.groups.forEach(function(g){
      if (g.label){ var h = document.createElement('p'); h.className = 'fl-grp'; h.innerHTML = (g.logo && LOGOS[g.logo] ? '<img src="' + LOGOS[g.logo] + '" alt="">' : '') + '<span>' + esc(g.label) + '</span>'; node.appendChild(h); }
      var box = document.createElement('div'); box.className = 'fl-chips';
      g.tools.forEach(function(n){ var c = chip(n, k++, i, g.big); if (c) box.appendChild(c); });
      node.appendChild(box);
      if (g.big){ var hn = document.createElement('p'); hn.className = 'fl-hint'; hn.textContent = 'Hover or tap a cloud to see its services'; node.appendChild(hn); }
    });
    node.style.setProperty('--i', i);
    track.appendChild(node); nodes.push(node);
  });
  var pk = document.createElement('span'); pk.className = 'fl-pk'; pk.setAttribute('aria-hidden', 'true'); track.appendChild(pk);
  root.appendChild(track);

  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('is-in'); } }); }, { threshold: .08 }) : null;
  nodes.forEach(function(n){ if (io) io.observe(n); else n.classList.add('is-in'); });

  /* the release animation follows the scroll: each stage lights up as you scroll down, and rewinds as you scroll up */
  var idx = -2, tk = 0;
  function place(i){
    var ico = $('.fl-ico', nodes[i]), tr = track.getBoundingClientRect(), r = ico.getBoundingClientRect();
    pk.style.left = (r.left - tr.left + r.width / 2) + 'px'; pk.style.top = (r.top - tr.top + r.height / 2) + 'px';
  }
  function upd(){
    tk = 0;
    var r = track.getBoundingClientRect(), vh = innerHeight;
    var p = (vh * .92 - r.top) / Math.max(1, Math.min(r.height * 1.7 + vh * .4, r.height + vh * .55));
    var n = REDUCE ? nodes.length - 1 : (p <= 0 ? -1 : Math.min(nodes.length - 1, Math.floor(p * nodes.length)));
    track.classList.toggle('fin', n === nodes.length - 1);
    if (n === idx) return;
    idx = n;
    nodes.forEach(function(x, j){ x.classList.toggle('done', j < n); x.classList.toggle('live', j === n); });
    pk.classList.toggle('on', n >= 0);
    if (n >= 0) place(n);
  }
  function req(){ if (!tk) tk = requestAnimationFrame(upd); }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', function(){ var k = idx; idx = -2; upd(); });
  upd();

  function show(b, s){
    hide(true);
    shown = b; b.classList.add('on');
    if (CLOUD[s.n]){
      var rows = CLOUD[s.n].map(function(n){ var x = bySh[n]; return x ? '<li><img src="' + LOGOS[x.logo] + '" alt=""><span><b>' + esc(x.sh) + '</b>' + esc(x.d) + '</span></li>' : ''; }).join('');
      tip.className = 'sg-tip big'; tip.innerHTML = '<div class="tt"><img src="' + LOGOS[s.logo] + '" alt=""><h4>' + esc(s.n) + ' services I use</h4></div><ul class="cl">' + rows + '</ul>';
      place2(b); return;
    }
    tip.className = 'sg-tip';
    var used = s.u && s.u[0] !== 'Course labs' ? '<p class="sv">Used in: ' + s.u.map(esc).join(', ') + '</p>' : '';
    var eq = EQ[s.n] ? '<p class="sv">Azure counterpart: ' + esc(EQ[s.n]) + '</p>' : (rev[s.n] ? '<p class="sv">AWS counterpart: ' + esc(rev[s.n]) + '</p>' : '');
    tip.innerHTML = '<div class="tt">' + (s.logo && LOGOS[s.logo] ? '<img src="' + LOGOS[s.logo] + '" alt="">' : '<span class="sy">' + esc(s.s) + '</span>') + '<h4>' + esc(s.n) + '</h4></div><p>' + esc(s.d) + '</p>' + eq + used;
    place2(b);
  }
  function place2(b){
    var r = b.getBoundingClientRect(), tw = tip.offsetWidth || 300, th = tip.offsetHeight || 130;
    var x = Math.max(12, Math.min(innerWidth - tw - 12, r.left + r.width / 2 - tw / 2));
    var y = r.top - th - 12; if (y < 76) y = r.bottom + 12;
    if (tip.classList.contains('big') && innerWidth > 1200){ x = Math.max(12, r.left - tw - 16); y = r.top - 24; }
    if (y + th > innerHeight - 8) y = Math.max(76, innerHeight - th - 8);
    tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.classList.add('show'); tip.setAttribute('aria-hidden', 'false');
  }
  tip.addEventListener('mouseenter', function(){ clearTimeout(ht); });
  tip.addEventListener('mouseleave', function(){ clearTimeout(ht); ht = setTimeout(hide, 140); });
  function hide(keep){
    if (shown){ shown.classList.remove('on'); shown = null; }
    if (keep !== true){ tip.classList.remove('show'); tip.setAttribute('aria-hidden', 'true'); }
  }
  document.addEventListener('click', function(){ hide(); });
  addEventListener('scroll', function(){ if (shown) hide(); }, { passive: true });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') hide(); });
})();

var WORK = [
  { key:'nova', n:'NovaBank microservices pipeline', type:'CI/CD pipeline', when:'2026',
    sum:'A banking-style microservices app taken from commit to Kubernetes, modelled on how a real team ships. Each environment has its own owner, and every release follows the same automated path.',
    pts:['Jenkins pipeline: checkout, build, test, image, push, deploy','Docker images published to Docker Hub','Kubernetes releases across QA, UAT and Prod','AWS layout with VPCs, subnets and EC2 hosts'],
    stack:['Jenkins','Docker','Docker Hub','Kubernetes','AWS'], mock:'nova' },
  { key:'tier', n:'Three-tier practice app', type:'Containers', when:'2026',
    sum:'A web app split into the classic three tiers: a browser frontend, a backend API and a relational database. It compiles, containerises and builds through Jenkins, and gives me a safe place to break and fix a pipeline.',
    pts:['HTML, CSS and JS frontend talking to a backend API','MySQL or PostgreSQL behind the API','Containerised and built by Jenkins','Stored on GitHub for repeat practice'],
    stack:['Docker','Jenkins','MySQL / PostgreSQL','GitHub'], mock:'tier' },
  { key:'gitops', n:'Local GitOps platform', type:'Platform engineering', when:'2026',
    sum:'A platform that runs on my own machine in a kind cluster. Changes in Git sync to the cluster, Prometheus and Grafana watch the metrics, and a Python anomaly detection model flags unusual behaviour.',
    pts:['Git as the source of truth for the cluster','Prometheus metrics with Grafana dashboards','Anomaly detection on the metric stream','Runs locally on kind, no cloud bill'],
    stack:['Kubernetes (kind)','Prometheus','Grafana','Python','Helm'], mock:'gitops' }
];

var MOCKS = {
  /* rolling deploy: stages fill, pods swap one by one, environments take turns going live */
  nova: function(){
    return { html:
      '<div class="mock-bar"><i></i><i></i><i></i><span>Jenkins &middot; novabank / main</span><em>live</em></div>' +
      '<div class="mock-body"><ol class="stg">' + ['Checkout','Build','Test','Image','Push','Deploy'].map(function(s){ return '<li><i></i>' + s + '</li>'; }).join('') + '</ol>' +
      '<div><div class="cap"><span>novabank-api &middot; 8 pods</span><span data-ver>v1</span></div><div class="pods" style="margin-top:8px">' + new Array(9).join('<i class="pod"></i>') + '</div></div>' +
      '<div class="envs"><span class="env">QA</span><span class="env">UAT</span><span class="env">Prod</span></div>' +
      '<pre class="log" data-log></pre></div>' +
      '<div class="mock-foot"><span>Illustrative UI</span><button class="btn btn-primary btn-sm" type="button" data-run>Deploy now</button></div>',
      init: function(root){
        var st = $$('.stg li', root), pods = $$('.pod', root), envs = $$('.env', root), log = $('[data-log]', root), ver = $('[data-ver]', root), btn = $('[data-run]', root);
        var names = ['Checkout','Build','Test','Image','Push','Deploy'];
        var lines = ['checking out main','mvn package','running unit tests','docker build','docker push','kubectl rollout restart'];
        var timers = [], alive = false, busy = false, envI = -1, round = 1;
        function T(fn, ms){ timers.push(setTimeout(fn, REDUCE ? 20 : ms)); }
        function put(t){ var a = (log.textContent ? log.textContent + '\n' : '') + t; log.textContent = a.split('\n').slice(-6).join('\n'); }
        function clear(){ timers.forEach(clearTimeout); timers = []; }
        function reset(){
          st.forEach(function(s){ s.className = ''; });
          pods.forEach(function(p){ p.className = 'pod'; });
          ver.textContent = 'v' + round;
        }
        function cycle(){
          if (!alive) { busy = false; return; }
          busy = true; reset(); log.textContent = ''; step(0);
        }
        function step(i){
          if (!alive){ busy = false; return; }
          if (i > 0) st[i-1].className = 'ok';
          if (i === 6) return finish();
          st[i].className = 'run'; put('[' + names[i] + '] ' + lines[i]);
          if (i === 5) roll(0); else T(function(){ step(i + 1); }, 680);
        }
        function roll(k){
          if (!alive){ busy = false; return; }
          if (k >= pods.length){ ver.textContent = 'v' + (round + 1); return T(function(){ step(6); }, 300); }
          pods[k].className = 'pod roll';
          T(function(){ pods[k].className = 'pod v2'; roll(k + 1); }, 240);
        }
        function finish(){
          envI = (envI + 1) % 3;
          envs.forEach(function(e, i){ e.classList.toggle('live', i === envI); });
          put('rolled out to ' + envs[envI].textContent);
          round++; busy = false;
          T(cycle, 3400);
        }
        btn.addEventListener('click', function(){ clear(); alive = true; cycle(); });
        return {
          start: function(){ if (alive) return; alive = true; if (!busy) cycle(); },
          stop: function(){ alive = false; clear(); busy = false; }
        };
      } };
  },
  /* working add-item form: the request travels browser, API, database and a new row appears */
  tier: function(){
    return { html:
      '<div class="mock-bar"><i></i><i></i><i></i><span>three-tier &middot; request flow</span><em>live</em></div>' +
      '<div class="mock-body"><div class="tiers"><div class="tier">Browser<small>HTML, CSS, JS</small></div><div class="wire"><i class="pkt"></i></div><div class="tier">API<small>backend</small></div><div class="wire"><i class="pkt"></i></div><div class="tier">Database<small>MySQL / Postgres</small></div></div>' +
      '<form class="addf" data-form><input id="tier-in" type="text" placeholder="Add a task, e.g. tag the image" aria-label="New task" autocomplete="off"><button class="btn btn-primary btn-sm" type="submit">Add</button></form>' +
      '<p class="resp" data-resp>Add a task and watch it travel through the tiers.</p>' +
      '<ul class="rows" data-rows aria-label="Rows stored in the database"></ul></div>' +
      '<div class="mock-foot"><span>Illustrative UI</span><span>auto demo on</span></div>',
      init: function(root){
        var tiers = $$('.tier', root), pk = $$('.pkt', root), resp = $('[data-resp]', root), rows = $('[data-rows]', root), form = $('[data-form]', root), input = $('input', root);
        var samples = ['write the Dockerfile','tag the image','push to Docker Hub','roll out to QA','check the dashboards'];
        var id = 0, busy = false, alive = false, idle = 0, auto = 0, si = 0;
        function fly(p, rev){
          if (REDUCE) return Promise.resolve();
          p.style.opacity = 1;
          var a = p.animate([{left: rev ? 'calc(100% - 10px)' : '0'},{left: rev ? '0' : 'calc(100% - 10px)'}], {duration: 460, easing: 'ease-in-out', fill: 'forwards'});
          return a.finished.then(function(){ p.style.opacity = 0; });
        }
        function hit(i){ tiers.forEach(function(t, j){ t.classList.toggle('hit', i === j); }); }
        function addRow(text){
          id++;
          var li = document.createElement('li'); li.innerHTML = '<span>id ' + String(id).padStart(2,'0') + '</span><span>' + esc(text) + '</span>';
          rows.insertBefore(li, rows.firstChild);
          while (rows.children.length > 3) rows.removeChild(rows.lastChild);
        }
        async function send(text){
          if (busy) return; busy = true;
          resp.textContent = 'POST /items';
          hit(0); await fly(pk[0]);
          hit(1); resp.textContent = 'API validates and writes'; await fly(pk[1]);
          hit(2); resp.textContent = 'INSERT INTO items'; await sleep(260);
          await fly(pk[1], true); hit(1); await fly(pk[0], true); hit(0);
          addRow(text); resp.textContent = '201 Created'; await sleep(600); hit(-1);
          busy = false;
        }
        form.addEventListener('submit', function(e){
          e.preventDefault(); idle = Date.now();
          var v = input.value.trim() || samples[si++ % samples.length]; input.value = '';
          send(v);
        });
        input.addEventListener('input', function(){ idle = Date.now(); });
        addRow('write the Dockerfile'); addRow('tag the image'); rows.lastChild.style.animation = 'none';
        return {
          start: function(){
            if (alive) return; alive = true;
            if (!REDUCE) auto = setInterval(function(){ if (!busy && Date.now() - idle > 9000) send(samples[si++ % samples.length]); }, 3200);
          },
          stop: function(){ alive = false; clearInterval(auto); auto = 0; }
        };
      } };
  },
  /* streaming metric with live anomaly flagging, plus a Git change that syncs to the cluster */
  gitops: function(){
    return { html:
      '<div class="mock-bar"><i></i><i></i><i></i><span>kind-cluster &middot; request latency</span><em>live</em></div>' +
      '<div class="mock-body"><div class="sync"><span class="chip">git: main</span><span class="ar">&rarr;</span><span class="chip good" data-sync>Synced</span><span class="ar">&rarr;</span><span class="chip" data-pods>3 pods</span></div>' +
      '<svg class="chart" viewBox="0 0 360 150" role="img" aria-label="Streaming latency chart"><line class="gr" x1="0" y1="37" x2="360" y2="37"/><line class="gr" x1="0" y1="75" x2="360" y2="75"/><line class="gr" x1="0" y1="113" x2="360" y2="113"/><line class="th" x1="0" y1="30" x2="360" y2="30"/><polyline class="pl" points=""/><g class="dots"></g></svg>' +
      '<div class="m-actions"><span class="badge" data-badge>Normal</span><div class="two"><button class="btn btn-secondary btn-sm" type="button" data-push>Push change</button><button class="btn btn-primary btn-sm" type="button" data-inj>Inject anomaly</button></div></div></div>' +
      '<div class="mock-foot"><span>Illustrative UI</span><span>Prometheus &rarr; Python model</span></div>',
      init: function(root){
        var pl = $('.pl', root), dots = $('.dots', root), badge = $('[data-badge]', root), sync = $('[data-sync]', root), podsEl = $('[data-pods]', root);
        var N = 48, d = [], timer = 0, spike = 0, alive = false, pods = 3, syncing = false, auto = 0, tickN = 0;
        for (var i = 0; i < N; i++) d.push(60 + Math.sin(i * .5) * 6 + Math.sin(i * 2.3) * 3);
        function y(v){ return 150 - v * 1.2; }
        function render(){
          pl.setAttribute('points', d.map(function(v, i){ return (i * 360 / (N - 1)).toFixed(1) + ',' + Math.max(4, y(v)).toFixed(1); }).join(' '));
          var base = d.slice(0, 30), m = base.reduce(function(a, b){ return a + b; }, 0) / base.length;
          var sd = Math.sqrt(base.reduce(function(a, b){ return a + (b - m) * (b - m); }, 0) / base.length) || 1;
          var out = '', any = false;
          d.forEach(function(v, i){ if (i > 30 && v > m + 3 * sd + 6){ any = true; out += '<circle class="an" cx="' + (i * 360 / (N - 1)).toFixed(1) + '" cy="' + Math.max(4, y(v)).toFixed(1) + '" r="4"/>'; } });
          dots.innerHTML = out;
          badge.className = 'badge' + (any ? ' bad' : ''); badge.textContent = any ? 'Anomaly flagged' : 'Normal';
        }
        function tick(){
          tickN++; d.shift(); var v = 60 + Math.sin(tickN / 2.2) * 6 + (Math.random() * 6 - 3);
          if (spike){ v += 38; spike = 0; }
          d.push(v); render();
        }
        async function push(){
          if (syncing) return; syncing = true;
          sync.className = 'chip warn'; sync.textContent = 'OutOfSync'; await sleep(900);
          sync.className = 'chip syn'; sync.textContent = 'Syncing'; await sleep(1100);
          pods = pods >= 5 ? 3 : pods + 1; podsEl.textContent = pods + ' pods';
          sync.className = 'chip good'; sync.textContent = 'Synced'; syncing = false;
        }
        $('[data-push]', root).addEventListener('click', push);
        $('[data-inj]', root).addEventListener('click', function(){ spike = 1; if (REDUCE) tick(); });
        render();
        return {
          start: function(){
            if (alive || REDUCE) { alive = true; return; }
            alive = true; timer = setInterval(tick, 420);
            var n = 0; auto = setInterval(function(){ n++; if (n % 3 === 0) push(); else if (n % 3 === 1) spike = 1; }, 5200);
          },
          stop: function(){ alive = false; clearInterval(timer); clearInterval(auto); timer = auto = 0; }
        };
      } };
  }
};



WORK = [
  { key:'ollama', n:'Local AI chatbot with Ollama', type:'Local LLM lab', when:'2026',
    sum:'A personal lab for running a language model on my own machine instead of a hosted AI API. A Python command-line chat and a browser chat page both talk to the same local Ollama service, which runs the Qwen 2.5 1.5B model.',
    pts:['Python CLI that keeps context, with /clear and /exit','Browser chat that streams replies and shows generation stats','Model selection, stop and clear controls','All inference stays local through the Ollama API'],
    stack:['Ollama','Qwen 2.5 1.5B','Python','HTML, CSS, JS'], mock:'ollama' },
  { key:'nova', n:'NovaBank microservices pipeline', type:'CI/CD pipeline', when:'2026',
    sum:'A banking-style microservices app taken from commit to Kubernetes, modelled on how a real team ships. Each environment has its own owner, and every release follows the same automated path.',
    pts:['Jenkins pipeline: checkout, build, test, image, push, deploy','Docker images published to Docker Hub','Kubernetes releases across QA, UAT and Prod','AWS layout with VPCs, subnets and EC2 hosts'],
    stack:['Jenkins','Docker','Docker Hub','Kubernetes','AWS'], mock:'nova' },
  { key:'gitops', n:'Local GitOps platform', type:'Platform engineering', when:'2026',
    sum:'A platform that runs on my own machine in a kind cluster. Changes in Git sync to the cluster, Prometheus and Grafana watch the metrics, and a Python anomaly detection model flags unusual behaviour.',
    pts:['Git as the source of truth for the cluster','Prometheus metrics with Grafana dashboards','Anomaly detection on the metric stream','Runs locally on kind, no cloud bill'],
    stack:['Kubernetes (kind)','Prometheus','Grafana','Python','Helm'], mock:'gitops' },
  { key:'tideline', n:'Tideline internal developer platform', type:'Platform engineering', when:'2026',
    sum:'A small internal developer platform on a laptop: add a folder to Git and get a deployed, monitored, policy-checked service.',
    pts:['FastAPI portal and shared Helm chart','Argo CD syncs every folder in Git to the cluster','Kyverno policy guardrails','ML anomaly detection per service'],
    stack:['Kubernetes','Argo CD','Kyverno','Prometheus','Grafana','FastAPI'], mock:'tideline' }
];

/* simple project visuals: a short path that lights up step by step */
(function(){
  var D = {
    nova: ['From a code change to production', [['git','Code','A change is pushed to Git'],['jenkins','Build and test','Jenkins builds it and runs the tests'],['docker','Package','A Docker image is pushed to Docker Hub'],['kubernetes','Deploy','Kubernetes rolls it out to QA, then UAT, then Prod'],['ec2','Run on AWS','VPCs, subnets and EC2 hosts']]],
    ollama: ['How a message gets answered', [['\uD83D\uDCAC','Chat','Python CLI or a streaming web page'],['\uD83E\uDD99','Ollama API','Both talk to localhost:11434'],['\uD83E\uDDE0','Qwen 2.5 (1.5B)','The model runs on my own machine'],['\u26A1','Streamed reply','Words appear as they are generated']]],
    tideline: ['From a Git folder to a monitored service', [['\uD83E\uDDED','Developer portal','FastAPI generates the service config'],['git','Git','Add a folder and push'],['kubernetes','Argo CD and Kubernetes','Argo CD syncs it to the kind cluster'],['\uD83D\uDEE1\uFE0F','Kyverno guardrails','Blocks unsafe or incomplete pods'],['prometheus','Prometheus and Grafana','Request rate, errors and latency'],['python','Anomaly detector','Isolation Forest flags unusual services']]],
    gitops: ['From Git to dashboards', [['git','Git','The source of truth for the cluster'],['kubernetes','Kubernetes (kind)','Changes sync to the local cluster'],['prometheus','Prometheus','Collects the metrics'],['grafana','Grafana','Shows the dashboards'],['python','Python model','Flags unusual behaviour']]]
  };
  Object.keys(D).forEach(function(k){
    MOCKS[k] = function(){
      var d = D[k];
      return { html: '<div class="sm"><p class="sm-h">' + d[0] + '</p><ol class="sm-l">' + d[1].map(function(s){
        return '<li><span class="sm-i">' + (LOGOS[s[0]] ? '<img src="' + LOGOS[s[0]] + '" alt="">' : s[0]) + '</span><div><b>' + esc(s[1]) + '</b><em>' + esc(s[2]) + '</em></div></li>'; }).join('') + '</ol></div>',
        init: function(root){
          var li = $$('li', root), i = -1, iv = 0;
          function tick(){ i = (i + 1) % (li.length + 1); li.forEach(function(x, j){ x.classList.toggle('on', j === i); x.classList.toggle('past', j < i); }); }
          if (REDUCE){ li.forEach(function(x){ x.classList.add('past'); }); }
          return { start: function(){ if (REDUCE || iv) return; tick(); iv = setInterval(tick, 1200); }, stop: function(){ clearInterval(iv); iv = 0; } };
        } };
    };
  });
})();

/* ---------- projects: stacking deck with live demos ---------- */
(function(){
  var row = $('#workRow'), inst = {};
  row.innerHTML = WORK.map(function(w, i){
    var url = CONFIG.repos && CONFIG.repos[w.key];
    var repo = url ? '<a class="btn btn-primary btn-sm wk-repo" href="' + esc(url) + '" target="_blank" rel="noopener">View on GitHub <span aria-hidden="true">&#8599;</span></a>' : '<p class="wk-repo off">Repository link coming soon</p>';
    var n = String(i + 1).padStart(2, '0');
    return '<article class="pj" role="listitem" data-i="' + i + '" style="--k:' + i + '" aria-labelledby="pj-t-' + i + '"><div class="pj-left">' +
      '<span class="pj-num" aria-hidden="true">' + n + '</span>' +
      '<p class="wk-kick" style="margin-top:14px">' + esc(w.type) + ' &middot; ' + w.when + '</p><h3 class="pj-title" id="pj-t-' + i + '">' + esc(w.n) + '</h3><p class="wk-desc">' + esc(w.sum) + '</p>' +
      '<ul class="wk-feat">' + w.pts.map(function(p){ return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
      '<ul class="wk-tech" aria-label="Technologies">' + w.stack.map(function(s){ return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' + repo +
      '</div><div class="pj-right"><div class="wk-vis" data-lenis-prevent><div class="mock" data-mock="' + i + '">' + MOCKS[w.mock]().html + '</div></div><p class="wk-cap">How this project works</p></div></article>';
  }).join('');
  var cards = $$('.pj', row);
  WORK.forEach(function(w, i){ inst[i] = MOCKS[w.mock]().init($('[data-mock="' + i + '"]', row)); });

  if ('IntersectionObserver' in window){
    var pio = new IntersectionObserver(function(es){ es.forEach(function(e){
      var i = +e.target.getAttribute('data-i');
      if (e.isIntersecting){ e.target.classList.add('is-in'); inst[i].start(); } else inst[i].stop();
    }); }, { threshold: .3 });
    cards.forEach(function(c){ pio.observe(c); });
  } else cards.forEach(function(c, i){ c.classList.add('is-in'); inst[i].start(); });

  /* earlier cards shrink slightly as the next one slides over them */
  var mq = window.matchMedia('(max-width:899px)'), tick = 0;
  function stack(){
    tick = 0;
    cards.forEach(function(c, i){
      if (mq.matches || REDUCE || i === cards.length - 1){ c.style.transform = ''; return; }
      var nx = cards[i + 1], nr = nx.getBoundingClientRect(), stick = parseFloat(getComputedStyle(nx).top) || 0;
      var p = Math.max(0, Math.min(1, 1 - (nr.top - stick) / Math.max(1, c.offsetHeight * .9)));
      c.style.transform = p > 0 ? 'scale(' + (1 - .045 * p).toFixed(4) + ')' : '';
    });
  }
  function req(){ if (!tick) tick = requestAnimationFrame(stack); }
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); stack();
})();

/* ---------- experience: card timeline, dotted line fills black on scroll ---------- */
(function(){
  var items = [
    ['Training','Full-time DevOps and AWS Cloud training','Hands-on labs, mock interviews and four hands-on builds','Feb 2026 – now','now'],
    ['Experience','Area Sales Manager','Redington India Limited','Until Feb 2026',''],
    ['Experience','Senior Technical Business Specialist, Enterprise Cloud','TSL Consulting Pvt. Ltd., Pune','Dec 2021 – Oct 2023',''],
    ['Education','B.Sc Computer Science','University of Pune','2021','']
  ];
  var list = $('#expList');
  list.innerHTML = items.map(function(x){
    return '<li class="exp-item ' + x[4] + '" data-stop><span class="exp-dot" aria-hidden="true"></span><article class="card exp-card rv"><div><p class="exp-kind">' + x[0] + '</p><h3 class="exp-title">' + esc(x[1]) + '</h3><p class="exp-org">' + esc(x[2]) + '</p></div><p class="exp-period">' + esc(x[3]) + '</p></article></li>';
  }).join('');
  $$('.rv', list).forEach(function(e){ if ('IntersectionObserver' in window){ var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('is-in'); io.unobserve(en.target); } }); }, { threshold: .12 }); io.observe(e); } else e.classList.add('is-in'); });
  var lis = $$('li[data-stop]', list), tick = false;
  function update(){
    tick = false;
    var r = list.getBoundingClientRect(), vh = innerHeight;
    var p = REDUCE ? 1 : Math.min(1, Math.max(0, (vh * .6 - r.top) / (r.height + vh * .1)));
    var fill = p * list.offsetHeight;
    list.style.setProperty('--fill', fill + 'px');
    lis.forEach(function(li){ li.classList.toggle('on', li.offsetTop + 30 <= fill); });
  }
  addEventListener('scroll', function(){ if (!tick){ tick = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
})();

/* ---------- contact ---------- */
(function(){
  function letters(text, accent){
    return text.split(' ').map(function(w){
      return '<span class="ct-word" aria-hidden="true">' + w.split('').map(function(c){ return '<span class="ct-l' + (accent ? ' accent' : '') + '">' + esc(c) + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $('#ctL1').innerHTML = letters("Let's build");
  $('#ctL2').innerHTML = letters('something') + ' ' + letters('together.', true);
  $$('.ct-l').forEach(function(el){
    el.addEventListener('pointerenter', function(){ if (!el.classList.contains('hop')) el.classList.add('hop'); });
    el.addEventListener('animationend', function(){ el.classList.remove('hop'); });
  });

  var mail = $('#ctMail');
  if (CONFIG.email){
    mail.innerHTML = '<a class="ct-email" href="mailto:' + esc(CONFIG.email) + '" id="mailTxt">' + esc(CONFIG.email) + '</a><button type="button" class="ct-copy" id="copyBtn" aria-label="Copy email address">Copy</button><span class="sr-only" role="status" aria-live="polite" id="copyLive" style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)"></span>';
    var cb = $('#copyBtn'), t;
    cb.addEventListener('click', function(){
      function done(){ cb.textContent = 'Copied ✓'; $('#copyLive').textContent = 'Email address copied'; clearTimeout(t); t = setTimeout(function(){ cb.textContent = 'Copy'; $('#copyLive').textContent = ''; }, 2000); }
      function fb(){ var r = document.createRange(); r.selectNodeContents($('#mailTxt')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); cb.textContent = 'Press Ctrl+C'; }
      try { navigator.clipboard.writeText(CONFIG.email).then(done, fb); } catch(e){ fb(); }
    });
  } else {
    mail.innerHTML = '<span class="ct-email off">Email not added yet</span><button type="button" class="ct-copy" disabled>Copy</button>';
  }

  function row(label, text, url, ext){
    var inner = '<span class="mono">' + label + '</span><span class="ct-lt">' + (text ? esc(text) : 'Not added yet') + '</span><span class="ct-ar" aria-hidden="true">&#8599;</span>';
    if (!text || !url) return '<li><div class="off">' + inner + '</div></li>';
    return '<li><a href="' + esc(url) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + inner + '</a></li>';
  }
  $('#ctLinks').innerHTML =
    row('GitHub', CONFIG.github.replace(/^https?:\/\//, ''), CONFIG.github, true) +
    row('LinkedIn', CONFIG.linkedin.replace(/^https?:\/\//, ''), CONFIG.linkedin, true);
})();

/* ---------- v8: hero dot field, ghost parallax, magnetic buttons ---------- */
(function(){
  var hero = $('#hero'), cv = $('#heroDots'); if (!hero || !cv) return;
  var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, GAP = 30, pts = [], mx = -999, my = -999, inside = false, raf = 0, vis = true;
  var ghost = $('.hero-ghost', hero);
  function size(){
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pts = [];
    var cols = Math.ceil(W / GAP) + 1, rows = Math.ceil(H / GAP) + 1;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) pts.push({ x: c * GAP + (r % 2 ? GAP / 2 : 0), y: r * GAP, dx: 0, dy: 0, vx: 0, vy: 0 });
  }
  function draw(t){
    ctx.clearRect(0, 0, W, H);
    var R = 150, i, p, ax, ay, d, f, s, a;
    for (i = 0; i < pts.length; i++){
      p = pts[i];
      if (inside && !REDUCE){
        ax = p.x + p.dx - mx; ay = p.y + p.dy - my; d = Math.sqrt(ax * ax + ay * ay);
        if (d < R && d > .1){ f = (1 - d / R); p.vx += ax / d * f * 2.2; p.vy += ay / d * f * 2.2; }
      }
      p.vx += -p.dx * .09; p.vy += -p.dy * .09; p.vx *= .82; p.vy *= .82; p.dx += p.vx; p.dy += p.vy;
      var wave = REDUCE ? 0 : Math.sin(t / 1400 + p.x * .012 + p.y * .01) * .5 + .5;
      d = inside ? Math.sqrt(Math.pow(p.x - mx, 2) + Math.pow(p.y - my, 2)) : 999;
      s = 1.1 + wave * .5 + (d < R ? (1 - d / R) * 1.9 : 0);
      a = .11 + wave * .05 + (d < R ? (1 - d / R) * .45 : 0);
      ctx.fillStyle = 'rgba(13,13,13,' + a.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x + p.dx, p.y + p.dy, s, 0, 6.2832); ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }
  function start(){ if (!raf && vis) raf = requestAnimationFrame(draw); }
  function stop(){ cancelAnimationFrame(raf); raf = 0; }
  size();
  if (REDUCE){ draw(0); stop(); } else start();
  var rt; addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ size(); if (REDUCE) draw(0); }, 120); });
  hero.addEventListener('pointermove', function(e){
    if (e.pointerType === 'touch') return;
    var b = hero.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; inside = true;
    if (ghost && !REDUCE) ghost.style.translate = (-(mx / b.width - .5) * 36).toFixed(1) + 'px ' + (-(my / b.height - .5) * 16).toFixed(1) + 'px';
  });
  hero.addEventListener('pointerleave', function(){ inside = false; if (ghost) ghost.style.translate = '0 0'; });
  if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ vis = es[0].isIntersecting; if (vis) start(); else stop(); }, { threshold: 0 }).observe(hero);
})();
(function(){
  if (REDUCE || !matchMedia('(hover:hover)').matches) return;
  $$('.btn:not(.is-off), .ct-copy').forEach(function(el){
    el.addEventListener('pointermove', function(e){
      var b = el.getBoundingClientRect();
      el.style.translate = ((e.clientX - b.left - b.width / 2) * .22).toFixed(1) + 'px ' + ((e.clientY - b.top - b.height / 2) * .3).toFixed(1) + 'px';
    });
    el.addEventListener('pointerleave', function(){ el.style.translate = '0 0'; });
  });
})();

/* ---------- v9: visible flip button, peek hint, hero tool chips ---------- */
(function(){
  var inner = $('#idCard .idc-inner'), card = $('#idCard');
  if (inner && !REDUCE){
    var done = false;
    card.addEventListener('click', function(){ done = true; });
    setTimeout(function(){
      if (done || card.classList.contains('is-flipped')) return;
      inner.classList.add('peek');
      inner.addEventListener('animationend', function(){ inner.classList.remove('peek'); }, { once: true });
    }, 2600);
  }
  var ul = $('#heroStack');
  if (ul) [['aws','AWS'],['kubernetes','Kubernetes'],['terraform','Terraform'],['github','GitHub'],['docker','Docker'],['jenkins','Jenkins'],['linux','Linux']].forEach(function(r){
    if (!LOGOS[r[0]]) return;
    var li = document.createElement('li');
    li.innerHTML = '<a href="#skills" aria-label="' + r[1] + ' in Technical stack" title="' + r[1] + '"><img src="' + LOGOS[r[0]] + '" alt=""></a>';
    ul.appendChild(li);
  });
})();

/* ---------- v10: letter hop on every heading ---------- */
(function(){
  function wrap(node){
    if (node.nodeType === 3){
      if (!/\S/.test(node.nodeValue)) return;
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function(part){
        if (!part) return;
        if (/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span'); w.className = 'hw'; w.setAttribute('aria-hidden', 'true');
        for (var i = 0; i < part.length; i++){
          var l = document.createElement('span'); l.className = 'hl'; l.textContent = part[i];
          l.addEventListener('pointerenter', function(){ if (!this.classList.contains('hop')) this.classList.add('hop'); });
          l.addEventListener('animationend', function(){ this.classList.remove('hop'); });
          w.appendChild(l);
        }
        frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === 1 && !node.classList.contains('hw')){
      Array.prototype.slice.call(node.childNodes).forEach(wrap);
    }
  }
  $$('.sec-h, .pj-title, .exp-title').forEach(function(h){
    h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
    wrap(h);
    var m = $('.rv-mask', h) || (h.classList.contains('rv-mask') ? h : null);
    if (m && 'MutationObserver' in window){
      var mo = new MutationObserver(function(){ if (m.classList.contains('is-in')){ setTimeout(function(){ m.classList.add('free'); }, 1200); mo.disconnect(); } });
      mo.observe(m, { attributes: true, attributeFilter: ['class'] });
      if (m.classList.contains('is-in')) setTimeout(function(){ m.classList.add('free'); }, 1200);
    }
  });
})();
