from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
import random
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    surname: str
    email: EmailStr
    phone: str
    telegram_username: str
    password_hash: str
    is_admin: bool = False
    daily_spin_used: bool = False
    last_spin_date: Optional[str] = None
    extra_spins: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserRegister(BaseModel):
    name: str
    surname: str
    email: EmailStr
    phone: str
    telegram_username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Site(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    logo_url: Optional[str] = None
    welcome_bonus: Optional[str] = None
    category: str = "other"  # main_sponsor, editor_choice, monthly, yearly, top_winners, other
    order: int = 999
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SiteCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    welcome_bonus: Optional[str] = None
    category: str = "other"
    order: int = 999

class SiteSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "site_settings"
    site_title: str = "Kazandıran Çark"
    site_description: str = "Şansını dene, büyük ödüller kazan!"
    partnership_text: str = "Reklam ve İş Birliği İçin İletişime Geçin"
    partnership_email: str = "info@kazandirancark.com"
    partnership_phone: str = "+90 555 123 4567"
    meta_keywords: str = "çark çevir, ödül kazan, bahis siteleri, bonus"
    meta_description: str = "Kazandıran Çark ile şansınızı deneyin! Bahis sitelerinden büyük ödüller kazanın."
    
class SettingsUpdate(BaseModel):
    site_title: Optional[str] = None
    site_description: Optional[str] = None
    partnership_text: Optional[str] = None
    partnership_email: Optional[str] = None
    partnership_phone: Optional[str] = None
    meta_keywords: Optional[str] = None
    meta_description: Optional[str] = None

class Rule(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class RuleCreate(BaseModel):
    title: str
    description: str
    order: int = 0

class Prize(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    site_id: str
    description: str
    image_url: Optional[str] = None
    weight: int = 1  # probability weight
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PrizeCreate(BaseModel):
    name: str
    site_id: str
    description: str
    image_url: Optional[str] = None
    weight: int = 1

class WheelSpin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    prize_id: str
    site_username: str
    status: str = "pending"  # pending, approved, rejected
    admin_note: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SpinRequest(BaseModel):
    site_username: str

class SpinPreviewResponse(BaseModel):
    spin: WheelSpin
    prize: Prize
    site: Site

class ConfirmSpinRequest(BaseModel):
    spin_id: str
    site_username: str

class SpinResponse(BaseModel):
    spin: WheelSpin
    prize: Prize
    site: Site

class ExtraSpinGrant(BaseModel):
    user_id: Optional[str] = None  # None means all users
    spins: int

class AdminUpdateSpin(BaseModel):
    status: str
    admin_note: Optional[str] = None

# Helper functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Auth endpoints
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        **user_data.model_dump(exclude={"password"}),
        password_hash=get_password_hash(user_data.password)
    )
    
    doc = user.model_dump()
    await db.users.insert_one(doc)
    
    token = create_access_token({"sub": user.id})
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "is_admin": user.is_admin}}

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user["id"]})
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"], "is_admin": user.get("is_admin", False)}}

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email, "is_admin": current_user.is_admin, "extra_spins": current_user.extra_spins, "daily_spin_used": current_user.daily_spin_used}

# Site endpoints
@api_router.get("/sites", response_model=List[Site])
async def get_sites():
    sites = await db.sites.find({}, {"_id": 0}).to_list(1000)
    return sites

@api_router.post("/admin/sites", response_model=Site)
async def create_site(site_data: SiteCreate, admin: User = Depends(get_admin_user)):
    site = Site(**site_data.model_dump())
    await db.sites.insert_one(site.model_dump())
    return site

@api_router.delete("/admin/sites/{site_id}")
async def delete_site(site_id: str, admin: User = Depends(get_admin_user)):
    await db.sites.delete_one({"id": site_id})
    return {"message": "Site deleted"}

