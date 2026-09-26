window.MOWAKAL_DATA = {
  currentUser: { id: "USR-001", name: "سلمان العبدالله", role: "client", email: "salman@example.sa" },
  statusLabels: {
    request: { draft: "مسودة", submitted: "مقدم", under_review: "قيد المراجعة", waiting_lawyer: "بانتظار المحامي", accepted: "مقبول", in_progress: "قيد التنفيذ", completed: "مكتمل", rejected: "مرفوض", cancelled: "ملغي" },
    verification: { pending: "جديد", under_review: "قيد المراجعة", approved: "معتمد", rejected: "مرفوض", more_info: "يحتاج معلومات إضافية" },
    consultation: { pending: "بانتظار الموافقة", scheduled: "مجدولة", completed: "مكتملة", cancelled: "ملغاة", rejected: "مرفوضة" },
    case: { new: "جديدة", active: "نشطة", on_hold: "متوقفة مؤقتًا", closed: "مغلقة" },
    payment: { unpaid: "غير مدفوعة", paid: "مدفوعة", pending: "بانتظار الدفع", refunded: "مستردة" }
  },
  services: [
    { id: "SERV-001", name: "استشارة قانونية", category: "استشارات", description: "إجابة قانونية عملية تساعدك على فهم موقفك وخياراتك القادمة.", type: "استشارة", icon: "◌", active: true, createdAt: "2026-09-01" },
    { id: "SERV-002", name: "دراسة قضية", category: "التقاضي", description: "مراجعة تفاصيل القضية والمستندات وتقديم تصور واضح لمسارها.", type: "دراسة ملف", icon: "▣", active: true, createdAt: "2026-09-01" },
    { id: "SERV-003", name: "تمثيل قانوني وقضائي", category: "التقاضي", description: "تمثيل مهني ومتابعة الإجراءات أمام الجهات المختصة.", type: "تمثيل", icon: "⚖", active: true, createdAt: "2026-09-01" },
    { id: "SERV-004", name: "صياغة ومراجعة العقود", category: "العقود", description: "صياغة العقود ومراجعتها بما يحمي مصالحك ويقلل المخاطر.", type: "وثيقة قانونية", icon: "▤", active: true, createdAt: "2026-09-01" },
    { id: "SERV-005", name: "صياغة المذكرات والخطابات", category: "الوثائق", description: "إعداد مذكرات وخطابات قانونية بصياغة واضحة ومنظمة.", type: "وثيقة قانونية", icon: "✎", active: true, createdAt: "2026-09-01" },
    { id: "SERV-006", name: "قضايا الشركات والأعمال", category: "الأعمال", description: "حلول قانونية للشركات والأنشطة التجارية والحوكمة.", type: "استشارة أعمال", icon: "▥", active: true, createdAt: "2026-09-01" },
    { id: "SERV-007", name: "القضايا العمالية", category: "العمل", description: "استشارات ومتابعة النزاعات واللوائح والعقود العمالية.", type: "قضية عمالية", icon: "◫", active: true, createdAt: "2026-09-01" },
    { id: "SERV-008", name: "القضايا العقارية", category: "العقار", description: "مراجعة عقود الإيجار والبيع والنزاعات العقارية.", type: "قضية عقارية", icon: "⌂", active: true, createdAt: "2026-09-01" },
    { id: "SERV-009", name: "قضايا الأحوال الشخصية", category: "الأحوال الشخصية", description: "إرشاد قانوني يحفظ الخصوصية ويشرح الخيارات المتاحة.", type: "استشارة أسرية", icon: "♡", active: true, createdAt: "2026-09-01" },
    { id: "SERV-010", name: "خدمات التنفيذ", category: "التنفيذ", description: "متابعة طلبات التنفيذ والإجراءات المرتبطة بها.", type: "متابعة إجراء", icon: "↗", active: true, createdAt: "2026-09-01" }
  ],
  lawyers: [
    { id: "LAW-001", name: "د. نورة العتيبي", initials: "نع", specialty: "القانون التجاري", city: "الرياض", experience: 12, rating: 4.9, reviews: 86, license: "رخصة مهنية ١٢٤٨٣", price: "من ٤٥٠ ريالًا", availability: "متاحة هذا الأسبوع", verified: true, bio: "مستشارة قانونية متخصصة في تأسيس الشركات والعقود التجارية وتسوية المنازعات بأسلوب عملي واضح.", services: ["العقود التجارية", "حوكمة الشركات", "تأسيس المنشآت"] },
    { id: "LAW-002", name: "أحمد السبيعي", initials: "اس", specialty: "القضايا العمالية", city: "جدة", experience: 9, rating: 4.8, reviews: 64, license: "رخصة مهنية ١١٠٢٦", price: "من ٣٥٠ ريالًا", availability: "متاح غدًا", verified: true, bio: "محامٍ يركز على أنظمة العمل واللوائح الداخلية وصياغة الحلول المتوازنة للمنشآت والأفراد.", services: ["نزاعات العمل", "لوائح الموارد البشرية", "الاستشارات العمالية"] },
    { id: "LAW-003", name: "سارة الحربي", initials: "سح", specialty: "القانون العقاري", city: "الدمام", experience: 8, rating: 4.7, reviews: 51, license: "رخصة مهنية ١٣٦٨٢", price: "من ٣٠٠ ريال", availability: "متاحة بعد يومين", verified: true, bio: "تقدم استشارات متخصصة في عقود الإيجار والبيع والشراكات والنزاعات المرتبطة بالعقار.", services: ["عقود الإيجار", "البيع والشراكة", "النزاعات العقارية"] },
    { id: "LAW-004", name: "خالد القحطاني", initials: "خق", specialty: "القانون الجنائي", city: "مكة المكرمة", experience: 15, rating: 4.9, reviews: 73, license: "رخصة مهنية ١٠٨٤٤", price: "من ٥٠٠ ريال", availability: "متاح هذا الأسبوع", verified: true, bio: "محامٍ متمرس في الترافع وإدارة الملفات الجنائية مع اهتمام خاص بوضوح الخطوات للعميل.", services: ["الترافع الجنائي", "التحقيقات", "الاستشارات العاجلة"] },
    { id: "LAW-005", name: "ريم الغامدي", initials: "رغ", specialty: "الأحوال الشخصية", city: "المدينة المنورة", experience: 7, rating: 4.8, reviews: 48, license: "رخصة مهنية ١٤١٠٥", price: "من ٢٥٠ ريالًا", availability: "متاحة اليوم", verified: true, bio: "تساعد الأسر على فهم الخيارات النظامية وإدارة قضايا الأحوال الشخصية بحساسية وخصوصية.", services: ["النفقة والحضانة", "التركات", "الوصايا"] },
    { id: "LAW-006", name: "يوسف المطيري", initials: "يم", specialty: "الملكية الفكرية", city: "الرياض", experience: 10, rating: 4.6, reviews: 39, license: "رخصة مهنية ١٢٢٩٠", price: "من ٤٠٠ ريال", availability: "متاح الأسبوع المقبل", verified: true, bio: "مستشار في حماية العلامات التجارية وحقوق المؤلف وصياغة اتفاقيات الاستخدام والترخيص.", services: ["العلامات التجارية", "حقوق المؤلف", "اتفاقيات الترخيص"] }
  ],
  clients: [
    { id: "CLI-001", name: "شركة مدار للتقنية", initials: "مت", email: "legal@madar.sa", phone: "0500000001", city: "الرياض", status: "active", requests: 6, cases: 2 },
    { id: "CLI-002", name: "شركة أفق للاستشارات", initials: "أا", email: "admin@ofuq.sa", phone: "0500000002", city: "جدة", status: "active", requests: 4, cases: 1 },
    { id: "CLI-003", name: "عبدالله الشهري", initials: "عش", email: "abdullah@example.sa", phone: "0500000003", city: "الرياض", status: "active", requests: 2, cases: 1 },
    { id: "CLI-004", name: "متجر نواة", initials: "من", email: "hello@nawaat.sa", phone: "0500000004", city: "الدمام", status: "suspended", requests: 3, cases: 0 }
  ],
  requests: [
    { id: "REQ-1001", clientId: "CLI-001", lawyerId: "LAW-001", serviceId: "SERV-004", title: "مراجعة اتفاقية توريد", description: "مراجعة اتفاقية توريد تقنية قبل توقيعها مع الشريك.", status: "in_progress", urgency: "عادية", city: "الرياض", createdAt: "2026-09-20", updatedAt: "منذ ساعتين", documentIds: ["DOC-001"], appointmentId: "APT-001", paymentId: "PAY-001", timeline: ["created", "submitted", "reviewed", "assigned", "accepted", "in_progress"] },
    { id: "REQ-1002", clientId: "CLI-001", lawyerId: "LAW-002", serviceId: "SERV-007", title: "مراجعة لائحة الموارد البشرية", description: "مراجعة اللائحة الداخلية وتوافقها مع نظام العمل.", status: "waiting_lawyer", urgency: "عالية", city: "الرياض", createdAt: "2026-09-24", updatedAt: "اليوم", documentIds: [], appointmentId: null, paymentId: null, timeline: ["created", "submitted", "reviewed", "assigned"] },
    { id: "REQ-1003", clientId: "CLI-003", lawyerId: null, serviceId: "SERV-001", title: "استشارة حول عقد إيجار", description: "أحتاج إلى فهم الالتزامات قبل تجديد عقد الإيجار.", status: "under_review", urgency: "عادية", city: "الرياض", createdAt: "2026-09-25", updatedAt: "منذ ٣ ساعات", documentIds: [], appointmentId: null, paymentId: null, timeline: ["created", "submitted", "reviewed"] },
    { id: "REQ-1004", clientId: "CLI-002", lawyerId: "LAW-003", serviceId: "SERV-008", title: "نزاع على عقد بيع عقار", description: "دراسة المستندات المتعلقة بعقد بيع عقار تجاري.", status: "completed", urgency: "عادية", city: "جدة", createdAt: "2026-08-14", updatedAt: "١٨ سبتمبر ٢٠٢٦", documentIds: ["DOC-003"], appointmentId: "APT-003", paymentId: "PAY-003", timeline: ["created", "submitted", "reviewed", "assigned", "accepted", "in_progress", "completed"] }
  ],
  consultations: [
    { id: "CONS-1048", requestId: "REQ-1001", clientId: "CLI-001", lawyerId: "LAW-001", subject: "مراجعة عقد شراكة", date: "٢٨ سبتمبر ٢٠٢٦", time: "١١:٠٠ صباحًا", method: "مكالمة مرئية", status: "scheduled" },
    { id: "CONS-1041", requestId: "REQ-1002", clientId: "CLI-001", lawyerId: "LAW-002", subject: "استشارة في لائحة العمل", date: "٣٠ سبتمبر ٢٠٢٦", time: "٤:٠٠ مساءً", method: "مكالمة هاتفية", status: "pending" },
    { id: "CONS-1019", requestId: "REQ-1004", clientId: "CLI-002", lawyerId: "LAW-003", subject: "نزاع على عقد إيجار", date: "١٢ سبتمبر ٢٠٢٦", time: "١:٠٠ مساءً", method: "مكالمة مرئية", status: "completed" }
  ],
  cases: [
    { id: "CASE-2001", clientId: "CLI-001", lawyerId: "LAW-001", requestId: "REQ-1001", title: "نزاع عقد توريد", type: "تجاري", status: "active", stage: "مراجعة المستندات", nextEvent: "جلسة متابعة ٢٨ سبتمبر", updatedAt: "منذ ساعتين", notes: ["تم استلام النسخة المحدثة من الاتفاقية."] },
    { id: "CASE-2002", clientId: "CLI-002", lawyerId: "LAW-003", requestId: "REQ-1004", title: "دراسة عقد بيع عقار", type: "عقاري", status: "closed", stage: "مكتملة", nextEvent: "لا توجد مواعيد قادمة", updatedAt: "١٨ سبتمبر ٢٠٢٦", notes: ["أغلقت القضية بعد تسليم الرأي القانوني."] },
    { id: "CASE-2003", clientId: "CLI-003", lawyerId: "LAW-005", requestId: "REQ-1003", title: "استشارة أحوال شخصية", type: "أحوال شخصية", status: "new", stage: "تحديد نطاق الخدمة", nextEvent: "بانتظار تحديد موعد", updatedAt: "اليوم", notes: [] }
  ],
  appointments: [
    { id: "APT-001", requestId: "REQ-1001", clientId: "CLI-001", lawyerId: "LAW-001", title: "مراجعة اتفاقية التوريد", date: "2026-09-28", time: "11:00", method: "مكالمة مرئية", status: "scheduled" },
    { id: "APT-002", requestId: "REQ-1002", clientId: "CLI-001", lawyerId: "LAW-002", title: "جلسة استشارة عمالية", date: "2026-09-30", time: "16:00", method: "مكالمة هاتفية", status: "pending" },
    { id: "APT-003", requestId: "REQ-1004", clientId: "CLI-002", lawyerId: "LAW-003", title: "تسليم الرأي القانوني", date: "2026-09-12", time: "13:00", method: "مكالمة مرئية", status: "completed" },
    { id: "APT-004", requestId: "REQ-1003", clientId: "CLI-003", lawyerId: "LAW-005", title: "تحديد نطاق الاستشارة", date: "2026-10-03", time: "10:00", method: "مكالمة هاتفية", status: "pending" }
  ],
  documents: [
    { id: "DOC-001", name: "اتفاقية التوريد - مدار", ownerId: "CLI-001", requestId: "REQ-1001", caseId: "CASE-2001", type: "PDF", uploadedAt: "٢٠ سبتمبر ٢٠٢٦", status: "تمت المراجعة", category: "request" },
    { id: "DOC-002", name: "لائحة الموارد البشرية", ownerId: "CLI-001", requestId: "REQ-1002", caseId: null, type: "DOCX", uploadedAt: "٢٤ سبتمبر ٢٠٢٦", status: "بانتظار المراجعة", category: "request" },
    { id: "DOC-003", name: "عقد بيع العقار", ownerId: "CLI-002", requestId: "REQ-1004", caseId: "CASE-2002", type: "PDF", uploadedAt: "١٤ أغسطس ٢٠٢٦", status: "تمت المراجعة", category: "case" },
    { id: "DOC-004", name: "الرأي القانوني النهائي", ownerId: "CLI-002", requestId: "REQ-1004", caseId: "CASE-2002", type: "PDF", uploadedAt: "١٨ سبتمبر ٢٠٢٦", status: "متاح للعميل", category: "case" },
    { id: "DOC-005", name: "الهوية الوطنية", ownerId: "CLI-003", requestId: null, caseId: null, type: "صورة", uploadedAt: "٢٥ سبتمبر ٢٠٢٦", status: "بيانات وصفية فقط", category: "profile" }
  ],
  payments: [
    { id: "PAY-001", invoice: "INV-501", clientId: "CLI-001", lawyerId: "LAW-001", requestId: "REQ-1001", amount: "٤٥٠ ريال", status: "paid", date: "٢٠ سبتمبر ٢٠٢٦", dueDate: "٢٠ سبتمبر ٢٠٢٦" },
    { id: "PAY-002", invoice: "INV-502", clientId: "CLI-001", lawyerId: "LAW-002", requestId: "REQ-1002", amount: "٣٥٠ ريال", status: "pending", date: "٢٤ سبتمبر ٢٠٢٦", dueDate: "٣٠ سبتمبر ٢٠٢٦" },
    { id: "PAY-003", invoice: "INV-503", clientId: "CLI-002", lawyerId: "LAW-003", requestId: "REQ-1004", amount: "٦٠٠ ريال", status: "paid", date: "١٤ أغسطس ٢٠٢٦", dueDate: "١٤ أغسطس ٢٠٢٦" },
    { id: "PAY-004", invoice: "INV-504", clientId: "CLI-003", lawyerId: "LAW-005", requestId: "REQ-1003", amount: "٢٥٠ ريال", status: "unpaid", date: "٢٥ سبتمبر ٢٠٢٦", dueDate: "٣ أكتوبر ٢٠٢٦" }
  ],
  messages: [
    { id: "MSG-001", clientId: "CLI-001", lawyerId: "LAW-001", subject: "اتفاقية التوريد", messages: [{ from: "lawyer", text: "مرحبًا، راجعت النسخة الأخيرة من الاتفاقية وسأرسل الملاحظات خلال اليوم.", time: "١٠:٣٠ ص" }, { from: "client", text: "شكرًا، أحتاج التركيز على بند الجزاءات ومدة التوريد.", time: "١١:٠٥ ص" }] },
    { id: "MSG-002", clientId: "CLI-001", lawyerId: "LAW-002", subject: "لائحة الموارد البشرية", messages: [{ from: "lawyer", text: "تم استلام اللائحة، وسأعود إليكم بعد إتمام المراجعة الأولية.", time: "أمس" }] },
    { id: "MSG-003", clientId: "CLI-002", lawyerId: "LAW-003", subject: "عقد بيع العقار", messages: [{ from: "client", text: "هل يمكن توضيح أثر البند الرابع في الرأي النهائي؟", time: "١٨ سبتمبر" }] }
  ],
  verifications: [
    { id: "VER-001", lawyerId: "LAW-001", name: "د. نورة العتيبي", license: "١٢٤٨٣", specialty: "القانون التجاري", city: "الرياض", submittedAt: "منذ ٣ ساعات", status: "under_review", experience: "١٢ سنة", documents: ["رخصة مهنية", "سجل تدريبي"] },
    { id: "VER-002", lawyerId: "LAW-002", name: "أحمد السبيعي", license: "١١٠٢٦", specialty: "القضايا العمالية", city: "جدة", submittedAt: "أمس", status: "pending", experience: "٩ سنوات", documents: ["رخصة مهنية"] },
    { id: "VER-003", lawyerId: "LAW-003", name: "سارة الحربي", license: "١٣٦٨٢", specialty: "القانون العقاري", city: "الدمام", submittedAt: "٢٣ سبتمبر ٢٠٢٦", status: "approved", experience: "٨ سنوات", documents: ["رخصة مهنية", "شهادة خبرة"] },
    { id: "VER-004", lawyerId: "LAW-005", name: "ريم الغامدي", license: "١٤١٠٥", specialty: "الأحوال الشخصية", city: "المدينة المنورة", submittedAt: "٢٢ سبتمبر ٢٠٢٦", status: "more_info", experience: "٧ سنوات", documents: ["رخصة مهنية"] }
  ],
  reviews: [
    { id: "REV-001", client: "شركة مدار للتقنية", lawyer: "د. نورة العتيبي", rating: 5, text: "تواصل واضح ومتابعة منظمة من بداية الطلب حتى تسليم الملاحظات.", date: "٢٠ سبتمبر ٢٠٢٦", status: "published" },
    { id: "REV-002", client: "شركة أفق للاستشارات", lawyer: "سارة الحربي", rating: 4, text: "شرح عملي للتفاصيل وسرعة في الرد على الاستفسارات.", date: "١٨ سبتمبر ٢٠٢٦", status: "published" },
    { id: "REV-003", client: "عبدالله الشهري", lawyer: "ريم الغامدي", rating: 5, text: "تعامل مهني وخصوصية عالية في شرح الخيارات النظامية.", date: "١٥ سبتمبر ٢٠٢٦", status: "pending" }
  ],
  activities: [
    { id: "ACT-001", event: "تسجيل مستخدم جديد", actor: "النظام", target: "CLI-004", timestamp: "منذ ١٠ دقائق", type: "account" },
    { id: "ACT-002", event: "تقديم طلب خدمة", actor: "عبدالله الشهري", target: "REQ-1003", timestamp: "منذ ٣ ساعات", type: "request" },
    { id: "ACT-003", event: "رفع طلب توثيق محامٍ", actor: "أحمد السبيعي", target: "VER-002", timestamp: "أمس", type: "verification" },
    { id: "ACT-004", event: "اعتماد محامٍ", actor: "مشرف المنصة", target: "VER-003", timestamp: "٢٣ سبتمبر ٢٠٢٦", type: "verification" },
    { id: "ACT-005", event: "قبول طلب استشارة", actor: "د. نورة العتيبي", target: "REQ-1001", timestamp: "٢٠ سبتمبر ٢٠٢٦", type: "request" },
    { id: "ACT-006", event: "تغيير حالة قضية", actor: "د. نورة العتيبي", target: "CASE-2001", timestamp: "٢٠ سبتمبر ٢٠٢٦", type: "case" },
    { id: "ACT-007", event: "إضافة مستند", actor: "شركة مدار للتقنية", target: "DOC-001", timestamp: "٢٠ سبتمبر ٢٠٢٦", type: "document" },
    { id: "ACT-008", event: "إنشاء فاتورة", actor: "النظام", target: "PAY-001", timestamp: "٢٠ سبتمبر ٢٠٢٦", type: "payment" }
  ],
  users: [
    { id: "USR-001", name: "سلمان العبدالله", email: "salman@example.sa", role: "عميل", status: "نشط", registeredAt: "١ سبتمبر ٢٠٢٦" },
    { id: "USR-002", name: "د. نورة العتيبي", email: "noura@example.sa", role: "محامٍ", status: "نشط", registeredAt: "٢ سبتمبر ٢٠٢٦" },
    { id: "USR-003", name: "أحمد السبيعي", email: "ahmad@example.sa", role: "محامٍ", status: "نشط", registeredAt: "٤ سبتمبر ٢٠٢٦" },
    { id: "USR-004", name: "شركة مدار للتقنية", email: "legal@madar.sa", role: "عميل", status: "نشط", registeredAt: "٥ سبتمبر ٢٠٢٦" },
    { id: "USR-005", name: "مشرف MOWAKAL", email: "admin@mowakal.sa", role: "مدير النظام", status: "نشط", registeredAt: "١ أغسطس ٢٠٢٦" }
  ]
};

