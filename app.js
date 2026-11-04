const user = Auth.current();
if (!user) location.href = 'login.html';
const $ = (s) => document.querySelector(s), view = $('#view');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const isT = user.role === 'teacher';
const uid = (p) => p + Math.random().toString(36).slice(2, 9);

function toast(msg, err) {
  const t = document.createElement('div'); t.className = 'toast' + (err ? ' err' : ''); t.textContent = msg;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), 3200);
}
// ---- data helpers
const get = () => DB.load();
const myAssignments = (d) => isT ? d.assignments.filter(a => a.teacherId === user.id) : d.assignments;
const subOf = (d, aid, sid) => d.submissions.find(s => s.assignmentId === aid && s.studentId === sid);
const stateOf = (d, a) => subOf(d, a.id, user.id) ? 'Submitted' : (new Date(a.deadline) < new Date() ? 'Overdue' : 'Pending');
const pill = (t) => `<span class="pill ${{ Submitted: 'p-info', Pending: 'p-warn', Overdue: 'p-bad', Reviewed: 'p-ok', 'Needs resubmission': 'p-bad' }[t] || 'p-info'}">${esc(t)}</span>`;
const empty = (m, link) => `<div class="empty"><p>${m}</p>${link || ''}</div>`;

// ---- routes: [html builder, allowed role]
const routes = {
  dashboard: () => isT ? teacherDash() : studentDash(),
  assignments: assignmentList,
  assignment: (id) => details(id),
  submit: (id) => submitPage(id),
  history: historyPage,
  submissions: submissionsPage,
  create: createPage
};
const access = { submit: 'student', history: 'student', submissions: 'teacher', create: 'teacher' };

function nav() {
  const items = isT
    ? [['dashboard', '🏠 Dashboard'], ['assignments', '📋 Assignments'], ['create', '➕ New assignment'], ['submissions', '📥 Submissions']]
    : [['dashboard', '🏠 Dashboard'], ['assignments', '📋 Assignments'], ['history', '🕘 My submissions']];
  const cur = (location.hash.split('/')[1] || 'dashboard');
  $('#nav').innerHTML = items.map(([r, l]) => `<a href="#/${r}" class="${cur === r ? 'on' : ''}">${l}</a>`).join('');
}
function route() {
  const [, name = 'dashboard', param] = location.hash.split('/');
  nav(); $('#side').classList.remove('open');
  if (!routes[name]) { view.innerHTML = empty('Page not found.', '<a class="btn" href="#/dashboard">Go to dashboard</a>'); return; }
  if (access[name] && access[name] !== user.role) { toast('You do not have access to that page.', true); location.hash = '#/dashboard'; return; }
  view.innerHTML = '<div class="spin" role="status" aria-label="Loading"></div>';
  setTimeout(() => { view.innerHTML = routes[name](param); bind(name, param); }, 250);
}

