/* Lucky Line CRM: Stats & Training (Rich's idea, Nov 5 2026).
   A stock-ticker chip at the front of the urgency circles opens one page with:
   time saved vs time behind this week, an opt-in leaderboard, tips to improve, and the sales-training library. */
let statsAt=0;
function hm(min){min=Math.round(Math.abs(+min||0));const h=Math.floor(min/60),m=min%60;return h?h+'h'+(m?' '+m+'m':''):m+'m'}
async function loadStats(force){if(force||!cache.stats||Date.now()-statsAt>120000){cache.stats=await fn('crm.app_stats()');statsAt=Date.now()}return cache.stats}
function tickerHTML(s){if(!s)return '';const net=(+s.saved_min||0)-(+s.behind_min||0);
  return `<a class="tick" href="#stats" aria-label="Stats and training: ${hm(s.saved_min)} saved, ${hm(s.behind_min)} behind this week">
   <small class="tklbl">Stats &amp; tips</small><span class="tbox"><span class="tk up">▲ ${hm(s.saved_min)}<em>saved</em></span><span class="tk dn">▼ ${hm(s.behind_min)}<em>behind</em></span><span class="tk ${net>=0?'up':'dn'}">${net>=0?'+':'−'}${hm(net)}<em>net</em></span></span></a>`}
/* put the ticker in front of the urgency circles every time they are drawn */
const _drawOrbs=window.drawOrbs;
window.drawOrbs=function(d){_drawOrbs(d);const o=$('#orbs');if(!o)return;if(cache.stats)o.insertAdjacentHTML('afterbegin',tickerHTML(cache.stats));
  loadStats().then(s=>{const box=$('#orbs');if(!box)return;const old=box.querySelector('.tick');if(old)old.outerHTML=tickerHTML(s);else box.insertAdjacentHTML('afterbegin',tickerHTML(s))}).catch(()=>{})};

function tips(s){const t=[];const on=+s.on_time_week||0,sent=+s.proposals_week||0;
  if(+s.late_proposals>0)t.push({h:`${s.late_proposals} proposal${s.late_proposals>1?'s are':' is'} past the 60-minute clock`,b:'Alden closes about 80% because the proposal lands while he is still the freshest roofer in their head. Build it from the walk-around video before you leave the driveway, then hit Send.'});
  if(sent&&on<sent)t.push({h:`${on} of ${sent} proposals went out within 60 minutes this week`,b:'Record the walk-around with narration so the report and options write themselves. Most of the hour is typing, and the CRM can do that part.'});
  if(+s.late_tasks>0)t.push({h:`${s.late_tasks} call${s.late_tasks>1?'s':''} or task${s.late_tasks>1?'s':''} overdue`,b:'Knock out the reddest circles first. A two-minute call today beats a perfect call next week, and the circles shrink back to green as you go.'});
  if(!+s.reports_week)t.push({h:'No video inspections logged this week',b:'Every walk-around you record is a report, a priced estimate and a proposal draft for free. Tap Inspect on the job, or drop the video in the Lucky Line Inspections folder.'});
  if(!t.length)t.push({h:'Clean week. Nothing is late.',b:'Use the extra time on the people who went quiet: open Pipe, sort by days quiet, and call the top three.'});
  return t}
