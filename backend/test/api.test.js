const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createApp } = require("../app");

const secret = "a-test-only-secret-longer-than-thirty-two-characters";
const users = [
  { id: 1, name: "Client One", email: "one@example.test", phone: "0500000001", city: "Riyadh", created_at: "2026-01-01T00:00:00Z", password_hash: bcrypt.hashSync("password123", 4), role: "client", status: "active" },
  { id: 2, name: "Client Two", email: "two@example.test", phone: "0500000002", city: "Jeddah", created_at: "2026-01-02T00:00:00Z", password_hash: bcrypt.hashSync("password123", 4), role: "client", status: "active" },
  { id: 3, name: "Lawyer One", email: "lawyer@example.test", phone: "0500000003", city: "Riyadh", created_at: "2026-01-03T00:00:00Z", password_hash: bcrypt.hashSync("password123", 4), role: "lawyer", status: "active" },
  { id: 4, name: "Lawyer Two", email: "other@example.test", phone: "0500000004", city: "Jeddah", created_at: "2026-01-04T00:00:00Z", password_hash: bcrypt.hashSync("password123", 4), role: "lawyer", status: "active" },
  { id: 5, name: "Admin", email: "admin@example.test", password_hash: bcrypt.hashSync("password123", 4), role: "admin", status: "active" },
  { id: 6, name: "Verifier", email: "verifier@example.test", password_hash: bcrypt.hashSync("password123", 4), role: "verifier", status: "active" },
  { id: 7, name: "Pending Lawyer", email: "pending@example.test", phone: "0500000007", city: "Dammam", created_at: "2026-01-07T00:00:00Z", password_hash: bcrypt.hashSync("password123", 4), role: "lawyer", status: "active" }
];
const lawyers = [
  { id: 10, user_id: 3, name: "Lawyer One", license_number: "LIC-10", specialty: "Contracts", city: "Riyadh", experience: 9, rating: 4.8, reviews: 64, bio: "Public professional profile", services_json: '["Contracts"]', verified: 1, verification_status: "approved" },
  { id: 11, user_id: 4, name: "Lawyer Two", license_number: "LIC-11", specialty: "Labor", city: "Jeddah", experience: 5, rating: 4.5, reviews: 12, bio: "Public professional profile", services_json: '[]', verified: 1, verification_status: "approved" },
  { id: 13, user_id: 7, name: "Pending Lawyer", license_number: "LIC-13", specialty: "Commercial", city: "Dammam", experience: 3, rating: 0, reviews: 0, bio: "", services_json: '[]', verified: 0, verification_status: "pending" }
];
const verificationRows = [{ id: 12, verification_status: "pending", verified: 0 }];
const services = [
  { id: "SERV-001", name: "Consultation", category: "Advisory", description: "Legal consultation", type: "Consultation", icon: "◌", active: 1, created_at: "2026-01-01T00:00:00Z" },
  { id: "SERV-002", name: "Drafting", category: "Documents", description: "Document drafting", type: "Document", icon: "✎", active: 1, created_at: "2026-01-02T00:00:00Z" }
];
const requestRow = {
  id: 99, client_id: 1, lawyer_id: 10, service_id: "SERV-001", title: "Private request",
  description: "Private facts", status: "waiting_lawyer", urgency: "عادية", city: "Riyadh",
  created_at: "2026-10-04T00:00:00Z", updated_at: "2026-10-04T00:00:00Z",
  lawyer_name: "Lawyer One", client_name: "Client One"
};
const events = [{ request_id: 99, status: "created" }, { request_id: 99, status: "waiting_lawyer" }];
let insertedMessage = null;
const auditEvents = [];