// ---- student dashboard
function studentDash() {
  const d = get(), list = d.assignments, st = list.map(a => stateOf(d, a));
  const n = (k) => st.filter(x => x === k).length, done = n('Submitted'), pct = list.length ? Math.round(done / list.length * 100) : 0;
  const upcoming = list.filter(a => stateOf(d, a) === 'Pending').sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 4);
  const recent = [...list].sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, 4);
  return `<h2>Welcome back, ${esc(user.name.split(' ')[0])}</h2><p class="mute">Here is where your assignments stand.</p>
  <div class="grid4">${[['Total assignments', list.length], ['Submitted', done], ['Pending', n('Pending')], ['Overdue', n('Overdue')]].map(([l, v]) => `<div class="card stat"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
  <div class="cols"><div class="card"><h3>Recent assignments</h3>${recent.length ? recent.map(a => `<div class="row"><div><a href="#/assignment/${a.id}">${esc(a.title)}</a><div class="mute">${esc(a.subject)}</div></div>${pill(stateOf(d, a))}</div>`).join('') : empty('No assignments yet.')}</div>
  <div class="card"><h3>Upcoming deadlines</h3>${upcoming.length ? upcoming.map(a => `<div class="row"><div><a href="#/assignment/${a.id}">${esc(a.title)}</a><div class="mute">Due ${fmt(a.deadline)}</div></div><a class="btn sm" href="#/submit/${a.id}">Submit</a></div>`).join('') : empty('Nothing due. You are all caught up.')}</div></div>
  <div class="card" style="margin-top:1rem"><h3>Submission statistics</h3><div class="bar"><i style="width:${pct}%"></i></div><span class="mute">${done} of ${list.length} assignments submitted (${pct}%)</span></div>`;
}
// ---- teacher dashboard
function teacherDash() {
  const d = get(), mine = myAssignments(d), ids = mine.map(a => a.id), subs = d.submissions.filter(s => ids.includes(s.assignmentId));
  const wait = subs.filter(s => s.status === 'Submitted').length, rev = subs.filter(s => s.status === 'Reviewed').length;
  const upcoming = mine.filter(a => new Date(a.deadline) > new Date()).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 4);
  const recent = [...subs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const title = (id) => esc((d.assignments.find(a => a.id === id) || {}).title);
  return `<h2>Welcome, ${esc(user.name)}</h2><p class="mute">Manage your assignments and review student work.</p>
  <div class="grid4">${[['Total assignments', mine.length], ['Submissions received', subs.length], ['Awaiting review', wait], ['Reviewed', rev]].map(([l, v]) => `<div class="card stat"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
  <div class="cols"><div class="card"><h3>Recent submissions</h3>${recent.length ? recent.map(s => `<div class="row"><div>${esc(s.studentName)}<div class="mute">${title(s.assignmentId)} · ${fmt(s.date)}</div></div>${pill(s.status)}</div>`).join('') : empty('No submissions yet.')}</div>
  <div class="card"><h3>Upcoming deadlines</h3>${upcoming.length ? upcoming.map(a => `<div class="row"><div>${esc(a.title)}<div class="mute">Due ${fmt(a.deadline)}</div></div><span class="mute">${d.submissions.filter(s => s.assignmentId === a.id).length} submitted</span></div>`).join('') : empty('No upcoming deadlines.', '<a class="btn" href="#/create">Create assignment</a>')}</div></div>`;
}
// ---- assignment list
function assignmentList() {
  const d = get(), list = myAssignments(d);
  const filt = isT ? '' : `<div class="bar-actions"><label for="flt" class="mute" style="margin:0">Show</label><select id="flt"><option>All</option><option>Pending</option><option>Submitted</option><option>Overdue</option></select></div>`;
  return `<h2>Assignments</h2>${filt}<div id="alist">${rows(d, list)}</div>`;
}
function rows(d, list) {
  if (!list.length) return `<div class="card">${empty('No assignments found.', isT ? '<a class="btn" href="#/create">Create assignment</a>' : '')}</div>`;
  return `<div class="card tablewrap"><table><thead><tr><th>Title</th><th>Subject</th><th>Deadline</th><th>${isT ? 'Submissions' : 'Status'}</th><th></th></tr></thead><tbody>${list.map(a => `<tr><td><a href="#/assignment/${a.id}">${esc(a.title)}</a></td><td>${esc(a.subject)}</td><td>${fmt(a.deadline)}</td><td>${isT ? d.submissions.filter(s => s.assignmentId === a.id).length : pill(stateOf(d, a))}</td><td>${isT ? `<button class="btn danger sm" data-del="${a.id}">Delete</button>` : (stateOf(d, a) === 'Submitted' ? '' : `<a class="btn sm" href="#/submit/${a.id}">Submit</a>`)}</td></tr>`).join('')}</tbody></table></div>`;
}
// ---- details
function details(id) {
  const d = get(), a = d.assignments.find(x => x.id === id);
  if (!a) return empty('That assignment does not exist.', '<a class="btn" href="#/assignments">Back to assignments</a>');
  const s = isT ? null : subOf(d, a.id, user.id);
  return `<a href="#/assignments">← All assignments</a><div class="card" style="margin-top:.8rem"><h2>${esc(a.title)}</h2>
  <p class="mute">${esc(a.subject)} · Posted ${fmt(a.created)} · Due ${fmt(a.deadline)} ${isT ? '' : pill(stateOf(d, a))}</p>
  <h3>Description</h3><p>${esc(a.description)}</p><h3>Instructions</h3><p>${esc(a.instructions || 'No extra instructions.')}</p>
  ${isT ? '' : (s ? `<p class="mute">You submitted <b>${esc(s.fileName)}</b> on ${fmt(s.date)}. Status: ${pill(s.status)}</p>` : '')}
  ${isT ? '' : (s && s.status === 'Reviewed' ? '' : `<a class="btn" href="#/submit/${a.id}">${s ? 'Resubmit' : 'Submit assignment'}</a>`)}</div>`;
}
// ---- submit
function submitPage(id) {
  const d = get(), a = d.assignments.find(x => x.id === id);
  if (!a) return empty('That assignment does not exist.', '<a class="btn" href="#/assignments">Back</a>');
  return `<a href="#/assignment/${a.id}">← Back</a><div class="card" style="margin-top:.8rem;max-width:560px"><h2>Submit: ${esc(a.title)}</h2>
  <p class="mute">Due ${fmt(a.deadline)}. Accepted files: PDF or DOCX, up to 5 MB.</p>
  <form id="sf"><label for="file">File</label><input id="file" type="file" accept=".pdf,.docx" required>
  <label for="notes">Notes for your teacher (optional)</label><textarea id="notes" rows="3"></textarea>
  <p style="margin-top:1rem"><button class="btn">Submit assignment</button></p></form></div>`;
}
// ---- history
function historyPage() {
  const d = get(), subs = d.submissions.filter(s => s.studentId === user.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const t = (id) => esc((d.assignments.find(a => a.id === id) || { title: '(deleted)' }).title);
  return `<h2>My submissions</h2>` + (subs.length ? `<div class="card tablewrap"><table><thead><tr><th>Assignment</th><th>File</th><th>Submitted</th><th>Status</th></tr></thead><tbody>${subs.map(s => `<tr><td>${t(s.assignmentId)}</td><td>${esc(s.fileName)}</td><td>${fmt(s.date)}</td><td>${pill(s.status)}</td></tr>`).join('')}</tbody></table></div>` : `<div class="card">${empty('You have not submitted anything yet.', '<a class="btn" href="#/assignments">View assignments</a>')}</div>`);
}
// ---- teacher submissions
function submissionsPage() {
  const d = get(), mine = myAssignments(d);
  return `<h2>Student submissions</h2><div class="bar-actions"><label for="af" class="mute" style="margin:0">Assignment</label><select id="af"><option value="">All</option>${mine.map(a => `<option value="${a.id}">${esc(a.title)}</option>`).join('')}</select></div><div id="slist">${subRows(d, '')}</div>`;
}
function subRows(d, aid) {
  const ids = myAssignments(d).map(a => a.id);
  const subs = d.submissions.filter(s => ids.includes(s.assignmentId) && (!aid || s.assignmentId === aid));
  if (!subs.length) return `<div class="card">${empty('No submissions to show yet.')}</div>`;
  const t = (id) => esc(d.assignments.find(a => a.id === id).title);
  return `<div class="card tablewrap"><table><thead><tr><th>Student</th><th>Assignment</th><th>File</th><th>Submitted</th><th>Status</th></tr></thead><tbody>${subs.map(s => `<tr><td>${esc(s.studentName)}</td><td>${t(s.assignmentId)}</td><td>${esc(s.fileName)}${s.notes ? `<div class="mute">${esc(s.notes)}</div>` : ''}</td><td>${fmt(s.date)}</td><td><select data-st="${s.id}" aria-label="Status">${['Submitted', 'Reviewed', 'Needs resubmission'].map(o => `<option ${o === s.status ? 'selected' : ''}>${o}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>`;
}
// ---- create
function createPage() {
  return `<h2>New assignment</h2><div class="card" style="max-width:600px"><form id="cf">
  <label for="t">Title</label><input id="t" required maxlength="100"><label for="s">Subject</label><input id="s" required maxlength="60">
  <label for="d">Description</label><textarea id="d" rows="3" required></textarea><label for="i">Instructions</label><textarea id="i" rows="3"></textarea>
  <label for="dl">Deadline</label><input id="dl" type="date" required><p style="margin-top:1rem"><button class="btn">Create assignment</button></p></form></div>`;
}

// ---- event wiring after each render
function bind(name) {
  if (name === 'assignments') {
    const f = $('#flt'); if (f) f.onchange = () => { const d = get(); $('#alist').innerHTML = rows(d, myAssignments(d).filter(a => f.value === 'All' || stateOf(d, a) === f.value)); wireDel(); };
    wireDel();
  }
  if (name === 'submissions') {
    $('#af').onchange = (e) => { $('#slist').innerHTML = subRows(get(), e.target.value); wireStatus(); }; wireStatus();
  }
  if (name === 'submit') $('#sf')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const file = $('#file').files[0], ok = file && /\.(pdf|docx)$/i.test(file.name);
    if (!ok) return toast('Choose a PDF or DOCX file.', true);
    if (file.size > 5 * 1024 * 1024) return toast('File is larger than 5 MB.', true);
    const d = get(), aid = location.hash.split('/')[2], old = subOf(d, aid, user.id);
    const rec = { id: old ? old.id : uid('u'), assignmentId: aid, studentId: user.id, studentName: user.name, date: new Date().toISOString(), fileName: file.name, notes: $('#notes').value.trim(), status: 'Submitted' };
    d.submissions = d.submissions.filter(s => s !== undefined && s.id !== rec.id); d.submissions.push(rec); DB.save(d);
    toast('Assignment submitted.'); location.hash = '#/history';
  });
  if (name === 'create') $('#cf').addEventListener('submit', (e) => {
    e.preventDefault(); const d = get();
    d.assignments.push({ id: uid('a'), title: $('#t').value.trim(), subject: $('#s').value.trim(), description: $('#d').value.trim(), instructions: $('#i').value.trim(), deadline: new Date($('#dl').value + 'T23:59:00').toISOString(), teacherId: user.id, created: new Date().toISOString() });
    DB.save(d); toast('Assignment created.'); location.hash = '#/assignments';
  });
}
function wireDel() {
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    if (!confirm('Delete this assignment and its submissions?')) return;
    const d = get(), id = b.dataset.del, a = d.assignments.find(x => x.id === id);
    if (!a || a.teacherId !== user.id) return toast('You can only delete your own assignments.', true);
    d.assignments = d.assignments.filter(x => x.id !== id); d.submissions = d.submissions.filter(s => s.assignmentId !== id);
    DB.save(d); toast('Assignment deleted.'); route();
  });
}
function wireStatus() {
  document.querySelectorAll('[data-st]').forEach(s => s.onchange = () => {
    const d = get(), sub = d.submissions.find(x => x.id === s.dataset.st); sub.status = s.value; DB.save(d); toast('Status updated.');
  });
}

$('#welcome').textContent = isT ? 'Teacher portal' : 'Student portal';
$('#role').textContent = user.name + ' · ' + user.role;
$('#out').onclick = () => Auth.logout();
$('#menu').onclick = () => $('#side').classList.toggle('open');
window.addEventListener('hashchange', route);
route();
