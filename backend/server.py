from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
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
    vip_spins: int = 0  # VIP çark hakları
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
    website_url: Optional[str] = None  # Site linki
    category: str = "other"  # main_sponsor, editor_choice, monthly, yearly, top_winners, other
    order: int = 999
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SiteCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    welcome_bonus: Optional[str] = None
    website_url: Optional[str] = None
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
    facebook_url: Optional[str] = None
    twitter_url: Optional[str] = None
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None
    telegram_url: Optional[str] = None
    
class SettingsUpdate(BaseModel):
    site_title: Optional[str] = None
    site_description: Optional[str] = None
    partnership_text: Optional[str] = None
    partnership_email: Optional[str] = None
    partnership_phone: Optional[str] = None
    meta_keywords: Optional[str] = None
    meta_description: Optional[str] = None
    facebook_url: Optional[str] = None
    twitter_url: Optional[str] = None
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None
    telegram_url: Optional[str] = None

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
    is_vip: bool = False  # VIP prize
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PrizeCreate(BaseModel):
    name: str
    site_id: str
    description: str
    image_url: Optional[str] = None
    weight: int = 1
    is_vip: bool = False

class VIPCondition(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    site_id: str  # Hangi site için
    condition_type: str  # "registration", "deposit", "bet"
    condition_value: str  # Koşul değeri (örn: "100 TL yatırım")
    description: str  # Açıklama
    spins_granted: int = 1  # Kaç VIP çark hakkı verilecek
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class VIPConditionCreate(BaseModel):
    site_id: str
    condition_type: str
    condition_value: str
    description: str
    spins_granted: int = 1
    is_active: bool = True

class VIPSpinGrant(BaseModel):
    user_id: str
    condition_id: str
    proof: Optional[str] = None  # Kanıt (ekran görüntüsü URL, vb.)

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
    return {
        "id": current_user.id, 
        "name": current_user.name, 
        "email": current_user.email, 
        "is_admin": current_user.is_admin, 
        "extra_spins": current_user.extra_spins, 
        "vip_spins": current_user.vip_spins,
        "daily_spin_used": current_user.daily_spin_used
    }

# Site endpoints
@api_router.get("/sites", response_model=List[Site])
async def get_sites():
    sites = await db.sites.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    return sites

@api_router.post("/admin/sites", response_model=Site)
async def create_site(site_data: SiteCreate, admin: User = Depends(get_admin_user)):
    site = Site(**site_data.model_dump())
    await db.sites.insert_one(site.model_dump())
    return site

@api_router.patch("/admin/sites/{site_id}")
async def update_site(site_id: str, site_data: SiteCreate, admin: User = Depends(get_admin_user)):
    await db.sites.update_one(
        {"id": site_id},
        {"$set": site_data.model_dump()}
    )
    return {"message": "Site updated"}

@api_router.delete("/admin/sites/{site_id}")
async def delete_site(site_id: str, admin: User = Depends(get_admin_user)):
    await db.sites.delete_one({"id": site_id})
    return {"message": "Site deleted"}

@api_router.post("/admin/upload-logo")
async def upload_logo(file: UploadFile = File(...), admin: User = Depends(get_admin_user)):
    # Create uploads directory if not exists
    upload_dir = Path("/app/backend/uploads")
    upload_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return URL
    file_url = f"/uploads/{unique_filename}"
    return {"url": file_url}

# Settings endpoints
@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        # Return default settings
        default_settings = SiteSettings()
        await db.settings.insert_one(default_settings.model_dump())
        return default_settings
    return settings

@api_router.patch("/admin/settings")
async def update_settings(settings_data: SettingsUpdate, admin: User = Depends(get_admin_user)):
    update_dict = {k: v for k, v in settings_data.model_dump().items() if v is not None}
    
    if update_dict:
        await db.settings.update_one(
            {"id": "site_settings"},
            {"$set": update_dict},
            upsert=True
        )
    
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    return settings

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
async def get_prizes(is_vip: Optional[bool] = None):
    """Get prizes, optionally filtered by VIP status"""
    query = {}
    if is_vip is not None:
        query["is_vip"] = is_vip
    else:
        # By default, return only non-VIP prizes for regular wheel
        query["is_vip"] = False
    
    prizes = await db.prizes.find(query, {"_id": 0}).to_list(1000)
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
    
    # Get all non-VIP prizes with weights
    prizes = await db.prizes.find({"is_vip": False}, {"_id": 0}).to_list(1000)
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
    allowed_fields = ["extra_spins", "is_admin", "daily_spin_used", "vip_spins"]
    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if update_dict:
        await db.users.update_one(
            {"id": user_id},
            {"$set": update_dict}
        )
    return {"message": "User updated"}

@api_router.patch("/admin/profile")
async def update_admin_profile(update_data: dict, current_user: User = Depends(get_current_user)):
    """Update current user's profile"""
    allowed_fields = ["name", "surname", "email", "phone", "telegram_username"]
    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields and v}
    
    # Handle password separately
    if "password" in update_data and update_data["password"]:
        update_dict["password_hash"] = get_password_hash(update_data["password"])
    
    if update_dict:
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": update_dict}
        )
    
    # Return updated user
    updated_user = await db.users.find_one({"id": current_user.id}, {"_id": 0, "password_hash": 0})
    return updated_user