const db = {
  async query(sql, params = []) {
    if (sql.startsWith("SELECT id, name, email, phone, city, role, status FROM users WHERE id")) return [[users.find((item) => item.id === Number(params[0]))].filter(Boolean)];
    if (sql.startsWith("SELECT u.id, u.name, u.email, u.phone, u.city, u.role, u.status, u.created_at, l.id AS lawyer_id")) {
      const user = users.find((item) => item.id === Number(params[0]));
      if (!user) return [[]];
      const lawyer = lawyers.find((item) => item.user_id === user.id);
      return [[{ ...user, lawyer_id: lawyer?.id ?? null, license_number: lawyer?.license_number, specialty: lawyer?.specialty, experience: lawyer?.experience, rating: lawyer?.rating, reviews: lawyer?.reviews, bio: lawyer?.bio, services_json: lawyer?.services_json, verified: lawyer?.verified, verification_status: lawyer?.verification_status }]];
    }
    if (sql.startsWith("SELECT id, name, email, password_hash, role, status FROM users WHERE email")) return [[users.find((item) => item.email === params[0])].filter(Boolean)];
    if (sql.startsWith("SELECT id, role FROM users WHERE id = ? FOR UPDATE")) return [[users.find((item) => item.id === Number(params[0]))].filter(Boolean).map(({ id, role }) => ({ id, role }))];
    if (sql.startsWith("SELECT id, verified FROM lawyers WHERE user_id")) return [[lawyers.find((item) => item.user_id === Number(params[0]))].filter(Boolean)];
    if (sql.startsWith("UPDATE users SET name =")) { const user = users.find((item) => item.id === Number(params[3])); Object.assign(user, { name: params[0], phone: params[1], city: params[2] }); return [{ affectedRows: 1 }]; }
    if (sql.includes("FROM requests r LEFT JOIN lawyers") && sql.includes("WHERE r.id")) return [[Number(params[0]) === 99 ? requestRow : null].filter(Boolean)];
    if (sql.includes("FROM requests r LEFT JOIN lawyers") && sql.includes("WHERE r.client_id")) return [[Number(params[0]) === 1 ? requestRow : null].filter(Boolean)];
    if (sql.includes("FROM requests r LEFT JOIN lawyers") && sql.includes("WHERE r.lawyer_id")) return [[Number(params[0]) === 10 ? requestRow : null].filter(Boolean)];
    if (sql.startsWith("SELECT request_id, status FROM request_events")) return [events.filter((item) => params.includes(item.request_id))];
    if (sql.startsWith("SELECT m.id, m.sender_id")) return [[]];
    if (sql.startsWith("INSERT INTO messages")) { insertedMessage = params; return [{ insertId: 300 }]; }
    if (sql.startsWith("UPDATE requests SET status")) { requestRow.status = params[0]; return [{ affectedRows: 1 }]; }
    if (sql.startsWith("INSERT INTO request_events")) { events.push({ request_id: params[0], status: params[2] }); return [{ insertId: 1 }]; }
    if (sql.startsWith("SELECT id, name, role, status, created_at FROM users ORDER BY")) return [users.map(({ id, name, role, status, created_at }) => ({ id, name, role, status, created_at }))];
    if (sql.startsWith("SELECT id, role, status FROM users WHERE id = ? FOR UPDATE")) return [[users.find((item) => item.id === Number(params[0]))].filter(Boolean).map(({ id, role, status }) => ({ id, role, status }))];
    if (sql.startsWith("UPDATE users SET status =")) { const user = users.find((item) => item.id === Number(params[1])); user.status = params[0]; return [{ affectedRows: 1 }]; }
    if (sql.startsWith("SELECT id, verification_status, verified FROM lawyers WHERE user_id")) return [[lawyers.find((item) => item.user_id === Number(params[0]))].filter(Boolean)];
    if (sql.startsWith("SELECT id FROM lawyers WHERE user_id = ? FOR UPDATE")) return [[lawyers.find((item) => item.user_id === Number(params[0]))].filter(Boolean).map(({ id }) => ({ id }))];
    if (sql.startsWith("UPDATE lawyers SET verified = ?, verification_status = ? WHERE id = ?")) {
      const item = [...lawyers, ...verificationRows].find((entry) => entry.id === Number(params[2]));
      item.verified = params[0]; item.verification_status = params[1]; return [{ affectedRows: 1 }];
    }
    if (sql.startsWith("SELECT COUNT(*) AS total FROM requests WHERE client_id")) return [[{ total: Number(params[0]) === requestRow.client_id ? 1 : 0 }]];
    if (sql.startsWith("SELECT COUNT(*) AS total FROM requests WHERE lawyer_id")) return [[{ total: Number(params[0]) === requestRow.lawyer_id ? 1 : 0 }]];
    if (sql.startsWith("SELECT COUNT(*) AS total FROM requests WHERE service_id")) return [[{ total: params[0] === requestRow.service_id ? 1 : 0 }]];
    if (sql.startsWith("SELECT COUNT(*) AS total FROM request_events WHERE actor_id")) return [[{ total: 0 }]];
    if (sql.startsWith("SELECT COUNT(*) AS total FROM messages WHERE sender_id")) return [[{ total: 0 }]];
    if (sql.startsWith("SELECT COUNT(*) AS total FROM appointments WHERE client_id")) return [[{ total: 0 }]];
    if (sql.startsWith("SELECT COUNT(*) AS total FROM appointments WHERE lawyer_id")) return [[{ total: 0 }]];
    if (sql.startsWith("SELECT COUNT(*) AS total FROM audit_events WHERE actor_id")) return [[{ total: 0 }]];
    if (sql.startsWith("DELETE FROM lawyers WHERE id = ?")) { const index = lawyers.findIndex((item) => item.id === Number(params[0])); if (index >= 0) lawyers.splice(index, 1); return [{ affectedRows: index >= 0 ? 1 : 0 }]; }
    if (sql.startsWith("DELETE FROM users WHERE id = ?")) { const index = users.findIndex((item) => item.id === Number(params[0])); if (index >= 0) users.splice(index, 1); return [{ affectedRows: index >= 0 ? 1 : 0 }]; }
    if (sql.startsWith("SELECT COUNT(*) AS total FROM users")) return [[{ total: users.length }]];
    if (sql.startsWith("SELECT COUNT(*) AS total FROM lawyers")) return [[{ total: lawyers.length }]];
    if (sql.startsWith("SELECT status, COUNT(*) AS total FROM requests")) return [[{ status: requestRow.status, total: 1 }]];
    if (sql.startsWith("SELECT id, actor_id, action")) return [[]];
    if (sql.startsWith("SELECT id, name, license_number")) return [[]];
    if (sql.startsWith("SELECT id, name, category, description, type, icon, active, created_at FROM services ORDER BY")) return [services.map((item) => ({ ...item }))];
    if (sql.startsWith("SELECT id FROM services WHERE id = ? FOR UPDATE")) return [[services.find((item) => item.id === params[0])].filter(Boolean).map(({ id }) => ({ id }))];
    if (sql.startsWith("SELECT id, name, category, description, type, icon, active, created_at FROM services WHERE id = ?")) return [[services.find((item) => item.id === params[0])].filter(Boolean).map((item) => ({ ...item }))];
    if (sql.startsWith("INSERT INTO services")) { const [id, name, category, description, type, icon] = params; services.push({ id, name, category, description, type, icon, active: 1, created_at: "2026-10-09T00:00:00Z" }); return [{ insertId: id }]; }
    if (sql.startsWith("UPDATE services SET")) {
      if (sql === "UPDATE services SET active = 0 WHERE id = ?") { const item = services.find((entry) => entry.id === params[0]); item.active = 0; return [{ affectedRows: 1 }]; }
      const assignment = sql.slice("UPDATE services SET ".length).split(" WHERE ")[0].split(", ");
      const item = services.find((entry) => entry.id === params.at(-1));
      assignment.forEach((part, index) => { const column = part.split(" = ")[0]; item[column] = column === "active" ? params[index] : params[index]; });
      return [{ affectedRows: 1 }];
    }
    if (sql.startsWith("DELETE FROM services WHERE id = ?")) { const index = services.findIndex((item) => item.id === params[0]); if (index >= 0) services.splice(index, 1); return [{ affectedRows: index >= 0 ? 1 : 0 }]; }
    if (sql.startsWith("SELECT id, verification_status FROM lawyers")) return [[verificationRows.find((item) => item.id === Number(params[0]))].filter(Boolean)];
    if (sql.startsWith("UPDATE lawyers SET verified")) { const item = verificationRows.find((entry) => entry.id === Number(params[2])); item.verified = params[0]; item.verification_status = params[1]; return [{ affectedRows: 1 }]; }
    if (sql.startsWith("INSERT INTO audit_events")) { auditEvents.push({ sql, params }); return [{ insertId: auditEvents.length }]; }
    if (sql.startsWith("SELECT 1 AS ready")) return [[{ ready: 1 }]];
    throw new Error("Unexpected test SQL: " + sql);
  },
  async getConnection() {
    return { query: (...args) => db.query(...args), beginTransaction: async () => {}, commit: async () => {}, rollback: async () => {}, release: () => {} };
  }
};

