import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Home, User, Lock, Mail, Phone, MessageCircle } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProfilePage = ({ user, setUser, logout }) => {
  const [profileData, setProfileData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    telegram_username: "",
  });

  const [passwordData, setPasswordData] = useState({
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        phone: user.phone || "",
        telegram_username: user.telegram_username || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.patch(`${API}/admin/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update user state
      setUser(prev => ({ ...prev, ...response.data }));
      toast.success("Profil güncellendi!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Güncelleme başarısız");
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Şifreler eşleşmiyor!");
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalı!");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `${API}/admin/profile`,
        { password: passwordData.new_password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Şifre güncellendi!");
      setPasswordData({ new_password: "", confirm_password: "" });
    } catch (error) {
      toast.error("Şifre güncellenemedi");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-yellow-400 glow-text" data-testid="profile-title">
          Profil Ayarları
        </h1>
        <div className="flex gap-4">
          <Button
            data-testid="back-btn"
            onClick={() => window.history.back()}
            variant="outline"
            className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900"
          >
            <Home size={18} className="mr-2" /> Geri Dön
          </Button>
          <Button
            data-testid="logout-btn"
            onClick={logout}
            variant="outline"
            className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900"
          >
            Çıkış
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Information */}
        <Card className="bg-gray-800/80 border-yellow-400/30">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <User size={24} /> Profil Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white flex items-center gap-2">
                  <User size={16} /> Ad
                </Label>
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="bg-gray-700 text-white border-gray-600"
                  data-testid="profile-name-input"
                />
              </div>
              <div>
                <Label className="text-white flex items-center gap-2">
                  <User size={16} /> Soyad
                </Label>
                <Input
                  value={profileData.surname}
                  onChange={(e) => setProfileData({ ...profileData, surname: e.target.value })}
                  className="bg-gray-700 text-white border-gray-600"
                  data-testid="profile-surname-input"
                />
              </div>
            </div>

            <div>
              <Label className="text-white flex items-center gap-2">
                <Mail size={16} /> E-posta
              </Label>
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
                data-testid="profile-email-input"
              />
            </div>

            <div>
              <Label className="text-white flex items-center gap-2">
                <Phone size={16} /> Telefon
              </Label>
              <Input
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
                data-testid="profile-phone-input"
              />
            </div>

            <div>
              <Label className="text-white flex items-center gap-2">
                <MessageCircle size={16} /> Telegram Kullanıcı Adı
              </Label>
              <Input
                value={profileData.telegram_username}
                onChange={(e) => setProfileData({ ...profileData, telegram_username: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
                data-testid="profile-telegram-input"
              />
            </div>

            <Button
              onClick={handleUpdateProfile}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold"
              data-testid="update-profile-btn"
            >
              Profil Bilgilerini Güncelle
            </Button>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card className="bg-gray-800/80 border-yellow-400/30">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <Lock size={24} /> Şifre Değiştir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Yeni Şifre</Label>
              <Input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
                placeholder="En az 6 karakter"
                data-testid="new-password-input"
              />
            </div>

            <div>
              <Label className="text-white">Yeni Şifre (Tekrar)</Label>
              <Input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
                placeholder="Şifreyi tekrar girin"
                data-testid="confirm-password-input"
              />
            </div>

            {passwordData.new_password && passwordData.confirm_password && (
              <div className={`text-sm ${passwordData.new_password === passwordData.confirm_password ? 'text-green-400' : 'text-red-400'}`}>
                {passwordData.new_password === passwordData.confirm_password ? '✓ Şifreler eşleşiyor' : '✗ Şifreler eşleşmiyor'}
              </div>
            )}

            <Button
              onClick={handleUpdatePassword}
              disabled={!passwordData.new_password || passwordData.new_password !== passwordData.confirm_password}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
              data-testid="update-password-btn"
            >
              Şifreyi Güncelle
            </Button>
          </CardContent>
        </Card>

        {user?.is_admin && (
          <div className="bg-yellow-400/10 border-2 border-yellow-400/30 rounded-lg p-4">
            <p className="text-yellow-400 text-center font-semibold">
              👑 Admin hesabısınız - Tüm yönetim yetkilerine sahipsiniz
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
