/* Lucky Line CRM v2: hands-free voice commands (free, uses the phone's own speech recognition).
   Simple phrases are understood on the phone; inside Claude, anything else is read by Claude. */
let rec=null,listening=false;
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function curJob(){const m=(location.hash||'').match(/^#job-(.+)$/);return m&&cache.job&&cache.job.job&&cache.job.job.id===m[1]?cache.job:null}
function voiceBox(html){let b=$('#voicebox');if(!b){b=document.createElement('div');b.id='voicebox';b.className='card voice';b.setAttribute('role','status');V.prepend(b)}b.innerHTML=html;$('#scroll').scrollTop=0;return b}
window.startVoice=()=>{if(!SR){voiceBox(`<div class="t">Voice isn't available in this browser</div><div class="s">Use Safari on iPhone or Chrome on Android, or type below.</div><div class="row" style="margin-top:8px"><input type="text" id="vtype" class="grow" placeholder="add a task call Mike tomorrow"><button class="b p" onclick="runVoice($('#vtype').value)">Go</button></div>`);return}
  if(listening){rec&&rec.stop();return}
  rec=new SR();rec.lang='en-US';rec.interimResults=true;rec.maxAlternatives=1;let finalT='';
  rec.onstart=()=>{listening=true;$('#micBtn')&&$('#micBtn').classList.add('rec');voiceBox(`<div class="k">Listening…</div><div class="heard" id="vheard">Say “add a task…”, “note…”, “call…”, “move this job to…”</div>`)};
  rec.onresult=e=>{let t='';for(const r of e.results){t+=r[0].transcript;if(r.isFinal)finalT=t}const h=$('#vheard');if(h)h.textContent=t};
  rec.onerror=e=>{voiceBox(`<div class="t">Didn't catch that</div><div class="s">${esc(e.error==='not-allowed'?'Allow the microphone for this site in your phone settings.':'Try again a little closer to the phone.')}</div>`)};
  rec.onend=()=>{listening=false;$('#micBtn')&&$('#micBtn').classList.remove('rec');const h=$('#vheard');const t=finalT||(h&&!/^Say /.test(h.textContent)?h.textContent:'');if(t)runVoice(t)};
  try{rec.start()}catch(e){listening=false}};
function whenFrom(s){s=(s||'').toLowerCase();const base=new Date();let d=null,h=9,mi=0;const tm=s.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?\b/);
  if(/\btoday\b|\btonight\b/.test(s))d=0;else if(/\btomorrow\b/.test(s))d=1;else if(/next week/.test(s))d=7;else{const m=s.match(/in (\d+|a|an|one|two|three) (hour|day|week)s?/);if(m){const n={a:1,an:1,one:1,two:2,three:3}[m[1]]||+m[1];if(m[2]==='hour')return new Date(Date.now()+n*36e5);d=n*(m[2]==='week'?7:1)}}
  const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];const dw=days.findIndex(x=>s.includes(x));
  if(d==null&&dw>=0){const today=new Date(new Date().toLocaleString('en-US',{timeZone:TZ})).getDay();d=(dw-today+7)%7||7}
  if(tm&&(tm[3]||/at\s+\d/.test(s))){h=+tm[1];mi=+(tm[2]||0);const ap=(tm[3]||'').replace(/\./g,'');if(ap==='pm'&&h<12)h+=12;if(ap==='am'&&h===12)h=0;if(!ap&&h<7)h+=12}
  if(d==null&&!tm)return null;if(d==null)d=0;
  const local=dISO(base.getTime()+d*864e5);return {date:local,time:String(h).padStart(2,'0')+':'+String(mi).padStart(2,'0')}}