function canEdit(){return !document.body.classList.contains('ro')}
const Stats=guard(async()=>{status('Crunching…');const s=await loadStats(true);status('Stats · this week');
  const net=(+s.saved_min||0)-(+s.behind_min||0),mins=s.minutes||{};const board=(s.board||[]).map(b=>({...b,score:(+b.done||0)+3*(+b.sent||0)+5*(+b.ontime||0)})).sort((a,b)=>b.score-a.score);
  const lib=Array.isArray(s.training)?s.training:[];
  V.innerHTML=`<div class="card"><div class="k">This week</div>
   <div class="stk"><div><b class="up">▲ ${hm(s.saved_min)}</b><span>saved by the CRM</span></div><div><b class="dn">▼ ${hm(s.behind_min)}</b><span>behind on proposals</span></div><div><b class="${net>=0?'up':'dn'}">${net>=0?'+':'−'}${hm(net)}</b><span>net</span></div></div>
   <div class="s" style="margin-top:8px">Saved = ${s.proposals_week} proposals × ${mins.proposal||45}m + ${s.reports_week} video reports × ${mins.report||60}m + ${s.auto_tasks_week} automatic follow-ups × ${mins.auto_task||5}m + ${s.tasks_done_week} tasks done × ${mins.task_done||3}m. Behind = how far past the 60-minute clock the open proposals are (max 24h each). These are estimates.</div></div>

  <h2>How to get better <span class="n">${tips(s).length}</span></h2>
  <div class="stack">${tips(s).map(x=>`<div class="card"><div class="t">${esc(x.h)}</div><div class="s cl3" data-label="${esc(x.h)}" style="color:var(--text);margin-top:4px">${esc(x.b)}</div></div>`).join('')}</div>

  <h2>Leaderboard <span class="n">opt-in</span></h2>
  <div class="card">${board.length?board.map((b,i)=>`<div class="lbr"><span class="rk">${i+1}</span><span class="grow t">${esc(b.name)}</span><span class="s">${b.done} done · ${b.sent} sent · ${b.ontime} on time</span><b class="sc">${b.score}</b></div>`).join(''):'<div class="s">Nobody has joined yet. Contests and the leaderboard only show people who opt in.</div>'}
   <div class="btns"><button class="b f keep" onclick="optBoard(${!s.me_on_board})">${s.me_on_board?'Leave the leaderboard':'Join the leaderboard'}</button></div>
   <div class="s" style="margin-top:6px">Score = tasks done + 3 per proposal sent + 5 per proposal sent within 60 minutes.</div></div>

  <h2>Sales training <span class="n">${lib.length}</span></h2>
  <div class="stack">${lib.map((x,i)=>`<div class="card row"><div class="grow"><div class="t">${esc(x.title)}</div><div class="s">${esc(x.kind||'Link')}</div></div><a class="b sm keep" href="${esc(x.url)}" target="_blank" rel="noopener">Open</a>${canEdit()?`<button class="b sm ic" aria-label="Remove" onclick="delTraining(${i})">✕</button>`:''}</div>`).join('')||'<div class="card empty">No training added yet.</div>'}</div>
  ${canEdit()?`<div class="card" style="margin-top:8px"><label class="f" style="margin-top:0">Add a training doc or video</label><input type="text" id="trt" placeholder="Title, e.g. Closing on the first visit"><div class="grid2"><div><input type="url" id="tru" placeholder="https://…" style="margin-top:6px"></div><div><select id="trk" style="margin-top:6px"><option>Video</option><option>Doc</option><option>Script</option><option>Course</option></select></div></div><div class="btns"><button class="b p f" onclick="addTraining()">Add to training</button></div></div>`:''}`});
window.optBoard=async on=>{try{await sql(`select crm.set_leaderboard(${on?'true':'false'}) as ok`);cache.stats=null;Stats()}catch(e){status('Could not update: '+e.message)}};
async function saveTraining(list){await sql(`insert into crm.settings(key,value) values ('training',${q(JSON.stringify(list))}) on conflict (key) do update set value=excluded.value, updated_at=now(); select 1`);cache.stats=null;Stats()}
window.addTraining=async()=>{const t=$('#trt').value.trim(),u=$('#tru').value.trim(),k=$('#trk').value;if(!t||!/^https?:\/\//.test(u)){status('Add a title and a link that starts with https://');return}const s=await loadStats(true);await saveTraining([...(s.training||[]),{title:t,url:u,kind:k}])};
window.delTraining=async i=>{const s=await loadStats(true);const l=[...(s.training||[])];l.splice(i,1);await saveTraining(l)};
Object.assign(window.XROUTES,{stats:Stats});Object.assign(window.XTITLES||(window.XTITLES={}),{stats:'Stats & training'});
