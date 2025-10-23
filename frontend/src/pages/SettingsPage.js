import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Home, Settings } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SettingsPage = ({ user, logout }) => {
  const [settings, setSettings] = useState({
    site_title: "",
    site_description: "",
    partnership_text: "",
    partnership_email: "",
    partnership_phone: "",
    meta_keywords: "",
    meta_description: "",
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    youtube_url: "",
    telegram_url: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`${API}/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Ayarlar kaydedildi!");
    } catch (error) {
      toast.error("Ayarlar kaydedilemedi");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-yellow-400 glow-text" data-testid="settings-title">
          Site Ayarları
        </h1>
        <div className="flex gap-4">
          <Button
            data-testid="home-btn"
            onClick={() => (window.location.href = "/admin")}
            variant="outline"
            className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900"
          >
            <Home size={18} className="mr-2" /> Admin Panel
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
        <Card className="bg-gray-800/80 border-yellow-400/30">
          <CardHeader>
            <CardTitle className="text-yellow-400">Genel Ayarlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Site Başlığı</Label>
              <Input
                value={settings.site_title}
                onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
              />
            </div>
            <div>
              <Label className="text-white">Site Açıklaması</Label>
              <Textarea
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/80 border-yellow-400/30">
          <CardHeader>
            <CardTitle className="text-yellow-400">İş Birliği Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">İş Birliği Metni</Label>
              <Input
                value={settings.partnership_text}
                onChange={(e) => setSettings({ ...settings, partnership_text: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
              />
            </div>
            <div>
              <Label className="text-white">E-posta</Label>
              <Input
                type="email"
                value={settings.partnership_email}
                onChange={(e) => setSettings({ ...settings, partnership_email: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
              />
            </div>
            <div>
              <Label className="text-white">Telefon</Label>
              <Input
                value={settings.partnership_phone}
                onChange={(e) => setSettings({ ...settings, partnership_phone: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/80 border-yellow-400/30">
          <CardHeader>
            <CardTitle className="text-yellow-400">SEO Ayarları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Meta Keywords</Label>
              <Input
                value={settings.meta_keywords}
                onChange={(e) => setSettings({ ...settings, meta_keywords: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
                placeholder="çark, ödül, bahis, bonus"
              />
            </div>
            <div>
              <Label className="text-white">Meta Description</Label>
              <Textarea
                value={settings.meta_description}
                onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
                rows={3}
                placeholder="Site açıklaması Google'da görünecek"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/80 border-yellow-400/30">
          <CardHeader>
            <CardTitle className="text-yellow-400">Sosyal Medya Linkleri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Facebook URL</Label>
              <Input
                value={settings.facebook_url}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
                placeholder="https://facebook.com/kazandirancark"
              />
            </div>
            <div>
              <Label className="text-white">Twitter URL</Label>
              <Input
                value={settings.twitter_url}
                onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
                placeholder="https://twitter.com/kazandirancark"
              />
            </div>
            <div>
              <Label className="text-white">Instagram URL</Label>
              <Input
                value={settings.instagram_url}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
                placeholder="https://instagram.com/kazandirancark"
              />
            </div>
            <div>
              <Label className="text-white">YouTube URL</Label>
              <Input
                value={settings.youtube_url}
                onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
                placeholder="https://youtube.com/@kazandirancark"
              />
            </div>
            <div>
              <Label className="text-white">Telegram URL</Label>
              <Input
                value={settings.telegram_url}
                onChange={(e) => setSettings({ ...settings, telegram_url: e.target.value })}
                className="bg-gray-700 text-white border-gray-600"
                placeholder="https://t.me/kazandirancark"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-lg py-6"
        >
          <Settings className="mr-2" /> Ayarları Kaydet
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
