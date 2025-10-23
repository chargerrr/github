import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

async def create_complete_demo_data():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['kazandiran_cark']
    
    pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
    
    # Clear all existing data
    await db.sites.delete_many({})
    await db.prizes.delete_many({})
    print('✅ Cleared existing demo data')
    
    # Create comprehensive sites with logos
    sites = [
        # Ana Sponsorlar
        {'id': 'site-001', 'name': 'Sekabet', 'logo_url': 'https://via.placeholder.com/150x60/FF6B35/FFFFFF?text=SEKABET', 'welcome_bonus': '1000 TL Hoşgeldin Bonusu', 'category': 'main_sponsor', 'order': 1},
        {'id': 'site-002', 'name': 'Supertotobet', 'logo_url': 'https://via.placeholder.com/150x60/004E89/FFFFFF?text=SUPERTOTOBET', 'welcome_bonus': '500 TL + 200 Freespin', 'category': 'main_sponsor', 'order': 2},
        {'id': 'site-003', 'name': 'Bets10', 'logo_url': 'https://via.placeholder.com/150x60/1A936F/FFFFFF?text=BETS10', 'welcome_bonus': '2000 TL İlk Yatırım', 'category': 'main_sponsor', 'order': 3},
        {'id': 'site-004', 'name': 'Youwin', 'logo_url': 'https://via.placeholder.com/150x60/C9184A/FFFFFF?text=YOUWIN', 'welcome_bonus': '750 TL Deneme Bonusu', 'category': 'main_sponsor', 'order': 4},
        
        # Editörün Seçimi
        {'id': 'site-005', 'name': 'Betboo', 'logo_url': 'https://via.placeholder.com/150x60/6A4C93/FFFFFF?text=BETBOO', 'welcome_bonus': '1500 TL Kayıp Bonusu', 'category': 'editor_choice', 'order': 5},
        {'id': 'site-006', 'name': 'Mobilbahis', 'logo_url': 'https://via.placeholder.com/150x60/F77F00/FFFFFF?text=MOBILBAHIS', 'welcome_bonus': '300 TL Freebet', 'category': 'editor_choice', 'order': 6},
        {'id': 'site-007', 'name': 'Betebet', 'logo_url': 'https://via.placeholder.com/150x60/06A77D/FFFFFF?text=BETEBET', 'welcome_bonus': '600 TL + 100 Freespin', 'category': 'editor_choice', 'order': 7},
        {'id': 'site-008', 'name': 'Kralbet', 'logo_url': 'https://via.placeholder.com/150x60/D62828/FFFFFF?text=KRALBET', 'welcome_bonus': '400 TL Hoşgeldin', 'category': 'editor_choice', 'order': 8},
        
        # Ayın Siteleri
        {'id': 'site-009', 'name': 'Superbahis', 'logo_url': 'https://via.placeholder.com/150x60/003049/FFFFFF?text=SUPERBAHIS', 'welcome_bonus': '2500 TL Mega Bonus', 'category': 'monthly', 'order': 9},
        {'id': 'site-010', 'name': 'Betpas', 'logo_url': 'https://via.placeholder.com/150x60/774936/FFFFFF?text=BETPAS', 'welcome_bonus': '350 TL Deneme', 'category': 'monthly', 'order': 10},
        {'id': 'site-011', 'name': 'Betist', 'logo_url': 'https://via.placeholder.com/150x60/7209B7/FFFFFF?text=BETIST', 'welcome_bonus': '800 TL İlk Yatırım', 'category': 'monthly', 'order': 11},
        {'id': 'site-012', 'name': 'Dinamobet', 'logo_url': 'https://via.placeholder.com/150x60/E63946/FFFFFF?text=DINAMOBET', 'welcome_bonus': '1200 TL Hoşgeldin Paketi', 'category': 'monthly', 'order': 12},
        
        # Yılın Siteleri
        {'id': 'site-013', 'name': 'Marsbahis', 'logo_url': 'https://via.placeholder.com/150x60/780000/FFFFFF?text=MARSBAHIS', 'welcome_bonus': '3000 TL VIP Bonus', 'category': 'yearly', 'order': 13},
        {'id': 'site-014', 'name': 'Casinometropol', 'logo_url': 'https://via.placeholder.com/150x60/03045E/FFFFFF?text=CASINOMETROPOL', 'welcome_bonus': '5000 TL Casino Bonusu', 'category': 'yearly', 'order': 14},
        {'id': 'site-015', 'name': 'Betnano', 'logo_url': 'https://via.placeholder.com/150x60/0077B6/FFFFFF?text=BETNANO', 'welcome_bonus': '1000 TL + 250 Freespin', 'category': 'yearly', 'order': 15},
        {'id': 'site-016', 'name': 'Bahsegel', 'logo_url': 'https://via.placeholder.com/150x60/9D4EDD/FFFFFF?text=BAHSEGEL', 'welcome_bonus': '2000 TL Yatırım Bonusu', 'category': 'yearly', 'order': 16},
        
        # En Çok Kazandıran
        {'id': 'site-017', 'name': 'Tipobet', 'logo_url': 'https://via.placeholder.com/150x60/D00000/FFFFFF?text=TIPOBET', 'welcome_bonus': '1500 TL Slot Bonusu', 'category': 'top_winners', 'order': 17},
        {'id': 'site-018', 'name': 'Bahigo', 'logo_url': 'https://via.placeholder.com/150x60/FFB703/000000?text=BAHIGO', 'welcome_bonus': '2200 TL Jackpot Bonus', 'category': 'top_winners', 'order': 18},
        {'id': 'site-019', 'name': 'Piabet', 'logo_url': 'https://via.placeholder.com/150x60/023047/FFFFFF?text=PIABET', 'welcome_bonus': '1800 TL Casino', 'category': 'top_winners', 'order': 19},
        {'id': 'site-020', 'name': 'Betlike', 'logo_url': 'https://via.placeholder.com/150x60/F72585/FFFFFF?text=BETLIKE', 'welcome_bonus': '900 TL Freebet', 'category': 'top_winners', 'order': 20},
        
        # Diğer
        {'id': 'site-021', 'name': 'Kolaybet', 'logo_url': 'https://via.placeholder.com/150x60/4361EE/FFFFFF?text=KOLAYBET', 'welcome_bonus': '500 TL Bonus', 'category': 'other', 'order': 21},
        {'id': 'site-022', 'name': 'Vdcasino', 'logo_url': 'https://via.placeholder.com/150x60/7209B7/FFFFFF?text=VDCASINO', 'welcome_bonus': '1000 TL Casino', 'category': 'other', 'order': 22},
    ]
    
    for site in sites:
        await db.sites.insert_one(site)
        print(f'✅ Site created: {site["name"]} ({site["category"]})')
    
    # Create comprehensive prizes for all sites
    prizes = []
    prize_id_counter = 1
    
    prize_templates = [
        {'type': 'nakit', 'amounts': [50, 100, 200, 500, 1000, 2000]},
        {'type': 'bonus', 'amounts': [100, 250, 500, 750, 1000]},
        {'type': 'freespin', 'amounts': [20, 50, 75, 100, 150, 200]},
        {'type': 'freebet', 'amounts': [50, 100, 200, 300, 500]},
    ]
    
    for site in sites:
        # Add 4-6 prizes per site
        num_prizes = 5
        for i in range(num_prizes):
            template = prize_templates[i % len(prize_templates)]
            amount = template['amounts'][i % len(template['amounts'])]
            
            if template['type'] == 'nakit':
                name = f"{amount} TL Nakit"
                desc = f"{site['name']} hesabınıza {amount} TL nakit yatırılacak"
                weight = 10 - (amount // 200)  # Bigger amounts = lower weight
            elif template['type'] == 'bonus':
                name = f"{amount} TL Bonus"
                desc = f"{site['name']} hesabınıza {amount} TL bonus yatırılacak"
                weight = 8 - (amount // 250)
            elif template['type'] == 'freespin':
                name = f"{amount} Freespin"
                desc = f"{site['name']} hesabınıza {amount} freespin tanımlanacak"
                weight = 12 - (amount // 50)
            else:  # freebet
                name = f"{amount} TL Freebet"
                desc = f"{site['name']} hesabınıza {amount} TL freebet tanımlanacak"
                weight = 9 - (amount // 150)
            
            prizes.append({
                'id': f'prize-{str(prize_id_counter).zfill(3)}',
                'name': name,
                'site_id': site['id'],
                'description': desc,
                'weight': max(1, weight)
            })
            prize_id_counter += 1
    
    for prize in prizes:
        await db.prizes.insert_one(prize)
    
    print(f'✅ {len(prizes)} prizes created for all sites')
    
    print('\n🎉 Complete demo data created successfully!')
    print(f'📊 Total Sites: {len(sites)}')
    print(f'📊 Total Prizes: {len(prizes)}')
    print('\nCategories:')
    print('  - Ana Sponsorlar: 4 sites')
    print('  - Editörün Seçimi: 4 sites')
    print('  - Ayın Siteleri: 4 sites')
    print('  - Yılın Siteleri: 4 sites')
    print('  - En Çok Kazandıran: 4 sites')
    print('  - Diğer: 2 sites')
    
    client.close()

if __name__ == '__main__':
    asyncio.run(create_complete_demo_data())
