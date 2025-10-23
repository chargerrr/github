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
import { Home, Gift, Globe, Award, Users, Plus, Trash2, Check, X } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminPage = ({ user, logout }) => {
  const [prizes, setPrizes] = useState([]);
  const [sites, setSites] = useState([]);
  const [spins, setSpins] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [rules, setRules] = useState([]);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showExtraSpinModal, setShowExtraSpinModal] = useState(false);

  const [prizeForm, setPrizeForm] = useState({
    name: "",
    site_id: "",
    description: "",
    image_url: "",
    weight: 1,
  });

  const [siteForm, setSiteForm] = useState({
    name: "",
    logo_url: "",
    welcome_bonus: "",
  });

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
      const [prizesRes, sitesRes, spinsRes, usersRes, rulesRes] = await Promise.all([
        axios.get(`${API}/prizes`, config),
        axios.get(`${API}/sites`, config),
        axios.get(`${API}/admin/spins`, config),
        axios.get(`${API}/admin/users`, config),
        axios.get(`${API}/rules`, config),
      ]);

      setPrizes(prizesRes.data);
      setSites(sitesRes.data);
      setSpins(spinsRes.data);
      setAllUsers(usersRes.data);
      setRules(rulesRes.data);
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
      setPrizeForm({ name: "", site_id: "", description: "", image_url: "", weight: 1 });
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

  const handleCreateSite = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API}/admin/sites`, siteForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Site eklendi!");
      setShowSiteModal(false);
      setSiteForm({ name: "", logo_url: "", welcome_bonus: "" });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-yellow-400 glow-text" data-testid="admin-title">Admin Panel</h1>
        <div className="flex gap-4">
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
          <TabsTrigger value="sites" data-testid="sites-tab" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
            <Globe className="mr-2" size={18} /> Siteler
          </TabsTrigger>
          <TabsTrigger value="rules" data-testid="rules-tab" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
            <Award className="mr-2" size={18} /> Kurallar
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="users-tab" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
            <Users className="mr-2" size={18} /> Kullanıcılar
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
                    <span>{u.name} {u.surname}</span>
                    <div className="flex gap-2">
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
      </Tabs>

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
        <DialogContent className="bg-gray-900 border-yellow-400" data-testid="site-modal">
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
              <Label className="text-white">Logo URL</Label>
              <Input
                data-testid="site-logo-input"
                value={siteForm.logo_url}
                onChange={(e) => setSiteForm({ ...siteForm, logo_url: e.target.value })}
                className="bg-gray-800 text-white border-gray-700"
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
    </div>
  );
};

export default AdminPage;