test("protected API enforces identity, roles and request ownership", async (t) => {
  const app = createApp({ db, jwtSecret: secret, logger: { error() {} } });
  const server = await new Promise((resolve) => { const listener = app.listen(0, "127.0.0.1", () => resolve(listener)); });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = "http://127.0.0.1:" + server.address().port;
  const token = (id) => jwt.sign({}, secret, { subject: String(id), algorithm: "HS256" });
  const call = async (path, { method = "GET", actor, body } = {}) => {
    const response = await fetch(base + path, {
      method,
      headers: { ...(actor ? { Authorization: "Bearer " + token(actor) } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
    return { code: response.status, data: await response.json() };
  };

  assert.equal((await call("/api/health")).code, 200);
  assert.equal((await call("/api/ready")).code, 200);
  assert.equal((await call("/api/me")).code, 401);
  assert.equal((await call("/api/me", { actor: 1 })).data.user.role, "client");
  const badToken = await fetch(base + "/api/me", { headers: { Authorization: "Bearer invalid" } });
  assert.equal(badToken.status, 401);
  assert.equal((await call("/api/auth/register", { method: "POST", body: { name: "Evil", email: "evil@example.test", password: "password123", role: "admin" } })).code, 400);
  for (const path of ["/api/admin/users", "/api/requests/client/1", "/api/messages/99", "/api/appointments/client/1"]) {
    assert.equal((await call(path)).code, 401, path + " requires authentication");
  }
  assert.equal((await call("/api/requests/99/status", { method: "PUT", body: { status: "accepted" } })).code, 401);

  const login = await call("/api/auth/login", { method: "POST", body: { email: "one@example.test", password: "password123" } });
  assert.equal(login.code, 200);
  assert.equal(jwt.verify(login.data.token, secret).sub, "1");
  assert.equal((await call("/api/requests/client/1", { actor: 1 })).code, 200);
  assert.equal((await call("/api/requests/client/1", { actor: 2 })).code, 403);
  assert.equal((await call("/api/requests/99", { actor: 1 })).code, 200);
  assert.equal((await call("/api/requests/99", { actor: 2 })).code, 404);
  assert.equal((await call("/api/requests/99", { actor: 3 })).code, 200);
  assert.equal((await call("/api/requests/99", { actor: 4 })).code, 404);
  lawyers[0].verified = 0;
  assert.equal((await call("/api/me", { actor: 3 })).data.user.verified, false);
  assert.equal((await call("/api/requests/99", { actor: 3 })).code, 403);
  assert.equal((await call("/api/messages/99", { actor: 3 })).code, 403);
  assert.equal((await call("/api/clients", { actor: 3 })).code, 403);
  lawyers[0].verified = 1;
  assert.equal((await call("/api/messages/99", { actor: 2 })).code, 404);
  assert.equal((await call("/api/messages/99", { actor: 5 })).code, 404);

  assert.equal((await call("/api/messages", { actor: 2, method: "POST", body: { requestId: 99, content: "Intrusion" } })).code, 404);
  assert.equal((await call("/api/messages", { actor: 1, method: "POST", body: { requestId: 99, content: "Hello", sender_id: 2, sender_role: "admin" } })).code, 201);
  assert.deepEqual(insertedMessage, [99, 1, "Hello"], "sender identity comes from the verified session");
  assert.equal((await call("/api/requests/99/status", { actor: 1, method: "PATCH", body: { status: "accepted" } })).code, 403);
  assert.equal((await call("/api/requests/99/status", { actor: 4, method: "PATCH", body: { status: "accepted" } })).code, 404);
  assert.equal((await call("/api/requests/99/status", { actor: 3, method: "PATCH", body: { status: "completed" } })).code, 409);
  assert.equal((await call("/api/requests/99/status", { actor: 3, method: "PATCH", body: { status: "accepted" } })).code, 200);
  assert.equal((await call("/api/requests/99/status", { actor: 3, method: "PATCH", body: { status: "accepted" } })).code, 409);

  assert.equal((await call("/api/admin/users", { actor: 1 })).code, 403);
  const admin = await call("/api/admin/users", { actor: 5 });
  assert.equal(admin.code, 200);
  assert.deepEqual(Object.keys(admin.data.users[0]).sort(), ["createdAt", "id", "name", "role", "status"]);
  assert.equal("email" in admin.data.users[0], false, "contact details are not exposed in the directory list");
  assert.equal((await call("/api/admin/users/1")).code, 401);
  assert.equal((await call("/api/admin/users/1", { actor: 1 })).code, 403);
  const clientDetails = await call("/api/admin/users/1", { actor: 5 });
  assert.equal(clientDetails.code, 200);
  assert.equal(clientDetails.data.user.email, "one@example.test");
  assert.equal(clientDetails.data.user.phone, "0500000001");
  assert.equal(clientDetails.data.user.lawyer, null);
  assert.equal("password_hash" in clientDetails.data.user, false);
  assert.equal("requests" in clientDetails.data.user, false, "private client-lawyer records are excluded");
  const lawyerDetails = await call("/api/admin/users/3", { actor: 5 });
  assert.equal(lawyerDetails.data.user.lawyer.license, "LIC-10");
  assert.equal(lawyerDetails.data.user.lawyer.rating, 4.8);
  assert.equal("bio" in lawyerDetails.data.user.lawyer, true);
  assert.equal((await call("/api/admin/users/999", { actor: 5 })).code, 404);

  const suspended = await call("/api/admin/users/2", { actor: 5, method: "PATCH", body: { action: "suspend" } });
  assert.equal(suspended.data.status, "ok");
  assert.equal(suspended.data.accountStatus, "suspended");
  assert.equal((await call("/api/me", { actor: 2 })).code, 401, "suspended accounts cannot continue using existing tokens");
  const activated = await call("/api/admin/users/2", { actor: 5, method: "PATCH", body: { action: "activate" } });
  assert.equal(activated.data.status, "ok");
  assert.equal(activated.data.accountStatus, "active");
  assert.equal((await call("/api/me", { actor: 2 })).code, 200);
  assert.equal((await call("/api/admin/users/1", { actor: 5, method: "PATCH", body: { action: "approve_lawyer" } })).code, 409);
  assert.equal((await call("/api/admin/users/7", { actor: 5, method: "PATCH", body: { action: "unknown" } })).code, 400);
  assert.equal((await call("/api/admin/users/7", { actor: 5, method: "PATCH", body: { action: "approve_lawyer" } })).data.verificationStatus, "approved");
  assert.equal((await call("/api/admin/users/7", { actor: 5, method: "PATCH", body: { action: "approve_lawyer" } })).data.verificationStatus, "approved", "repeated approval is idempotent");
  assert.equal(lawyers.find((item) => item.user_id === 7).verified, 1);
  assert.equal((await call("/api/admin/users/7", { actor: 5, method: "PATCH", body: { action: "suspend" } })).data.accountStatus, "suspended");
  assert.equal((await call("/api/admin/users/5", { actor: 5, method: "PATCH", body: { action: "suspend" } })).code, 409);
  assert.equal((await call("/api/admin/users/5", { actor: 5, method: "DELETE" })).code, 409);
  assert.equal((await call("/api/admin/users/1", { actor: 5, method: "DELETE" })).code, 409, "users with historical requests cannot be deleted");
  assert.equal((await call("/api/admin/users/3", { actor: 5, method: "DELETE" })).code, 409, "lawyers with assigned requests cannot be deleted");
  assert.equal((await call("/api/admin/users/2", { actor: 1, method: "DELETE" })).code, 403);

  const servicePayload = { name: "New service", category: "Contracts", description: "Contract review", type: "Legal document", icon: "⚖" };
  assert.equal((await call("/api/admin/services", { actor: 1 })).code, 403);
  assert.equal((await call("/api/admin/services", { method: "POST", actor: 5, body: { ...servicePayload, description: "" } })).code, 400);
  assert.equal((await call("/api/admin/services", { method: "POST", actor: 5, body: { ...servicePayload, active: false } })).code, 400);
  const createdService = await call("/api/admin/services", { method: "POST", actor: 5, body: servicePayload });
  assert.equal(createdService.code, 201);
  const serviceId = createdService.data.service.id;
  assert.match(serviceId, /^SVC-[A-F0-9]{16}$/);
  const editedService = await call("/api/admin/services/" + serviceId, { method: "PATCH", actor: 5, body: { name: "Updated service", category: "Advisory", description: "Updated description", type: "Consultation", icon: "◌" } });
  assert.equal(editedService.data.service.name, "Updated service");
  assert.equal((await call("/api/admin/services/" + serviceId, { method: "PATCH", actor: 5, body: { active: false } })).data.service.active, false);
  assert.deepEqual((await call("/api/admin/services/" + serviceId, { method: "DELETE", actor: 5 })).data, { status: "ok", deleted: true, archived: false, active: false });
  const archivedService = await call("/api/admin/services/SERV-001", { method: "DELETE", actor: 5 });
  assert.deepEqual(archivedService.data, { status: "ok", deleted: false, archived: true, active: false });
  assert.equal(services.find((item) => item.id === "SERV-001").active, 0, "services used by requests are archived, not physically deleted");
  assert.equal((await call("/api/admin/services/SERV-404", { method: "DELETE", actor: 5 })).code, 404);
  assert.equal((await call("/api/admin/services/SERV-001", { method: "PATCH", actor: 5, body: { active: true } })).data.service.active, true);
  assert.equal((await call("/api/admin/services/SERV-001", { method: "PATCH", actor: 5, body: { name: "" } })).code, 400);
  assert.equal((await call("/api/admin/services/SERV-001", { actor: 1, method: "DELETE" })).code, 403);

  assert.equal((await call("/api/admin/requests", { actor: 5 })).code, 404);
  assert.equal((await call("/api/verifications", { actor: 5 })).code, 403);
  assert.equal((await call("/api/verifications", { actor: 6 })).code, 200);
  assert.equal((await call("/api/verifications/12", { actor: 5, method: "PATCH", body: { decision: "approved" } })).code, 403);
  assert.equal((await call("/api/verifications/12", { actor: 6, method: "PATCH", body: { decision: "approved" } })).code, 200);
  assert.equal(verificationRows[0].verified, 1);
  assert.equal((await call("/api/verifications/12", { actor: 6, method: "PATCH", body: { decision: "rejected" } })).code, 409);
  assert.deepEqual((await call("/api/admin/users/2", { actor: 5, method: "DELETE" })).data, { status: "ok", deleted: true });
  assert.equal((await call("/api/admin/users/2", { actor: 5 })).code, 404);
  assert.deepEqual((await call("/api/admin/users/7", { actor: 5, method: "DELETE" })).data, { status: "ok", deleted: true });
  assert.equal(lawyers.some((item) => item.user_id === 7), false, "an unreferenced lawyer profile is removed with its account");
  const updated = await call("/api/me", { actor: 1, method: "PATCH", body: { name: "Client Updated", phone: null, city: null } });
  assert.equal(updated.code, 200);
  assert.equal(updated.data.user.phone, null);
  assert.equal((await call("/api/me", { actor: 3, method: "PATCH", body: { name: "No", phone: null, city: null } })).code, 403);
});
