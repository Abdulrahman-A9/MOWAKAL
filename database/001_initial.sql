-- Apply only to a new, empty MySQL 8 database. No existing tables are dropped.
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('client', 'lawyer', 'admin', 'verifier') NOT NULL,
  phone VARCHAR(20) NULL,
  city VARCHAR(80) NULL,
  status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lawyers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  license_number VARCHAR(60) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  city VARCHAR(80) NULL,
  experience TINYINT UNSIGNED NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  reviews INT UNSIGNED NOT NULL DEFAULT 0,
  consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  availability VARCHAR(80) NULL,
  bio VARCHAR(700) NULL,
  services_json JSON NULL,
  verified TINYINT(1) NOT NULL DEFAULT 0,
  verification_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY lawyers_user_unique (user_id),
  UNIQUE KEY lawyers_license_unique (license_number),
  CONSTRAINT lawyers_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(20) NOT NULL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  description VARCHAR(500) NOT NULL,
  type VARCHAR(80) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  client_id BIGINT UNSIGNED NOT NULL,
  lawyer_id BIGINT UNSIGNED NULL,
  service_id VARCHAR(20) NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  urgency ENUM('عادية', 'عالية', 'عاجلة') NOT NULL DEFAULT 'عادية',
  city VARCHAR(80) NULL,
  status ENUM('submitted', 'waiting_lawyer', 'under_review', 'accepted', 'in_progress', 'completed', 'rejected', 'cancelled') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY requests_client_created (client_id, created_at),
  KEY requests_lawyer_created (lawyer_id, created_at),
  CONSTRAINT requests_client_fk FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT requests_lawyer_fk FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE RESTRICT,
  CONSTRAINT requests_service_fk FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS request_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  actor_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY request_events_request_id (request_id, id),
  CONSTRAINT request_events_request_fk FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE RESTRICT,
  CONSTRAINT request_events_actor_fk FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY messages_request_id (request_id, id),
  CONSTRAINT messages_request_fk FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE RESTRICT,
  CONSTRAINT messages_sender_fk FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  client_id BIGINT UNSIGNED NOT NULL,
  lawyer_id BIGINT UNSIGNED NOT NULL,
  appointment_date DATETIME NOT NULL,
  notes VARCHAR(1000) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY appointments_request_date_unique (request_id, appointment_date),
  KEY appointments_client_date (client_id, appointment_date),
  CONSTRAINT appointments_request_fk FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE RESTRICT,
  CONSTRAINT appointments_client_fk FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT appointments_lawyer_fk FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(60) NOT NULL,
  resource_type VARCHAR(60) NOT NULL,
  resource_id VARCHAR(40) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY audit_events_created (created_at),
  CONSTRAINT audit_events_actor_fk FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO services (id, name, category, description, type, icon) VALUES
('SERV-001', 'استشارة قانونية', 'استشارات', 'إجابة قانونية عملية تساعدك على فهم موقفك وخياراتك القادمة.', 'استشارة', '◌'),
('SERV-002', 'دراسة قضية', 'التقاضي', 'مراجعة تفاصيل القضية والمستندات وتقديم تصور واضح لمسارها.', 'دراسة ملف', '▣'),
('SERV-003', 'تمثيل قانوني وقضائي', 'التقاضي', 'تمثيل مهني ومتابعة الإجراءات أمام الجهات المختصة.', 'تمثيل', '⚖'),
('SERV-004', 'صياغة ومراجعة العقود', 'العقود', 'صياغة العقود ومراجعتها بما يحمي المصالح ويقلل المخاطر.', 'وثيقة قانونية', '▤'),
('SERV-005', 'صياغة المذكرات والخطابات', 'الوثائق', 'إعداد مذكرات وخطابات قانونية بصياغة واضحة ومنظمة.', 'وثيقة قانونية', '✎'),
('SERV-006', 'قضايا الشركات والأعمال', 'الأعمال', 'حلول قانونية للشركات والأنشطة التجارية والحوكمة.', 'استشارة أعمال', '▥'),
('SERV-007', 'القضايا العمالية', 'العمل', 'استشارات ومتابعة النزاعات واللوائح والعقود العمالية.', 'قضية عمالية', '◫'),
('SERV-008', 'القضايا العقارية', 'العقار', 'مراجعة عقود الإيجار والبيع والنزاعات العقارية.', 'قضية عقارية', '⌂'),
('SERV-009', 'قضايا الأحوال الشخصية', 'الأحوال الشخصية', 'إرشاد قانوني يحفظ الخصوصية ويشرح الخيارات المتاحة.', 'استشارة أسرية', '♡'),
('SERV-010', 'خدمات التنفيذ', 'التنفيذ', 'متابعة طلبات التنفيذ والإجراءات المرتبطة بها.', 'متابعة إجراء', '↗');
