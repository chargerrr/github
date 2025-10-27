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
  const [vipPrizes, setVipPrizes] = useState([]);
  const [sites, setSites] = useState([]);
  const [rules, setRules] = useState([]);
  const [mySpins, setMySpins] = useState([]);
  const [recentWinners, setRecentWinners] = useState([]);
  const [settings, setSettings] = useState({});
  const [vipSpinning, setVipSpinning] = useState(false);
  const [vipWonPrize, setVipWonPrize] = useState(null);
  const wheelRef = useRef(null);
  const canvasRef = useRef(null);
  const vipWheelRef = useRef(null);
  const vipCanvasRef = useRef(null);
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
    fetchVipPrizes();
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

  useEffect(() => {
    if (vipPrizes.length > 0 && vipCanvasRef.current) {
      drawVipWheel();
    }
  }, [vipPrizes]);

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

  const drawVipWheel = () => {
    const canvas = vipCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;

    // Take first 8 VIP prizes for display
    const displayPrizes = vipPrizes.slice(0, 8);
    const sliceAngle = (2 * Math.PI) / displayPrizes.length;

    displayPrizes.forEach((prize, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Draw slice with VIP gradient colors
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      // VIP colors: Purple/Pink gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      if (index % 2 === 0) {
        gradient.addColorStop(0, '#9333EA'); // Purple
        gradient.addColorStop(1, '#7C3AED');
      } else {
        gradient.addColorStop(0, '#EC4899'); // Pink
        gradient.addColorStop(1, '#DB2777');
      }
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text with glow effect
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px Inter';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 10;
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

  const fetchVipPrizes = async () => {
    try {
      const response = await axios.get(`${API}/vip-prizes`);
      setVipPrizes(response.data);
    } catch (error) {
      console.error("Error fetching VIP prizes:", error);
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

    // More realistic spinning: 8-10 full rotations with easing
    const rotations = 8 + Math.random() * 2;
    const extraDegrees = Math.random() * 360; // Random final position
    const degrees = rotations * 360 + extraDegrees;
    
    if (wheelRef.current) {
      // Reset first
      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = 'rotate(0deg)';
      
      // Force reflow
      void wheelRef.current.offsetHeight;
      
      // Apply spinning
      wheelRef.current.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.3, 0.99)';
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
      }, 5500); // Increased timeout to match animation duration
    } catch (error) {
      setSpinning(false);
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'none';
        wheelRef.current.style.transform = 'rotate(0deg)';
      }
      toast.error(error.response?.data?.detail || "Çark çevrilemedi");
    }
  };

  const handleVipSpin = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!user.vip_spins || user.vip_spins <= 0) {
      toast.error("VIP çevirme hakkınız bulunmuyor");
      return;
    }

    setVipSpinning(true);
    playSpinSound();

    // More realistic spinning: 8-10 full rotations with easing
    const rotations = 8 + Math.random() * 2;
    const extraDegrees = Math.random() * 360; // Random final position
    const degrees = rotations * 360 + extraDegrees;
    
    if (vipWheelRef.current) {
      vipWheelRef.current.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.3, 0.99)';
      vipWheelRef.current.style.transform = `rotate(${degrees}deg)`;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API}/wheel/vip-spin-preview`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTimeout(async () => {
        setVipWonPrize(response.data);
        setWonPrize(response.data); // Use same prize modal
        setVipSpinning(false);
        createParticles();
        setShowSiteModal(true);
        
        // Refresh user data to update VIP spin counts
        try {
          const userResponse = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(userResponse.data);
        } catch (error) {
          console.error("Failed to refresh user data:", error);
        }
      }, 5500); // Increased timeout to match animation duration
    } catch (error) {
      setVipSpinning(false);
      if (vipWheelRef.current) {
        vipWheelRef.current.style.transition = '';
        vipWheelRef.current.style.transform = 'rotate(0deg)';
      }
      toast.error(error.response?.data?.detail || "VIP çark çevrilemedi");
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
        <title>ÇARK ÇEVİRME SİTESİ - Ücretsiz Ödül Kazan</title>
        <meta name="description" content="Her gün ücretsiz çark çevir, büyük ödüller kazan! VIP çark sistemi ile daha büyük kazançlar. TRX, TL bonus ve daha fazlası." />
        <meta name="keywords" content="çark çevirme, ücretsiz çark, online çark oyunu, ödül kazandıran çark, VIP çark, bahis sitesi çark, günlük ödül çarkı" />
        
        {/* Yandex için özel meta taglar */}
        <meta property="ya:ovs:upload_date" content={new Date().toISOString()} />
        <meta property="article:published_time" content="2025-01-01T00:00:00Z" />
        <meta property="article:modified_time" content={new Date().toISOString()} />
        
        {/* Open Graph */}
        <meta property="og:title" content="ÇARK ÇEVİRME SİTESİ - Ücretsiz Ödül Kazan" />
        <meta property="og:description" content="Her gün ücretsiz çark çevir, büyük ödüller kazan!" />
        <meta property="og:type" content="website" />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Kazandıran Çark",
            "description": "Her gün ücretsiz çark çevirme oyunu. Büyük ödüller kazan!",
            "applicationCategory": "Game",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "TRY"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1250"
            },
            "datePublished": "2025-01-01",
            "dateModified": new Date().toISOString().split('T')[0]
          })}
        </script>
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="main-heading">
            ŞANSINI DENE, BÜYÜK ÖDÜLLER KAZAN! 🎰
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-yellow-400 mb-2">
            HER GÜN ÜCRETSİZ ÇARK ÇEVİRME HAKKI
          </h2>
          <p className="text-lg text-gray-300 mb-4" data-testid="sub-heading">
            {user
              ? `${user.extra_spins > 0 ? `${user.extra_spins} ekstra hakkın var!` : "Bugünlük çark hakkını kullan!"} ${user.vip_spins > 0 ? `🌟 ${user.vip_spins} VIP çark hakkın var!` : ""}`
              : "Çarkı çevirmek için giriş yapın"}
          </p>
        </div>

        {/* Wheels Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 max-w-6xl w-full">
          {/* Normal Wheel */}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <Gift size={28} />
              Normal Çark
            </h3>
            <div className="wheel-container" data-testid="wheel-container">
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
            <p className="text-gray-300 mt-4 text-center">
              {user 
                ? (user.daily_spin_used && user.extra_spins <= 0 
                  ? "Günlük hakkın bitti" 
                  : "Çarkı çevir ve kazan!")
                : "Giriş yap ve çevir"}
            </p>
          </div>

          {/* VIP Wheel */}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <Trophy size={28} className="text-purple-400" />
              VIP Çark
              {user && user.vip_spins > 0 && (
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-3 py-1 rounded-full">
                  {user.vip_spins} Hak
                </span>
              )}
            </h3>
            <div 
              className={`wheel-container ${!user || user.vip_spins <= 0 ? 'opacity-50 pointer-events-none' : ''}`} 
              data-testid="vip-wheel-container"
            >
              <div className="wheel-pointer vip-pointer"></div>
              <div ref={vipWheelRef} className={`wheel vip-wheel ${vipSpinning ? "spinning" : ""}`} data-testid="vip-wheel">
                <canvas ref={vipCanvasRef} width="484" height="484"></canvas>
              </div>
              <div
                className="wheel-center vip-center"
                onClick={handleVipSpin}
                data-testid="vip-spin-btn"
                style={{ pointerEvents: vipSpinning || !user || user.vip_spins <= 0 ? "none" : "auto" }}
              >
                <Star className="text-yellow-400" size={40} />
              </div>
              {(!user || user.vip_spins <= 0) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                  <div className="text-center text-white">
                    <Star size={48} className="mx-auto mb-2 text-purple-400" />
                    <p className="font-bold">VIP ÇARK</p>
                    <p className="text-sm text-gray-300">Hakkın yok</p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-gray-300 mt-4 text-center">
              {user && user.vip_spins > 0
                ? "VIP çarkı çevir ve büyük ödüller kazan!"
                : "VIP hakkı için admin ile iletişime geç"}
            </p>
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

      {/* Footer with Social Media */}
      <footer className="relative z-10 mt-12 border-t border-yellow-400/30 bg-gray-900/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className="text-yellow-400 font-bold text-xl mb-3">{settings.site_title || "Kazandıran Çark"}</h3>
              <p className="text-gray-400 text-sm">
                {settings.site_description || "Şansınızı deneyin ve büyük ödüller kazanın!"}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-yellow-400 font-bold text-xl mb-3">Hızlı Bağlantılar</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#rules" className="hover:text-yellow-400">Kurallar</a></li>
                <li><a href="#sites" className="hover:text-yellow-400">Partner Siteler</a></li>
                {settings.partnership_text && (
                  <li><a href="#partnership" className="hover:text-yellow-400">İş Birliği</a></li>
                )}
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-yellow-400 font-bold text-xl mb-3">Bizi Takip Edin</h3>
              <div className="flex gap-3 flex-wrap">
                {settings.facebook_url && (
                  <a 
                    href={settings.facebook_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {settings.twitter_url && (
                  <a 
                    href={settings.twitter_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-sky-500 hover:bg-sky-600 rounded-full flex items-center justify-center transition-all"
                    aria-label="Twitter"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                )}
                {settings.instagram_url && (
                  <a 
                    href={settings.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:opacity-90 rounded-full flex items-center justify-center transition-all"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {settings.youtube_url && (
                  <a 
                    href={settings.youtube_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all"
                    aria-label="YouTube"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {settings.telegram_url && (
                  <a 
                    href={settings.telegram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all"
                    aria-label="Telegram"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400 text-sm">
            <p>© 2025 {settings.site_title || "Kazandıran Çark"}. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>

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