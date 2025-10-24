# Kazandıran Çark - Deployment Rehberi

## 📋 Gereksinimler

- Python 3.10+
- Node.js 16+
- MongoDB 4.4+
- Nginx (opsiyonel, production için önerilir)

## 🚀 Hızlı Kurulum (Docker ile)

### 1. Docker ve Docker Compose Kurulumu

```bash
# Ubuntu/Debian için
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. Projeyi İndirme

```bash
# Projeyi sunucunuza kopyalayın
scp -r /app/* kullanici@sunucu:/home/kullanici/kazandiran-cark/
```

### 3. Environment Dosyalarını Ayarlama

**Backend .env (/app/backend/.env):**
```env
MONGO_URL=mongodb://mongodb:27017
DB_NAME=kazandiran_cark
SECRET_KEY=BURAYA_GUCLU_BIR_SECRET_KEY_OLUSTURUN
CORS_ORIGINS=https://sizin-domain.com,http://localhost:3000
```

**Frontend .env (/app/frontend/.env):**
```env
REACT_APP_BACKEND_URL=https://sizin-domain.com
```

### 4. Docker Compose ile Başlatma

```bash
cd /home/kullanici/kazandiran-cark
docker-compose up -d
```

## 🛠️ Manuel Kurulum (Docker olmadan)

### 1. MongoDB Kurulumu

```bash
# Ubuntu/Debian için
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Backend Kurulumu

```bash
cd /app/backend

# Virtual environment oluşturma
python3 -m venv venv
source venv/bin/activate

# Bağımlılıkları yükleme
pip install -r requirements.txt

# .env dosyasını ayarlama
cp .env.example .env
nano .env  # SECRET_KEY ve MONGO_URL'i düzenleyin

# Backend'i başlatma
uvicorn server:app --host 0.0.0.0 --port 8001
```

### 3. Frontend Kurulumu

```bash
cd /app/frontend

# Bağımlılıkları yükleme
yarn install

# .env dosyasını ayarlama
cp .env.example .env
nano .env  # REACT_APP_BACKEND_URL'i düzenleyin

# Production build oluşturma
yarn build

# Static dosyaları serve etme
npx serve -s build -l 3000
```

### 4. Nginx Konfigürasyonu (Production için önerilir)

**/etc/nginx/sites-available/kazandiran-cark:**
```nginx
server {
    listen 80;
    server_name sizin-domain.com;

    # Frontend
    location / {
        root /home/kullanici/kazandiran-cark/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploaded files
    location /uploads {
        alias /home/kullanici/kazandiran-cark/backend/uploads;
    }
}
```

```bash
# Nginx konfigürasyonunu aktifleştirme
sudo ln -s /etc/nginx/sites-available/kazandiran-cark /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL Sertifikası (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d sizin-domain.com
```

### 6. Systemd Servisleri Oluşturma

**Backend Service (/etc/systemd/system/kazandiran-backend.service):**
```ini
[Unit]
Description=Kazandiran Cark Backend
After=network.target

[Service]
Type=simple
User=kullanici
WorkingDirectory=/home/kullanici/kazandiran-cark/backend
Environment="PATH=/home/kullanici/kazandiran-cark/backend/venv/bin"
ExecStart=/home/kullanici/kazandiran-cark/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start kazandiran-backend
sudo systemctl enable kazandiran-backend
sudo systemctl status kazandiran-backend
```

## 📊 Demo Data Oluşturma

```bash
cd /app/backend
source venv/bin/activate
python scripts/create_complete_demo.py
```

## 🔐 İlk Admin Kullanıcı Oluşturma

Backend'de otomatik olarak şu email adresleriyle kayıt olan kullanıcılar admin olur:
- admin@kazantest.com
- testadmin@kazantest.com
- superadmin@test.com

Veya manuel olarak MongoDB'de:

```bash
mongosh
use kazandiran_cark
db.users.updateOne(
  {email: "sizin@email.com"},
  {$set: {is_admin: true}}
)
```

## 🎮 VIP Çark Sistemi Kurulumu

### Admin Panelinden VIP Ayarları:

1. **VIP Ödüller Sekmesi:**
   - Büyük ödüller ekleyin (5000 TL, 10000 TRX, vb.)
   - "VIP Ödül" checkbox'ını işaretleyin

2. **VIP Kurallar Sekmesi:**
   - Koşul ekleyin (örn: "1000 TL yatırım")
   - Kaç VIP çevirme hakkı verileceğini belirleyin

3. **VIP Kullanıcılar Sekmesi:**
   - Kullanıcılara manuel VIP hak verin
   - VIP istatistikleri görüntüleyin

## 🔄 Güncelleme

```bash
cd /home/kullanici/kazandiran-cark

# Backend güncellemesi
cd backend
source venv/bin/activate
git pull  # veya yeni dosyaları kopyalayın
pip install -r requirements.txt
sudo systemctl restart kazandiran-backend

# Frontend güncellemesi
cd ../frontend
git pull  # veya yeni dosyaları kopyalayın
yarn install
yarn build
sudo systemctl reload nginx
```

## 🐛 Sorun Giderme

### Backend çalışmıyor:
```bash
sudo systemctl status kazandiran-backend
journalctl -u kazandiran-backend -n 50
```

### MongoDB bağlantı hatası:
```bash
sudo systemctl status mongod
sudo journalctl -u mongod
```

### Frontend görünmüyor:
```bash
sudo nginx -t
sudo systemctl status nginx
```

### Port kullanımda hatası:
```bash
sudo lsof -i :8001
sudo lsof -i :3000
```

## 📝 Yedekleme

### MongoDB Yedekleme:
```bash
mongodump --db kazandiran_cark --out /backup/$(date +%Y%m%d)
```

### Dosya Yedekleme:
```bash
tar -czf /backup/uploads_$(date +%Y%m%d).tar.gz /home/kullanici/kazandiran-cark/backend/uploads
```

## 🔒 Güvenlik Önerileri

1. ✅ Güçlü SECRET_KEY kullanın
2. ✅ MongoDB'yi sadece localhost'tan erişilebilir yapın
3. ✅ SSL sertifikası kullanın (HTTPS)
4. ✅ Firewall kurallarını ayarlayın
5. ✅ Düzenli yedekleme yapın
6. ✅ Log dosyalarını izleyin

## 📞 Destek

Sorularınız için GitHub Issues veya iletişim kanallarını kullanabilirsiniz.

## 📄 Lisans

[Lisans bilgisi buraya eklenecek]
