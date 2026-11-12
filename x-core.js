/* Lucky Line CRM v2: calendar, reports, automations, invoices, settings, exports, add-ons.
   Uses the globals from index.html: $, V, esc, q, sql, fn, guard, status, cache, TZ, fmtDue, money, ICON, STAGES, go, hosted, session, mcp, callTool. */
const PORTAL_BASE='https://nomadishere.github.io/lucky-line-crm/';
const FN_BASE='https://wwqjoagdnclaylllzcut.supabase.co/functions/v1/';
const ALL_STAGES=['Lead','Inspection','Proposal Due','Proposal Sent','Approved','Scheduled','In Progress','Completed','Paid','On Hold','Lost'];
const dISO=d=>new Date(d).toLocaleDateString('en-CA',{timeZone:TZ});
const todayISO=()=>dISO(Date.now());
const addDays=(iso,n)=>{const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const dayName=(iso,o)=>new Date(iso+'T12:00:00Z').toLocaleDateString('en-US',Object.assign({timeZone:'UTC'},o));
const tmLocal=t=>new Date(t).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:TZ});
const XI={
 cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
 more:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
 chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
 bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
 inv:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h8M9 17h5"/></svg>',
 gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
 dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>',
 plug:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 01-12 0zM12 18v4"/></svg>',
 people:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.3-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.5a3.5 3.5 0 010 7M18.5 14.8c1.6.8 2.6 2.6 3 5.2"/></svg>',
 video:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3"/></svg>',
 chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16v11H8l-4 4z"/></svg>',
 phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/></svg>',
 team:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
 mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
 left:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>',
 right:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>',
 link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"/></svg>'};
async function moreData(force){if(force||!cache.more)cache.more=await fn('crm.app_more()');return cache.more}
function setting(k){return ((cache.more||{}).settings||{})[k]||''}
async function copyText(t,msg){try{await navigator.clipboard.writeText(t);status(msg||'Copied ✓')}catch(e){prompt('Copy this:',t)}}
function smsHref(phone,body){return 'sms:'+(phone||'')+(/iPhone|iPad|Mac/i.test(navigator.userAgent)?'&':'?')+'body='+encodeURIComponent(body)}
function mailHref(email,subject,body){return 'mailto:'+encodeURIComponent(email||'')+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)}
function download(name,text,type){const b=new Blob([text],{type:type||'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}

/* ---------- CALENDAR ---------- */
let calDay=null,calAdd=false;
const Calendar=guard(async()=>{calDay=calDay||todayISO();
  const dow=(new Date(calDay+'T12:00:00Z').getUTCDay()+6)%7, mon=addDays(calDay,-dow), sun=addDays(mon,6);
  status('Syncing…');const [items,more]=await Promise.all([fn(`crm.app_calendar(${q(mon)}::date,${q(sun)}::date)`),moreData()]);cache.cal=items||[];
  if(!cache.pipe)fn('crm.app_pipeline()').then(r=>cache.pipe=r).catch(()=>{});
  const byDay={};(items||[]).forEach(i=>{const k=dISO(i.starts_at);(byDay[k]=byDay[k]||[]).push(i)});
  const days=[...Array(7)].map((_,i)=>addDays(mon,i));const list=byDay[calDay]||[];
  const ics=(more.settings||{}).ics_token?FN_BASE.replace('https://','webcal://')+'crm-ics?t='+more.settings.ics_token:'';
  status(dayName(mon,{month:'short',day:'numeric'})+' – '+dayName(sun,{month:'short',day:'numeric'})+' · '+(items||[]).length+' items');
  V.innerHTML=`<div class="row"><button class="b ic" aria-label="Previous week" onclick="calDay=addDays(calDay,-7);Calendar()">${XI.left}</button><div class="grow t" style="text-align:center;font-size:15px">${dayName(calDay,{month:'long',year:'numeric'})}</div><button class="b ic" aria-label="Next week" onclick="calDay=addDays(calDay,7);Calendar()">${XI.right}</button></div>
  <div class="week">${days.map(d=>{const it=byDay[d]||[];const dots=it.slice(0,3).map(i=>`<u class="${i.src==='proposal'||(i.src==='task'&&!i.done&&new Date(i.starts_at)<new Date())?'r':i.src==='task'?'a':''}"></u>`).join('');return `<button class="day ${d===calDay?'on':''} ${d===todayISO()?'today':''}" onclick="calDay='${d}';Calendar()">${dayName(d,{weekday:'short'})}<b>${+d.slice(8)}</b><i>${dots}</i></button>`}).join('')}</div>
  <h2>${calDay===todayISO()?'Today':dayName(calDay,{weekday:'long',month:'short',day:'numeric'})} <span class="n">${list.length}</span></h2>
  <div class="card">${list.length?list.map(evRow).join(''):'<div class="empty">Nothing booked. Tap Add to book an inspection or install.</div>'}
   <div class="btns"><button class="b p f" onclick="calAdd=!calAdd;Calendar()">${calAdd?'Close':'Add to calendar'}</button>${calDay!==todayISO()?`<button class="b f" onclick="calDay=null;Calendar()">Back to today</button>`:''}</div></div>
  ${calAdd?eventForm():''}
  <h2>On your phone</h2><div class="card"><div class="t">Put this calendar on your phone</div><div class="s">Inspections, installs, proposal deadlines and tasks show up in your iPhone or Google calendar and update by themselves.</div>
   ${ics?`<div class="btns"><a class="b p f" href="${esc(ics)}">${XI.cal}iPhone calendar</a><a class="b f" target="_blank" rel="noopener" href="https://calendar.google.com/calendar/r?cid=${encodeURIComponent(ics)}">Google Calendar</a><button class="b f" onclick="copyText('${esc(ics.replace('webcal://','https://'))}','Calendar link copied')">Copy link</button></div>`:'<div class="empty">Calendar link not set up.</div>'}</div>`;
  if(calAdd)wireEventForm()});
function evRow(i){const tm=i.all_day?'All day':tmLocal(i.starts_at);const late=i.src==='task'&&!i.done&&new Date(i.starts_at)<new Date();
  return `<div class="ev ${i.src} ${i.done?'done':''}"><div class="tm">${tm}</div><span class="bar2"></span><div class="grow"><div class="t" style="${i.done?'text-decoration:line-through':''}">${esc(i.title)}</div><div class="s">${esc([i.contact,i.location,i.crew&&('crew '+i.crew)].filter(Boolean).join(' · '))}${late?' · <span class="latetag">late</span>':''}</div>
   <div class="acts">${i.job_id?`<a class="b sm" href="#job-${i.job_id}">Open job</a>`:''}${i.src==='task'&&!i.done?`<button class="b sm" onclick="doneTask('${i.id}',this);setTimeout(Calendar,500)">Done</button>`:''}${i.src==='event'?`<button class="b sm" onclick="delEvent('${i.id}')">Remove</button>`:''}</div></div></div>`}
function eventForm(j){const jobs=(cache.pipe||[]);return `<div class="card" style="margin-top:8px" id="evf"><div class="t">Book it</div>
  <label class="f">What</label><input type="text" id="evt" placeholder="Inspection at the Smith house" value="${j?esc('Inspection: '+j.title.split(' — ')[0]):''}">
  <div class="grid2"><div><label class="f">Type</label><select id="evk"><option>Inspection</option><option>Install</option><option>Meeting</option><option>Call</option><option>Other</option></select></div>
  <div><label class="f">Job</label><select id="evj"><option value="">None</option>${jobs.map(x=>`<option value="${x.id}" ${j&&j.id===x.id?'selected':''}>${esc(x.title.slice(0,40))}</option>`).join('')}</select></div>
  <div><label class="f">Date</label><input type="date" id="evd" value="${calDay||todayISO()}"></div><div><label class="f">Start</label><input type="text" id="evs" value="9:00 AM" placeholder="9:00 AM"></div>
  <div><label class="f">How long</label><select id="evl"><option value="30">30 min</option><option value="60" selected>1 hour</option><option value="120">2 hours</option><option value="240">Half day</option><option value="480">Full day</option><option value="1440">2 days</option><option value="2160">3 days</option></select></div>
  <div><label class="f">Crew</label><input type="text" id="evc" placeholder="Rich + 3"></div></div>
  <label class="f">Notes</label><input type="text" id="evn" placeholder="Gate code, dog, ladder side">
  <div class="s" id="everr" style="color:var(--red);margin-top:6px"></div><div class="btns"><button class="b p f" id="evsave">Save</button></div></div>`}
function parseTime(s){const m=String(s||'').trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(a|p)?/i);if(!m)return '09:00';let h=+m[1],mi=+(m[2]||0);const ap=(m[3]||'').toLowerCase();if(ap==='p'&&h<12)h+=12;if(ap==='a'&&h===12)h=0;if(!ap&&h<7)h+=12;return String(Math.min(h,23)).padStart(2,'0')+':'+String(Math.min(mi,59)).padStart(2,'0')}
function wireEventForm(after){$('#evsave').onclick=async()=>{const t=$('#evt').value.trim(),k=$('#evk').value,jid=$('#evj').value,d=$('#evd').value,tm=parseTime($('#evs').value),len=+$('#evl').value,crew=$('#evc').value.trim(),notes=$('#evn').value.trim();
  if(!t){$('#everr').textContent='Say what it is';return}if(!d){$('#everr').textContent='Pick a date';return}
  const st=`((${q(d)}::date + ${q(tm)}::time) at time zone '${TZ}')`,en=`(${st} + interval '${len} minutes')`;
  try{status('Saving…');
   if(k==='Install'&&jid)await sql(`update crm.jobs set scheduled_start=${st},scheduled_end=${en},crew=${q(crew)},stage=case when stage in ('Approved','Proposal Sent') then 'Scheduled' else stage end where id=${q(jid)}; select 1`);
   else await sql(`insert into crm.events(job_id,contact_id,kind,title,starts_at,ends_at,crew,notes,created_by) values (${q(jid)},(select contact_id from crm.jobs where id=${q(jid||null)}),${q(k.toLowerCase())},${q(t)},${st},${en},${q(crew)},${q(notes)},'Justin'); select 1`);
   if(jid&&k==='Inspection')await sql(`update crm.jobs set stage=case when stage='Lead' then 'Inspection' else stage end, next_action=${q('Inspection '+d+' '+$('#evs').value)}, next_action_due=${q(d)} where id=${q(jid)}; select 1`);
   calAdd=false;calDay=d;cache.pipe=null;status('Booked ✓');after?after():Calendar()}catch(e){$('#everr').textContent='Could not save: '+e.message}}}
window.delEvent=async id=>{await sql(`delete from crm.events where id=${q(id)}; select 1`);Calendar()};

/* ---------- MORE ---------- */
const More=guard(async()=>{const m=await moreData(true).catch(()=>({counts:{}}));status('Everything else');
  const tl=(h,icon,t,s)=>`<a class="card tilebtn" href="${h}">${icon}<div class="t">${t}</div><div class="s">${s}</div></a>`;
  V.innerHTML=`<div class="tiles">
   ${tl('#inspect',XI.video,'Inspect','Walk-around video or Roofly report')}
   ${tl('#people',XI.people,'People','Customers, vendors, partners')}
   ${tl('#inbox',XI.chat,'Texts','Every text with every customer')}
   ${tl('#stats',XI.chart,'Stats & training','Time saved, leaderboard, coaching')}
   ${tl('#reports',XI.chart,'Reports','Win rate, speed, money in')}
   ${tl('#invoices',XI.inv,'Invoices',((m.counts||{}).invoices_open||0)+' waiting on payment')}
   ${tl('#automations',XI.bolt,'Automations','Follow-ups that make themselves')}
   ${tl('#voice',XI.mic,'Voice','Talk to the CRM hands-free')}
   ${tl('#addons',XI.plug,'Add-ons','Texting, card pay, AI phone line')}
   ${tl('#exports',XI.dl,'Export','QuickBooks, spreadsheets')}
   ${tl('#settings',XI.gear,'Settings','Payment terms, review link, API')}
   ${tl('#team',XI.team,'Team','Who can see and edit')}
   ${tl('#install',XI.phone,'Install app','Put it on your home screen')}
  </div>`});

/* ---------- REPORTS ---------- */
function hbars(rows,lab,val,fmt){const mx=Math.max(1,...rows.map(r=>+r[val]||0));return rows.map(r=>`<div class="hb" title="${esc(r[lab])}: ${esc(fmt(r[val]))}"><div class="lbl">${esc(r[lab])}</div><div class="trk"><i style="width:${Math.max(1,100*(+r[val]||0)/mx)}%"></i></div><div class="val">${esc(fmt(r[val]))}</div></div>`).join('')}
function cols(rows,key,fmt){const mx=Math.max(1,...rows.map(r=>+r[key]||0));return `<div class="cols">${rows.map(r=>`<div class="c" title="${esc(r.month)}: ${esc(fmt(r[key]))}"><span>${+r[key]?esc(fmt(r[key])):''}</span><i style="height:${100*(+r[key]||0)/mx}%"></i></div>`).join('')}</div><div class="colx">${rows.map(r=>`<div>${esc(r.month)}</div>`).join('')}</div>`}
const kfmt=n=>{n=+n||0;return n>=1e6?'$'+(n/1e6).toFixed(1)+'M':n>=1e3?'$'+Math.round(n/1e3)+'K':'$'+Math.round(n)};
const Reports=guard(async()=>{status('Crunching…');const r=await fn('crm.app_reports()');cache.reports=r;status('Reports · live');
  const out=Math.max(0,(+r.invoiced||0)-(+r.collected||0));const stat=(k,v,s,c)=>`<div class="card stat"><div class="k">${k}</div><div class="v" style="${c?'color:'+c:''}">${v}</div>${s?`<div class="s">${s}</div>`:''}</div>`;
  V.innerHTML=`<div class="grid">
   ${stat('Won (all time)',kfmt(r.won_value),r.won_count+' jobs')}
   ${stat('Win rate',r.win_rate!=null?r.win_rate+'%':'—','won vs. lost')}
   ${stat('Inspection → proposal',r.avg_minutes_to_proposal!=null?(r.avg_minutes_to_proposal<120?r.avg_minutes_to_proposal+'m':Math.round(r.avg_minutes_to_proposal/60)+'h'):'—',r.timed_proposals+' timed',r.avg_minutes_to_proposal!=null&&r.avg_minutes_to_proposal<=60?'var(--green)':'var(--amber)')}
   ${stat('Sent within 60 min',r.pct_within_60!=null?r.pct_within_60+'%':'—','the Alden rule')}
   ${stat('Collected',kfmt(r.collected),'payments logged')}
   ${stat('Outstanding',kfmt(out),'invoiced, not paid',out?'var(--amber)':'')}
   ${stat('Leads (90 days)',r.leads_90,r.sent_90+' proposals sent')}
   ${stat('Late tasks',r.tasks_late,r.tasks_done_7+' done this week',r.tasks_late?'var(--red)':'var(--green)')}
  </div>
  <h2>Pipeline value by stage</h2><div class="card">${hbars((r.by_stage||[]).filter(x=>x.stage!=='Lost'),'stage','value',kfmt)}<div class="s" style="margin-top:6px">${(r.by_stage||[]).map(x=>esc(x.stage)+' '+x.n).join(' · ')}</div></div>
  <h2>Won by month</h2><div class="card">${cols(r.monthly||[],'won',kfmt)}</div>
  <h2>New leads by month</h2><div class="card">${cols(r.monthly||[],'leads',n=>String(n))}</div>
  <h2>Money collected by month</h2><div class="card">${cols(r.monthly||[],'collected',kfmt)}</div>
  <h2>Where leads come from</h2><div class="card"><table class="mat"><tbody><tr><td class="s">Source</td><td class="s">Leads</td><td class="s">Won</td><td class="s">Won $</td></tr>${(r.by_source||[]).map(s=>`<tr><td>${esc(s.src)}</td><td>${s.n}</td><td>${s.won}</td><td>${kfmt(s.value)}</td></tr>`).join('')}</tbody></table></div>
  <h2>Open work by owner</h2><div class="card">${hbars(r.by_owner||[],'owner','n',n=>n+' jobs')}</div>
  <h2>Open work by location</h2><div class="card">${hbars(r.by_location||[],'location','n',n=>n+' jobs')}</div>
  <h2>Ask about your numbers</h2><div class="card"><div class="row"><input type="text" id="aq" class="grow" placeholder="Which lead source closes best?"><button class="b p" onclick="askNumbers()">Ask</button></div><div class="s" id="aans" style="margin-top:8px;color:var(--text);white-space:pre-wrap"></div></div>`});
window.askNumbers=async()=>{const qq=$('#aq').value.trim();if(!qq)return;const A=$('#aans');
  if(!sampler){try{sampler=await claude.use('sample')}catch(e){}}
  if(!sampler){A.textContent=localAnswer(qq,cache.reports);return}
  A.textContent='Thinking…';try{const r=await sampler(`You are the numbers assistant for Lucky Line Roofing's CRM. Answer in 2-4 short plain sentences using only this data (JSON):\n${JSON.stringify(cache.reports)}\n\nQuestion: ${qq}`,{modelTier:'default'});A.textContent=(r&&r.text)||'No answer.'}catch(e){A.textContent=localAnswer(qq,cache.reports)}};
function localAnswer(qq,r){qq=qq.toLowerCase();if(/source|where/.test(qq)){const b=[...(r.by_source||[])].sort((a,b)=>(b.won/Math.max(1,b.n))-(a.won/Math.max(1,a.n)))[0];return b?`${b.src} closes best: ${b.won} won out of ${b.n} leads (${kfmt(b.value)}).`:'No sources yet.'}
  if(/win|close/.test(qq))return `Win rate is ${r.win_rate??'—'}% (${r.won_count} won, ${r.lost_count} lost).`;if(/fast|speed|minute|60/.test(qq))return `Average inspection-to-proposal time is ${r.avg_minutes_to_proposal??'—'} minutes; ${r.pct_within_60??'—'}% went out within 60.`;
  if(/owe|outstanding|collect|paid/.test(qq))return `${kfmt(r.collected)} collected; ${kfmt(Math.max(0,r.invoiced-r.collected))} invoiced and still owed.`;return `Open pipeline ${kfmt(r.open_value)}, ${r.tasks_late} late tasks, win rate ${r.win_rate??'—'}%.`}

/* ---------- AUTOMATIONS ---------- */
const TRIG={stage_entered:'When a job moves to',proposal_viewed:'When the customer opens the proposal',proposal_signed:'When the customer signs',invoice_paid:'When a payment comes in',job_created:'When a new job is added'};
const Automations=guard(async()=>{const m=await moreData(true);const rows=m.automations||[];status(rows.filter(a=>a.enabled).length+' automations on');
  V.innerHTML=`<div class="card"><div class="t">Follow-ups that make themselves</div><div class="s">Each rule makes a task (or a note) at the right time, so nothing falls through the cracks. Switch any rule off, or tap Edit to change it.</div></div>
  <div class="stack" style="margin-top:8px">${rows.map(autoCard).join('')}</div>
  <div class="btns"><button class="b p f" onclick="newAuto()">New automation</button></div>`});
function delayTxt(a){const h=+a.delay_hours;const d=h>=24?Math.round(h/24)+' day'+(Math.round(h/24)===1?'':'s')+' later':h?h+' hour'+(h===1?'':'s')+' later':'right away';return d+(a.at_hour!=null?' at '+((a.at_hour%12)||12)+(a.at_hour<12?' AM':' PM'):'')}
function autoCard(a){return `<div class="card" id="au-${a.id}"><div class="row"><div class="grow"><div class="t">${esc(a.name)}</div><div class="s">${esc(TRIG[a.trigger_event]||a.trigger_event)}${a.trigger_stage?' <b style="color:var(--text)">'+esc(a.trigger_stage)+'</b>':''} → ${a.action==='task'?esc(a.task_kind)+' task':'note'} ${esc(delayTxt(a))}</div><div class="s" style="color:var(--text);margin-top:4px">“${esc(a.task_title)}”</div></div>
  <button class="sw ${a.enabled?'on':''}" role="switch" aria-checked="${a.enabled}" aria-label="On or off" onclick="toggleAuto('${a.id}',${!a.enabled})"></button></div>
  <div class="acts"><button class="b sm" onclick="editAuto('${a.id}')">Edit</button></div></div>`}
window.toggleAuto=async(id,on)=>{await sql(`update crm.automations set enabled=${on} where id=${q(id)}; select 1`);cache.more=null;Automations()};
function autoForm(a){a=a||{trigger_event:'stage_entered',trigger_stage:'Proposal Sent',delay_hours:48,at_hour:10,task_kind:'call',priority:'Normal',owner:'Justin',action:'task',task_title:'',name:''};const dd=+a.delay_hours>=24&&+a.delay_hours%24===0;
  return `<label class="f" style="margin-top:0">Name</label><input type="text" class="an" value="${esc(a.name)}" placeholder="Proposal follow-up day 3">
  <div class="grid2"><div><label class="f">When</label><select class="atr">${Object.entries(TRIG).map(([k,v])=>`<option value="${k}" ${k===a.trigger_event?'selected':''}>${v}</option>`).join('')}</select></div>
  <div><label class="f">Stage</label><select class="ast"><option value="">Any</option>${ALL_STAGES.map(s=>`<option ${s===a.trigger_stage?'selected':''}>${s}</option>`).join('')}</select></div>
  <div><label class="f">Wait</label><input type="number" class="adl" inputmode="decimal" value="${dd?a.delay_hours/24:a.delay_hours}"></div><div><label class="f">Unit</label><select class="adu"><option value="24" ${dd?'selected':''}>days</option><option value="1" ${dd?'':'selected'}>hours</option></select></div>
  <div><label class="f">At (hour, optional)</label><select class="aah"><option value="">Any time</option>${[...Array(24)].map((_,h)=>`<option value="${h}" ${a.at_hour===h?'selected':''}>${(h%12)||12} ${h<12?'AM':'PM'}</option>`).join('')}</select></div>
  <div><label class="f">Type</label><select class="ak">${['call','text','email','other'].map(k=>`<option ${k===a.task_kind?'selected':''}>${k}</option>`).join('')}</select></div>
  <div><label class="f">Priority</label><select class="ap">${['Urgent','High','Normal','Low'].map(k=>`<option ${k===a.priority?'selected':''}>${k}</option>`).join('')}</select></div>
  <div><label class="f">Who</label><input type="text" class="ao" value="${esc(a.owner)}"></div></div>
  <label class="f">Task (use {customer}, {title}, {address})</label><input type="text" class="att" value="${esc(a.task_title)}" placeholder="Call {customer} about the proposal">
  <div class="btns"><button class="b p f" onclick="saveAuto(this,'${a.id||''}')">Save</button>${a.id?`<button class="b sm" onclick="delAuto('${a.id}')">Delete</button>`:''}</div>`}
window.editAuto=id=>{const a=(cache.more.automations||[]).find(x=>x.id===id);$('#au-'+id).innerHTML=autoForm(a)};
window.newAuto=()=>{const d=document.createElement('div');d.className='card';d.style.marginTop='8px';d.innerHTML=autoForm();V.appendChild(d);d.scrollIntoView({behavior:'smooth'})};
window.saveAuto=async(btn,id)=>{const c=btn.closest('.card'),g=s=>c.querySelector(s).value;const hrs=(+g('.adl')||0)*(+g('.adu'));const ttl=g('.att').trim();if(!ttl){c.querySelector('.att').focus();return}
  const vals=`name=${q(g('.an').trim()||ttl.slice(0,40))},trigger_event=${q(g('.atr'))},trigger_stage=${q(g('.atr')==='stage_entered'?g('.ast'):'')},delay_hours=${hrs},at_hour=${g('.aah')===''?'null':+g('.aah')},task_kind=${q(g('.ak'))},priority=${q(g('.ap'))},owner=${q(g('.ao')||'Justin')},task_title=${q(ttl)}`;
  try{if(id)await sql(`update crm.automations set ${vals} where id=${q(id)}; select 1`);else await sql(`insert into crm.automations(name,trigger_event,task_title,sort) values ('x','stage_entered','x',99) returning id`).then(r=>sql(`update crm.automations set ${vals} where id=${q(r[0].id)}; select 1`));
   cache.more=null;status('Saved ✓');Automations()}catch(e){status('Could not save: '+e.message)}};
window.delAuto=async id=>{await sql(`delete from crm.automations where id=${q(id)}; select 1`);cache.more=null;Automations()};

/* ---------- INVOICES ---------- */
let invFilter='Open';
const Invoices=guard(async()=>{status('Syncing…');const rows=await fn('crm.app_invoices()');cache.invs=rows||[];drawInvs()});
function invPill(s){return `<span class="pill ${s==='paid'?'green':s==='partial'||s==='sent'?'amber':s==='void'?'':'acc'}">${esc(s)}</span>`}
function drawInvs(){const rows=cache.invs;const f={Open:r=>['sent','partial','draft'].includes(r.status),Paid:r=>r.status==='paid',All:()=>true}[invFilter];const list=rows.filter(f);
  const owed=rows.filter(r=>['sent','partial'].includes(r.status)).reduce((s,r)=>s+(+r.total-+r.paid),0);status(rows.length+' invoices · '+money(owed)+' owed');
  V.innerHTML=`<div class="chips">${['Open','Paid','All'].map(s=>`<button class="chip ${s===invFilter?'on':''}" onclick="invFilter='${s}';drawInvs()">${s}</button>`).join('')}</div>
  <div class="grid" style="margin-top:10px">${list.map(r=>`<a class="card" style="display:block" href="#invoice-${r.id}"><div class="row"><div class="grow"><div class="t">#${r.number} · ${esc(r.contact||'')}</div><div class="s">${esc(r.title||r.job||'')}</div></div></div><div class="row" style="margin-top:8px">${invPill(r.status)}<div class="grow"></div><div class="tot" style="font-size:16px">${money(r.total)}</div></div>${+r.paid&&r.status!=='paid'?`<div class="s">${money(r.paid)} paid · ${money(r.total-r.paid)} left</div>`:''}</a>`).join('')||'<div class="card w2 empty">No invoices here. Open a job and tap Deposit invoice or Final invoice.</div>'}</div>`}
const Invoice=guard(async id=>{status('Loading…');const [d]=await Promise.all([fn(`crm.app_invoice(${q(id)})`),moreData()]);cache.inv=d;const i=d.invoice,c=d.contact||{},t=d.totals;const bal=(+t.total)-(+t.paid);
  status('Invoice #'+i.number+' · '+i.status);
  V.innerHTML=`<div class="card"><div class="row"><div class="grow"><div class="t" style="font-size:18px">Invoice #${i.number}</div><div class="s">${esc(c.name||'')}${d.job?' · <a href="#job-'+d.job.id+'">'+esc(d.job.title)+' ›</a>':''}</div></div>${invPill(i.status)}</div>
   <div class="grid2" style="margin-top:6px"><div><label class="f">Title</label><input type="text" id="ititle" value="${esc(i.title||'')}"></div><div><label class="f">Due</label><input type="date" id="idue" value="${i.due_on||''}"></div></div>
   <table class="lines"><tbody id="ilines">${(d.lines.length?d.lines:[{}]).map(l=>`<tr><td style="width:56%"><input type="text" class="li" value="${esc(l.item||'')}" placeholder="Item"></td><td style="width:14%"><input type="number" class="lq" value="${l.qty??1}" inputmode="decimal"></td><td style="width:30%"><input type="number" class="lp" value="${l.unit_price??''}" inputmode="decimal" placeholder="$"></td></tr>`).join('')}</tbody></table>
   <label class="f">Note to customer</label><input type="text" id="inotes" value="${esc(i.notes||'')}" placeholder="Thank you for choosing Lucky Line!">
   <div class="sec"><div class="kv"><span>Total</span><b>${money(t.total)}</b></div><div class="kv"><span>Paid</span><b>${money(t.paid)}</b></div><div class="kv"><span>Balance</span><b style="color:${bal>0?'var(--amber)':'var(--green)'}">${money(bal)}</b></div></div>
   <div class="btns"><button class="b sm" onclick="document.querySelector('#ilines').insertAdjacentHTML('beforeend','<tr><td><input type=text class=li placeholder=Item></td><td><input type=number class=lq value=1></td><td><input type=number class=lp placeholder=$></td></tr>')">Add line</button><button class="b f" onclick="saveInv('${i.id}')">Save</button></div></div>
  <h2>Send it</h2><div class="card"><div class="s">The customer gets a clean Lucky Line invoice page${setting('card_enabled')==='true'?' with a Pay by card button':''}.</div><div class="btns" id="isend"><button class="b p f" onclick="sendInv('${i.id}')">${ICON.send}Get customer link</button></div></div>
  <h2>Record a payment</h2><div class="card"><div class="grid2"><div><label class="f" style="margin-top:0">Amount</label><input type="number" id="pamt" inputmode="decimal" value="${bal>0?bal.toFixed(2):''}"></div><div><label class="f" style="margin-top:0">How</label><select id="pmeth"><option>Check</option><option>Card</option><option>ACH / bank</option><option>Zelle</option><option>Cash</option><option>Financing</option><option>Other</option></select></div></div>
   <label class="f">Check # / reference</label><input type="text" id="pref"><div class="btns"><button class="b p f" onclick="addPay('${i.id}')">Record payment</button></div>
   ${d.payments.length?`<div class="sec">${d.payments.map(p=>`<div class="kv"><span>${esc(fmtDue(p.paid_at))} · ${esc(p.method||'')}${p.reference?' #'+esc(p.reference):''}</span><b>${money(p.amount)}</b></div>`).join('')}</div>`:''}</div>
  <div class="btns">${i.status!=='void'?`<button class="b sm" onclick="voidInv('${i.id}')">Void invoice</button>`:''}</div>`});
window.saveInv=async(id,quiet)=>{const rows=[...document.querySelectorAll('#ilines tr')].map((r,k)=>({item:r.querySelector('.li').value.trim(),qty:+r.querySelector('.lq').value||1,p:+r.querySelector('.lp').value||0,k})).filter(r=>r.item);
  await sql(`update crm.invoices set title=${q($('#ititle').value)},due_on=${q($('#idue').value)},notes=${q($('#inotes').value)} where id=${q(id)}; delete from crm.invoice_lines where invoice_id=${q(id)}; ${rows.length?`insert into crm.invoice_lines(invoice_id,item,qty,unit_price,sort) values ${rows.map(r=>`(${q(id)},${q(r.item)},${r.qty},${r.p},${r.k})`).join(',')};`:''} select 1`);if(!quiet){status('Saved ✓');Invoice(id)}};
window.sendInv=async id=>{await saveInv(id,1);const d=cache.inv,c=d.contact||{};const r=await sql(`select crm.portal_link('invoice',${q(d.invoice.job_id)},${q(id)}) as t; `);const url=PORTAL_BASE+'invoice.html?t='+r[0].t;
  const first=(c.name||'there').split(/[ (—]/)[0];const body=`Hi ${first}, here is your invoice #${d.invoice.number} from Lucky Line Roofing: ${url}\nThank you! — Justin, 406-609-9950`;
  await sql(`update crm.invoices set status=case when status='draft' then 'sent' else status end, sent_at=coalesce(sent_at,now()) where id=${q(id)}; select 1`);
  $('#isend').innerHTML=`<code class="lk">${esc(url)}</code><div class="btns" style="width:100%">${(c.phones||[])[0]?`<a class="b p f" href="${esc(smsHref(c.phones[0],body))}">${ICON.text}Text it</a>`:''}${(c.emails||[])[0]?`<a class="b f" href="${esc(mailHref(c.emails[0],'Invoice #'+d.invoice.number+' from Lucky Line Roofing',body))}">${ICON.mail}Email it</a>`:''}<button class="b f" onclick="copyText('${esc(url)}')">Copy</button><a class="b f" href="${esc(url)}" target="_blank" rel="noopener">Preview</a></div>`;status('Invoice marked sent')};
window.addPay=async id=>{const a=+$('#pamt').value;if(!(a>0)){$('#pamt').focus();return}await sql(`insert into crm.payments(invoice_id,job_id,amount,method,reference,recorded_by) values (${q(id)},(select job_id from crm.invoices where id=${q(id)}),${a},${q($('#pmeth').value)},${q($('#pref').value)},'Justin'); select 1`);status('Payment recorded ✓');Invoice(id)};
window.voidInv=async id=>{await sql(`update crm.invoices set status='void' where id=${q(id)}; update crm.portal_links set revoked=true where invoice_id=${q(id)}; select 1`);Invoice(id)};
window.newInvoice=async(jid,kind)=>{try{status('Making the invoice…');const r=await sql(`select crm.invoice_from_job(${q(jid)},${q(kind)}) as id`);location.hash='invoice-'+r[0].id}catch(e){status('Could not make it: '+e.message)}};

/* ---------- SETTINGS ---------- */
const SETS=[['pay_instructions','How customers can pay (shows on every invoice)','textarea'],['terms','Payment terms (shows on every proposal)','textarea'],['review_link','Google review link (for review-request texts)','text'],['financing_link','Financing link (shows on proposals and invoices)','text'],['pay_link','Card payment link (Stripe/Square payment link, optional)','text'],['supplier_email','Supplier email for material orders','text']];
const Settings=guard(async()=>{const m=await moreData(true),s=m.settings||{};status('Settings');
  const api=FN_BASE+'crm-lead';
  V.innerHTML=`<div class="card">${SETS.map(([k,l,t])=>`<label class="f" ${k==='pay_instructions'?'style="margin-top:0"':''}>${l}</label>${t==='textarea'?`<textarea data-k="${k}" style="min-height:70px">${esc(s[k]||'')}</textarea>`:`<input type="text" data-k="${k}" value="${esc(s[k]||'')}">`}`).join('')}
   <div class="btns"><button class="b p f" onclick="saveSettings()">Save settings</button></div></div>
  <h2>Website & Zapier leads (API)</h2><div class="card"><div class="s">Any website form, Zapier zap or the AI phone line can send leads straight in. They land with a 15-minute call task, same as tapping +.</div>
   <code class="lk">POST ${esc(api)}\nx-api-key: ${esc(s.api_key||'')}\n{"name":"Jane Smith","phone":"406-555-0100","email":"","address":"","notes":"","source":"Website"}</code>
   <div class="btns"><button class="b f" onclick="copyText(${esc(JSON.stringify(api))},'API address copied')">Copy address</button><button class="b f" onclick="copyText(${esc(JSON.stringify(s.api_key||''))},'API key copied')">Copy key</button></div></div>`});
window.saveSettings=async()=>{const vals=[...document.querySelectorAll('[data-k]')].map(e=>`(${q(e.dataset.k)},${q(e.value.trim())},now())`).join(',');await sql(`insert into crm.settings(key,value,updated_at) values ${vals} on conflict (key) do update set value=excluded.value,updated_at=now(); select 1`);cache.more=null;status('Settings saved ✓')};

/* ---------- TEAM ---------- */
const Team=guard(async()=>{const m=await moreData(true);status('Team');
  V.innerHTML=`<div class="card">${(m.team||[]).map(t=>`<div class="kv"><span><b>${esc(t.name)}</b><br><span class="s">${esc(t.role||'')}${t.email?' · '+esc(t.email):''}</span></span><span class="s" style="text-align:right">${t.active?(t.can_edit?'Can edit':'View only'):'Login off'}</span></div>`).join('')}</div>
  <div class="s" style="margin:10px 4px">View-only people can see everything but can't change it. Ask Claude to add someone, switch a login on, or give edit rights.</div>`});

/* ---------- EXPORTS ---------- */
function csv(rows){if(!rows.length)return '';const keys=Object.keys(rows[0]);const cell=v=>{v=v==null?'':Array.isArray(v)?v.join('; '):String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};return keys.join(',')+'\n'+rows.map(r=>keys.map(k=>cell(r[k])).join(',')).join('\n')}
const EXPORTS={
 'QuickBooks invoices':['quickbooks-invoices.csv',`select i.number "InvoiceNo", coalesce(c.name,'Customer') "Customer", to_char(i.issued_on,'MM/DD/YYYY') "InvoiceDate", to_char(coalesce(i.due_on,i.issued_on),'MM/DD/YYYY') "DueDate", 'Roofing' "Item(Product/Service)", l.item "ItemDescription", l.qty "ItemQuantity", l.unit_price "ItemRate", l.qty*l.unit_price "ItemAmount" from crm.invoices i join crm.invoice_lines l on l.invoice_id=i.id left join crm.contacts c on c.id=i.contact_id where i.status<>'void' order by i.number, l.sort`],
 'QuickBooks payments':['quickbooks-payments.csv',`select to_char(p.paid_at at time zone '${TZ}','MM/DD/YYYY') "Date", coalesce(c.name,'Customer') "Customer", i.number "InvoiceNo", p.amount "Amount", p.method "PaymentMethod", p.reference "RefNo" from crm.payments p join crm.invoices i on i.id=p.invoice_id left join crm.contacts c on c.id=i.contact_id order by p.paid_at`],
 'Customers':['contacts.csv',`select name, company, category, phones, emails, source, to_char(last_contact_at at time zone '${TZ}','YYYY-MM-DD') last_contact from crm.contacts order by name`],
 'Jobs':['jobs.csv',`select j.title, c.name contact, j.address, j.stage, j.priority, j.owner, j.value, j.source, j.location, to_char(j.created_at at time zone '${TZ}','YYYY-MM-DD') created, to_char(j.proposal_sent_at at time zone '${TZ}','YYYY-MM-DD') proposal_sent, to_char(j.approved_at at time zone '${TZ}','YYYY-MM-DD') approved from crm.jobs j left join crm.contacts c on c.id=j.contact_id order by j.created_at desc`],
 'Tasks':['tasks.csv',`select t.title, t.kind, t.owner, t.priority, to_char(t.due_at at time zone '${TZ}','YYYY-MM-DD HH24:MI') due, to_char(t.done_at at time zone '${TZ}','YYYY-MM-DD') done, j.title job from crm.tasks t left join crm.jobs j on j.id=t.job_id order by t.due_at desc`]};
const Exports=guard(async()=>{status('Exports');V.innerHTML=`<div class="card"><div class="t">Download a spreadsheet</div><div class="s">The QuickBooks files match QuickBooks Online's import format (Settings → Import data → Invoices).</div>
  <div class="stack" style="margin-top:10px">${Object.keys(EXPORTS).map(k=>`<button class="b f" style="width:100%" onclick="doExport('${k}')">${XI.dl}${k}</button>`).join('')}</div></div>`});
window.doExport=async k=>{const [name,query]=EXPORTS[k];status('Building '+name+'…');const rows=await sql(query);if(!rows.length){status('Nothing to export yet');return}download(name,csv(rows));status(rows.length+' rows ✓')};

/* ---------- INSTALL ---------- */
const Install=guard(async()=>{status('Install');const ios=/iPhone|iPad/i.test(navigator.userAgent);
  V.innerHTML=`<div class="card"><div class="t">Put Lucky Line CRM on your home screen</div><div class="s" style="margin-top:6px">It opens full screen like a normal app, with its own icon, and loads even with weak signal on a roof.</div>
  <div class="sec">${ios?'<div class="t" style="font-size:14px">iPhone</div><div class="s">1. Open this page in Safari.<br>2. Tap the Share button.<br>3. Tap <b>Add to Home Screen</b>, then Add.</div>':'<div class="t" style="font-size:14px">Android / Chrome</div><div class="s">Tap Install below, or the browser menu → <b>Install app</b>.</div>'}</div>
  <div class="btns">${window._bip?'<button class="b p f" onclick="_bip.prompt()">Install</button>':''}<button class="b f" onclick="copyText('${PORTAL_BASE}','App link copied')">Copy app link</button></div></div>`});
addEventListener('beforeinstallprompt',e=>{e.preventDefault();window._bip=e});

/* ---------- ADD-ONS (paid services: built, waiting for Justin's OK) ---------- */
const ADDONS=[
 {k:'sms_enabled',t:'Two-way texting',s:'Text customers from the CRM and see their replies here, with a task whenever someone texts in.',need:'A Twilio account and a local 406 phone number, plus the one-time carrier registration for business texting. Monthly cost depends on the number and how many texts.',now:'Until it\'s on, Text buttons open your phone\'s Messages app and the CRM logs what you sent.'},
 {k:'card_enabled',t:'Pay by card / bank on invoices',s:'A Pay now button on every invoice. The payment records itself and the job moves to Paid.',need:'A Stripe account in Lucky Line\'s name. No monthly fee; Stripe takes a small cut of each payment.',now:'Until it\'s on, invoices show your check/phone payment instructions, or a payment link you paste in Settings.'},
 {k:'ai_receptionist',t:'AI phone receptionist',s:'Answers calls 24/7, books the inspection, and drops the lead and call transcript into the CRM with a 15-minute call task.',need:'A phone number for the agent (Twilio) and ElevenLabs voice minutes, billed by the minute.',now:'Built and tested: the agent “Lucky Line Roofing — AI receptionist” is in your ElevenLabs account, connected to the CRM. You can try it free in ElevenLabs with the Test button. It just needs a phone number.'},
 {k:'aerial_reports',t:'Pro aerial measurement reports',s:'Order EagleView / Hover style measurement reports from a job.',need:'An account with a measurement provider. Paid per report.',now:'Free now: measure the roof on satellite imagery in the job\'s Measure card.'},
 {k:'qbo_sync',t:'QuickBooks live sync',s:'Invoices and payments flow into QuickBooks on their own.',need:'Your QuickBooks Online login to approve the connection.',now:'Free now: QuickBooks-ready exports in Export.'}];
const Addons=guard(async()=>{const m=await moreData(true),s=m.settings||{};status('Add-ons');
  V.innerHTML=`<div class="card"><div class="t">Built and waiting for your OK</div><div class="s">These cost money to run, so they stay off until you say go. Everything else in the CRM is free and already on.</div></div>
  <div class="stack" style="margin-top:8px">${ADDONS.map(a=>{const live=s[a.k]==='true';return `<div class="card addon ${live?'live':''}"><div class="row"><div class="grow"><div class="t">${a.t}</div></div><span class="pill ${live?'green':'amber'}">${live?'On':'Needs your OK'}</span></div><div class="s" style="color:var(--text);margin-top:4px">${a.s}</div><div class="s" style="margin-top:6px"><b>What it needs:</b> ${a.need}</div><div class="s" style="margin-top:4px"><b>Right now:</b> ${a.now}</div>${a.k==='qbo_sync'?'<div id="qbopanel" class="sec" style="margin-top:8px"></div>':''}</div>`}).join('')}</div>`;qboInit()});

/* QuickBooks live sync: talks to the crm-qbo edge function (editors only). */
async function qboCall(action,extra){const tok=await freshToken();if(!tok)throw new Error('Sign in first');const r=await fetch(FN_BASE+'crm-qbo',{method:'POST',headers:{Authorization:'Bearer '+tok,apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify(Object.assign({action},extra||{}))});const j=await r.json().catch(()=>({}));if(!r.ok&&!j.error)j.error='QuickBooks service error '+r.status;return j}
async function qboInit(){const el=document.getElementById('qbopanel');if(!el)return;
  if(!hosted||!session){el.innerHTML='<div class="s">Open the hosted CRM and sign in to connect QuickBooks.</div>';return}
  const msg={connected:'QuickBooks connected.',denied:'QuickBooks connection was cancelled.',badstate:'That connection link expired. Tap Connect QuickBooks again.',tokenfail:'QuickBooks did not accept the connection. Tap Connect QuickBooks to try again.'}[new URLSearchParams(location.search).get('qbo')]||'';
  el.innerHTML='<div class="s">Checking QuickBooks…</div>';
  let st;try{st=await qboCall('status')}catch(e){st={error:e.message}}
  if(st.error){el.innerHTML=`<div class="s">${msg?msg+' ':''}${st.error==='Editors only'?'Only editors can connect QuickBooks.':'Could not reach QuickBooks service: '+esc(st.error)}</div>`;return}
  const env=st.environment==='production'?'live company':'test company (sandbox)';
  el.innerHTML=`${msg?`<div class="s" style="margin-bottom:6px"><b>${msg}</b></div>`:''}${st.connected?`<div class="s"><b>Connected</b> to a QuickBooks ${env}.</div><div id="qboresult" class="s" style="margin-top:4px"></div><div class="btns"><button class="b p f" onclick="qboSync(this)">Sync now</button><button class="b f" onclick="qboDisconnect()">Disconnect</button></div>`:`<div class="s">Not connected yet. You'll sign in to QuickBooks and approve once.</div><div class="btns"><button class="b p f" onclick="qboConnect(this)">Connect QuickBooks</button></div>`}`}
async function qboConnect(btn){btn.disabled=true;btn.textContent='Opening QuickBooks…';try{const j=await qboCall('connect',{return_to:location.origin+location.pathname+'#addons'});if(j.url)location.href=j.url;else{btn.disabled=false;btn.textContent='Connect QuickBooks';status(j.error||'Could not start the connection')}}catch(e){btn.disabled=false;btn.textContent='Connect QuickBooks';status(e.message)}}
async function qboSync(btn){const out=document.getElementById('qboresult');btn.disabled=true;btn.textContent='Syncing…';try{const j=await qboCall('sync');const errs=(j.errors||[]);out.innerHTML=j.ok?`Sent ${j.invoices} invoice${j.invoices===1?'':'s'} and ${j.payments} payment${j.payments===1?'':'s'} to QuickBooks.${errs.length?'<br>Problems: '+errs.map(esc).join('<br>'):''}`:esc(j.error||'Sync failed')}catch(e){out.textContent=e.message}btn.disabled=false;btn.textContent='Sync now'}
async function qboDisconnect(){if(!confirm('Disconnect QuickBooks? Nothing in QuickBooks is deleted.'))return;try{await qboCall('disconnect')}catch(e){status(e.message)}qboInit()}

/* ---------- VOICE help page ---------- */
const VoiceHelp=guard(async()=>{status('Voice');V.innerHTML=`<div class="card voice"><div class="t">Talk to the CRM</div><div class="s">Tap the mic at the top of any screen and say what you need. On a job page, it acts on that job.</div>
 <div class="sec">${['“Add a task call Mike tomorrow”','“Note: customer wants a metal roof quote”','“Move this job to scheduled”','“Call Chad”','“Text Mike”','“Open Two Bit Saloon”','“New lead Sarah Jones 406 555 0123”','“Book inspection Friday at 2”','“Show my calendar” / “What’s late”'].map(x=>`<div class="kv"><span>${x}</span></div>`).join('')}</div>
 <div class="btns"><button class="b p f" onclick="startVoice()">${XI.mic}Try it now</button></div></div>`});

window.XROUTES={calendar:Calendar,more:More,reports:Reports,automations:Automations,invoices:Invoices,settings:Settings,team:Team,exports:Exports,install:Install,addons:Addons,voice:VoiceHelp};
window.XARGROUTES={invoice:Invoice};
window.XTITLES={calendar:'Calendar',more:'More',reports:'Reports',automations:'Automations',invoices:'Invoices',settings:'Settings',team:'Team',exports:'Export',install:'Install',addons:'Add-ons',voice:'Voice',invoiceX:'Invoice',inbox:'Texts',threadX:'Texts'};
