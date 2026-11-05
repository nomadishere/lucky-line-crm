/* Public sign-up with Justin's approval.
   - Login screen gets "Create a free account" (name, company, email, password).
   - New accounts see a "pending" screen until Justin approves them.
   - Justin (editor) sees a "New sign-ups" card on Today with Approve / Decline.
   Server side: public.clvr_signup, public.clvr_whoami, crm.pending_signups, crm.approve_signup. */
(() => {
  const U = SB_URL, K = SB_KEY, VIEW = () => document.getElementById('view');
  const e2 = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  window.ACCESS = null; window.PENDING = false;

  // ---------- who am I (works for pending accounts too) ----------
  async function whoami() {
    const tok = await freshToken(); if (!tok) return null;
    const r = await fetch(U + '/rest/v1/rpc/clvr_whoami', { method: 'POST', headers: { apikey: K, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: '{}' });
    return r.ok ? r.json() : null;
  }
  const _check = checkAccess;
  checkAccess = async function () {
    if (!hosted || !session) return;
    let a = null; try { a = await whoami(); } catch (e) {}
    window.ACCESS = a || {}; window.PENDING = !!(a && a.pending);
    if (window.PENDING) { if (a.name) window.MYNAME = String(a.name).split(' ')[0]; Pending(); return; }
    await _check();
    showSignups();
  };

  // ---------- pending screen ----------
  function Pending() {
    status('Waiting for approval'); const o = document.getElementById('orbs'); if (o) o.innerHTML = '';
    const sg = document.getElementById('signups'); if (sg) sg.innerHTML = '';
    VIEW().innerHTML = `<div class="card" style="max-width:440px;margin:24px auto;text-align:center">
      <div style="font-size:42px;line-height:1">&#127808;</div>
      <div class="t" style="margin-top:10px">You're on the list${window.MYNAME ? ', ' + e2(window.MYNAME) : ''}!</div>
      <div class="s" style="margin-top:8px">Justin approves every new ${e2(window.BRAND || 'CLVR')} account, usually the same day. As soon as he does, this page opens straight into the CRM.</div>
      <div class="btns" style="justify-content:center"><button class="b p keep" id="pgAgain">Check again</button><button class="b keep" onclick="signOut()">Sign out</button></div></div>`;
    document.getElementById('pgAgain').onclick = async () => { await checkAccess(); if (!window.PENDING) go(); };
  }
  window.Pending = Pending;
  const _go = go;
  let checking = null;
  go = function () {
    if (hosted && session && window.ACCESS === null) { // learn access first so pending accounts never hit the data screens
      if (!checking) checking = checkAccess().finally(() => { checking = null; if (!window.PENDING) { _go(); setTimeout(showSignups, 50); } });
      return;
    }
    if (hosted && session && window.PENDING) { Pending(); return; }
    _go.apply(this, arguments); setTimeout(showSignups, 50);
  };
  removeEventListener('hashchange', _go); addEventListener('hashchange', () => go());
  const _out = window.signOut;
  if (typeof _out === 'function') window.signOut = async function () { window.ACCESS = null; window.PENDING = false; const sg = document.getElementById('signups'); if (sg) sg.innerHTML = ''; return _out.apply(this, arguments); };

  // ---------- sign-up form on the login screen ----------
  const _login = Login;
  Login = function () {
    _login();
    const f = document.getElementById('lg'); if (!f) return;
    const box = document.createElement('div'); box.className = 's'; box.style.cssText = 'text-align:center;margin-top:14px';
    box.innerHTML = `New here? <button type="button" class="b sm keep" id="toSignup" style="margin-left:6px">Create a free account</button>`;
    f.appendChild(box);
    document.getElementById('toSignup').onclick = Signup;
  };
  function Signup() {
    status('Create account');
    VIEW().innerHTML = `<form class="card" id="sg" style="max-width:420px;margin:24px auto">
      <div class="t" style="text-align:center">Create your ${e2(window.BRAND || 'CLVR')} account</div>
      <div class="s" style="text-align:center;margin-top:4px">Free. Justin approves new accounts, usually the same day.</div>
      <label class="f">Your name</label><input name="n" autocomplete="name" required maxlength="80">
      <label class="f">Company <span style="opacity:.6">(optional)</span></label><input name="c" autocomplete="organization" maxlength="80">
      <label class="f">Email</label><input type="email" name="e" autocomplete="email" required>
      <label class="f">Password <span style="opacity:.6">(8+ characters)</span></label><input type="password" name="p" autocomplete="new-password" minlength="8" required>
      <div class="s" id="sgerr" style="color:var(--red);margin-top:8px"></div>
      <div class="btns"><button class="b p f" type="submit" id="sgBtn">Create account</button></div>
      <div class="s" style="text-align:center;margin-top:12px">Already have one? <button type="button" class="b sm keep" id="toLogin" style="margin-left:6px">Sign in</button></div></form>`;
    document.querySelectorAll('#sg input').forEach(i => { if (!i.style.width) i.style.cssText = 'width:100%;min-height:38px;border-radius:9px;border:1px solid var(--border2);background:var(--panel2);padding:8px 10px;color:var(--text)'; });
    document.getElementById('toLogin').onclick = () => Login();
    document.getElementById('sg').onsubmit = async ev => {
      ev.preventDefault(); const f = Object.fromEntries(new FormData(ev.target)), err = document.getElementById('sgerr'), btn = document.getElementById('sgBtn');
      err.textContent = ''; btn.disabled = true; btn.textContent = 'Creating…';
      try {
        const r = await fetch(U + '/rest/v1/rpc/clvr_signup', { method: 'POST', headers: { apikey: K, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_name: f.n, p_email: f.e.trim(), p_password: f.p, p_company: f.c || null }) });
        const d = await r.json().catch(() => null);
        if (!r.ok) throw new Error((d && d.message) || 'Could not create the account');
        const { data, error } = await sb.auth.signInWithPassword({ email: f.e.trim(), password: f.p });
        if (error) throw new Error('Account made. Please sign in.');
        session = data.session; document.getElementById('live').classList.remove('off'); document.getElementById('signout').style.display = 'grid';
        await checkAccess(); if (!window.PENDING) { location.hash = 'today'; go(); }
      } catch (e) { err.textContent = e.message; btn.disabled = false; btn.textContent = 'Create account'; }
    };
  }

  // ---------- Justin's approval card (Today) ----------
  async function showSignups() {
    let sg = document.getElementById('signups');
    if (!sg) { const v = VIEW(); if (!v) return; sg = document.createElement('div'); sg.id = 'signups'; v.parentNode.insertBefore(sg, v); }
    const onToday = !location.hash || location.hash === '#today';
    if (!hosted || !session || !(window.ACCESS && window.ACCESS.editor) || !onToday) { sg.innerHTML = ''; return; }
    let list = [];
    try { const r = await sb.rpc('crm_run', { stmts: ['select crm.pending_signups() as l'] }); const l = r.data && r.data[0] && r.data[0].l; list = typeof l === 'string' ? JSON.parse(l) : (l || []); } catch (e) {}
    if (!list.length) { sg.innerHTML = ''; return; }
    sg.innerHTML = `<div class="card" style="margin-bottom:12px"><div class="t">New sign-ups <span class="s">(${list.length})</span></div>
      <div class="s" style="margin-top:2px">Approve to give them the same access as Gage, Rich and Christian: add anything, change or delete nothing.</div>
      ${list.map(p => `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 0;border-top:1px solid var(--border)">
        <div style="flex:1;min-width:160px"><b>${e2(p.name)}</b>${p.company ? ' · ' + e2(p.company) : ''}<div class="s">${e2(p.email)} · ${e2(new Date(p.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }))}</div></div>
        <button class="b sm p keep" data-ok="1" data-id="${e2(p.id)}">Approve</button><button class="b sm keep" data-ok="0" data-id="${e2(p.id)}">Decline</button></div>`).join('')}</div>`;
    sg.querySelectorAll('button[data-id]').forEach(b => b.onclick = async () => {
      const id = b.dataset.id; if (!/^[0-9a-f-]{36}$/i.test(id)) return;
      b.disabled = true; b.textContent = b.dataset.ok === '1' ? 'Approving…' : 'Declining…';
      await sb.rpc('crm_run', { stmts: [`select crm.approve_signup('${id}', ${b.dataset.ok === '1'}) as r`] });
      showSignups();
    });
  }
  window.showSignups = showSignups;
})();
