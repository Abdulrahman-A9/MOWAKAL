const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("node:crypto");

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const route = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const bad = (message) => { throw new HttpError(400, message); };
const requiredText = (value, label, max = 200, min = 1) => {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) bad(label + " غير صالح");
  return value.trim();
};
const optionalText = (value, label, max = 200) => value == null || value === "" ? null : requiredText(value, label, max);
const positiveId = (value) => {
  const number = Number(value);
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(number) || number < 1) bad("المعرّف غير صالح");
  return number;
};
const iso = (value) => value instanceof Date ? value.toISOString() : String(value || "");
const parseAreas = (value) => {
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value || "[]"); } catch { return []; }
};
const safeLawyer = (row) => ({
  id: String(row.id),
  name: row.name,
  initials: row.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join(""),
  specialty: row.specialty,
  city: row.city,
  experience: Number(row.experience),
  rating: Number(row.rating || 0),
  reviews: Number(row.reviews || 0),
  license: row.license_number,
  price: "من " + new Intl.NumberFormat("ar-SA").format(Number(row.consultation_fee || 0)) + " ريال",
  availability: row.availability || "حسب الموعد",
  bio: row.bio || "",
  services: parseAreas(row.services_json),
  verified: Boolean(row.verified)
});
const safeRequest = (row, timeline = []) => ({
  id: String(row.id),
  clientId: String(row.client_id),
  lawyerId: row.lawyer_id == null ? null : String(row.lawyer_id),
  serviceId: row.service_id,
  title: row.title,
  description: row.description || "",
  status: row.status,
  urgency: row.urgency,
  city: row.city || "",
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
  documentIds: [],
  appointmentId: null,
  paymentId: null,
  timeline: timeline.length ? timeline : ["created", row.status],
  lawyerName: row.lawyer_name || null,
  clientName: row.client_name || null
});
const requestSelect = "SELECT r.id, r.client_id, r.lawyer_id, r.service_id, r.title, r.description, r.status, r.urgency, r.city, r.created_at, r.updated_at, l.name AS lawyer_name, u.name AS client_name FROM requests r LEFT JOIN lawyers l ON l.id = r.lawyer_id JOIN users u ON u.id = r.client_id";

