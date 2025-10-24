# 🖥️ KAZANDIRAN ÇARK - SİSTEM GEREKSİNİMLERİ RAPORU

## 📊 ÖZET

**Uygulama Tipi:** Full-stack Web Uygulaması (React + FastAPI + MongoDB)  
**Mimari:** Mikroservis (3 ana servis)  
**Deployment:** Docker veya Manuel

---

## 🎯 HOSTİNG TİPİ ÖNERİLERİ

### ❌ SHARED HOSTİNG (UYGUN DEĞİL)
**Neden çalışmaz:**
- Docker desteği yok
- Root erişimi yok
- MongoDB kurulumu yapılamaz
- Python/Node.js versiyonları eski
- Process yönetimi kısıtlı

### ✅ VPS HOSTİNG (ÖNERİLEN) ⭐
**En uygun seçenek:**
- Tam root erişimi
- Docker kurulumu mümkün
- Tüm portları açabilirsiniz
- Maliyet/performans dengesi iyi

### ✅ DEDICATED SERVER (YÜKSEK TRAFİK İÇİN)
**Büyük ölçek için:**
- Tam performans
- Paylaşımsız kaynaklar
- Yüksek maliyet

### ✅ CLOUD HOSTİNG (ESNEKLİK İSTERSENİZ)
**Örnekler:** AWS, Google Cloud, Azure, DigitalOcean
- Otomatik ölçeklendirme
- Yedekleme kolay
- Biraz teknik bilgi gerekir

---

## 💻 MİNİMUM SİSTEM GEREKSİNİMLERİ

### Donanım (Test/Geliştirme İçin)
```
CPU:      2 Core (2.0 GHz+)
RAM:      2 GB
Disk:     10 GB SSD
Bant:     100 Mbps
```

**Kullanıcı kapasitesi:** 50-100 eşzamanlı kullanıcı

---

## 🚀 ÖNERİLEN SİSTEM GEREKSİNİMLERİ

### Donanım (Production İçin)
```
CPU:      4 Core (2.5 GHz+)
RAM:      4 GB
Disk:     20 GB SSD
Bant:     1 Gbps
```

**Kullanıcı kapasitesi:** 500-1000 eşzamanlı kullanıcı

---

## 💎 YÜKSEK TRAFİK İÇİN

### Donanım (Yüksek Yük)
```
CPU:      8 Core (3.0 GHz+)
RAM:      8 GB
Disk:     50 GB SSD (NVMe)
Bant:     10 Gbps
```

**Kullanıcı kapasitesi:** 5000+ eşzamanlı kullanıcı

---

## 🔧 YAZILIM GEREKSİNİMLERİ

### İşletim Sistemi (Önerilen)
```
✅ Ubuntu 20.04 LTS veya 22.04 LTS
✅ Debian 10 veya 11
✅ CentOS 8+ / Rocky Linux
✅ AlmaLinux 8+

❌ Windows Server (Docker ile mümkün ama önerilmez)
```

### Docker ile Kurulum (Önerilen)
```
Docker:           20.10 veya üzeri
Docker Compose:   1.29 veya üzeri
```

### Manuel Kurulum İçin
```
Python:           3.10 veya üzeri
Node.js:          16 veya üzeri
MongoDB:          4.4 veya üzeri
Nginx:            1.18 veya üzeri (opsiyonel)
```

---

## 📦 DEPOLAMA GEREKSİNİMLERİ

### Uygulama Dosyaları
```
Backend:          50 MB
Frontend:         5 MB (production build)
Docker Images:    1.5 GB
Toplam:           ~2 GB
```

### Kullanıcı Verileri (Tahmin)
```
MongoDB:          100 MB başlangıç
Uploaded Files:   500 MB - 5 GB (logo, görseller)
Backup:           2x veri boyutu
Toplam (1 yıl):   5-15 GB
```

### Önerilen Disk Alanı
```
Minimum:          10 GB
Önerilen:         20 GB
Yüksek Trafik:    50 GB+
```

---

## 🌐 NETWORK GEREKSİNİMLERİ

### Açık Olması Gereken Portlar
```
80    (HTTP)      → Frontend
443   (HTTPS)     → Frontend (SSL ile)
8001  (Backend)   → API (opsiyonel, nginx arkasında olabilir)
27017 (MongoDB)   → Sadece localhost (KAPALI dışarıya)
```

### Bant Genişliği İhtiyacı
```
Az Trafik:        100 Mbps
Orta Trafik:      1 Gbps
Yüksek Trafik:    10 Gbps
```

---

## 📈 PERFORMANS TAHMİNLERİ