@api_router.patch("/admin/sites/{site_id}")
async def update_site(site_id: str, site_data: SiteCreate, admin: User = Depends(get_admin_user)):
    await db.sites.update_one(
        {"id": site_id},
        {"$set": site_data.model_dump()}
    )
    return {"message": "Site updated"}

# Rules endpoints
@api_router.get("/rules", response_model=List[Rule])
async def get_rules():
    rules = await db.rules.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    return rules

@api_router.post("/admin/rules", response_model=Rule)
async def create_rule(rule_data: RuleCreate, admin: User = Depends(get_admin_user)):
    rule = Rule(**rule_data.model_dump())
    await db.rules.insert_one(rule.model_dump())
    return rule

@api_router.delete("/admin/rules/{rule_id}")
async def delete_rule(rule_id: str, admin: User = Depends(get_admin_user)):
    await db.rules.delete_one({"id": rule_id})
    return {"message": "Rule deleted"}

# Prize endpoints
@api_router.get("/prizes", response_model=List[Prize])
async def get_prizes():
    prizes = await db.prizes.find({}, {"_id": 0}).to_list(1000)
    return prizes

@api_router.post("/admin/prizes", response_model=Prize)
async def create_prize(prize_data: PrizeCreate, admin: User = Depends(get_admin_user)):
    prize = Prize(**prize_data.model_dump())
    await db.prizes.insert_one(prize.model_dump())
    return prize

@api_router.delete("/admin/prizes/{prize_id}")
async def delete_prize(prize_id: str, admin: User = Depends(get_admin_user)):
    await db.prizes.delete_one({"id": prize_id})
    return {"message": "Prize deleted"}

# Wheel spin endpoints
@api_router.post("/wheel/spin-preview", response_model=SpinPreviewResponse)
async def spin_wheel_preview(current_user: User = Depends(get_current_user)):
    """First step: Spin the wheel and show which prize was won"""
    # Check if user can spin
    today = datetime.now(timezone.utc).date().isoformat()
    
    # Reset daily spin if it's a new day
    if current_user.last_spin_date != today:
        # New day - reset daily spin
        current_user.daily_spin_used = False
        current_user.last_spin_date = today
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"daily_spin_used": False, "last_spin_date": today}}
        )
    
    # Check if user can spin today
    if current_user.daily_spin_used:
        if current_user.extra_spins <= 0:
            raise HTTPException(status_code=400, detail="No spins available today")
        # Use extra spin
        await db.users.update_one(
            {"id": current_user.id},
            {"$inc": {"extra_spins": -1}}
        )
    else:
        # Use daily spin
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"daily_spin_used": True, "last_spin_date": today}}
        )
    
    # Get all prizes with weights
    prizes = await db.prizes.find({}, {"_id": 0}).to_list(1000)
    if not prizes:
        raise HTTPException(status_code=400, detail="No prizes available")
    
    # Weighted random selection
    total_weight = sum(p["weight"] for p in prizes)
    rand = random.uniform(0, total_weight)
    cumulative = 0
    selected_prize = None
    
    for prize in prizes:
        cumulative += prize["weight"]
        if rand <= cumulative:
            selected_prize = Prize(**prize)
            break
    
    if not selected_prize:
        selected_prize = Prize(**prizes[0])
    
    # Get site info
    site = await db.sites.find_one({"id": selected_prize.site_id}, {"_id": 0})
    if not site:
        raise HTTPException(status_code=400, detail="Site not found")
    
    # Create temporary spin record (without site_username yet)
    spin = WheelSpin(
        user_id=current_user.id,
        prize_id=selected_prize.id,
        site_username=""  # Will be filled in confirm step
    )
    await db.spins.insert_one(spin.model_dump())
    
    return SpinPreviewResponse(spin=spin, prize=selected_prize, site=Site(**site))