function createApp({ db, jwtSecret, allowedOrigins = [], logger = console }) {
  if (!db || !jwtSecret || jwtSecret.length < 32) throw new Error("Database and strong JWT secret are required");
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)) }));
  app.use(express.json({ limit: "64kb" }));

  const query = async (sql, params = [], connection = db) => (await connection.query(sql, params))[0];
  const transaction = async (work) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const result = await work(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
  const authenticate = route(async (req, res, next) => {
    const match = /^Bearer (\S+)$/i.exec(req.get("authorization") || "");
    if (!match) throw new HttpError(401, "يلزم تسجيل الدخول");
    let claims;
    try { claims = jwt.verify(match[1], jwtSecret, { algorithms: ["HS256"] }); }
    catch { throw new HttpError(401, "انتهت الجلسة أو لم تعد صالحة"); }
    const id = positiveId(claims.sub);
    const users = await query("SELECT id, name, email, phone, city, role, status FROM users WHERE id = ?", [id]);
    const user = users[0];
    if (!user || user.status !== "active") throw new HttpError(401, "الحساب غير متاح");
    req.actor = { id: Number(user.id), role: user.role, name: user.name, email: user.email, phone: user.phone, city: user.city };
    if (user.role === "lawyer") {
      const lawyers = await query("SELECT id, verified FROM lawyers WHERE user_id = ?", [user.id]);
      if (!lawyers[0]) throw new HttpError(403, "الملف المهني غير مكتمل");
      req.actor.lawyerId = Number(lawyers[0].id);
      req.actor.verified = Boolean(lawyers[0].verified);
      if (!req.actor.verified && !["/api/me", "/api/me/lawyer-profile"].includes(req.path)) {
        throw new HttpError(403, "الملف المهني بانتظار التوثيق");
      }
    }
    next();
  });
  const allow = (...roles) => (req, res, next) => roles.includes(req.actor?.role) ? next() : next(new HttpError(403, "لا تملك صلاحية هذا الإجراء"));
  const requestFor = async (id, actor, connection = db) => {
    const rows = await query(requestSelect + " WHERE r.id = ?", [positiveId(id)], connection);
    const item = rows[0];
    if (!item || !(actor.role === "client" && Number(item.client_id) === actor.id || actor.role === "lawyer" && Number(item.lawyer_id) === actor.lawyerId)) {
      throw new HttpError(404, "الطلب غير متاح");
    }
    return item;
  };
  const requestTimeline = async (ids) => {
    if (!ids.length) return new Map();
    const placeholders = ids.map(() => "?").join(",");
    const rows = await query("SELECT request_id, status FROM request_events WHERE request_id IN (" + placeholders + ") ORDER BY id ASC", ids);
    const events = new Map();
    rows.forEach((row) => {
      const id = String(row.request_id);
      if (!events.has(id)) events.set(id, []);
      events.get(id).push(row.status);
    });
    return events;
  };
  const listRequests = async (actor) => {
    if (!["client", "lawyer"].includes(actor.role)) throw new HttpError(403, "لا تملك صلاحية عرض الطلبات");
    const field = actor.role === "client" ? "r.client_id" : "r.lawyer_id";
    const value = actor.role === "client" ? actor.id : actor.lawyerId;
    const rows = await query(requestSelect + " WHERE " + field + " = ? ORDER BY r.created_at DESC LIMIT 100", [value]);
    const events = await requestTimeline(rows.map((item) => Number(item.id)));
    return rows.map((row) => safeRequest(row, events.get(String(row.id))));
  };

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  app.get("/api/ready", route(async (req, res) => {
    await query("SELECT 1 AS ready");
    res.json({ status: "ok" });
  }));
  app.get("/api/services", route(async (req, res) => {
    const services = await query("SELECT id, name, category, description, type, icon, active, created_at FROM services WHERE active = 1 ORDER BY id");
    res.json({ status: "ok", services: services.map((item) => ({
      id: item.id, name: item.name, category: item.category, description: item.description,
      type: item.type, icon: item.icon, active: Boolean(item.active), createdAt: iso(item.created_at)
    })) });
  }));
  app.get("/api/lawyers", route(async (req, res) => {
    const lawyers = await query("SELECT l.id, l.name, l.specialty, l.city, l.experience, l.rating, l.reviews, l.license_number, l.consultation_fee, l.availability, l.bio, l.services_json, l.verified FROM lawyers l JOIN users u ON u.id = l.user_id WHERE l.verified = 1 AND u.status = 'active' ORDER BY l.id LIMIT 100");
    res.json({ status: "ok", lawyers: lawyers.map(safeLawyer) });
  }));
  app.get("/api/lawyers/:id", route(async (req, res) => {
    const lawyers = await query("SELECT l.id, l.name, l.specialty, l.city, l.experience, l.rating, l.reviews, l.license_number, l.consultation_fee, l.availability, l.bio, l.services_json, l.verified FROM lawyers l JOIN users u ON u.id = l.user_id WHERE l.id = ? AND l.verified = 1 AND u.status = 'active'", [positiveId(req.params.id)]);
    if (!lawyers[0]) throw new HttpError(404, "ملف المحامي غير متاح");
    res.json({ status: "ok", lawyer: safeLawyer(lawyers[0]) });
  }));
  app.post("/api/auth/register", route(async (req, res) => {
    const name = requiredText(req.body?.name, "الاسم", 100);
    const email = requiredText(req.body?.email, "البريد الإلكتروني", 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad("البريد الإلكتروني غير صالح");
    const password = requiredText(req.body?.password, "كلمة المرور", 72, 8);
    const phone = optionalText(req.body?.phone, "رقم الجوال", 20);
    const requestedRole = req.body?.role || "client";
    if (!["client", "lawyer"].includes(requestedRole)) bad("نوع الحساب غير متاح للتسجيل العام");
    let license, specialty, experience;
    if (requestedRole === "lawyer") {
      license = requiredText(req.body?.license, "رقم الرخصة", 60);
      specialty = requiredText(req.body?.specialty, "التخصص", 100);
      experience = Number(req.body?.experience);
      if (!Number.isInteger(experience) || experience < 0 || experience > 60) bad("سنوات الخبرة غير صالحة");
    }
    const hash = await bcrypt.hash(password, 12);
    const userId = await transaction(async (connection) => {
      const created = await query("INSERT INTO users (name, email, password_hash, role, phone, status) VALUES (?, ?, ?, ?, ?, 'active')", [name, email, hash, requestedRole, phone], connection);
      if (requestedRole === "lawyer") {
        await query("INSERT INTO lawyers (user_id, name, license_number, specialty, experience, verification_status, verified) VALUES (?, ?, ?, ?, ?, 'pending', 0)", [created.insertId, name, license, specialty, experience], connection);
      }
      return created.insertId;
    });
    res.status(201).json({ status: "ok", userId: String(userId), message: "تم إنشاء الحساب بنجاح" });
  }));
  app.post("/api/auth/login", route(async (req, res) => {
    const email = requiredText(req.body?.email, "البريد الإلكتروني", 254).toLowerCase();
    const password = requiredText(req.body?.password, "كلمة المرور", 200);
    const rows = await query("SELECT id, name, email, password_hash, role, status FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user || user.status !== "active" || !await bcrypt.compare(password, user.password_hash)) {
      throw new HttpError(401, "البريد أو كلمة المرور غير صحيحة");
    }
    const token = jwt.sign({}, jwtSecret, { algorithm: "HS256", subject: String(user.id), expiresIn: "1h" });
    res.json({ status: "ok", token, user: { id: String(user.id), name: user.name, email: user.email, role: user.role } });
  }));

  app.get("/api/me", authenticate, (req, res) => res.json({ status: "ok", user: { id: String(req.actor.id), name: req.actor.name, email: req.actor.email, phone: req.actor.phone, city: req.actor.city, role: req.actor.role, ...(req.actor.role === "lawyer" ? { verified: req.actor.verified } : {}) } }));
  app.patch("/api/me", authenticate, allow("client"), route(async (req, res) => {
    const name = requiredText(req.body?.name, "الاسم", 100);
    const phone = optionalText(req.body?.phone, "رقم الجوال", 20);
    const city = optionalText(req.body?.city, "المدينة", 80);
    await query("UPDATE users SET name = ?, phone = ?, city = ? WHERE id = ?", [name, phone, city, req.actor.id]);
    res.json({ status: "ok", user: { id: String(req.actor.id), name, email: req.actor.email, phone, city, role: "client" } });
  }));
  app.get("/api/me/lawyer-profile", authenticate, allow("lawyer"), route(async (req, res) => {
    const rows = await query("SELECT id, name, specialty, city, experience, rating, reviews, license_number, consultation_fee, availability, bio, services_json, verified, verification_status FROM lawyers WHERE id = ?", [req.actor.lawyerId]);
    res.json({ status: "ok", lawyer: { ...safeLawyer(rows[0]), verificationStatus: rows[0].verification_status } });
  }));
  app.patch("/api/me/lawyer-profile", authenticate, allow("lawyer"), route(async (req, res) => {
    const name = requiredText(req.body?.name, "الاسم المهني", 100);
    const specialty = requiredText(req.body?.specialty, "التخصص", 100);
    const license = requiredText(req.body?.license, "رقم الرخصة", 60);
    const city = requiredText(req.body?.city, "المدينة", 80);
    const bio = requiredText(req.body?.bio, "النبذة المهنية", 700, 30);
    const availability = requiredText(req.body?.availability, "المواعيد", 80);
    const experience = Number(req.body?.experience);
    const fee = Number(req.body?.fee);
    const services = req.body?.services;
    if (!Number.isInteger(experience) || experience < 0 || experience > 60 || !Number.isInteger(fee) || fee < 0 || fee > 100000) bad("الخبرة أو الأتعاب غير صالحة");
    if (!Array.isArray(services) || services.length < 1 || services.length > 12 || services.some((item) => typeof item !== "string" || !item.trim() || item.length > 80)) bad("مجالات الخدمة غير صالحة");
    const profile = await transaction(async (connection) => {
      const current = await query("SELECT license_number FROM lawyers WHERE id = ? FOR UPDATE", [req.actor.lawyerId], connection);
      if (!current[0]) throw new HttpError(404, "الملف المهني غير متاح");
      const licenseChanged = current[0].license_number !== license;
      await query("UPDATE lawyers SET name = ?, specialty = ?, license_number = ?, city = ?, bio = ?, availability = ?, experience = ?, consultation_fee = ?, services_json = ?, verified = IF(?, 0, verified), verification_status = IF(?, 'pending', verification_status) WHERE id = ?", [name, specialty, license, city, bio, availability, experience, fee, JSON.stringify(services.map((item) => item.trim())), licenseChanged, licenseChanged, req.actor.lawyerId], connection);
      const rows = await query("SELECT id, name, specialty, city, experience, rating, reviews, license_number, consultation_fee, availability, bio, services_json, verified, verification_status FROM lawyers WHERE id = ?", [req.actor.lawyerId], connection);
      return { ...safeLawyer(rows[0]), verificationStatus: rows[0].verification_status };
    });
    res.json({ status: "ok", lawyer: profile });
  }));

  app.post("/api/requests", authenticate, allow("client"), route(async (req, res) => {
    const serviceId = requiredText(req.body?.serviceId, "الخدمة", 20);
    const title = requiredText(req.body?.title, "عنوان الطلب", 180);
    const description = requiredText(req.body?.description, "وصف الطلب", 4000);
    const urgency = req.body?.urgency || "عادية";
    if (!["عادية", "عالية", "عاجلة"].includes(urgency)) bad("الأولوية غير صالحة");
    const city = optionalText(req.body?.city, "المدينة", 80);
    const lawyerId = req.body?.lawyerId ? positiveId(req.body.lawyerId) : null;
    const services = await query("SELECT id FROM services WHERE id = ? AND active = 1", [serviceId]);
    if (!services[0]) bad("الخدمة غير متاحة");
    if (lawyerId) {
      const lawyers = await query("SELECT l.id FROM lawyers l JOIN users u ON u.id = l.user_id WHERE l.id = ? AND l.verified = 1 AND u.status = 'active'", [lawyerId]);
      if (!lawyers[0]) bad("المحامي غير متاح");
    }
    const status = lawyerId ? "waiting_lawyer" : "submitted";
    const id = await transaction(async (connection) => {
      const created = await query("INSERT INTO requests (client_id, lawyer_id, service_id, title, description, urgency, city, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [req.actor.id, lawyerId, serviceId, title, description, urgency, city, status], connection);
      await query("INSERT INTO request_events (request_id, actor_id, status) VALUES (?, ?, 'created'), (?, ?, ?)", [created.insertId, req.actor.id, created.insertId, req.actor.id, status], connection);
      return created.insertId;
    });
    res.status(201).json({ status: "ok", requestId: String(id), message: "تم إرسال الطلب بنجاح" });
  }));
  app.get("/api/requests", authenticate, route(async (req, res) => {
    if (req.query.clientId && (req.actor.role !== "client" || positiveId(req.query.clientId) !== req.actor.id)) throw new HttpError(403, "لا تملك صلاحية عرض هذه الطلبات");
    res.json({ status: "ok", requests: await listRequests(req.actor) });
  }));
  app.get("/api/requests/client/:clientId", authenticate, allow("client"), route(async (req, res) => {
    if (positiveId(req.params.clientId) !== req.actor.id) throw new HttpError(403, "لا تملك صلاحية عرض هذه الطلبات");
    res.json({ status: "ok", requests: await listRequests(req.actor) });
  }));
  app.get("/api/requests/:id", authenticate, route(async (req, res) => {
    const item = await requestFor(req.params.id, req.actor);
    const events = await requestTimeline([Number(item.id)]);
    res.json({ status: "ok", request: safeRequest(item, events.get(String(item.id))) });
  }));
  const transitions = { waiting_lawyer: ["accepted", "under_review", "rejected"], under_review: ["accepted", "rejected"], accepted: ["in_progress"], in_progress: ["completed"] };
  const updateStatus = route(async (req, res) => {
    if (req.actor.role !== "lawyer" || !req.actor.verified) throw new HttpError(403, "هذا الإجراء للمحامي الموثّق المرتبط بالطلب");
    const nextStatus = req.body?.status;
    if (typeof nextStatus !== "string") bad("الحالة غير صالحة");
    const result = await transaction(async (connection) => {
      const rows = await query(requestSelect + " WHERE r.id = ? FOR UPDATE", [positiveId(req.params.id)], connection);
      const item = rows[0];
      if (!item || Number(item.lawyer_id) !== req.actor.lawyerId) throw new HttpError(404, "الطلب غير متاح");
      if (!(transitions[item.status] || []).includes(nextStatus)) throw new HttpError(409, "تغيير الحالة غير مسموح");
      await query("UPDATE requests SET status = ? WHERE id = ?", [nextStatus, item.id], connection);
      await query("INSERT INTO request_events (request_id, actor_id, status) VALUES (?, ?, ?)", [item.id, req.actor.id, nextStatus], connection);
      return nextStatus;
    });
    res.json({ status: "ok", requestStatus: result });
  });
  app.patch("/api/requests/:id/status", authenticate, updateStatus);
  app.put("/api/requests/:id/status", authenticate, updateStatus);

  app.get("/api/messages/:requestId", authenticate, route(async (req, res) => {
    const item = await requestFor(req.params.requestId, req.actor);
    const rows = await query("SELECT m.id, m.sender_id, u.role AS sender_role, m.content, m.created_at FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.request_id = ? ORDER BY m.id ASC LIMIT 200", [item.id]);
    res.json({ status: "ok", messages: rows.map((row) => ({ id: String(row.id), from: row.sender_role, text: row.content, time: iso(row.created_at) })) });
  }));
  app.post("/api/messages", authenticate, route(async (req, res) => {
    const requestId = positiveId(req.body?.requestId ?? req.body?.request_id);
    const content = requiredText(req.body?.content, "نص الرسالة", 4000);
    await requestFor(requestId, req.actor);
    const result = await query("INSERT INTO messages (request_id, sender_id, content) VALUES (?, ?, ?)", [requestId, req.actor.id, content]);
    res.status(201).json({ status: "ok", messageId: String(result.insertId), message: { id: String(result.insertId), from: req.actor.role, text: content, time: new Date().toISOString() } });
  }));
  app.get("/api/conversations", authenticate, route(async (req, res) => {
    const requests = (await listRequests(req.actor)).filter((item) => item.lawyerId);
    if (!requests.length) return res.json({ status: "ok", conversations: [] });
    const ids = requests.map((item) => Number(item.id));
    const placeholders = ids.map(() => "?").join(",");
    const rows = await query("SELECT m.id, m.request_id, u.role AS sender_role, m.content, m.created_at FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.request_id IN (" + placeholders + ") ORDER BY m.id ASC", ids);
    const messages = new Map(ids.map((id) => [String(id), []]));
    rows.forEach((row) => messages.get(String(row.request_id))?.push({ id: String(row.id), from: row.sender_role, text: row.content, time: iso(row.created_at) }));
    res.json({ status: "ok", conversations: requests.map((item) => ({ id: item.id, clientId: item.clientId, lawyerId: item.lawyerId, subject: item.title, messages: messages.get(item.id) || [] })) });
  }));

  app.get("/api/appointments/client/:clientId", authenticate, allow("client"), route(async (req, res) => {
    if (positiveId(req.params.clientId) !== req.actor.id) throw new HttpError(403, "لا تملك صلاحية عرض هذه المواعيد");
    const rows = await query("SELECT a.id, a.request_id, a.client_id, a.lawyer_id, a.appointment_date, a.notes, r.title FROM appointments a JOIN requests r ON r.id = a.request_id WHERE a.client_id = ? ORDER BY a.appointment_date ASC", [req.actor.id]);
    res.json({ status: "ok", appointments: rows.map((row) => ({ id: String(row.id), requestId: String(row.request_id), clientId: String(row.client_id), lawyerId: String(row.lawyer_id), title: row.title, date: iso(row.appointment_date), notes: row.notes, status: "scheduled" })) });
  }));
  app.get("/api/clients", authenticate, allow("lawyer"), route(async (req, res) => {
    const rows = await query("SELECT DISTINCT u.id, u.name, u.email, u.phone, u.city, u.status FROM users u JOIN requests r ON r.client_id = u.id WHERE r.lawyer_id = ? ORDER BY u.id DESC LIMIT 100", [req.actor.lawyerId]);
    res.json({ status: "ok", clients: rows.map((row) => ({ id: String(row.id), name: row.name, initials: row.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join(""), email: row.email, phone: row.phone, city: row.city || "", status: row.status, requests: 0, cases: 0 })) });
  }));
  app.get("/api/appointments", authenticate, route(async (req, res) => {
    if (!["client", "lawyer"].includes(req.actor.role)) throw new HttpError(403, "لا تملك صلاحية عرض المواعيد");
    const field = req.actor.role === "client" ? "a.client_id" : "a.lawyer_id";
    const id = req.actor.role === "client" ? req.actor.id : req.actor.lawyerId;
    const rows = await query("SELECT a.id, a.request_id, a.client_id, a.lawyer_id, a.appointment_date, a.notes, r.title FROM appointments a JOIN requests r ON r.id = a.request_id WHERE " + field + " = ? ORDER BY a.appointment_date ASC LIMIT 100", [id]);
    res.json({ status: "ok", appointments: rows.map((row) => ({ id: String(row.id), requestId: String(row.request_id), clientId: String(row.client_id), lawyerId: String(row.lawyer_id), title: row.title, date: iso(row.appointment_date), notes: row.notes, status: "scheduled" })) });
  }));
  app.post("/api/appointments", authenticate, allow("client"), route(async (req, res) => {
    const item = await requestFor(req.body?.requestId ?? req.body?.request_id, req.actor);
    if (!item.lawyer_id) throw new HttpError(409, "لا يمكن حجز موعد قبل تعيين محامٍ");
    const when = new Date(req.body?.appointmentDate ?? req.body?.appointment_date);
    if (!Number.isFinite(when.getTime()) || when <= new Date()) bad("تاريخ الموعد غير صالح");
    const notes = optionalText(req.body?.notes, "ملاحظات الموعد", 1000);
    const result = await query("INSERT INTO appointments (request_id, client_id, lawyer_id, appointment_date, notes) VALUES (?, ?, ?, ?, ?)", [item.id, req.actor.id, item.lawyer_id, when, notes]);
    res.status(201).json({ status: "ok", appointmentId: String(result.insertId) });
  }));

  app.get("/api/admin/users", authenticate, allow("admin"), route(async (req, res) => {
    const rows = await query("SELECT id, name, role, status, created_at FROM users ORDER BY id DESC LIMIT 100");
    res.json({ status: "ok", users: rows.map((row) => ({ id: String(row.id), name: row.name, role: row.role, status: row.status, createdAt: iso(row.created_at) })) });
  }));
  app.get("/api/admin/users/:id", authenticate, allow("admin"), route(async (req, res) => {
    const rows = await query("SELECT u.id, u.name, u.email, u.phone, u.city, u.role, u.status, u.created_at, l.id AS lawyer_id, l.license_number, l.specialty, l.experience, l.rating, l.reviews, l.bio, l.services_json, l.verified, l.verification_status FROM users u LEFT JOIN lawyers l ON l.user_id = u.id WHERE u.id = ?", [positiveId(req.params.id)]);
    const row = rows[0];
    if (!row) throw new HttpError(404, "الحساب غير موجود");
    const user = {
      id: String(row.id), name: row.name, email: row.email, phone: row.phone, city: row.city,
      role: row.role, status: row.status, createdAt: iso(row.created_at),
      lawyer: row.lawyer_id == null ? null : {
        license: row.license_number, specialty: row.specialty, experience: Number(row.experience),
        rating: Number(row.rating || 0), reviews: Number(row.reviews || 0), bio: row.bio || "",
        services: parseAreas(row.services_json), verified: Boolean(row.verified),
        verificationStatus: row.verification_status
      }
    };
    res.json({ status: "ok", user });
  }));
  app.patch("/api/admin/users/:id", authenticate, allow("admin"), route(async (req, res) => {
    const userId = positiveId(req.params.id);
    const action = req.body?.action;
    if (!["activate", "suspend", "approve_lawyer", "reject_lawyer"].includes(action)) bad("إجراء الحساب غير صالح");
    const result = await transaction(async (connection) => {
      const rows = await query("SELECT id, role, status FROM users WHERE id = ? FOR UPDATE", [userId], connection);
      const target = rows[0];
      if (!target) throw new HttpError(404, "الحساب غير موجود");
      if (target.role === "admin") throw new HttpError(409, "لا يمكن إدارة حسابات مديري المنصة من هذه الصفحة");

      if (action === "activate" || action === "suspend") {
        if (userId === req.actor.id) throw new HttpError(409, "لا يمكن إيقاف حسابك الإداري");
        const nextStatus = action === "activate" ? "active" : "suspended";
        if (target.status !== nextStatus) {
          await query("UPDATE users SET status = ? WHERE id = ?", [nextStatus, userId], connection);
          await query("INSERT INTO audit_events (actor_id, action, resource_type, resource_id) VALUES (?, ?, 'user', ?)", [req.actor.id, "user_" + action, String(userId)], connection);
        }
        return { accountStatus: nextStatus };
      }

      if (target.role !== "lawyer") throw new HttpError(409, "إجراء التوثيق متاح لحسابات المحامين فقط");
      const lawyers = await query("SELECT id, verification_status, verified FROM lawyers WHERE user_id = ? FOR UPDATE", [userId], connection);
      const profile = lawyers[0];
      if (!profile) throw new HttpError(409, "لا يوجد ملف مهني مرتبط بهذا الحساب");
      const decision = action === "approve_lawyer" ? "approved" : "rejected";
      if (profile.verification_status !== "pending") {
        if (profile.verification_status === decision) return { verificationStatus: decision };
        throw new HttpError(409, "تمت مراجعة الملف المهني سابقًا");
      }
      await query("UPDATE lawyers SET verified = ?, verification_status = ? WHERE id = ?", [decision === "approved" ? 1 : 0, decision, profile.id], connection);
      await query("INSERT INTO audit_events (actor_id, action, resource_type, resource_id) VALUES (?, ?, 'lawyer_verification', ?)", [req.actor.id, decision, String(profile.id)], connection);
      return { verificationStatus: decision };
    });
    res.json({ status: "ok", ...result });
  }));
  app.delete("/api/admin/users/:id", authenticate, allow("admin"), route(async (req, res) => {
    const userId = positiveId(req.params.id);
    if (userId === req.actor.id) throw new HttpError(409, "لا يمكن حذف حسابك الإداري");
    await transaction(async (connection) => {
      const rows = await query("SELECT id, role FROM users WHERE id = ? FOR UPDATE", [userId], connection);
      const target = rows[0];
      if (!target) throw new HttpError(404, "الحساب غير موجود");
      if (target.role === "admin") throw new HttpError(409, "لا يمكن حذف حساب مدير منصة من هذه الصفحة");
      const lawyers = await query("SELECT id FROM lawyers WHERE user_id = ? FOR UPDATE", [userId], connection);
      const references = [
        ["SELECT COUNT(*) AS total FROM requests WHERE client_id = ?", userId],
        ["SELECT COUNT(*) AS total FROM request_events WHERE actor_id = ?", userId],
        ["SELECT COUNT(*) AS total FROM messages WHERE sender_id = ?", userId],
        ["SELECT COUNT(*) AS total FROM appointments WHERE client_id = ?", userId],
        ["SELECT COUNT(*) AS total FROM audit_events WHERE actor_id = ?", userId]
      ];
      if (lawyers[0]) {
        references.push(["SELECT COUNT(*) AS total FROM requests WHERE lawyer_id = ?", lawyers[0].id]);
        references.push(["SELECT COUNT(*) AS total FROM appointments WHERE lawyer_id = ?", lawyers[0].id]);
      }
      for (const [sql, id] of references) {
        const counts = await query(sql, [id], connection);
        if (Number(counts[0]?.total || 0) > 0) throw new HttpError(409, "لا يمكن حذف حساب مرتبط بسجلات محفوظة؛ أوقف الحساب بدلًا من ذلك للحفاظ على سلامة السجلات");
      }
      if (lawyers[0]) await query("DELETE FROM lawyers WHERE id = ?", [lawyers[0].id], connection);
      await query("DELETE FROM users WHERE id = ?", [userId], connection);
      await query("INSERT INTO audit_events (actor_id, action, resource_type, resource_id) VALUES (?, 'user_deleted', 'user', ?)", [req.actor.id, String(userId)], connection);
    });
    res.json({ status: "ok", deleted: true });
  }));
  app.get("/api/admin/services", authenticate, allow("admin"), route(async (req, res) => {
    const rows = await query("SELECT id, name, category, description, type, icon, active, created_at FROM services ORDER BY id");
    res.json({ status: "ok", services: rows.map((item) => ({ id: item.id, name: item.name, category: item.category, description: item.description, type: item.type, icon: item.icon, active: Boolean(item.active), createdAt: iso(item.created_at) })) });
  }));
  app.post("/api/admin/services", authenticate, allow("admin"), route(async (req, res) => {
    const serviceFields = new Set(["name", "category", "description", "type", "icon"]);
    if (Object.keys(req.body || {}).some((field) => !serviceFields.has(field))) bad("بيانات الخدمة غير صالحة");
    const name = requiredText(req.body?.name, "اسم الخدمة", 120);
    const category = requiredText(req.body?.category, "مجال الخدمة", 80);
    const description = requiredText(req.body?.description, "وصف الخدمة", 500);
    const type = requiredText(req.body?.type, "نوع الخدمة", 80);
    const icon = requiredText(req.body?.icon, "رمز الخدمة", 10);
    const serviceId = "SVC-" + randomBytes(8).toString("hex").toUpperCase();
    const service = await transaction(async (connection) => {
      await query("INSERT INTO services (id, name, category, description, type, icon, active) VALUES (?, ?, ?, ?, ?, ?, 1)", [serviceId, name, category, description, type, icon], connection);
      await query("INSERT INTO audit_events (actor_id, action, resource_type, resource_id) VALUES (?, 'service_created', 'service', ?)", [req.actor.id, serviceId], connection);
      const rows = await query("SELECT id, name, category, description, type, icon, active, created_at FROM services WHERE id = ?", [serviceId], connection);
      const item = rows[0];
      return { id: item.id, name: item.name, category: item.category, description: item.description, type: item.type, icon: item.icon, active: Boolean(item.active), createdAt: iso(item.created_at) };
    });
    res.status(201).json({ status: "ok", service });
  }));
  app.patch("/api/admin/services/:id", authenticate, allow("admin"), route(async (req, res) => {
    const serviceId = requiredText(req.params.id, "معرّف الخدمة", 20);
    const values = req.body || {};
    const allowedFields = { name: ["name", "اسم الخدمة", 120], category: ["category", "مجال الخدمة", 80], description: ["description", "وصف الخدمة", 500], type: ["type", "نوع الخدمة", 80], icon: ["icon", "رمز الخدمة", 10] };
    const fields = Object.keys(values);
    if (!fields.length || fields.some((field) => field !== "active" && !allowedFields[field])) bad("بيانات تحديث الخدمة غير صالحة");
    if (Object.hasOwn(values, "active") && typeof values.active !== "boolean") bad("حالة الخدمة غير صالحة");
    const updates = fields.map((field) => {
      if (field === "active") return ["active", values.active ? 1 : 0];
      const [column, label, max] = allowedFields[field];
      return [column, requiredText(values[field], label, max)];
    });
    const service = await transaction(async (connection) => {
      const rows = await query("SELECT id FROM services WHERE id = ? FOR UPDATE", [serviceId], connection);
      if (!rows[0]) throw new HttpError(404, "الخدمة غير متاحة");
      await query("UPDATE services SET " + updates.map(([column]) => column + " = ?").join(", ") + " WHERE id = ?", [...updates.map(([, value]) => value), serviceId], connection);
      await query("INSERT INTO audit_events (actor_id, action, resource_type, resource_id) VALUES (?, ?, 'service', ?)", [req.actor.id, fields.length === 1 && fields[0] === "active" ? (values.active ? "service_enabled" : "service_disabled") : "service_updated", serviceId], connection);
      const updatedRows = await query("SELECT id, name, category, description, type, icon, active, created_at FROM services WHERE id = ?", [serviceId], connection);
      const item = updatedRows[0];
      return { id: item.id, name: item.name, category: item.category, description: item.description, type: item.type, icon: item.icon, active: Boolean(item.active), createdAt: iso(item.created_at) };
    });
    res.json({ status: "ok", service });
  }));
  app.delete("/api/admin/services/:id", authenticate, allow("admin"), route(async (req, res) => {
    const serviceId = requiredText(req.params.id, "معرّف الخدمة", 20);
    const result = await transaction(async (connection) => {
      const rows = await query("SELECT id FROM services WHERE id = ? FOR UPDATE", [serviceId], connection);
      if (!rows[0]) throw new HttpError(404, "الخدمة غير موجودة");
      const references = await query("SELECT COUNT(*) AS total FROM requests WHERE service_id = ?", [serviceId], connection);
      const used = Number(references[0]?.total || 0) > 0;
      if (used) await query("UPDATE services SET active = 0 WHERE id = ?", [serviceId], connection);
      else await query("DELETE FROM services WHERE id = ?", [serviceId], connection);
      await query("INSERT INTO audit_events (actor_id, action, resource_type, resource_id) VALUES (?, ?, 'service', ?)", [req.actor.id, used ? "service_archived" : "service_deleted", serviceId], connection);
      return { deleted: !used, archived: used, active: false };
    });
    res.json({ status: "ok", ...result });
  }));
  app.get("/api/admin/stats", authenticate, allow("admin"), route(async (req, res) => {
    const [users, lawyers, requests] = await Promise.all([
      query("SELECT COUNT(*) AS total FROM users"),
      query("SELECT COUNT(*) AS total FROM lawyers WHERE verified = 1"),
      query("SELECT status, COUNT(*) AS total FROM requests GROUP BY status")
    ]);
    res.json({ status: "ok", stats: { totalUsers: Number(users[0].total), verifiedLawyers: Number(lawyers[0].total), requestCounts: Object.fromEntries(requests.map((row) => [row.status, Number(row.total)])) } });
  }));
  app.get("/api/admin/activity", authenticate, allow("admin"), route(async (req, res) => {
    const rows = await query("SELECT id, actor_id, action, resource_type, resource_id, created_at FROM audit_events ORDER BY id DESC LIMIT 100");
    res.json({ status: "ok", activities: rows.map((row) => ({ id: String(row.id), event: row.action, actor: String(row.actor_id), target: row.resource_type + "-" + row.resource_id, timestamp: iso(row.created_at), type: row.resource_type })) });
  }));
  app.get("/api/verifications", authenticate, allow("verifier"), route(async (req, res) => {
    const rows = await query("SELECT id, name, license_number, specialty, city, experience, verification_status FROM lawyers WHERE verification_status = 'pending' ORDER BY id ASC LIMIT 100");
    res.json({ status: "ok", verifications: rows.map((row) => ({ id: String(row.id), name: row.name, license: row.license_number, specialty: row.specialty, city: row.city, experience: row.experience, status: row.verification_status })) });
  }));
  app.patch("/api/verifications/:id", authenticate, allow("verifier"), route(async (req, res) => {
    const decision = req.body?.decision;
    if (!["approved", "rejected"].includes(decision)) bad("قرار التوثيق غير صالح");
    await transaction(async (connection) => {
      const rows = await query("SELECT id, verification_status FROM lawyers WHERE id = ? FOR UPDATE", [positiveId(req.params.id)], connection);
      if (!rows[0]) throw new HttpError(404, "طلب التوثيق غير متاح");
      if (rows[0].verification_status !== "pending") throw new HttpError(409, "تمت مراجعة الطلب سابقًا");
      await query("UPDATE lawyers SET verified = ?, verification_status = ? WHERE id = ?", [decision === "approved" ? 1 : 0, decision, rows[0].id], connection);
      await query("INSERT INTO audit_events (actor_id, action, resource_type, resource_id) VALUES (?, ?, 'lawyer_verification', ?)", [req.actor.id, decision, rows[0].id], connection);
    });
    res.json({ status: "ok", verificationStatus: decision });
  }));

  app.use("/api", (req, res) => res.status(404).json({ status: "error", message: "المسار غير متاح" }));
  app.use((error, req, res, next) => {
    const status = error.status || (["ER_DUP_ENTRY", "ER_ROW_IS_REFERENCED_2"].includes(error.code) ? 409 : 500);
    if (status >= 500) logger.error("api_error", { code: error.code || "INTERNAL", path: req.path });
    res.status(status).json({ status: "error", message: status === 500 ? "تعذر إكمال الطلب حاليًا" : status === 409 && !error.status ? "البيانات مستخدمة مسبقًا" : error.message });
  });
  return app;
}

module.exports = { createApp };
