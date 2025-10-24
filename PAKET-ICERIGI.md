# 📦 KAZANDIRAN ÇARK - TAM PAKET İÇERİĞİ

## 📥 İndirilen Dosya

**Dosya Adı:** `kazandiran-cark-full-package.zip`  
**Boyut:** 309 KB  
**İçerik:** Kaynak kod + Production build + Kurulum dosyaları + Dokümantasyon

---

## 📁 Paket İçeriği

```
kazandiran-cark-full-package.zip
│
├── 📂 backend/                          # Backend Uygulaması (Python FastAPI)
│   ├── server.py                        # Ana backend dosyası (tüm API'ler)
│   ├── requirements.txt                 # Python bağımlılıkları
│   ├── .env                            # Environment değişkenleri (ÖNEMLİ!)
│   ├── .env.example                    # Environment template
│   ├── Dockerfile                       # Docker container tanımı
│   ├── uploads/                         # Yüklenen dosyalar klasörü
│   └── scripts/                         # Yardımcı scriptler
│       ├── create_demo_data.py          # Demo veri oluşturucu
│       └── create_complete_demo.py      # Tam demo veri oluşturucu
│
├── 📂 frontend/                         # Frontend Uygulaması (React)
│   ├── build/                           # ✅ Production build (derlenmiş)
│   │   ├── index.html                   # Ana HTML dosyası
│   │   ├── static/                      # JS, CSS, medya dosyaları
│   │   └── ...
│   ├── src/                             # ✅ Kaynak kodlar
│   │   ├── App.js                       # Ana uygulama
│   │   ├── App.css                      # Global stiller
│   │   ├── index.js                     # Entry point
│   │   ├── pages/                       # Sayfalar
│   │   │   ├── HomePage.js              # Ana sayfa (çarklar)
│   │   │   ├── AdminPage.js             # Admin panel
│   │   │   ├── SettingsPage.js          # Ayarlar
│   │   │   └── ProfilePage.js           # Profil
│   │   └── components/                  # UI bileşenleri
│   │       └── ui/                      # Shadcn UI bileşenleri
│   ├── public/                          # Static dosyalar
│   │   ├── sitemap.xml                  # SEO sitemap
│   │   ├── robots.txt                   # SEO robots
│   │   └── ...
│   ├── package.json                     # Node bağımlılıkları
│   ├── yarn.lock                        # Yarn lock dosyası
│   ├── tailwind.config.js               # Tailwind CSS config
│   ├── postcss.config.js                # PostCSS config
│   ├── craco.config.js                  # Create React App config
│   ├── .env                            # Frontend environment (ÖNEMLİ!)
│   ├── .env.example                    # Environment template
│   ├── Dockerfile                       # Docker container tanımı
│   └── nginx.conf                       # Nginx konfigürasyonu
│
├── 📂 scripts/                          # Yardımcı Scriptler
│   ├── create_demo_data.py              # Temel demo veri
│   └── create_complete_demo.py          # Detaylı demo veri
│
├── 📄 docker-compose.yml                # ✅ Docker Compose orchestration
├── 📄 install.sh                        # ✅ Otomatik kurulum scripti
├── 📄 README.md                         # ✅ Proje ana dokümantasyonu
├── 📄 DEPLOYMENT.md                     # ✅ Detaylı kurulum kılavuzu
└── 📄 QUICKSTART.md                     # ✅ Hızlı başlangıç rehberi
```

---

## 🚀 HIZLI KURULUM (3 ADIM)

### Adım 1: Dosyayı Çıkarın
```bash
unzip kazandiran-cark-full-package.zip
cd kazandiran-cark
```

### Adım 2: Environment Ayarları
```bash
# Backend environment
nano backend/.env
# Değiştirin:
# - SECRET_KEY (güçlü bir key oluşturun)
# - CORS_ORIGINS (domain'inizi ekleyin)

# Frontend environment
nano frontend/.env
# Değiştirin:
# - REACT_APP_BACKEND_URL (backend URL'inizi girin)
```

### Adım 3: Docker ile Başlatın
```bash
chmod +x install.sh
./install.sh
```

**VEYA Manuel:**
```bash
docker-compose up -d
```

---

## 📋 GEREKSİNİMLER

### Minimum Sunucu Gereksinimleri:
- **CPU:** 2 Core
- **RAM:** 2 GB
- **Disk:** 10 GB
- **İşletim Sistemi:** Ubuntu 20.04+ veya Debian 10+

### Yazılım Gereksinimleri:
- **Docker:** 20.10+
- **Docker Compose:** 1.29+

