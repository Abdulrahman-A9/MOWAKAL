const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createApp } = require("../app");

const secret = "a-test-only-secret-longer-than-thirty-two-characters";
const users = [
  { id: 1, name: "Client One", email: "one@example.test", password_hash: bcrypt.hashSync("password123", 4), role: "client", status: "active" },
  { id: 2, name: "Client Two", email: "two@example.test", password_hash: bcrypt.hashSync("password123", 4), role: "client", status: "active" },
  { id: 3, name: "Lawyer One", email: "lawyer@example.test", password_hash: bcrypt.hashSync("password123", 4), role: "lawyer", status: "active" },
  { id: 4, name: "Lawyer Two", email: "other@example.test", password_hash: bcrypt.hashSync("password123", 4), role: "lawyer", status: "active" },
  { id: 5, name: "Admin", email: "admin@example.test", password_hash: bcrypt.hashSync("password123", 4), role: "admin", status: "active" },
  { id: 6, name: "Verifier", email: "verifier@example.test", password_hash: bcrypt.hashSync("password123", 4), role: "verifier", status: "active" }
];
const lawyers = [{ id: 10, user_id: 3, verified: 1 }, { id: 11, user_id: 4, verified: 1 }];
const verificationRows = [{ id: 12, verification_status: "pending", verified: 0 }];
const requestRow = {
  id: 99, client_id: 1, lawyer_id: 10, service_id: "SERV-001", title: "Private request",
  description: "Private facts", status: "waiting_lawyer", urgency: "عادية", city: "Riyadh",
  created_at: "2026-10-04T00:00:00Z", updated_at: "2026-10-04T00:00:00Z",
  lawyer_name: "Lawyer One", client_name: "Client One"
};
const events = [{ request_id: 99, status: "created" }, { request_id: 99, status: "waiting_lawyer" }];
let insertedMessage = null;

const db = {
  async query(sql, params = []) {
    if (sql.startsWith("SELECT id, name, email, phone, city, role, status FROM users WHERE id")) return [[users.find((item) => item.id === Number(params[0]))].filter(Boolean)];
    if (sql.startsWith("SELECT id, name, email, password_hash, role, status FROM users WHERE email")) return [[users.find((item) => item.email === params[0])].filter(Boolean)];
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
    if (sql.startsWith("SELECT id, role, status FROM users ORDER BY")) return [users.map(({ id, role, status }) => ({ id, role, status }))];
    if (sql.startsWith("SELECT COUNT(*) AS total FROM users")) return [[{ total: users.length }]];
    if (sql.startsWith("SELECT COUNT(*) AS total FROM lawyers")) return [[{ total: lawyers.length }]];
    if (sql.startsWith("SELECT status, COUNT(*) AS total FROM requests")) return [[{ status: requestRow.status, total: 1 }]];
    if (sql.startsWith("SELECT id, actor_id, action")) return [[]];
    if (sql.startsWith("SELECT id, name, license_number")) return [[]];
    if (sql.startsWith("SELECT id, verification_status FROM lawyers")) return [[verificationRows.find((item) => item.id === Number(params[0]))].filter(Boolean)];
    if (sql.startsWith("UPDATE lawyers SET verified")) { const item = verificationRows.find((entry) => entry.id === Number(params[2])); item.verified = params[0]; item.verification_status = params[1]; return [{ affectedRows: 1 }]; }
    if (sql.startsWith("INSERT INTO audit_events")) return [{ insertId: 1 }];
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
  assert.deepEqual(Object.keys(admin.data.users[0]).sort(), ["id", "role", "status"]);
  assert.equal((await call("/api/admin/requests", { actor: 5 })).code, 404);
  assert.equal((await call("/api/verifications", { actor: 5 })).code, 403);
  assert.equal((await call("/api/verifications", { actor: 6 })).code, 200);
  assert.equal((await call("/api/verifications/12", { actor: 5, method: "PATCH", body: { decision: "approved" } })).code, 403);
  assert.equal((await call("/api/verifications/12", { actor: 6, method: "PATCH", body: { decision: "approved" } })).code, 200);
  assert.equal(verificationRows[0].verified, 1);
  assert.equal((await call("/api/verifications/12", { actor: 6, method: "PATCH", body: { decision: "rejected" } })).code, 409);
  const updated = await call("/api/me", { actor: 1, method: "PATCH", body: { name: "Client Updated", phone: null, city: null } });
  assert.equal(updated.code, 200);
  assert.equal(updated.data.user.phone, null);
  assert.equal((await call("/api/me", { actor: 3, method: "PATCH", body: { name: "No", phone: null, city: null } })).code, 403);
});