@api_router.post("/wheel/confirm-spin")
async def confirm_spin(confirm_data: ConfirmSpinRequest, current_user: User = Depends(get_current_user)):
    """Second step: User provides their site username for the prize"""
    # Update the spin with site username
    spin = await db.spins.find_one({"id": confirm_data.spin_id}, {"_id": 0})
    if not spin:
        raise HTTPException(status_code=404, detail="Spin not found")
    
    if spin["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not your spin")
    
    await db.spins.update_one(
        {"id": confirm_data.spin_id},
        {"$set": {"site_username": confirm_data.site_username}}
    )
    
    return {"message": "Site username confirmed"}

@api_router.get("/wheel/my-spins")
async def get_my_spins(current_user: User = Depends(get_current_user)):
    spins = await db.spins.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    
    result = []
    for spin in spins:
        prize = await db.prizes.find_one({"id": spin["prize_id"]}, {"_id": 0})
        site = await db.sites.find_one({"id": prize["site_id"]}, {"_id": 0}) if prize else None
        result.append({
            "spin": spin,
            "prize": prize,
            "site": site
        })
    
    return result

@api_router.get("/recent-winners")
async def get_recent_winners():
    """Get recent 10 winners for display"""
    spins = await db.spins.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    
    result = []
    for spin in spins:
        user = await db.users.find_one({"id": spin["user_id"]}, {"_id": 0})
        prize = await db.prizes.find_one({"id": spin["prize_id"]}, {"_id": 0})
        site = await db.sites.find_one({"id": prize["site_id"]}, {"_id": 0}) if prize else None
        
        # Mask user email for privacy
        masked_email = user["email"][:3] + "***" + user["email"].split("@")[1] if user else "***"
        
        result.append({
            "user_name": user["name"][:1] + "***" if user else "***",
            "email": masked_email,
            "prize_name": prize["name"] if prize else "Unknown",
            "site_name": site["name"] if site else "Unknown",
            "created_at": spin["created_at"]
        })
    
    return result

# Admin endpoints
@api_router.get("/admin/spins")
async def get_all_spins(admin: User = Depends(get_admin_user)):
    spins = await db.spins.find({}, {"_id": 0}).to_list(1000)
    
    result = []
    for spin in spins:
        user = await db.users.find_one({"id": spin["user_id"]}, {"_id": 0})
        prize = await db.prizes.find_one({"id": spin["prize_id"]}, {"_id": 0})
        site = await db.sites.find_one({"id": prize["site_id"]}, {"_id": 0}) if prize else None
        result.append({
            "spin": spin,
            "user": {"id": user["id"], "name": user["name"], "email": user["email"], "telegram_username": user["telegram_username"]} if user else None,
            "prize": prize,
            "site": site
        })
    
    return result

@api_router.patch("/admin/spins/{spin_id}")
async def update_spin(spin_id: str, update_data: AdminUpdateSpin, admin: User = Depends(get_admin_user)):
    await db.spins.update_one(
        {"id": spin_id},
        {"$set": update_data.model_dump()}
    )
    return {"message": "Spin updated"}

@api_router.post("/admin/extra-spins")
async def grant_extra_spins(grant_data: ExtraSpinGrant, admin: User = Depends(get_admin_user)):
    if grant_data.user_id:
        # Grant to specific user
        await db.users.update_one(
            {"id": grant_data.user_id},
            {"$inc": {"extra_spins": grant_data.spins}}
        )
        return {"message": f"Granted {grant_data.spins} spins to user"}
    else:
        # Grant to all users
        await db.users.update_many(
            {},
            {"$inc": {"extra_spins": grant_data.spins}}
        )
        return {"message": f"Granted {grant_data.spins} spins to all users"}

@api_router.get("/admin/users")
async def get_all_users(admin: User = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.patch("/admin/users/{user_id}")
async def update_user(user_id: str, update_data: dict, admin: User = Depends(get_admin_user)):
    allowed_fields = ["extra_spins", "is_admin", "daily_spin_used"]
    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if update_dict:
        await db.users.update_one(
            {"id": user_id},
            {"$set": update_dict}
        )
    return {"message": "User updated"}

@api_router.get("/admin/users/export")
async def export_users(admin: User = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(10000)
    return users

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()