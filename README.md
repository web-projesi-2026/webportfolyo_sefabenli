# Sefa Benli — Kişisel Portfolio Web Sitesi

> Bilgisayar Programcılığı öğrencisi ve yazılım geliştirici olarak projelerimi, becerilerimi ve kendimi tanıttığım kişisel portfolyo web sitem.

---

## 🚀 Canlı Demo

[sefabenli.com](https://sefabenli.com) *(yakında)*

---

## 📁 Proje Yapısı

```
sefa-portfolio/
│
├── index.html                        ← Ana Sayfa
├── README.md                         ← Bu dosya
│
├── pages/
│   ├── about.html                    ← Hakkımda (detaylı tanıtım, timeline, hobiler)
│   ├── projects.html                 ← Tüm projeler + filtreleme (Web / Python / Java)
│   ├── blog.html                     ← Blog yazıları + kenar çubuğu
│   ├── services.html                 ← Hizmetler (web geliştirme, Python, veritabanı, mentorluk)
│   ├── contact.html                  ← İletişim formu
│   ├── login.html                    ← Giriş Yap
│   └── register.html                 ← Kayıt Ol
│
├── assets/
│   ├── css/
│   │   ├── style.css                 ← Ana stiller + animasyonlar
│   │   └── responsive.css            ← Responsive kurallar
│   ├── js/
│   │   └── main.js                   ← Tüm JavaScript
│   └── img/                          ← Görseller
│
├── backend/
│   └── php/
│       ├── db.php                    ← ⭐ Merkezi MySQL (PDO) bağlantısı
│       ├── auth.php                  ← Kayıt / Giriş / Çıkış
│       ├── contact.php               ← İletişim formu işleme + e-posta
│       └── session_check.php         ← Oturum koruma yardımcısı
│
└── admin/
    └── index.html                    ← Admin Paneli
```

---

## ✨ Özellikler

### Frontend
- **Tek sayfa tasarım** + ayrı detay sayfaları (`pages/`)
- **Koyu tema** — mor accent rengi sistemi (`#6e40c9`)
- **Typed text efekti** — hero bölümünde dönen meslek unvanları
- **Scroll spy** — aktif navbar bağlantısı otomatik güncellenir
- **Proje filtreleme** — Tümü / Web / Python / Java

### Backend (PHP)
- **`db.php`** — PDO tabanlı singleton bağlantı; auth ve contact bu dosyayı `require` eder
- **Session tabanlı kimlik doğrulama** (login, register, logout)
- **Oturum zaman aşımı** — 2 saat hareketsizlik sonrası otomatik çıkış
- **Bcrypt şifre hashleme** (cost: 12)
- **Session fixation koruması** — `session_regenerate_id()`
- **CSRF token** desteği
- **Rate limiting** — dakikada 5 istek sınırı
- **Honeypot** — bot koruması
- **Beni hatırla** — 30 günlük güvenli cookie (Secure + HttpOnly + SameSite=Strict)

---

## 🛠️ Kullanılan Teknolojiler

| Katman     | Teknoloji                          |
|------------|------------------------------------|
| Markup     | HTML5                              |
| Stil       | CSS3, CSS Variables, Flexbox, Grid |
| JavaScript | Vanilla JS (ES6+)                  |
| Backend    | PHP 8+                             |
| Veritabanı | MySQL 8+ / MariaDB                 |
| İkonlar    | Font Awesome 6.5                   |
| Font       | Google Fonts — Poppins             |

---

## ⚙️ Kurulum

### 1. Projeyi Klonla

```bash
git clone https://github.com/sefabenli/portfolio.git
cd portfolio
```

### 2. Veritabanını Oluştur

```sql
CREATE DATABASE sefa_portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sefa_portfolio;

CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    first_name    VARCHAR(50)  NOT NULL,
    last_name     VARCHAR(50)  NOT NULL,
    email         VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('user','admin') DEFAULT 'user',
    is_active     TINYINT(1) DEFAULT 1,
    last_login    DATETIME,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE remember_tokens (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE contact_messages (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    email        VARCHAR(120) NOT NULL,
    subject      VARCHAR(200),
    message_type VARCHAR(30),
    message      TEXT NOT NULL,
    ip_address   VARCHAR(45),
    is_read      TINYINT(1) DEFAULT 0,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3. `backend/php/db.php` Dosyasını Yapılandır

```php
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_USER', 'kullanici_adiniz');
define('DB_PASS', 'sifreniz');
define('DB_NAME', 'sefa_portfolio');
```

> **Not:** Yalnızca `db.php` düzenlemek yeterlidir. `auth.php` ve `contact.php` bu dosyayı otomatik olarak dahil eder.

### 4. `backend/php/contact.php` Dosyasını Yapılandır

```php
define('SITE_EMAIL', 'sizin@emailiniz.com');
```

### 5. Korumalı Sayfalara Oturum Kontrolü Ekle (isteğe bağlı)

```php
<?php
require_once 'backend/php/session_check.php';
requireLogin();    // Giriş yapılmamışsa login'e yönlendir
// requireAdmin(); // Yalnızca adminlere açık sayfalar için
?>
```

### 6. Çalıştır

```bash
php -S localhost:8000
# veya XAMPP / WAMP / Laragon ile htdocs'a taşı
```

---

## 🔐 Güvenlik Mimarisi

```
Kullanıcı formu
      │
      ▼
auth.php / contact.php
      │
      ├─ CSRF token doğrula
      ├─ Honeypot kontrolü
      ├─ Rate limit kontrolü
      ├─ Girdi temizleme (sanitize)
      │
      ▼
   db.php  ←  tek nokta, PDO prepared statements
      │
      ▼
   MySQL
```

---

## 📝 İçerik Güncelleme

| Ne güncellemek istiyorsunuz? | Dosya |
|------------------------------|-------|
| İsim, unvan, açıklama | `index.html` → `.hero-content` |
| Hakkımda metni | `pages/about.html` |
| Proje kartları | `pages/projects.html` |
| Hizmetler | `pages/services.html` |
| Blog yazıları | `pages/blog.html` |
| İletişim bilgileri | `pages/contact.html` |
| Veritabanı bağlantısı | `backend/php/db.php` |
| Renk şeması | `assets/css/style.css` → `:root` |

---

## 🎨 Renk Sistemi

```css
--accent:        #6e40c9   /* Ana mor */
--accent-2:      #a78bfa   /* Açık mor */
--dark-bg:       #0d1117   /* En koyu arka plan */
--dark-surface:  #161b22   /* Orta yüzey */
--dark-card:     #1c2333   /* Kart arka planı */
```

---

## 📬 İletişim

**Sefa Benli**
- E-posta: sefa@example.com
- GitHub: [github.com/sefabenli](https://github.com/sefabenli)
- LinkedIn: [linkedin.com/in/sefabenli](https://linkedin.com/in/sefabenli)

---

## 📄 Lisans

Bu proje kişisel kullanım amaçlı geliştirilmiştir.  
Kaynak kodu referans olarak kullanılabilir; ticari amaçla kullanılamaz.

---

*Sevgiyle kodlandı ❤️ — Sefa Benli, 2025*