### Kullanıcı Başına Kaynak Kullanımı (Ortalama)
```
RAM:              2-5 MB
CPU:              0.01-0.05 core
Disk I/O:         1-2 MB/s
Network:          10-50 KB/s
```

### Maksimum Eşzamanlı Kullanıcı (Yaklaşık)

| Sunucu Tipi      | CPU    | RAM   | Kullanıcı Sayısı |
|------------------|--------|-------|------------------|
| Minimum VPS      | 2 Core | 2 GB  | 100              |
| Önerilen VPS     | 4 Core | 4 GB  | 500-1000         |
| Güçlü VPS        | 8 Core | 8 GB  | 2000-5000        |
| Dedicated        | 16 Core| 16 GB | 10000+           |

---

## 💰 MALİYET TAHMİNLERİ (Aylık)

### VPS Hosting Sağlayıcıları

**Türkiye:**
```
Turhost VPS:      150-300 TL/ay (2-4 Core, 2-4 GB RAM)
Natro VPS:        200-400 TL/ay
İHS VPS:          180-350 TL/ay
```

**Yurt Dışı:**
```
DigitalOcean:     $12-24/ay (~400-800 TL)
Linode:           $12-24/ay
Vultr:            $12-24/ay
Hetzner:          €5-15/ay (~200-600 TL) ⭐ EN UCUZ
AWS Lightsail:    $10-20/ay
```

### Cloud Hosting (Kullanıma Göre)
```
AWS EC2:          $20-100/ay (değişken)
Google Cloud:     $20-100/ay
Azure:            $20-100/ay
```

---

## 🎯 ÖNERİLEN HOSTİNG ÇÖZÜMLERİ

