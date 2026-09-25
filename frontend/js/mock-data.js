window.MOWAKAL_DATA = {
  lawyers: [
    {
      id: "lawyer-001",
      name: "د. نورة العتيبي",
      initials: "نع",
      specialty: "القانون التجاري",
      city: "الرياض",
      experience: 12,
      rating: 4.9,
      reviews: 86,
      license: "رخصة مهنية ١٢٤٨٣",
      price: "من ٤٥٠ ريالًا",
      availability: "متاحة هذا الأسبوع",
      verified: true,
      bio: "مستشارة قانونية متخصصة في تأسيس الشركات والعقود التجارية وتسوية المنازعات بأسلوب عملي واضح.",
      services: ["العقود التجارية", "حوكمة الشركات", "تأسيس المنشآت"],
      accent: "light"
    },
    {
      id: "lawyer-002",
      name: "أحمد السبيعي",
      initials: "اس",
      specialty: "قضايا العمل",
      city: "جدة",
      experience: 9,
      rating: 4.8,
      reviews: 64,
      license: "رخصة مهنية ١١٠٢٩",
      price: "من ٣٥٠ ريالًا",
      availability: "متاح غدًا",
      verified: true,
      bio: "محامٍ يركز على أنظمة العمل واللوائح الداخلية وصياغة الحلول المتوازنة للمنشآت والأفراد.",
      services: ["نزاعات العمل", "لوائح الموارد البشرية", "الاستشارات العمالية"],
      accent: "default"
    },
    {
      id: "lawyer-003",
      name: "سارة الحربي",
      initials: "سح",
      specialty: "القانون العقاري",
      city: "الدمام",
      experience: 8,
      rating: 4.7,
      reviews: 51,
      license: "رخصة مهنية ١٣٦٧١",
      price: "من ٣٠٠ ريال",
      availability: "متاحة بعد يومين",
      verified: true,
      bio: "تقدم استشارات متخصصة في عقود الإيجار والبيع والشراء والنزاعات المرتبطة بالعقار.",
      services: ["عقود الإيجار", "البيع والشراء", "النزاعات العقارية"],
      accent: "light"
    },
    {
      id: "lawyer-004",
      name: "خالد القحطاني",
      initials: "خق",
      specialty: "القانون الجنائي",
      city: "مكة المكرمة",
      experience: 15,
      rating: 4.9,
      reviews: 73,
      license: "رخصة مهنية ١٠٨٤٤",
      price: "من ٥٠٠ ريال",
      availability: "متاح هذا الأسبوع",
      verified: true,
      bio: "محامٍ متمرس في الترافع وإدارة الملفات الجنائية مع اهتمام خاص بوضوح الخطوات للعميل.",
      services: ["الترافع الجنائي", "التحقيقات", "الاستشارات العاجلة"],
      accent: "default"
    },
    {
      id: "lawyer-005",
      name: "ريم الغامدي",
      initials: "رغ",
      specialty: "الأحوال الشخصية",
      city: "المدينة المنورة",
      experience: 7,
      rating: 4.8,
      reviews: 48,
      license: "رخصة مهنية ١٤١٠٥",
      price: "من ٢٥٠ ريالًا",
      availability: "متاحة اليوم",
      verified: true,
      bio: "تساعد الأسر على فهم الخيارات النظامية وإدارة قضايا الأحوال الشخصية بحساسية وخصوصية.",
      services: ["النفقة والحضانة", "التركات", "الوصايا"],
      accent: "light"
    },
    {
      id: "lawyer-006",
      name: "يوسف المطيري",
      initials: "يم",
      specialty: "الملكية الفكرية",
      city: "الرياض",
      experience: 10,
      rating: 4.6,
      reviews: 39,
      license: "رخصة مهنية ١٢٩٩٠",
      price: "من ٤٠٠ ريال",
      availability: "متاح الأسبوع المقبل",
      verified: true,
      bio: "مستشار في حماية العلامات التجارية وحقوق المؤلف وصياغة اتفاقيات الاستخدام والترخيص.",
      services: ["العلامات التجارية", "حقوق المؤلف", "اتفاقيات الترخيص"],
      accent: "default"
    }
  ],
  consultations: [
    { id: "CONS-1048", lawyer: "د. نورة العتيبي", initials: "نع", subject: "مراجعة عقد شراكة", date: "٢٨ سبتمبر ٢٠٢٦", status: "accepted", action: "عرض التفاصيل" },
    { id: "CONS-1041", lawyer: "أحمد السبيعي", initials: "اس", subject: "استشارة في لائحة العمل", date: "٢٤ سبتمبر ٢٠٢٦", status: "pending", action: "متابعة الطلب" },
    { id: "CONS-1019", lawyer: "سارة الحربي", initials: "سح", subject: "نزاع على عقد إيجار", date: "١٢ سبتمبر ٢٠٢٦", status: "completed", action: "عرض الملخص" },
    { id: "CONS-0995", lawyer: "ريم الغامدي", initials: "رغ", subject: "استشارة أسرية", date: "٢٨ أغسطس ٢٠٢٦", status: "rejected", action: "طلب جديد" }
  ],
  cases: [
    { id: "MOW-2048", title: "نزاع عقد توريد", client: "شركة مدار للتقنية", status: "active", updated: "منذ ساعتين", type: "تجاري" },
    { id: "MOW-2039", title: "مراجعة لائحة داخلية", client: "شركة أفق للاستشارات", status: "active", updated: "أمس", type: "عمل" },
    { id: "MOW-1988", title: "استشارة عقد إيجار", client: "عبدالله الشهري", status: "closed", updated: "١٨ سبتمبر ٢٠٢٦", type: "عقاري" },
    { id: "MOW-1972", title: "تسجيل علامة تجارية", client: "متجر نواة", status: "active", updated: "١٦ سبتمبر ٢٠٢٦", type: "ملكية فكرية" },
    { id: "MOW-1924", title: "مراجعة اتفاقية خدمات", client: "منشأة ركن", status: "closed", updated: "٠٨ سبتمبر ٢٠٢٦", type: "تجاري" }
  ],
  clients: [
    { name: "شركة مدار للتقنية", initials: "مت", email: "legal@madar.sa", status: "نشطة", fees: "١٢,٥٠٠ ريال" },
    { name: "شركة أفق للاستشارات", initials: "أا", email: "admin@ofuq.sa", status: "نشطة", fees: "٨,٧٥٠ ريال" },
    { name: "عبدالله الشهري", initials: "عش", email: "abdullah@example.sa", status: "مغلقة", fees: "٣,٢٠٠ ريال" },
    { name: "متجر نواة", initials: "من", email: "hello@nawaat.sa", status: "نشطة", fees: "٥,٤٠٠ ريال" }
  ],
  documents: [
    { name: "اتفاقية التوريد - مدار", type: "PDF", date: "٢٥ سبتمبر ٢٠٢٦", by: "د. نورة العتيبي", category: "court" },
    { name: "لائحة الموارد البشرية", type: "Word", date: "٢٣ سبتمبر ٢٠٢٦", by: "أحمد السبيعي", category: "word" },
    { name: "مذكرة مراجعة العقد", type: "PDF", date: "٢٠ سبتمبر ٢٠٢٦", by: "د. نورة العتيبي", category: "pdf" },
    { name: "ملف بيانات شركة أفق", type: "بيانات عميل", date: "١٨ سبتمبر ٢٠٢٦", by: "د. نورة العتيبي", category: "client" }
  ],
  calendarEvents: [
    { date: "2026-09-28", title: "جلسة مدار", type: "meeting" },
    { date: "2026-09-30", title: "موعد تسليم", type: "deadline" },
    { date: "2026-10-03", title: "مراجعة أفق", type: "meeting" }
  ],
  activities: [
    { icon: "✓", title: "تم قبول طلب استشارة جديد", detail: "من شركة مدار للتقنية · منذ ساعتين", tone: "success" },
    { icon: "↗", title: "تم رفع مستند إلى ملف القضية", detail: "اتفاقية التوريد · أمس", tone: "info" },
    { icon: "!", title: "موعد نهائي يقترب", detail: "تسليم مذكرة قضية MOW-2048 · خلال 4 أيام", tone: "warning" }
  ],
  adminVerifications: [
    { name: "هند الزهراني", initials: "هز", specialty: "القانون التجاري", submitted: "منذ ٣ ساعات", status: "pending" },
    { name: "مازن الدوسري", initials: "مد", specialty: "القانون العقاري", submitted: "أمس", status: "pending" },
    { name: "لطيفة العبدالله", initials: "ل ع", specialty: "الأحوال الشخصية", submitted: "٢٣ سبتمبر ٢٠٢٦", status: "pending" }
  ]
};
