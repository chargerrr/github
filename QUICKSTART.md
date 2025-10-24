# 🚀 KURULUM HIZLI BAŞLANGIÇ

## 📦 İndirme

Production build dosyası: `kazandiran-cark-production.tar.gz` (1 MB)

## ⚡ En Hızlı Kurulum (Docker)

```bash
# 1. Dosyaları çıkar
tar -xzf kazandiran-cark-production.tar.gz
cd kazandiran-cark

# 2. Otomatik kurulum script'ini çalıştır
chmod +x install.sh
./install.sh

# Veya manuel:
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# .env dosyalarını düzenleyin!
docker-compose up -d
```

## 🌐 Erişim

- **Frontend:** http://localhost (veya sizin domain)
- **Backend API:** http://localhost:8001
- **API Dokümantasyon:** http://localhost:8001/docs

## 🔐 İlk Admin

Şu email adreslerinden biriyle kayıt olun (otomatik admin olur):
- admin@kazantest.com
- testadmin@kazantest.com
- superadmin@test.com

## 📁 Dosya Yapısı

```
kazandiran-cark/
├── backend/                 # Python FastAPI backend
│   ├── server.py           # Ana backend dosyası
│   ├── requirements.txt    # Python bağımlılıkları
│   ├── .env.example        # Environment template
│   ├── Dockerfile          # Docker image
│   └── scripts/            # Yardımcı scriptler
├── frontend/               # React frontend
│   ├── build/             # Production build
│   ├── public/            # Static dosyalar
│   ├── package.json       # Node bağımlılıkları
│   ├── .env.example       # Environment template
│   ├── Dockerfile         # Docker image
│   └── nginx.conf         # Nginx konfigürasyonu
├── docker-compose.yml     # Docker orchestration
├── README.md              # Genel bilgiler
├── DEPLOYMENT.md          # Detaylı kurulum kılavuzu
└── install.sh             # Otomatik kurulum scripti
```

## ⚙️ Konfigürasyon

### Backend (.env)
```env
MONGO_URL=mongodb://mongodb:27017
DB_NAME=kazandiran_cark
SECRET_KEY=BURAYA_GUCLU_BIR_KEY_GIRIN
CORS_ORIGINS=https://yourdomain.com
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=https://yourdomain.com
```

## 🎮 İlk Kullanım

1. **Admin olarak giriş yap**
2. **Admin Panel → Siteler** sekmesinden partner siteler ekle
3. **Admin Panel → Ödüller** sekmesinden normal ödüller ekle
4. **Admin Panel → VIP Ödüller** sekmesinden VIP ödüller ekle
5. **Admin Panel → VIP Kurallar** sekmesinden VIP koşullar oluştur
6. **Admin Panel → VIP Kullanıcılar** sekmesinden kullanıcılara VIP hak ver

## 🔧 Yararlı Komutlar

```bash
# Servis yönetimi
docker-compose up -d          # Başlat
docker-compose down           # Durdur
docker-compose restart        # Yeniden başlat
docker-compose logs -f        # Logları izle

# Specific servis logları
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Container içine gir
docker exec -it kazandiran_backend bash
docker exec -it kazandiran_frontend sh

# MongoDB yedekleme
docker exec kazandiran_mongodb mongodump --out /backup

# Demo veri oluştur
docker exec kazandiran_backend python scripts/create_complete_demo.py
```

## 🆘 Sorun Giderme

### Port zaten kullanımda
```bash
# Portları kontrol et
sudo lsof -i :80
sudo lsof -i :8001
sudo lsof -i :27017

# Docker portlarını değiştir
# docker-compose.yml içinde port mapping'i değiştirin
```

### MongoDB bağlantı hatası
```bash
# MongoDB loglarını kontrol et
docker-compose logs mongodb

# MongoDB'yi yeniden başlat
docker-compose restart mongodb
```

### Frontend görünmüyor
```bash
# Nginx loglarını kontrol et
docker-compose logs frontend

# Browser cache'i temizle
# CTRL + SHIFT + R (hard reload)
```

## 🔒 Production Güvenlik

1. ✅ **SECRET_KEY değiştirin** (backend/.env)
2. ✅ **HTTPS kullanın** (Let's Encrypt ile ücretsiz)
3. ✅ **Firewall ayarlayın** (sadece 80, 443 portları açık)
4. ✅ **MongoDB'yi güvenli hale getirin** (authentication)
5. ✅ **Düzenli yedekleme yapın**

## 📚 Daha Fazla Bilgi

- Detaylı kurulum: [DEPLOYMENT.md](DEPLOYMENT.md)
- API dokümantasyonu: http://localhost:8001/docs
- GitHub: [repo-url]

## 🎉 Başarılar!

Herhangi bir sorunuz varsa lütfen iletişime geçin.

---
**Hazırlayan: AI Assistant | 2025**