const stripWhen=s=>s.replace(/\b(today|tonight|tomorrow|next week|on (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|(monday|tuesday|wednesday|thursday|friday|saturday|sunday)|in (\d+|a|an|one|two|three) (hours?|days?|weeks?)|at \d{1,2}(:\d{2})?\s*(am|pm|a\.m\.|p\.m\.)?)\b/gi,'').replace(/\s{2,}/g,' ').trim();
async function findPerson(name){if(!cache.people)cache.people=await fn(`crm.app_people('')`);const n=name.toLowerCase().trim();return (cache.people||[]).find(p=>p.name.toLowerCase()===n)||(cache.people||[]).find(p=>p.name.toLowerCase().startsWith(n))||(cache.people||[]).find(p=>p.name.toLowerCase().includes(n))}
async function findJob(name){if(!cache.pipe)cache.pipe=await fn('crm.app_pipeline()');const n=name.toLowerCase().trim();return (cache.pipe||[]).find(j=>(j.title+' '+(j.contact||'')).toLowerCase().includes(n))}
window.runVoice=async raw=>{const t=String(raw||'').trim().replace(/[.!?]+$/,'');if(!t)return;const s=t.toLowerCase();const J=curJob();const jid=J?J.job.id:null,cid=J&&J.contact?J.contact.id:null;
  const done=(msg,undo)=>voiceBox(`<div class="k">You said</div><div class="heard">“${esc(t)}”</div><div class="s" style="color:var(--text);margin-top:6px">✓ ${msg}</div><div class="btns"><button class="b p sm" onclick="startVoice()">${XI.mic}Again</button><button class="b sm" onclick="this.closest('#voicebox').remove()">Close</button></div>`);
  try{let m;
   if((m=s.match(/^(?:new|add)(?: a)? lead (.+)$/))){const ph=(m[1].match(/[\d\s-]{10,}/)||[''])[0];const nm=t.slice(t.toLowerCase().indexOf('lead')+4).replace(ph,'').trim();location.hash='add';setTimeout(()=>{const f=$('#lf');if(f){f.name.value=nm.replace(/\b\w/g,c=>c.toUpperCase());f.phone.value=ph.trim()}},150);return}
   if((m=s.match(/^(?:add |create )?(?:a )?(?:task|reminder|remind me(?: to)?)(?: to)? (.+)$/))){const w=whenFrom(m[1]);let ttl=stripWhen(t.slice(t.length-m[1].length));ttl=ttl.charAt(0).toUpperCase()+ttl.slice(1);
     const due=w?`((${q(w.date)}::date + ${q(w.time)}::time) at time zone '${TZ}')`:`(((now() at time zone '${TZ}')::date+1)+time '09:00') at time zone '${TZ}'`;
     await sql(`insert into crm.tasks(contact_id,job_id,kind,title,owner,priority,due_at,source) values (${q(cid)},${q(jid)},${q(/^(call|phone)/i.test(ttl)?'call':/^text/i.test(ttl)?'text':'other')},${q(ttl)},'Justin','Normal',${due},'Voice'); select 1`);cache.today=null;done(`Task added${J?' to this job':''}: ${esc(ttl)}${w?' · '+esc(w.date)+' '+esc(w.time):' · tomorrow 9:00'}`);return}
   if((m=s.match(/^(?:add a |take a |log a )?(?:note|log)[:,]? (.+)$/))){if(!J){done('Open a job first, then say “note…”');return}await sql(`insert into crm.notes(contact_id,job_id,kind,body,author,source) values (${q(cid)},${q(jid)},'note',${q(t.slice(t.length-m[1].length))},'Justin','Voice'); update crm.jobs set last_contact_at=now() where id=${q(jid)}; select 1`);done('Note saved on this job');setTimeout(()=>Job(jid),900);return}
   if((m=s.match(/^(?:move|mark|set|put) (?:this job |it |this )?(?:to|as|in|into) (.+)$/))){const st=ALL_STAGES.find(x=>m[1].includes(x.toLowerCase()))||(/sign|won|approve/.test(m[1])?'Approved':/lost|dead/.test(m[1])?'Lost':/done|complete|finish/.test(m[1])?'Completed':/paid/.test(m[1])?'Paid':/hold/.test(m[1])?'On Hold':/schedul/.test(m[1])?'Scheduled':null);
     if(!J||!st){done(J?'Say a stage like “scheduled” or “completed”':'Open a job first');return}await sql(`update crm.jobs set stage=${q(st)} where id=${q(jid)}; select 1`);cache.pipe=null;done('Moved to '+esc(st));setTimeout(()=>Job(jid),900);return}
   if((m=s.match(/^book (?:an |the )?(inspection|install|meeting)(?: for (.+?))?(?: (?:on|at|for) .+)?$/))||(m=s.match(/^book (?:an |the )?(inspection|install|meeting)(.*)$/))){const w=whenFrom(t);if(!w){done('Say a day and time, like “book inspection Friday at 2”');return}const k=m[1];
     const st=`((${q(w.date)}::date + ${q(w.time)}::time) at time zone '${TZ}')`;
     if(k==='install'&&J)await sql(`update crm.jobs set scheduled_start=${st},scheduled_end=${st}+interval '9 hours',stage=case when stage in ('Approved','Proposal Sent') then 'Scheduled' else stage end where id=${q(jid)}; select 1`);
     else await sql(`insert into crm.events(job_id,contact_id,kind,title,starts_at,ends_at,created_by) values (${q(jid)},${q(cid)},${q(k)},${q(k.charAt(0).toUpperCase()+k.slice(1)+(J?': '+J.job.title.split(' — ')[0]:''))},${st},${st}+interval '1 hour','Voice'); select 1`);done(`Booked ${esc(k)} ${esc(w.date)} ${esc(w.time)}`);return}
   if((m=s.match(/^(call|text|email) (.+)$/))){const p=m[2]==='them'||m[2]==='him'||m[2]==='her'?(J&&J.contact):await findPerson(m[2]);if(!p){done('No one called “'+esc(m[2])+'”');return}const ph=(p.phones||[])[0],em=(p.emails||[])[0];
     if(m[1]==='email'&&em){location.href='mailto:'+em;return}if(!ph){done(esc(p.name)+' has no phone number');return}location.href=(m[1]==='call'?'tel:':'sms:')+ph;return}
   if(/^(show |open |go to )?(my )?(calendar|schedule)$/.test(s)){location.hash='calendar';return}
   if(/^(show |open )?(reports?|numbers)$/.test(s)){location.hash='reports';return}
   if(/what'?s late|^(show |open )?today$|^home$/.test(s)){location.hash='today';return}
   if(/^(show |open )?(pipeline|pipe|jobs)$/.test(s)){location.hash='pipeline';return}
   if(/^(show |open )?(texts|messages|inbox)$/.test(s)){location.hash='inbox';return}
   if((m=s.match(/^(?:open|show|find|go to|pull up) (.+)$/))){const j=await findJob(m[1]);if(j){location.hash='job-'+j.id;return}const p=await findPerson(m[1]);if(p){location.hash='contact-'+p.id;return}done('Couldn\'t find “'+esc(m[1])+'”');return}
   // anything else: let Claude read it when running inside Claude
   if(!sampler){try{sampler=await claude.use('sample')}catch(e){}}
   if(sampler){voiceBox(`<div class="k">You said</div><div class="heard">“${esc(t)}”</div><div class="s">Working it out…</div>`);const r=await sampler(`Turn this spoken command for a roofing CRM into JSON only, one of: {"do":"task","title":"...","when":"tomorrow 9am"} | {"do":"note","text":"..."} | {"do":"stage","stage":"one of ${ALL_STAGES.join(', ')}"} | {"do":"open","name":"..."} | {"do":"none","reply":"short answer"}.\nCommand: ${t}`,{modelTier:'fast'});const a=JSON.parse(((r&&r.text)||'{}').replace(/^[^{]*/,'').replace(/[^}]*$/,''));
     if(a.do==='task')return runVoice('add a task '+a.title+' '+(a.when||''));if(a.do==='note')return runVoice('note '+a.text);if(a.do==='stage')return runVoice('move this job to '+a.stage);if(a.do==='open')return runVoice('open '+a.name);done(esc(a.reply||'Got it'));return}
   voiceBox(`<div class="k">You said</div><div class="heard">“${esc(t)}”</div><div class="s" style="margin-top:6px">I didn't understand that one. Try “add a task…”, “note…”, “call…”, “move this job to…”, “book inspection Friday at 2”.</div><div class="btns"><a class="b sm" href="#voice">All commands</a><button class="b sm" onclick="this.closest('#voicebox').remove()">Close</button></div>`)
  }catch(e){done('Could not do that: '+esc(e.message))}};
