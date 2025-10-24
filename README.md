# 🎰 Kazandıran Çark - VIP Spin & Win Platform

Modern, şık ve kullanıcı dostu bir çark çevirme platformu. Normal çark ve VIP çark sistemi ile kullanıcılarınıza eşsiz bir deneyim sunun!

## ✨ Özellikler

### 🎯 Normal Çark
- Günlük ücretsiz çevirme hakkı
- Ekstra çevirme hakları
- Çeşitli ödüller (bonus, freespin, nakit, freebet)
- Smooth ve heyecanlı animasyonlar
- Gerçek zamanlı kazanan listesi

### 🌟 VIP Çark
- Özel büyük ödüller (TRX, TL bonuslar)
- Mor/pembe premium tasarım
- Özelleştirilebilir VIP koşullar
- Manuel veya otomatik hak verme
- VIP kullanıcı yönetimi ve istatistikler

### 👑 Admin Panel
- **Ödül Yönetimi:** Normal ve VIP ödüller
- **Site Yönetimi:** Ortaklık siteleri, logolar, kategoriler
- **VIP Kurallar:** Koşul bazlı VIP hak verme
- **Kullanıcı Yönetimi:** Tüm kullanıcıları görüntüleme, düzenleme, export
- **İstatistikler:** Detaylı raporlama ve analiz
- **Database Yönetimi:** Seçici veri temizleme

## 🚀 Hızlı Başlangıç

### Docker ile Kurulum (Önerilen)

```bash
# Environment dosyalarını ayarlayın
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# .env dosyalarını düzenleyin!

# Docker ile başlatın
docker-compose up -d

# Demo verileri oluşturun (opsiyonel)
docker exec -it kazandiran_backend python scripts/create_complete_demo.py
```

### Manuel Kurulum

Detaylı kurulum talimatları için [DEPLOYMENT.md](DEPLOYMENT.md) dosyasını inceleyin.

## 📚 Teknolojiler

**Backend:** FastAPI, MongoDB, Motor, JWT, Passlib  
**Frontend:** React 18, Tailwind CSS, Shadcn UI, Axios  
**DevOps:** Docker, Nginx

## 📖 Dokümantasyon

- [Deployment Rehberi](DEPLOYMENT.md) - Detaylı kurulum ve konfigürasyon
- [API Dokümantasyonu](http://localhost:8001/docs) - FastAPI swagger UI

---

**Made with ❤️ for amazing user experience**

## Özellikler

### Kullanıcı Özellikleri
- **Üyelik Sistemi**: Ad, soyad, email, telefon ve Telegram kullanıcı adı ile kayıt
- **Çark Çevirme**: Günlük 1 ücretsiz çark hakkı
- **Ödül Kazanma**: Farklı ağırlıklarda ödüller
- **Site Kullanıcı Adı**: Ödül kazandığınız site için kullanıcı adınızı belirtme
- **Ödül Takibi**: Kazandığınız ödülleri ve durumlarını görüntüleme
- **Ekstra Çark Hakları**: Admin tarafından tanımlanan ekstra çevirme hakları

### Admin Özellikleri
- **Site Yönetimi**: Ödül sitelerini ekleme/silme (Sekabet, Bets10, vb.)
- **Ödül Yönetimi**: 
  - Ödül ekleme/silme
  - Ödül ağırlığı belirleme (kazanma olasılığı)
  - Site bağlantısı yapma
- **Çark Yönetimi**:
  - Tüm çevirilen çarkları görüntüleme
  - Kullanıcı bilgilerini görme
  - Ödülleri onaylama/reddetme
  - Admin notları ekleme
- **Ekstra Hak Tanımlama**:
  - Belirli kullanıcıya ekstra çark hakkı
  - Tüm kullanıcılara toplu ekstra hak

## Teknoloji Stack

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL veritabanı
- **Motor**: Async MongoDB driver
- **JWT**: Token tabanlı kimlik doğrulama
- **Bcrypt**: Şifre hashleme

### Frontend
- **React 19**: Modern UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Yüksek kaliteli component kütüphanesi
- **Axios**: HTTP client
- **Sonner**: Toast bildirimleri
- **Lucide React**: Modern iconlar

## Test Credentials

### Admin Kullanıcı
- **Email**: admin@test.com
- **Şifre**: admin123

### Test Verileri
Uygulama aşağıdaki test verileri ile gelir:
- **Siteler**: Sekabet, Bets10, Youwin
- **Ödüller**: 
  - 500 TL Bonus (ağırlık: 1) - En nadir
  - 100 TL Bonus (ağırlık: 3)
  - 50 Freespin (ağırlık: 5)
  - 20 TL Bonus (ağırlık: 8)
  - 10 Freespin (ağırlık: 10) - En yaygın

## Çark Çevirme Kuralları
1. Her kullanıcı günde 1 kere ücretsiz çark çevirebilir
2. Günlük hak kullanıldığında, ekstra haklardan kullanılır
3. Yeni gün başladığında günlük hak otomatik yenilenir
4. Ödüller ağırlıklı olarak seçilir (weight değeri)

## Ödül Durumları
- **Pending**: Beklemede - Admin onayı bekleniyor
- **Approved**: Onaylandı - Ödül kullanıcıya tanımlandı
- **Rejected**: Reddedildi - Bilgiler doğrulanamadı