(function () {
  const data = window.MOWAKAL_DATA;
  const storageKey = "mowakal.lawyer-profiles.v1";
  const editableFields = ["name", "initials", "email", "phone", "specialty", "city", "experience", "license", "price", "availability", "bio", "services"];

  function readProfiles() {
    try {
      const profiles = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
      return profiles && typeof profiles === "object" && !Array.isArray(profiles) ? profiles : {};
    } catch (_) {
      return {};
    }
  }

  const savedProfiles = readProfiles();
  data.lawyers.forEach((lawyer) => {
    const saved = savedProfiles[lawyer.id];
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return;
    editableFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(saved, field)) lawyer[field] = field === "services" && Array.isArray(saved[field]) ? saved[field].slice() : saved[field];
    });
  });

  data.saveLawyerProfile = function (lawyerId, profile) {
    const lawyer = data.lawyers.find((entry) => entry.id === lawyerId);
    if (!lawyer) throw new Error("لم يتم العثور على ملف المحامي.");
    const next = {};
    editableFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(profile, field)) next[field] = field === "services" && Array.isArray(profile[field]) ? profile[field].slice() : profile[field];
    });
    const profiles = readProfiles();
    profiles[lawyerId] = { ...profiles[lawyerId], ...next };
    window.localStorage.setItem(storageKey, JSON.stringify(profiles));
    Object.assign(lawyer, next);
    return lawyer;
  };
})();