@api_router.post("/admin/create-admin")
async def create_admin_user(user_data: UserRegister, admin: User = Depends(get_admin_user)):
    """Create a new admin user"""
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        **user_data.model_dump(exclude={"password"}),
        password_hash=get_password_hash(user_data.password),
        is_admin=True  # Make them admin by default
    )
    
    doc = user.model_dump()
    await db.users.insert_one(doc)
    
    return {"message": "Admin user created", "user_id": user.id}

@api_router.get("/admin/users/export")
async def export_users(admin: User = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(10000)
    return users

# Database Management endpoints
@api_router.post("/admin/database/clear")
async def clear_database(collections: List[str], admin: User = Depends(get_admin_user)):
    """Clear specified collections. Options: users, sites, prizes, spins, rules"""
    deleted_counts = {}
    
    if "users" in collections:
        # Delete all users except admins
        result = await db.users.delete_many({"is_admin": {"$ne": True}})
        deleted_counts["users"] = result.deleted_count
    
    if "sites" in collections:
        result = await db.sites.delete_many({})
        deleted_counts["sites"] = result.deleted_count
    
    if "prizes" in collections:
        result = await db.prizes.delete_many({})
        deleted_counts["prizes"] = result.deleted_count
    
    if "spins" in collections:
        result = await db.spins.delete_many({})
        deleted_counts["spins"] = result.deleted_count
    
    if "rules" in collections:
        result = await db.rules.delete_many({})
        deleted_counts["rules"] = result.deleted_count
    
    return {"message": "Collections cleared", "deleted": deleted_counts}

@api_router.get("/admin/database/stats")
async def get_database_stats(admin: User = Depends(get_admin_user)):
    """Get database statistics"""
    stats = {
        "users": await db.users.count_documents({}),
        "sites": await db.sites.count_documents({}),
        "prizes": await db.prizes.count_documents({}),
        "spins": await db.spins.count_documents({}),
        "rules": await db.rules.count_documents({}),
        "vip_conditions": await db.vip_conditions.count_documents({})
    }
    return stats

# VIP System endpoints
@api_router.get("/vip-conditions")
async def get_vip_conditions():
    """Get all active VIP conditions"""
    conditions = await db.vip_conditions.find({"is_active": True}, {"_id": 0}).to_list(1000)
    
    # Populate site info
    result = []
    for cond in conditions:
        site = await db.sites.find_one({"id": cond["site_id"]}, {"_id": 0})
        result.append({
            **cond,
            "site": site
        })
    
    return result

@api_router.get("/admin/vip-conditions")
async def get_all_vip_conditions(admin: User = Depends(get_admin_user)):
    """Get all VIP conditions (including inactive)"""
    conditions = await db.vip_conditions.find({}, {"_id": 0}).to_list(1000)
    
    # Populate site info
    result = []
    for cond in conditions:
        site = await db.sites.find_one({"id": cond["site_id"]}, {"_id": 0})
        result.append({
            **cond,
            "site": site
        })
    
    return result

@api_router.post("/admin/vip-conditions", response_model=VIPCondition)
async def create_vip_condition(condition_data: VIPConditionCreate, admin: User = Depends(get_admin_user)):
    """Create a new VIP condition"""
    condition = VIPCondition(**condition_data.model_dump())
    await db.vip_conditions.insert_one(condition.model_dump())
    return condition

@api_router.patch("/admin/vip-conditions/{condition_id}")
async def update_vip_condition(condition_id: str, condition_data: VIPConditionCreate, admin: User = Depends(get_admin_user)):
    """Update a VIP condition"""
    await db.vip_conditions.update_one(
        {"id": condition_id},
        {"$set": condition_data.model_dump()}
    )
    return {"message": "VIP condition updated"}

@api_router.delete("/admin/vip-conditions/{condition_id}")
async def delete_vip_condition(condition_id: str, admin: User = Depends(get_admin_user)):
    """Delete a VIP condition"""
    await db.vip_conditions.delete_many({"id": condition_id})
    return {"message": "VIP condition deleted"}

@api_router.post("/admin/grant-vip-spins")
async def grant_vip_spins(grant_data: VIPSpinGrant, admin: User = Depends(get_admin_user)):
    """Manually grant VIP spins to a user based on a condition"""
    # Get the condition
    condition = await db.vip_conditions.find_one({"id": grant_data.condition_id}, {"_id": 0})
    if not condition:
        raise HTTPException(status_code=404, detail="VIP condition not found")
    
    # Grant spins to user
    await db.users.update_one(
        {"id": grant_data.user_id},
        {"$inc": {"vip_spins": condition["spins_granted"]}}
    )
    
    # Log the grant (optional, for tracking)
    grant_log = {
        "id": str(uuid.uuid4()),
        "user_id": grant_data.user_id,
        "condition_id": grant_data.condition_id,
        "spins_granted": condition["spins_granted"],
        "proof": grant_data.proof,
        "granted_by": admin.id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.vip_grants.insert_one(grant_log)
    
    return {"message": f"Granted {condition['spins_granted']} VIP spins to user", "spins_granted": condition["spins_granted"]}

@api_router.get("/admin/vip-users")
async def get_vip_users(admin: User = Depends(get_admin_user)):
    """Get all users with VIP spins"""
    users = await db.users.find(
        {"vip_spins": {"$gt": 0}},
        {"_id": 0, "password_hash": 0}
    ).to_list(1000)
    
    return users

@api_router.get("/admin/vip-stats")
async def get_vip_stats(admin: User = Depends(get_admin_user)):
    """Get VIP system statistics"""
    stats = {
        "total_vip_conditions": await db.vip_conditions.count_documents({}),
        "active_vip_conditions": await db.vip_conditions.count_documents({"is_active": True}),
        "users_with_vip_spins": await db.users.count_documents({"vip_spins": {"$gt": 0}}),
        "total_vip_grants": await db.vip_grants.count_documents({}),
        "vip_prizes": await db.prizes.count_documents({"is_vip": True}),
        "total_vip_spins_available": sum([u.get("vip_spins", 0) for u in await db.users.find({}, {"_id": 0, "vip_spins": 1}).to_list(10000)])
    }
    
    return stats

@api_router.get("/vip-prizes")
async def get_vip_prizes():
    """Get all VIP prizes"""
    prizes = await db.prizes.find({"is_vip": True}, {"_id": 0}).to_list(1000)
    return prizes

@api_router.post("/wheel/vip-spin-preview", response_model=SpinPreviewResponse)
async def vip_spin_preview(current_user: User = Depends(get_current_user)):
    """VIP wheel spin - first step"""
    # Check if user has VIP spins
    if current_user.vip_spins <= 0:
        raise HTTPException(status_code=400, detail="No VIP spins available")
    
    # Deduct VIP spin
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"vip_spins": -1}}
    )
    
    # Get all VIP prizes with weights
    vip_prizes = await db.prizes.find({"is_vip": True}, {"_id": 0}).to_list(1000)
    if not vip_prizes:
        raise HTTPException(status_code=400, detail="No VIP prizes available")
    
    # Weighted random selection
    total_weight = sum(p["weight"] for p in vip_prizes)
    rand = random.uniform(0, total_weight)
    cumulative = 0
    selected_prize = None
    
    for prize in vip_prizes:
        cumulative += prize["weight"]
        if rand <= cumulative:
            selected_prize = Prize(**prize)
            break
    
    if not selected_prize:
        selected_prize = Prize(**vip_prizes[0])
    
    # Get site info
    site = await db.sites.find_one({"id": selected_prize.site_id}, {"_id": 0})
    if not site:
        raise HTTPException(status_code=400, detail="Site not found")
    
    # Create temporary spin record
    spin = WheelSpin(
        user_id=current_user.id,
        prize_id=selected_prize.id,
        site_username=""  # Will be filled in confirm step
    )
    await db.spins.insert_one(spin.model_dump())
    
    return SpinPreviewResponse(spin=spin, prize=selected_prize, site=Site(**site))

app.include_router(api_router)

# Mount uploads directory
upload_dir = Path("/app/backend/uploads")
upload_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

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