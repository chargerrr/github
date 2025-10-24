#!/bin/bash

# Kazandıran Çark - Hızlı Kurulum Script
# Bu script otomatik kurulum için kullanılabilir

set -e

echo "🎰 Kazandıran Çark - Otomatik Kurulum"
echo "======================================"
echo ""

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Gerekli yazılımları kontrol et
echo "📋 Gereksinimler kontrol ediliyor..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker bulunamadı! Lütfen Docker'ı yükleyin.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose bulunamadı! Lütfen Docker Compose'u yükleyin.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker ve Docker Compose bulundu${NC}"
echo ""

# Environment dosyalarını kontrol et ve oluştur
echo "🔧 Environment dosyaları ayarlanıyor..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠️  backend/.env dosyası oluşturuldu. Lütfen SECRET_KEY'i değiştirin!${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo -e "${YELLOW}⚠️  frontend/.env dosyası oluşturuldu. Lütfen REACT_APP_BACKEND_URL'i ayarlayın!${NC}"
fi

echo ""

# Domain adı sor
read -p "🌐 Domain adınız (örn: example.com): " domain
if [ -n "$domain" ]; then
    sed -i "s|https://yourdomain.com|https://$domain|g" frontend/.env
    echo -e "${GREEN}✅ Frontend URL güncellendi: https://$domain${NC}"
fi

echo ""

# Docker build ve çalıştır
echo "🐳 Docker container'ları oluşturuluyor ve başlatılıyor..."
docker-compose up -d --build

echo ""
echo -e "${GREEN}✅ Kurulum tamamlandı!${NC}"
echo ""
echo "📊 Container durumu:"
docker-compose ps
echo ""

# Demo data sor
read -p "🎲 Demo veri oluşturulsun mu? (y/n): " create_demo
if [ "$create_demo" = "y" ]; then
    echo "Demo veriler oluşturuluyor..."
    sleep 5  # MongoDB'nin başlamasını bekle
    docker exec kazandiran_backend python scripts/create_complete_demo.py
    echo -e "${GREEN}✅ Demo veriler oluşturuldu${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Kurulum Başarılı!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Uygulamaya erişim:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:8001"
echo "   API Docs: http://localhost:8001/docs"
echo ""
echo "🔐 İlk admin kullanıcı:"
echo "   Email: admin@kazantest.com"
echo "   Password: [Kayıt sırasında belirlediğiniz]"
echo ""
echo "📖 Detaylı dokümantasyon: DEPLOYMENT.md"
echo ""
echo "💡 Yararlı komutlar:"
echo "   docker-compose logs -f          # Logları görüntüle"
echo "   docker-compose restart          # Servisleri yeniden başlat"
echo "   docker-compose down             # Servisleri durdur"
echo "   docker-compose up -d            # Servisleri başlat"
echo ""
echo "⚠️  ÖNEMLİ:"
echo "   1. backend/.env dosyasında SECRET_KEY'i değiştirin!"
echo "   2. Production için HTTPS kullanın (Let's Encrypt)"
echo "   3. Firewall ayarlarını yapın"
echo "   4. Düzenli yedekleme alın"
echo ""
