import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trophy, Star, Gift, LogOut, User, Award, CheckCircle2 } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HomePage = ({ user, setUser, logout }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [siteUsername, setSiteUsername] = useState("");
  const [prizes, setPrizes] = useState([]);
  const [sites, setSites] = useState([]);
  const [rules, setRules] = useState([]);
  const [mySpins, setMySpins] = useState([]);
  const [recentWinners, setRecentWinners] = useState([]);
  const [settings, setSettings] = useState({});
  const wheelRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    telegram_username: "",
    password: "",
  });

  useEffect(() => {
    fetchPrizes();
    fetchSites();
    fetchRules();
    fetchRecentWinners();
    fetchSettings();
    if (user) {
      fetchMySpins();
    }
  }, [user]);

  useEffect(() => {
    if (prizes.length > 0 && canvasRef.current) {
      drawWheel();
    }
  }, [prizes]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;

    // Take first 8 prizes for display
    const displayPrizes = prizes.slice(0, 8);
    const sliceAngle = (2 * Math.PI) / displayPrizes.length;

    displayPrizes.forEach((prize, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      // Alternate colors
      ctx.fillStyle = index % 2 === 0 ? '#8B0000' : '#FFD700';
      ctx.fill();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = index % 2 === 0 ? '#FFD700' : '#000';
      ctx.font = 'bold 14px Inter';
      ctx.fillText(prize.name.substring(0, 20), radius / 1.5, 10);
      ctx.restore();
    });
  };

  const fetchPrizes = async () => {
    try {
      const response = await axios.get(`${API}/prizes`);
      setPrizes(response.data);
    } catch (error) {
      console.error("Error fetching prizes:", error);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await axios.get(`${API}/sites`);
      setSites(response.data);
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await axios.get(`${API}/rules`);
      setRules(response.data);
    } catch (error) {
      console.error("Error fetching rules:", error);
    }
  };

  const fetchRecentWinners = async () => {
    try {
      const response = await axios.get(`${API}/recent-winners`);
      setRecentWinners(response.data);
    } catch (error) {
      console.error("Error fetching recent winners:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchMySpins = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/wheel/my-spins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMySpins(response.data);
    } catch (error) {
      console.error("Error fetching spins:", error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(`${API}${endpoint}`, payload);
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      setShowAuthModal(false);
      toast.success(isLogin ? "Giriş başarılı!" : "Kayıt başarılı!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Bir hata oluştu");
    }
  };

  const playSpinSound = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const createParticles = () => {
    const container = document.querySelector(".wheel-container");
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      const angle = (Math.PI * 2 * i) / 30;
      const distance = 100 + Math.random() * 100;
      particle.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
      particle.style.left = "50%";
      particle.style.top = "50%";
      container.appendChild(particle);
      setTimeout(() => particle.remove(), 2000);
    }
  };

  const handleSpin = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setSpinning(true);
    playSpinSound();

    const rotations = 5 + Math.random() * 3;
    const degrees = rotations * 360;
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${degrees}deg)`;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API}/wheel/spin-preview`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTimeout(async () => {
        setWonPrize(response.data);
        setSpinning(false);
        createParticles();
        setShowSiteModal(true);
        
        // Refresh user data to update spin counts
        try {
          const userResponse = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(userResponse.data);
        } catch (error) {
          console.error("Failed to refresh user data:", error);
        }
      }, 4000);
    } catch (error) {
      setSpinning(false);
      toast.error(error.response?.data?.detail || "Çark çevrilemedi");
    }
  };

  const submitSiteUsername = async () => {
    if (!siteUsername.trim()) {
      toast.error("Lütfen kullanıcı adınızı girin");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/wheel/confirm-spin`,
        { 
          spin_id: wonPrize.spin.id,
          site_username: siteUsername 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowSiteModal(false);
      setShowWinModal(true);
      setSiteUsername("");
      fetchMySpins();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Bilgiler kaydedilemedi");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      <Helmet>
        <title>{settings.site_title || "Kazandıran Çark"}</title>
        <meta name="description" content={settings.meta_description || "Şansınızı deneyin ve büyük ödüller kazanın!"} />
        <meta name="keywords" content={settings.meta_keywords || "çark, ödül, bahis, bonus"} />
        
        {/* Open Graph */}
        <meta property="og:title" content={settings.site_title || "Kazandıran Çark"} />
        <meta property="og:description" content={settings.meta_description || "Şansınızı deneyin ve büyük ödüller kazanın!"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={settings.site_title || "Kazandıran Çark"} />
        <meta name="twitter:description" content={settings.meta_description || "Şansınızı deneyin ve büyük ödüller kazanın!"} />
      </Helmet>
      
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <Star
            key={i}
            className="absolute text-yellow-400 opacity-20"
            size={Math.random() * 20 + 10}
            style={
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
              }
            }
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 glow-text" data-testid="app-title">
          Kazandıran Çark
        </h1>
        {user ? (
          <div className="flex items-center gap-4">
            {user.is_admin && (
              <Button
                data-testid="admin-panel-btn"
                onClick={() => (window.location.href = "/admin")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Admin Panel
              </Button>
            )}
            <div className="glass-card px-4 py-2 rounded-lg text-white flex items-center gap-2">
              <User size={20} />
              <span data-testid="user-name">{user.name}</span>
            </div>
            <Button
              data-testid="logout-btn"
              onClick={logout}
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900"
            >
              <LogOut size={18} />
            </Button>
          </div>
        ) : (
          <Button
            data-testid="login-btn"
            onClick={() => setShowAuthModal(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-3 text-lg"
          >
            Giriş Yap / Kayıt Ol
          </Button>
        )}
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="main-heading">
            Şansını Dene, Büyük Ödüller Kazan!
          </h2>
          <p className="text-lg text-gray-300" data-testid="sub-heading">
            {user
              ? `${user.extra_spins > 0 ? `${user.extra_spins} ekstra hakkın var!` : "Bugünlük çark hakkını kullan!"}`
              : "Çarkı çevirmek için giriş yapın"}
          </p>
        </div>

        {/* Wheel */}
        <div className="wheel-container mb-12" data-testid="wheel-container">
          <div className="wheel-pointer"></div>
          <div ref={wheelRef} className={`wheel ${spinning ? "spinning" : ""}`} data-testid="wheel">
            <canvas ref={canvasRef} width="484" height="484"></canvas>
          </div>
          <div
            className="wheel-center"
            onClick={handleSpin}
            data-testid="spin-btn"
            style={{ pointerEvents: spinning ? "none" : "auto" }}
          >
            <Trophy className="text-white" size={40} />
          </div>
        </div>

        {/* Recent Winners */}
        {recentWinners.length > 0 && (
          <div className="max-w-4xl w-full glass-card rounded-2xl p-6 mb-12" data-testid="recent-winners-section">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
              🎊 Son Kazananlar
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentWinners.map((winner, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                  data-testid={`winner-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center">
                      <Trophy className="text-yellow-400" size={20} />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{winner.user_name}</p>
                      <p className="text-gray-400 text-sm">{winner.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">{winner.prize_name}</p>
                    <p className="text-gray-400 text-sm">{winner.site_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Prizes */}
        {user && mySpins.length > 0 && (
          <div className="max-w-4xl w-full glass-card rounded-2xl p-8 mb-12" data-testid="my-prizes-section">
            <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
              <Award /> Kazandığım Ödüller
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mySpins.map((item, index) => (
                <Card key={index} className="bg-gray-800/50 border-yellow-400/30" data-testid={`prize-card-${index}`}>
                  <CardHeader>
                    <CardTitle className="text-yellow-400 text-lg">{item.prize?.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white mb-2">Site: {item.site?.name}</p>
                    <p className="text-gray-400 text-sm mb-2">{item.prize?.description}</p>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm ${
                        item.spin.status === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : item.spin.status === "rejected"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                      data-testid={`prize-status-${index}`}
                    >
                      {item.spin.status === "approved"
                        ? "Onaylandı"
                        : item.spin.status === "rejected"
                        ? "Reddedildi"
                        : "Bekliyor"}
                    </div>
                    {item.spin.admin_note && (
                      <p className="text-gray-400 text-sm mt-2" data-testid={`admin-note-${index}`}>
                        Not: {item.spin.admin_note}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Partner Sites Section - Categorized */}
        {sites.length > 0 && (
          <div className="max-w-6xl w-full mb-12" data-testid="partner-sites-section">
            {/* Main Sponsors */}
            {sites.filter(s => s.category === 'main_sponsor').length > 0 && (
              <div className="mb-10">
                <h3 className="text-3xl font-bold text-yellow-400 mb-6 text-center glow-text">
                  ⭐ Ana Sponsorlar
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sites.filter(s => s.category === 'main_sponsor').map((site, index) => (
                    <SiteCard key={site.id} site={site} index={index} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Editor's Choice */}
            {sites.filter(s => s.category === 'editor_choice').length > 0 && (
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
                  👑 Editörün Seçimi
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sites.filter(s => s.category === 'editor_choice').map((site, index) => (
                    <SiteCard key={site.id} site={site} index={index} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Monthly Sites */}
            {sites.filter(s => s.category === 'monthly').length > 0 && (
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
                  🗓️ Ayın Siteleri
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sites.filter(s => s.category === 'monthly').map((site, index) => (
                    <SiteCard key={site.id} site={site} index={index} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Yearly Sites */}
            {sites.filter(s => s.category === 'yearly').length > 0 && (
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
                  🏆 Yılın Siteleri
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sites.filter(s => s.category === 'yearly').map((site, index) => (
                    <SiteCard key={site.id} site={site} index={index} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Top Winners */}
            {sites.filter(s => s.category === 'top_winners').length > 0 && (
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
                  💰 En Çok Kazandıran Siteler
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sites.filter(s => s.category === 'top_winners').map((site, index) => (
                    <SiteCard key={site.id} site={site} index={index} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Other Sites */}
            {sites.filter(s => s.category === 'other' || !s.category).length > 0 && (
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
                  📌 Diğer Siteler
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sites.filter(s => s.category === 'other' || !s.category).map((site, index) => (
                    <SiteCard key={site.id} site={site} index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Partnership Section */}
        {settings.partnership_text && (
          <div className="max-w-4xl w-full glass-card rounded-2xl p-8 mb-12" data-testid="partnership-section">
            <h3 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
              🤝 İş Birliği
            </h3>
            <div className="text-center space-y-4">
              <p className="text-white text-lg">{settings.partnership_text}</p>
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                {settings.partnership_email && (
                  <a 
                    href={`mailto:${settings.partnership_email}`}
                    className="text-yellow-400 hover:text-yellow-300 font-semibold"
                  >
                    📧 {settings.partnership_email}
                  </a>
                )}
                {settings.partnership_phone && (
                  <a 
                    href={`tel:${settings.partnership_phone}`}
                    className="text-yellow-400 hover:text-yellow-300 font-semibold"
                  >
                    📞 {settings.partnership_phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rules Section */}
        {rules.length > 0 && (
          <div className="max-w-4xl w-full glass-card rounded-2xl p-8" data-testid="rules-section">
            <h3 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
              Çark Çevirme Kuralları
            </h3>
            <div className="space-y-4">
              {rules.map((rule, index) => (
                <div 
                  key={rule.id} 
                  className="flex gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                  data-testid={`rule-${index}`}
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                      <CheckCircle2 className="text-gray-900" size={20} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">{rule.title}</h4>
                    <p className="text-gray-300">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="bg-gray-900 border-yellow-400" data-testid="auth-modal">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-2xl">
              {isLogin ? "Giriş Yap" : "Kayıt Ol"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label className="text-white">Ad</Label>
                  <Input
                    data-testid="name-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-800 text-white border-gray-700"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Soyad</Label>
                  <Input
                    data-testid="surname-input"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    className="bg-gray-800 text-white border-gray-700"
                    required
                  />
                </div>
              </>
            )}
            <div>
              <Label className="text-white">E-posta</Label>
              <Input
                data-testid="email-input"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-gray-800 text-white border-gray-700"
                required
              />
            </div>
            {!isLogin && (
              <>
                <div>
                  <Label className="text-white">Telefon</Label>
                  <Input
                    data-testid="phone-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-gray-800 text-white border-gray-700"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Telegram Kullanıcı Adı</Label>
                  <Input
                    data-testid="telegram-input"
                    value={formData.telegram_username}
                    onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                    className="bg-gray-800 text-white border-gray-700"
                    required
                  />
                </div>
              </>
            )}
            <div>
              <Label className="text-white">Şifre</Label>
              <Input
                data-testid="password-input"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-gray-800 text-white border-gray-700"
                required
              />
            </div>
            <Button
              data-testid="auth-submit-btn"
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold"
            >
              {isLogin ? "Giriş Yap" : "Kayıt Ol"}
            </Button>
            <button
              data-testid="toggle-auth-mode"
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-yellow-400 hover:underline text-sm"
            >
              {isLogin ? "Hesabın yok mu? Kayıt ol" : "Zaten hesabın var mı? Giriş yap"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Site Username Modal - Shown AFTER winning */}
      <Dialog open={showSiteModal} onOpenChange={setShowSiteModal}>
        <DialogContent className="bg-gray-900 border-yellow-400" data-testid="site-modal">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-2xl">🎉 Tebrikler! 🎉</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-purple-800/30 p-6 rounded-lg space-y-3">
              <p className="text-white text-xl font-bold text-center">{wonPrize?.prize?.name}</p>
              <p className="text-gray-300 text-center">{wonPrize?.prize?.description}</p>
              <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold text-lg">
                <Gift size={24} />
                <span>Site: {wonPrize?.site?.name}</span>
              </div>
            </div>
            
            {wonPrize?.site?.website_url && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-lg border-2 border-yellow-400/50">
                <p className="text-white text-center mb-3">
                  Henüz <span className="font-bold text-yellow-400">{wonPrize?.site?.name}</span> üyesi değil misiniz?
                </p>
                <a
                  href={wonPrize?.site?.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    type="button"
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold text-lg py-6"
                    data-testid="visit-site-btn"
                  >
                    🎰 {wonPrize?.site?.name} Sitesine Git - Üye Ol
                  </Button>
                </a>
                <p className="text-gray-400 text-sm text-center mt-2">
                  Üye olduktan sonra aşağıya kullanıcı adınızı girin
                </p>
              </div>
            )}
            
            <div className="border-t-2 border-gray-700 pt-4">
              <p className="text-white mb-3">
                Bu ödül <span className="text-yellow-400 font-bold">{wonPrize?.site?.name}</span> hesabınıza gönderilecek. 
                Lütfen bu sitedeki kullanıcı adınızı girin:
              </p>
              <div>
                <Label className="text-white">{wonPrize?.site?.name} Kullanıcı Adı</Label>
                <Input
                  data-testid="site-username-input"
                  value={siteUsername}
                  onChange={(e) => setSiteUsername(e.target.value)}
                  className="bg-gray-800 text-white border-gray-700"
                  placeholder={`Örn: ${wonPrize?.site?.name?.toLowerCase()}_user123`}
                />
              </div>
              <Button
                data-testid="confirm-username-btn"
                onClick={submitSiteUsername}
                className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-6 text-lg"
              >
                ✅ Kullanıcı Adını Onayla ve Ödülü Al
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Win Confirmation Modal */}
      <Dialog open={showWinModal} onOpenChange={setShowWinModal}>
        <DialogContent className="bg-gray-900 border-yellow-400" data-testid="win-modal">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-3xl text-center glow-text">
              ✅ Kaydedildi!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <Gift className="mx-auto text-yellow-400" size={80} />
            <div className="bg-purple-800/30 p-4 rounded-lg">
              <p className="text-white">Ödülünüz admin onayından sonra <span className="text-yellow-400 font-bold">{wonPrize?.site?.name}</span> hesabınıza tanımlanacaktır.</p>
              <p className="text-gray-400 mt-2 text-sm">Durumu "Kazandığım Ödüller" bölümünden takip edebilirsiniz.</p>
            </div>
            <Button
              data-testid="close-win-modal-btn"
              onClick={() => setShowWinModal(false)}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold"
            >
              Tamam
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden audio element */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3" />

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

// SiteCard Component
const SiteCard = ({ site, index }) => (
  <Card 
    className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 hover:scale-105 cursor-pointer"
    data-testid={`site-card-${index}`}
  >
    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
      <div className="w-full h-16 flex items-center justify-center mb-2">
        <img 
          src={site.logo_url} 
          alt={site.name} 
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div style={{display: 'none'}} className="text-xl font-bold text-yellow-400">
          {site.name}
        </div>
      </div>
      <h4 className="text-lg font-bold text-white">{site.name}</h4>
      {site.welcome_bonus && (
        <div className="bg-yellow-400/20 px-3 py-1.5 rounded-full">
          <p className="text-yellow-400 font-semibold text-sm">{site.welcome_bonus}</p>
        </div>
      )}
    </CardContent>
  </Card>
);

export default HomePage;