// DEMO authentication (client-side). For real security use Amazon Cognito.
const Auth = {
  login(email, pw) {
    const u = DB.load().users.find(x => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === pw);
    if (!u) return null;
    sessionStorage.setItem('sas_user', JSON.stringify({ id: u.id, name: u.name, email: u.email, role: u.role }));
    return u;
  },
  current() { try { return JSON.parse(sessionStorage.getItem('sas_user')); } catch (e) { return null; } },
  logout() { sessionStorage.removeItem('sas_user'); location.href = 'login.html'; }
};