### 1️⃣ BAŞLANGIÇ (Test/Demo)
**Hetzner Cloud CX21**
- 2 vCPU, 4 GB RAM, 40 GB SSD
- Maliyet: €5.83/ay (~230 TL)
- Lokasyon: Almanya (Türkiye'ye yakın)
- Link: hetzner.com

### 2️⃣ ORTA ÖLÇEK (500-1000 kullanıcı)
**DigitalOcean Droplet**
- 4 vCPU, 8 GB RAM, 160 GB SSD
- Maliyet: $48/ay (~1600 TL)
- Lokasyon: Frankfurt, Amsterdam
- Link: digitalocean.com

**VEYA Hetzner CPX31**
- 4 vCPU, 8 GB RAM, 160 GB SSD
- Maliyet: €16.20/ay (~650 TL) ⭐
- Çok daha ucuz!

### 3️⃣ YÜKSEK TRAFİK (5000+ kullanıcı)
**Hetzner CCX32**
- 8 dedicated vCPU, 32 GB RAM, 240 GB SSD
- Maliyet: €63.60/ay (~2500 TL)
- Link: hetzner.com

---

## 🔒 GÜVENLİK GEREKSİNİMLERİ

### Zorunlu
```
✅ Firewall aktif (UFW veya iptables)
✅ SSH key authentication
✅ SSL sertifikası (Let's Encrypt - ücretsiz)
✅ Düzenli güvenlik güncellemeleri
✅ Strong password policy
```

### Önerilen
```
✅ Fail2ban (brute force koruması)
✅ DDoS koruması (Cloudflare ücretsiz)
✅ Yedekleme sistemi (günlük)
✅ Monitoring (uptime kontrolü)
```

---

## 📊 YEDEKLEME GEREKSİNİMLERİ

### Yedeklenecek Veriler
```
MongoDB:          Günlük otomatik yedek
Uploaded Files:   Haftalık yedek
.env dosyaları:   Manuel yedek (şifreli)
```

### Yedek Alanı
```
Günlük backup:    2 GB
Haftalık backup:  10 GB
Aylık backup:     20 GB
Toplam:           ~50 GB önerilir
```

---

## ⚡ OPTİMİZASYON İPUÇLARI

### Performans Artırma
```
✅ Redis cache ekleyin
✅ CDN kullanın (Cloudflare - ücretsiz)
✅ MongoDB indexleme optimize edin
✅ Nginx gzip compression aktif
✅ Static dosyalar için CDN
```

### Maliyet Düşürme
```
✅ Hetzner gibi ucuz ama kaliteli sağlayıcılar
✅ Reserved instances (yıllık ödeme)
✅ Gereksiz servisleri kapatın
✅ Auto-scaling yerine sabit kaynak
```

---

## 🎯 HOSTING SEÇİM REHBERİ

### Hangi Durumda Hangi Hosting?

**Test/Demo/Küçük Proje:**
```
→ Hetzner CX11 (1 vCPU, 2 GB RAM)
→ Maliyet: €3.79/ay (~150 TL)
→ Kullanıcı: 50-100
```

**Startup/Orta Ölçek:**
```
→ Hetzner CX21 (2 vCPU, 4 GB RAM) ⭐ ÖNERİLEN
→ Maliyet: €5.83/ay (~230 TL)
→ Kullanıcı: 500-1000
```

**Büyüyen İşletme:**
```
→ Hetzner CPX31 (4 vCPU, 8 GB RAM)
→ Maliyet: €16.20/ay (~650 TL)
→ Kullanıcı: 2000-3000
```

**Yüksek Trafik/Enterprise:**
```
→ Dedicated Server veya Cloud
→ Maliyet: €50+/ay (~2000+ TL)
→ Kullanıcı: 10000+
```

---

## 📋 KURULUM ÖNCESİ KONTROL LİSTESİ

### ✅ Hosting Alındıktan Sonra Kontrol Edin

- [ ] Root SSH erişimi var mı?
- [ ] Docker kurulumu yapılabiliyor mu?
- [ ] Port 80 ve 443 açık mı?
- [ ] Disk alanı yeterli mi? (min 10 GB)
- [ ] RAM yeterli mi? (min 2 GB)
- [ ] Backup özelliği var mı?
- [ ] SSL sertifikası kurulabiliyor mu?
- [ ] Domain bağlanabiliyor mu?

---

## 🔍 TEKNİK DETAYLAR

### Docker Container Kaynak Kullanımı
```
MongoDB:          512 MB - 1 GB RAM
Backend:          256 MB - 512 MB RAM
Frontend:         128 MB - 256 MB RAM
Toplam:           ~1-2 GB RAM
```

### Disk I/O İhtiyacı
```
MongoDB:          Orta-Yüksek (SSD önerilir)
Backend:          Düşük
Frontend:         Çok Düşük
Uploaded Files:   Orta
```

---

## 🎨 ÖZEL SENARYOLAR

### Senaryo 1: Çok Az Bütçe (100-150 TL/ay)
```
Sağlayıcı:   Hetzner CX11
CPU:         1 vCPU
RAM:         2 GB
Disk:        20 GB
Maliyet:     €3.79/ay (~150 TL)
Kullanıcı:   50-100
Uyarı:       Sadece test/demo için
```

### Senaryo 2: Makul Bütçe (200-300 TL/ay) ⭐ ÖNERİLEN
```
Sağlayıcı:   Hetzner CX21
CPU:         2 vCPU
RAM:         4 GB
Disk:        40 GB
Maliyet:     €5.83/ay (~230 TL)
Kullanıcı:   500-1000
Uyarı:       Production için ideal
```

### Senaryo 3: Yüksek Performans (1500-2000 TL/ay)
```
Sağlayıcı:   DigitalOcean / Hetzner
CPU:         8 vCPU
RAM:         16 GB
Disk:        100 GB SSD
Maliyet:     $48-60/ay (~1600-2000 TL)
Kullanıcı:   5000+
Uyarı:       Büyük ölçek için
```

---

## 📞 ÖNERİLER VE NOTLAR

### 🎯 En İyi Seçim (Maliyet/Performans)
**Hetzner Cloud CX21**
- 2 vCPU, 4 GB RAM, 40 GB SSD
- €5.83/ay (~230 TL)
- 500-1000 kullanıcı kapasitesi
- Almanya veri merkezi (Türkiye'ye 40-60ms ping)

### ⚠️ Dikkat Edilecekler
- Shared hosting ÇALIŞMAZ
- Windows Server önerilmez
- MongoDB için SSD disk şart
- SSL sertifikası zorunlu (ücretsiz Let's Encrypt)
- Domain gerekli (hosting ile gelir genelde)

### 🔐 Güvenlik
- Firewall mutlaka kurun
- SSH port değiştirin (22 → başka port)
- Düzenli yedek alın
- Monitoring/alerting kurun

---

## 📝 SONUÇ ve ÖNERİ

**Başlangıç için önerimiz:**

```
Hosting:    Hetzner Cloud CX21
Maliyet:    €5.83/ay (~230 TL)
Kurulum:    Docker Compose ile
Süre:       15 dakika
SSL:        Let's Encrypt (ücretsiz)
Backup:     Hetzner snapshot (ek ücret)
Domain:     .com domain (~15$/yıl)

TOPLAM:     ~300 TL/ay (hosting + domain)
```

---

## 📞 DESTEK

Hosting seçimi veya kurulum hakkında sorularınız için:
- DEPLOYMENT.md dosyasına bakın
- QUICKSTART.md ile hızlı başlayın

**🚀 Başarılar dileriz!**

---

**Rapor Tarihi:** 2025-10-24  
**Versiyon:** 1.0  
**Hazırlayan:** AI Assistant