VEYA Manuel kurulum için:
- **Python:** 3.10+
- **Node.js:** 16+
- **MongoDB:** 4.4+
- **Nginx:** (opsiyonel, production için önerilir)

---

## ⚙️ ÖNEMLİ YAPILANDIRMALAR

### 1. Backend Environment (`backend/.env`)
```env
# MongoDB Bağlantısı
MONGO_URL=mongodb://mongodb:27017
DB_NAME=kazandiran_cark

# Güvenlik (ÖNEMLİ - DEĞİŞTİRİN!)
SECRET_KEY=buraya-cok-guclu-bir-secret-key-girin-min-32-karakter

# CORS (Domain'lerinizi ekleyin)
CORS_ORIGINS=https://yourdomain.com,http://localhost:3000
```

### 2. Frontend Environment (`frontend/.env`)
```env
# Backend API URL (Domain'inizi veya IP'nizi girin)
REACT_APP_BACKEND_URL=https://yourdomain.com
```

### 3. Docker Compose (`docker-compose.yml`)
- Port ayarları: 80 (frontend), 8001 (backend), 27017 (mongodb)
- Değiştirmek isterseniz docker-compose.yml'i düzenleyin

---

## 🌐 ERİŞİM BİLGİLERİ (Kurulum Sonrası)

### Uygulamaya Erişim:
- **Ana Sayfa (Frontend):** http://sunucu-ip veya https://domain.com
- **Backend API:** http://sunucu-ip:8001
- **API Dokümantasyonu:** http://sunucu-ip:8001/docs

### İlk Admin Kullanıcı:
Aşağıdaki email adreslerinden biriyle kayıt olun (otomatik admin olur):
- `admin@kazantest.com`
- `testadmin@kazantest.com`
- `superadmin@test.com`

---

## 📖 DOKÜMANTASYON REHBERİ

Pakette 3 ana dokümantasyon dosyası var:

1. **QUICKSTART.md** → İlk 5 dakikada başlatmak için
2. **DEPLOYMENT.md** → Detaylı kurulum, güvenlik, backup
3. **README.md** → Proje özellikleri ve genel bilgiler

---

## 🎮 VIP ÇARK SİSTEMİ KURULUMU

VIP sistemini aktif etmek için:

1. Admin olarak giriş yapın
2. **Admin Panel → Siteler** → Partner siteler ekleyin
3. **Admin Panel → VIP Ödüller** → Büyük ödüller ekleyin (5000 TL, TRX, vb.)
4. **Admin Panel → VIP Kurallar** → Koşullar oluşturun (1000 TL yatırım, vb.)
5. **Admin Panel → VIP Kullanıcılar** → Kullanıcılara VIP hak verin

---

## 🔒 GÜVENLİK KONTROLLİSTESİ

Kurulumdan önce mutlaka yapın:

- [ ] Backend `.env` dosyasında SECRET_KEY'i değiştirin
- [ ] Production'da HTTPS kullanın (Let's Encrypt ücretsiz)
- [ ] Firewall kurallarını ayarlayın (sadece 80, 443 portları)
- [ ] MongoDB authentication aktif edin
- [ ] CORS ayarlarını production domain'e göre düzenleyin
- [ ] Düzenli yedekleme sistemi kurun

---

## 🆘 SORUN GİDERME

### Portlar kullanımda:
```bash
sudo lsof -i :80
sudo lsof -i :8001
sudo lsof -i :27017
```

### Container logları:
```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Servis yeniden başlatma:
```bash
docker-compose restart
docker-compose down && docker-compose up -d
```

---

## 📞 DESTEK

- GitHub Issues
- Email: [destek-email]
- Dokümantasyon: README.md, DEPLOYMENT.md, QUICKSTART.md

---

## 📝 LİSANS

[Lisans bilgisi buraya eklenecek]

---

## ✅ KURULUM DOĞRULAMA

Kurulum tamamlandıktan sonra:

1. ✅ Frontend açılıyor mu? → http://sunucu-ip
2. ✅ Backend API çalışıyor mu? → http://sunucu-ip:8001/docs
3. ✅ Kayıt olabiliyorsunuz mu?
4. ✅ Giriş yapabiliyorsunuz mu?
5. ✅ Normal çark dönüyor mu?
6. ✅ Admin panel açılıyor mu? (admin email ile)
7. ✅ VIP çark sistemi çalışıyor mu?

Tüm kontroller ✅ ise **kurulum başarılı!** 🎉

---

**Hazırlayan:** AI Assistant  
**Tarih:** 2025  
**Versiyon:** 1.0  

**🚀 Başarılar dileriz!**
