import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Home, Gift, Globe, Award, Users, Plus, Trash2, Check, X, User, Star, Trophy } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminPage = ({ user, logout }) => {
  const [prizes, setPrizes] = useState([]);
  const [sites, setSites] = useState([]);
  const [spins, setSpins] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [rules, setRules] = useState([]);
  const [dbStats, setDbStats] = useState({});
  const [vipConditions, setVipConditions] = useState([]);
  const [vipPrizes, setVipPrizes] = useState([]);
  const [vipUsers, setVipUsers] = useState([]);
  const [vipStats, setVipStats] = useState({});
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showExtraSpinModal, setShowExtraSpinModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showVipConditionModal, setShowVipConditionModal] = useState(false);
  const [showVipPrizeModal, setShowVipPrizeModal] = useState(false);
  const [showVipSpinGrantModal, setShowVipSpinGrantModal] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    telegram_username: "",
    password: "",
  });

  const [prizeForm, setPrizeForm] = useState({
    name: "",
    site_id: "",
    description: "",
    image_url: "",
    weight: 1,
    is_vip: false,
  });

  const [vipConditionForm, setVipConditionForm] = useState({
    site_id: "",
    condition_type: "registration",
    condition_value: "",
    description: "",
    spins_granted: 1,
    is_active: true,
  });

  const [vipSpinGrantForm, setVipSpinGrantForm] = useState({
    user_id: "",
    condition_id: "",
    proof: "",
  });

  const [siteForm, setSiteForm] = useState({
    name: "",
    logo_url: "",
    welcome_bonus: "",
    website_url: "",
    category: "other",
    order: 999,
  });

  const [logoFile, setLogoFile] = useState(null);

  const [ruleForm, setRuleForm] = useState({
    title: "",
    description: "",
    order: 0,
  });

  const [extraSpinForm, setExtraSpinForm] = useState({
    user_id: "all-users",
    spins: 1,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const [prizesRes, sitesRes, spinsRes, usersRes, rulesRes, statsRes, vipConditionsRes, vipPrizesRes, vipUsersRes, vipStatsRes] = await Promise.all([
        axios.get(`${API}/prizes`, config),
        axios.get(`${API}/sites`, config),
        axios.get(`${API}/admin/spins`, config),
        axios.get(`${API}/admin/users`, config),
        axios.get(`${API}/rules`, config),
        axios.get(`${API}/admin/database/stats`, config),
        axios.get(`${API}/admin/vip-conditions`, config),
        axios.get(`${API}/vip-prizes`, config),
        axios.get(`${API}/admin/vip-users`, config),
        axios.get(`${API}/admin/vip-stats`, config),
      ]);

      setPrizes(prizesRes.data);
      setSites(sitesRes.data);
      setSpins(spinsRes.data);
      setAllUsers(usersRes.data);
      setRules(rulesRes.data);
      setDbStats(statsRes.data);
      setVipConditions(vipConditionsRes.data);
      setVipPrizes(vipPrizesRes.data);
      setVipUsers(vipUsersRes.data);
      setVipStats(vipStatsRes.data);
    } catch (error) {
      toast.error("Veri yüklenemedi");
    }
  };

  const handleCreatePrize = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API}/admin/prizes`, prizeForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Ödül oluşturuldu!");
      setShowPrizeModal(false);
      setPrizeForm({ name: "", site_id: "", description: "", image_url: "", weight: 1, is_vip: false });
      fetchData();
    } catch (error) {
      toast.error("Ödül oluşturulamadı");
    }
  };

  const handleDeletePrize = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API}/admin/prizes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Ödül silindi");
      fetchData();
    } catch (error) {
      toast.error("Ödül silinemedi");
    }
  };

  // VIP Condition handlers
  const handleCreateVipCondition = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API}/admin/vip-conditions`, vipConditionForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("VIP koşul oluşturuldu!");
      setShowVipConditionModal(false);
      setVipConditionForm({
        site_id: "",
        condition_type: "registration",
        condition_value: "",
        description: "",
        spins_granted: 1,
        is_active: true,
      });
      fetchData();
    } catch (error) {
      toast.error("VIP koşul oluşturulamadı");
    }
  };

  const handleDeleteVipCondition = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API}/admin/vip-conditions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("VIP koşul silindi");
      fetchData();
    } catch (error) {
      toast.error("VIP koşul silinemedi");
    }
  };

  const handleGrantVipSpins = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API}/admin/grant-vip-spins`, vipSpinGrantForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("VIP çevirme hakkı verildi!");
      setShowVipSpinGrantModal(false);
      setVipSpinGrantForm({
        user_id: "",
        condition_id: "",
        proof: "",
      });
      fetchData();
    } catch (error) {
      toast.error("VIP hak verilemedi");
    }
  };

  const handleCreateSite = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    try {
      let logoUrl = siteForm.logo_url;
      
      // Upload logo if file selected
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        
        const uploadResponse = await axios.post(`${API}/admin/upload-logo`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        });
        
        logoUrl = `${process.env.REACT_APP_BACKEND_URL}${uploadResponse.data.url}`;
      }
      
      await axios.post(`${API}/admin/sites`, { ...siteForm, logo_url: logoUrl }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success("Site eklendi!");
      setShowSiteModal(false);
      setSiteForm({ name: "", logo_url: "", welcome_bonus: "", website_url: "", category: "other", order: 999 });
      setLogoFile(null);
      fetchData();
    } catch (error) {
      toast.error("Site eklenemedi");
    }
  };

  const handleDeleteSite = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API}/admin/sites/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Site silindi");
      fetchData();
    } catch (error) {
      toast.error("Site silinemedi");
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API}/admin/rules`, ruleForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Kural eklendi!");
      setShowRuleModal(false);
      setRuleForm({ title: "", description: "", order: 0 });
      fetchData();
    } catch (error) {
      toast.error("Kural eklenemedi");
    }
  };

  const handleDeleteRule = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API}/admin/rules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Kural silindi");
      fetchData();
    } catch (error) {
      toast.error("Kural silinemedi");
    }
  };

  const handleUpdateSpin = async (spinId, status, adminNote) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `${API}/admin/spins/${spinId}`,
        { status, admin_note: adminNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Durum güncellendi");
      fetchData();
    } catch (error) {
      toast.error("Güncelleme başarısız");
    }
  };

  const handleGrantExtraSpins = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${API}/admin/extra-spins`,
        {
          user_id: extraSpinForm.user_id === "all-users" ? null : extraSpinForm.user_id,
          spins: parseInt(extraSpinForm.spins),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Ekstra çark hakları tanımlandı!");
      setShowExtraSpinModal(false);
      setExtraSpinForm({ user_id: "all-users", spins: 1 });
      fetchData();
    } catch (error) {
      toast.error("İşlem başarısız");
    }
  };

  const handleResetDailySpin = async (userId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `${API}/admin/users/${userId}`,
        { daily_spin_used: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Günlük çark sıfırlandı!");
      fetchData();
    } catch (error) {
      toast.error("İşlem başarısız");
    }
  };

  const handleExportUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API}/admin/users/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Convert to CSV
      const users = response.data;
      const headers = ["ID", "Ad", "Soyad", "Email", "Telefon", "Telegram", "Ekstra Çark", "Admin", "Kayıt Tarihi"];
      const csvContent = [
        headers.join(","),
        ...users.map(u => [
          u.id,
          u.name,
          u.surname,
          u.email,
          u.phone,
          u.telegram_username,
          u.extra_spins,
          u.is_admin ? "Evet" : "Hayır",
          u.created_at
        ].join(","))
      ].join("\n");
      
      // Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success("Kullanıcılar export edildi!");
    } catch (error) {
      toast.error("Export başarısız");
    }
  };

  const handleClearDatabase = async () => {
    if (selectedCollections.length === 0) {
      toast.error("Lütfen en az bir koleksiyon seçin");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${API}/admin/database/clear`,
        selectedCollections,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Veritabanı temizlendi! ${JSON.stringify(response.data.deleted)}`);
      setShowClearModal(false);
      setSelectedCollections([]);
      fetchData();
    } catch (error) {
      toast.error("Temizleme başarısız");
    }
  };

  const toggleCollection = (collection) => {
    if (selectedCollections.includes(collection)) {
      setSelectedCollections(selectedCollections.filter(c => c !== collection));
    } else {
      setSelectedCollections([...selectedCollections, collection]);
    }
  };

  const handleToggleAdmin = async (userId, currentAdminStatus) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `${API}/admin/users/${userId}`,
        { is_admin: !currentAdminStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(currentAdminStatus ? "Admin yetkisi kaldırıldı" : "Admin yetkisi verildi");
      fetchData();
    } catch (error) {
      toast.error("İşlem başarısız");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API}/admin/create-admin`, newAdminData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Yeni admin kullanıcısı oluşturuldu!");
      setShowCreateAdminModal(false);
      setNewAdminData({
        name: "",
        surname: "",
        email: "",
        phone: "",
        telegram_username: "",
        password: "",
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Admin oluşturulamadı");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-yellow-400 glow-text" data-testid="admin-title">Admin Panel</h1>
        <div className="flex gap-4">
          <Button
            data-testid="profile-btn"
            onClick={() => (window.location.href = "/profile")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <User size={18} className="mr-2" /> Profil
          </Button>
          <Button
            data-testid="settings-btn"
            onClick={() => (window.location.href = "/settings")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Award size={18} className="mr-2" /> Ayarlar
          </Button>
          <Button
            data-testid="home-btn"
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900"
          >
            <Home size={18} className="mr-2" /> Ana Sayfa
          </Button>
          <Button
            data-testid="admin-logout-btn"
            onClick={logout}
            variant="outline"
            className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900"
          >
            Çıkış
          </Button>
        </div>
      </header>

      <Tabs defaultValue="spins" className="w-full">
        <TabsList className="bg-gray-800 mb-6">
          <TabsTrigger value="spins" data-testid="spins-tab" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
            <Award className="mr-2" size={18} /> Çevirilen Çarklar
          </TabsTrigger>
          <TabsTrigger value="prizes" data-testid="prizes-tab" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
            <Gift className="mr-2" size={18} /> Ödüller
          </TabsTrigger>
          <TabsTrigger value="vip-prizes" data-testid="vip-prizes-tab" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
            <Trophy className="mr-2" size={18} /> VIP Ödüller
          </TabsTrigger>
          <TabsTrigger value="sites" data-testid="sites-tab" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
            <Globe className="mr-2" size={18} /> Siteler
          </TabsTrigger>
          <TabsTrigger value="vip-conditions" data-testid="vip-conditions-tab" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
            <Star className="mr-2" size={18} /> VIP Kurallar
          </TabsTrigger>
          <TabsTrigger value="rules" data-testid="rules-tab" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
            <Award className="mr-2" size={18} /> Kurallar
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="users-tab" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
            <Users className="mr-2" size={18} /> Kullanıcılar
          </TabsTrigger>
          <TabsTrigger value="vip-users" data-testid="vip-users-tab" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
            <Star className="mr-2" size={18} /> VIP Kullanıcılar
          </TabsTrigger>
          <TabsTrigger value="database" data-testid="database-tab" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
            <Trash2 className="mr-2" size={18} /> Veritabanı
          </TabsTrigger>
        </TabsList>

        {/* Spins Tab */}
        <TabsContent value="spins" data-testid="spins-content">
          <div className="grid gap-4">
            {spins.map((item, index) => (
              <Card key={index} className="bg-gray-800/80 border-yellow-400/30" data-testid={`spin-card-${index}`}>
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex justify-between items-center">
                    <span>{item.user?.name} - {item.prize?.name}</span>
                    <div className="flex gap-2">
                      {item.spin.status === "pending" && (
                        <>
                          <Button
                            data-testid={`approve-spin-${index}`}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleUpdateSpin(item.spin.id, "approved", "Ödül hesabınıza tanımlandı")}
                          >
                            <Check size={16} /> Onayla
                          </Button>
                          <Button
                            data-testid={`reject-spin-${index}`}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleUpdateSpin(item.spin.id, "rejected", "Bilgiler doğrulanamadı")}
                          >
                            <X size={16} /> Reddet
                          </Button>
                        </>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-white space-y-2">
                  <p><strong>Email:</strong> {item.user?.email}</p>
                  <p><strong>Telegram:</strong> {item.user?.telegram_username}</p>
                  <p><strong>Site:</strong> {item.site?.name}</p>
                  <p><strong>Site Kullanıcı Adı:</strong> {item.spin.site_username}</p>
                  <p><strong>Ödül:</strong> {item.prize?.description}</p>
                  <p>
                    <strong>Durum:</strong>{" "}
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm ${
                        item.spin.status === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : item.spin.status === "rejected"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {item.spin.status === "approved" ? "Onaylandı" : item.spin.status === "rejected" ? "Reddedildi" : "Bekliyor"}
                    </span>
                  </p>
                  {item.spin.admin_note && <p className="text-gray-400"><strong>Not:</strong> {item.spin.admin_note}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Prizes Tab */}
        <TabsContent value="prizes" data-testid="prizes-content">
          <div className="mb-4">
            <Button
              data-testid="add-prize-btn"
              onClick={() => setShowPrizeModal(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold"
            >
              <Plus className="mr-2" size={18} /> Yeni Ödül Ekle
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prizes.map((prize, index) => (
              <Card key={prize.id} className="bg-gray-800/80 border-yellow-400/30" data-testid={`prize-admin-card-${index}`}>
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex justify-between items-center">
                    <span>{prize.name}</span>
                    <Button
                      data-testid={`delete-prize-${index}`}
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeletePrize(prize.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-white space-y-2">
                  <p>{prize.description}</p>
                  <p className="text-sm text-gray-400">Ağırlık: {prize.weight}</p>
                  <p className="text-sm text-gray-400">Site: {sites.find((s) => s.id === prize.site_id)?.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* VIP Prizes Tab */}
        <TabsContent value="vip-prizes" data-testid="vip-prizes-content">
          <div className="mb-4 flex gap-4">
            <Button
              data-testid="add-vip-prize-btn"
              onClick={() => {
                setPrizeForm({ ...prizeForm, is_vip: true });
                setShowPrizeModal(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
            >
              <Plus className="mr-2" size={18} /> Yeni VIP Ödül Ekle
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vipPrizes.map((prize, index) => (
              <Card key={prize.id} className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-400/50" data-testid={`vip-prize-card-${index}`}>
                <CardHeader>
                  <CardTitle className="text-purple-300 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Trophy size={20} className="text-yellow-400" />
                      <span>{prize.name}</span>
                    </div>
                    <Button
                      data-testid={`delete-vip-prize-${index}`}
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeletePrize(prize.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-white space-y-2">
                  <p>{prize.description}</p>
                  <p className="text-sm text-purple-300">Ağırlık: {prize.weight}</p>
                  <p className="text-sm text-purple-300">Site: {sites.find((s) => s.id === prize.site_id)?.name}</p>
                  <div className="mt-2 inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 rounded-full text-xs font-bold">
                    VIP ÖDÜL
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {vipPrizes.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <Trophy size={48} className="mx-auto mb-4 opacity-50" />
              <p>Henüz VIP ödül eklenmemiş</p>
            </div>
          )}
        </TabsContent>

        {/* Sites Tab */}
        <TabsContent value="sites" data-testid="sites-content">
          <div className="mb-4">
            <Button
              data-testid="add-site-btn"
              onClick={() => setShowSiteModal(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold"
            >
              <Plus className="mr-2" size={18} /> Yeni Site Ekle
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sites.map((site, index) => (
              <Card key={site.id} className="bg-gray-800/80 border-yellow-400/30" data-testid={`site-card-${index}`}>
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex justify-between items-center">
                    <span>{site.name}</span>
                    <Button
                      data-testid={`delete-site-${index}`}
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteSite(site.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-white space-y-2">
                  {site.logo_url && (
                    <div className="flex justify-center mb-2">
                      <img src={site.logo_url} alt={site.name} className="max-h-12 object-contain" />
                    </div>
                  )}
                  {site.welcome_bonus && (
                    <div className="bg-yellow-400/20 px-3 py-2 rounded text-center">
                      <p className="text-yellow-400 font-semibold text-sm">{site.welcome_bonus}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* VIP Conditions Tab */}
        <TabsContent value="vip-conditions" data-testid="vip-conditions-content">
          <div className="mb-4">
            <Button
              data-testid="add-vip-condition-btn"
              onClick={() => setShowVipConditionModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
            >
              <Plus className="mr-2" size={18} /> Yeni VIP Koşul Ekle
            </Button>
          </div>
          <div className="grid gap-4">
            {vipConditions.map((condition, index) => (
              <Card key={condition.id} className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-400/50" data-testid={`vip-condition-card-${index}`}>
                <CardHeader>
                  <CardTitle className="text-purple-300 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Star size={20} className="text-yellow-400" />
                      <span>{condition.description}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className={`text-xs px-3 py-1 rounded-full ${condition.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {condition.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                      <Button
                        data-testid={`delete-vip-condition-${index}`}
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteVipCondition(condition.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-white space-y-2">
                  <p><strong>Site:</strong> {condition.site?.name || 'Bilinmiyor'}</p>
                  <p><strong>Koşul Tipi:</strong> {condition.condition_type}</p>
                  <p><strong>Koşul Değeri:</strong> {condition.condition_value}</p>
                  <p><strong>Verilen VIP Hak:</strong> {condition.spins_granted} çevirme</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {vipConditions.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <Star size={48} className="mx-auto mb-4 opacity-50" />
              <p>Henüz VIP koşul eklenmemiş</p>
            </div>
          )}
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" data-testid="rules-content">
          <div className="mb-4">
            <Button
              data-testid="add-rule-btn"
              onClick={() => setShowRuleModal(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold"
            >
              <Plus className="mr-2" size={18} /> Yeni Kural Ekle
            </Button>
          </div>
          <div className="grid gap-4">
            {rules.map((rule, index) => (
              <Card key={rule.id} className="bg-gray-800/80 border-yellow-400/30" data-testid={`rule-card-${index}`}>
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex justify-between items-center">
                    <span>#{rule.order} - {rule.title}</span>
                    <Button
                      data-testid={`delete-rule-${index}`}
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-white">
                  <p>{rule.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" data-testid="users-content">
          <div className="mb-4 flex gap-4">
            <Button
              data-testid="create-admin-btn"
              onClick={() => setShowCreateAdminModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              <Plus className="mr-2" size={18} /> Yeni Admin Ekle
            </Button>
            <Button
              data-testid="grant-extra-spins-btn"
              onClick={() => setShowExtraSpinModal(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold"
            >
              <Plus className="mr-2" size={18} /> Ekstra Çark Hakkı Tanımla
            </Button>
            <Button
              data-testid="export-users-btn"
              onClick={handleExportUsers}
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900"
            >
              Export CSV
            </Button>
          </div>
          <div className="grid gap-4">
            {allUsers.map((u, index) => (
              <Card key={u.id} className="bg-gray-800/80 border-yellow-400/30" data-testid={`user-card-${index}`}>
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      {u.name} {u.surname}
                      {u.is_admin && <span className="text-xs bg-purple-600 px-2 py-1 rounded">👑 Admin</span>}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                        className={u.is_admin ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"}
                        data-testid={`toggle-admin-${index}`}
                      >
                        {u.is_admin ? "Admin Kaldır" : "Admin Yap"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleResetDailySpin(u.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Reset Daily
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-white space-y-1">
                  <p><strong>Email:</strong> {u.email}</p>
                  <p><strong>Telefon:</strong> {u.phone}</p>
                  <p><strong>Telegram:</strong> {u.telegram_username}</p>
                  <p><strong>Ekstra Çark:</strong> {u.extra_spins}</p>
                  <p><strong>Günlük Çark:</strong> {u.daily_spin_used ? "Kullanıldı" : "Kullanılmadı"}</p>
                  <p><strong>Admin:</strong> {u.is_admin ? "Evet" : "Hayır"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* VIP Users Tab */}
        <TabsContent value="vip-users" data-testid="vip-users-content">
          <div className="mb-4">
            <Button
              data-testid="grant-vip-spin-btn"
              onClick={() => setShowVipSpinGrantModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
            >
              <Plus className="mr-2" size={18} /> VIP Çevirme Hakkı Ver
            </Button>
          </div>

          {/* VIP Stats */}
          <Card className="mb-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-400/50">
            <CardHeader>
              <CardTitle className="text-purple-300 flex items-center gap-2">
                <Trophy size={24} className="text-yellow-400" />
                VIP İstatistikleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-purple-300">{vipStats.users_with_vip_spins || 0}</p>
                  <p className="text-gray-400 text-sm">VIP Kullanıcılar</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-purple-300">{vipStats.total_vip_spins_available || 0}</p>
                  <p className="text-gray-400 text-sm">Toplam VIP Hak</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-purple-300">{vipStats.active_vip_conditions || 0}</p>
                  <p className="text-gray-400 text-sm">Aktif Koşullar</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-purple-300">{vipStats.vip_prizes || 0}</p>
                  <p className="text-gray-400 text-sm">VIP Ödüller</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VIP Users List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vipUsers.map((u, index) => (
              <Card key={u.id} className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-400/50" data-testid={`vip-user-card-${index}`}>
                <CardHeader>
                  <CardTitle className="text-purple-300 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Star size={20} className="text-yellow-400" />
                      <span>{u.name} {u.surname}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-600/30 px-3 py-1 rounded-full">
                      <Trophy size={16} className="text-yellow-400" />
                      <span className="text-sm font-bold">{u.vip_spins}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-white space-y-1">
                  <p><strong>Email:</strong> {u.email}</p>
                  <p><strong>Telefon:</strong> {u.phone}</p>
                  <p><strong>Telegram:</strong> {u.telegram_username}</p>
                  <p className="text-purple-300 font-semibold mt-2">VIP Çark Hakkı: {u.vip_spins}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {vipUsers.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <Star size={48} className="mx-auto mb-4 opacity-50" />
              <p>Henüz VIP çevirme hakkı olan kullanıcı yok</p>
            </div>
          )}
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" data-testid="database-content">
          <div className="space-y-6">
            <Card className="bg-gray-800/80 border-yellow-400/30">
              <CardHeader>
                <CardTitle className="text-yellow-400">Veritabanı İstatistikleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-white">{dbStats.users || 0}</p>
                    <p className="text-gray-400 text-sm">Kullanıcılar</p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-white">{dbStats.sites || 0}</p>
                    <p className="text-gray-400 text-sm">Siteler</p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-white">{dbStats.prizes || 0}</p>
                    <p className="text-gray-400 text-sm">Ödüller</p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-white">{dbStats.spins || 0}</p>
                    <p className="text-gray-400 text-sm">Çevirilen Çarklar</p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-white">{dbStats.rules || 0}</p>
                    <p className="text-gray-400 text-sm">Kurallar</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-500 flex items-center gap-2">
                  <Trash2 size={24} /> Tehlikeli Bölge - Veritabanı Temizleme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white mb-4">
                  ⚠️ Dikkat: Bu işlem geri alınamaz! Seçili koleksiyonlardaki tüm veriler silinecektir.
                </p>
                <Button
                  onClick={() => setShowClearModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                  data-testid="open-clear-modal-btn"
                >
                  <Trash2 className="mr-2" size={18} /> Veritabanını Temizle
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Database Clear Modal */}
      <Dialog open={showClearModal} onOpenChange={setShowClearModal}>
        <DialogContent className="bg-gray-900 border-red-500" data-testid="clear-modal">
          <DialogHeader>
            <DialogTitle className="text-red-500 text-2xl flex items-center gap-2">
              <Trash2 /> Veritabanı Temizleme
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-white">Silmek istediğiniz koleksiyonları seçin:</p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer" onClick={() => toggleCollection('users')}>
                <input 
                  type="checkbox" 
                  checked={selectedCollections.includes('users')}
                  onChange={() => toggleCollection('users')}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <p className="text-white font-semibold">Kullanıcılar</p>
                  <p className="text-gray-400 text-sm">Admin hariç tüm kullanıcılar silinecek ({(dbStats.users || 0) - 1} kayıt)</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer" onClick={() => toggleCollection('sites')}>
                <input 
                  type="checkbox" 
                  checked={selectedCollections.includes('sites')}
                  onChange={() => toggleCollection('sites')}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <p className="text-white font-semibold">Siteler</p>
                  <p className="text-gray-400 text-sm">Tüm bahis siteleri silinecek ({dbStats.sites || 0} kayıt)</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer" onClick={() => toggleCollection('prizes')}>
                <input 
                  type="checkbox" 
                  checked={selectedCollections.includes('prizes')}
                  onChange={() => toggleCollection('prizes')}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <p className="text-white font-semibold">Ödüller</p>
                  <p className="text-gray-400 text-sm">Tüm ödüller silinecek ({dbStats.prizes || 0} kayıt)</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer" onClick={() => toggleCollection('spins')}>
                <input 
                  type="checkbox" 
                  checked={selectedCollections.includes('spins')}
                  onChange={() => toggleCollection('spins')}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <p className="text-white font-semibold">Çevirilen Çarklar</p>
                  <p className="text-gray-400 text-sm">Tüm çark kayıtları silinecek ({dbStats.spins || 0} kayıt)</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer" onClick={() => toggleCollection('rules')}>
                <input 
                  type="checkbox" 
                  checked={selectedCollections.includes('rules')}
                  onChange={() => toggleCollection('rules')}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <p className="text-white font-semibold">Kurallar</p>
                  <p className="text-gray-400 text-sm">Tüm kurallar silinecek ({dbStats.rules || 0} kayıt)</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleClearDatabase}
                disabled={selectedCollections.length === 0}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                data-testid="confirm-clear-btn"
              >
                <Trash2 className="mr-2" /> Seçili Koleksiyonları Sil
              </Button>
              <Button
                onClick={() => {
                  setShowClearModal(false);
                  setSelectedCollections([]);
                }}
                variant="outline"
                className="border-gray-600 text-gray-400"
              >
                İptal
              </Button>
            </div>

            <p className="text-red-400 text-sm text-center">
              ⚠️ Bu işlem geri alınamaz! Emin misiniz?
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prize Modal */}
      <Dialog open={showPrizeModal} onOpenChange={setShowPrizeModal}>
        <DialogContent className="bg-gray-900 border-yellow-400" data-testid="prize-modal">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-2xl">Yeni Ödül Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePrize} className="space-y-4">
            <div>
              <Label className="text-white">Ödül Adı</Label>
              <Input
                data-testid="prize-name-input"
                value={prizeForm.name}
                onChange={(e) => setPrizeForm({ ...prizeForm, name: e.target.value })}
                className="bg-gray-800 text-white border-gray-700"
                required
              />
            </div>
            <div>
              <Label className="text-white">Site</Label>
              <Select value={prizeForm.site_id} onValueChange={(val) => setPrizeForm({ ...prizeForm, site_id: val })}>
                <SelectTrigger data-testid="prize-site-select" className="bg-gray-800 text-white border-gray-700">
                  <SelectValue placeholder="Site seçin" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id} data-testid={`site-option-${site.id}`}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Açıklama</Label>
              <Textarea
                data-testid="prize-description-input"
                value={prizeForm.description}
                onChange={(e) => setPrizeForm({ ...prizeForm, description: e.target.value })}
                className="bg-gray-800 text-white border-gray-700"
                required
              />
            </div>
            <div>
              <Label className="text-white">Ağırlık (Kazanma Olasılığı)</Label>
              <Input
                data-testid="prize-weight-input"
                type="number"
                min="1"
                value={prizeForm.weight}
                onChange={(e) => setPrizeForm({ ...prizeForm, weight: parseInt(e.target.value) })}
                className="bg-gray-800 text-white border-gray-700"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_vip"
                checked={prizeForm.is_vip}
                onChange={(e) => setPrizeForm({ ...prizeForm, is_vip: e.target.checked })}
                className="w-5 h-5"
              />
              <Label htmlFor="is_vip" className="text-purple-300 font-semibold cursor-pointer flex items-center gap-2">
                <Trophy size={18} className="text-yellow-400" />
                VIP Ödül (Sadece VIP çarkta görünür)
              </Label>
            </div>
            <Button
              data-testid="submit-prize-btn"
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold"
            >
              Ödül Ekle
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Site Modal */}
      <Dialog open={showSiteModal} onOpenChange={setShowSiteModal}>
        <DialogContent className="bg-gray-900 border-yellow-400 max-h-[90vh] overflow-y-auto" data-testid="site-modal">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-2xl">Yeni Site Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSite} className="space-y-4">
            <div>
              <Label className="text-white">Site Adı</Label>
              <Input
                data-testid="site-name-input"
                value={siteForm.name}
                onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })}
                className="bg-gray-800 text-white border-gray-700"
                placeholder="Örn: Sekabet"
                required
              />
            </div>
            <div>
              <Label className="text-white">Logo Yükle</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="bg-gray-800 text-white border-gray-700"
              />
              <p className="text-gray-400 text-sm mt-1">veya URL girin:</p>
              <Input
                data-testid="site-logo-input"
                value={siteForm.logo_url}
                onChange={(e) => setSiteForm({ ...siteForm, logo_url: e.target.value })}
                className="bg-gray-800 text-white border-gray-700 mt-2"
                placeholder="https://..."
              />
            </div>
            <div>
              <Label className="text-white">Deneme Bonusu</Label>
              <Input
                data-testid="site-bonus-input"
                value={siteForm.welcome_bonus}
                onChange={(e) => setSiteForm({ ...siteForm, welcome_bonus: e.target.value })}
                className="bg-gray-800 text-white border-gray-700"
                placeholder="500 TL Deneme Bonusu"
              />
            </div>
            <div>
              <Label className="text-white">Site Linki (URL)</Label>
              <Input
                data-testid="site-url-input"
                type="url"
                value={siteForm.website_url}
                onChange={(e) => setSiteForm({ ...siteForm, website_url: e.target.value })}
                className="bg-gray-800 text-white border-gray-700"
                placeholder="https://www.sekabet.com"
              />
            </div>
            <div>
              <Label className="text-white">Kategori</Label>
              <Select value={siteForm.category} onValueChange={(val) => setSiteForm({ ...siteForm, category: val })}>
                <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  <SelectItem value="main_sponsor">Ana Sponsorlar</SelectItem>
                  <SelectItem value="editor_choice">Editörün Seçimi</SelectItem>
                  <SelectItem value="monthly">Ayın Siteleri</SelectItem>
                  <SelectItem value="yearly">Yılın Siteleri</SelectItem>
                  <SelectItem value="top_winners">En Çok Kazandıran</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Sıra</Label>
              <Input
                type="number"
                min="0"
                value={siteForm.order}
                onChange={(e) => setSiteForm({ ...siteForm, order: parseInt(e.target.value) })}
                className="bg-gray-800 text-white border-gray-700"
              />
            </div>
            <Button
              data-testid="submit-site-btn"
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold"
            >
              Site Ekle
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rule Modal */}
      <Dialog open={showRuleModal} onOpenChange={setShowRuleModal}>
        <DialogContent className="bg-gray-900 border-yellow-400" data-testid="rule-modal">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-2xl">Yeni Kural Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRule} className="space-y-4">
            <div>
              <Label className="text-white">Kural Başlığı</Label>
              <Input
                data-testid="rule-title-input"
                value={ruleForm.title}
                onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
                className="bg-gray-800 text-white border-gray-700"
                placeholder="Örn: Günlük Çark Hakkı"
                required
              />
            </div>
            <div>
              <Label className="text-white">Açıklama</Label>
              <Textarea
                data-testid="rule-description-input"
                value={ruleForm.description}
                onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                className="bg-gray-800 text-white border-gray-700"
                placeholder="Kuralın detaylı açıklaması..."
                rows={4}
                required
              />
            </div>
            <div>
              <Label className="text-white">Sıra</Label>
              <Input
                data-testid="rule-order-input"
                type="number"
                min="0"
                value={ruleForm.order}
                onChange={(e) => setRuleForm({ ...ruleForm, order: parseInt(e.target.value) })}
                className="bg-gray-800 text-white border-gray-700"
                required
              />
            </div>
            <Button
              data-testid="submit-rule-btn"
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold"
            >
              Kural Ekle
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Extra Spin Modal */}
      <Dialog open={showExtraSpinModal} onOpenChange={setShowExtraSpinModal}>
        <DialogContent className="bg-gray-900 border-yellow-400" data-testid="extra-spin-modal">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-2xl">Ekstra Çark Hakkı Tanımla</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGrantExtraSpins} className="space-y-4">
            <div>
              <Label className="text-white">Kullanıcı (Boş bırakırsanız tüm kullanıcılara tanımlanır)</Label>
              <Select value={extraSpinForm.user_id} onValueChange={(val) => setExtraSpinForm({ ...extraSpinForm, user_id: val })}>
                <SelectTrigger data-testid="extra-spin-user-select" className="bg-gray-800 text-white border-gray-700">
                  <SelectValue placeholder="Tüm kullanıcılar" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  <SelectItem value="all-users" data-testid="all-users-option">Tüm Kullanıcılar</SelectItem>
                  {allUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id} data-testid={`user-option-${u.id}`}>
                      {u.name} {u.surname} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Çark Sayısı</Label>
              <Input
                data-testid="extra-spin-count-input"
                type="number"
                min="1"
                value={extraSpinForm.spins}
                onChange={(e) => setExtraSpinForm({ ...extraSpinForm, spins: e.target.value })}
                className="bg-gray-800 text-white border-gray-700"
                required
              />
            </div>
            <Button
              data-testid="submit-extra-spin-btn"
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold"
            >
              Tanımla
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Admin Modal */}
      <Dialog open={showCreateAdminModal} onOpenChange={setShowCreateAdminModal}>
        <DialogContent className="bg-gray-900 border-green-500" data-testid="create-admin-modal">
          <DialogHeader>
            <DialogTitle className="text-green-400 text-2xl">👑 Yeni Admin Kullanıcısı Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Ad</Label>
                <Input
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                  className="bg-gray-800 text-white border-gray-700"
                  required
                  data-testid="admin-name-input"
                />
              </div>
              <div>
                <Label className="text-white">Soyad</Label>
                <Input
                  value={newAdminData.surname}
                  onChange={(e) => setNewAdminData({ ...newAdminData, surname: e.target.value })}
                  className="bg-gray-800 text-white border-gray-700"
                  required
                  data-testid="admin-surname-input"
                />
              </div>
            </div>
            <div>
              <Label className="text-white">E-posta</Label>
              <Input
                type="email"
                value={newAdminData.email}
                onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                className="bg-gray-800 text-white border-gray-700"
                required
                data-testid="admin-email-input"
              />
            </div>
            <div>
              <Label className="text-white">Telefon</Label>
              <Input
                value={newAdminData.phone}
                onChange={(e) => setNewAdminData({ ...newAdminData, phone: e.target.value })}
                className="bg-gray-800 text-white border-gray-700"
                required
                data-testid="admin-phone-input"
              />
            </div>
            <div>
              <Label className="text-white">Telegram Kullanıcı Adı</Label>
              <Input
                value={newAdminData.telegram_username}
                onChange={(e) => setNewAdminData({ ...newAdminData, telegram_username: e.target.value })}
                className="bg-gray-800 text-white border-gray-700"
                required
                data-testid="admin-telegram-input"
              />
            </div>
            <div>
              <Label className="text-white">Şifre</Label>
              <Input
                type="password"
                value={newAdminData.password}
                onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                className="bg-gray-800 text-white border-gray-700"
                placeholder="En az 6 karakter"
                required
                data-testid="admin-password-input"
              />
            </div>
            <div className="bg-green-600/20 p-3 rounded-lg border border-green-500/50">
              <p className="text-green-400 text-sm">
                ⚠️ Bu kullanıcı otomatik olarak admin yetkilerine sahip olacaktır.
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
              data-testid="submit-create-admin-btn"
            >
              Admin Oluştur
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;