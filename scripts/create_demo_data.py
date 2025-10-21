import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

async def create_demo_data():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['kazandiran_cark']
    
    pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
    
    # Create admin user
    admin = {
        'id': 'admin-001',
        'name': 'Admin',
        'surname': 'User',
        'email': 'admin@test.com',
        'phone': '+905551234567',
        'telegram_username': '@adminuser',
        'password_hash': pwd_context.hash('admin123'),
        'is_admin': True,
        'daily_spin_used': False,
        'last_spin_date': None,
        'extra_spins': 0
    }
    
    existing = await db.users.find_one({'email': 'admin@test.com'})
    if not existing:
        await db.users.insert_one(admin)
        print('✅ Admin user created: admin@test.com / admin123')
    
    # Clear existing data
    await db.sites.delete_many({})
    await db.prizes.delete_many({})
    await db.rules.delete_many({})
    print('✅ Cleared existing demo data')
    
    # Create sites with logos and bonuses
    sites = [
        {
            'id': 'site-001',
            'name': 'Sekabet',
            'logo_url': 'https://via.placeholder.com/150x60/FF6B35/FFFFFF?text=SEKABET',
            'welcome_bonus': '500 TL Deneme Bonusu'
        },
        {
            'id': 'site-002',
            'name': 'Supertotobet',
            'logo_url': 'https://via.placeholder.com/150x60/004E89/FFFFFF?text=SUPERTOTOBET',
            'welcome_bonus': '200 Freespin'
        },
        {
            'id': 'site-003',
            'name': 'Bets10',
            'logo_url': 'https://via.placeholder.com/150x60/1A936F/FFFFFF?text=BETS10',
            'welcome_bonus': '1000 TL Hoşgeldin Bonusu'
        },
        {
            'id': 'site-004',
            'name': 'Youwin',
            'logo_url': 'https://via.placeholder.com/150x60/C9184A/FFFFFF?text=YOUWIN',
            'welcome_bonus': '300 TL + 50 Freespin'
        },
        {
            'id': 'site-005',
            'name': 'Betboo',
            'logo_url': 'https://via.placeholder.com/150x60/6A4C93/FFFFFF?text=BETBOO',
            'welcome_bonus': '750 TL İlk Yatırım Bonusu'
        },
        {
            'id': 'site-006',
            'name': 'Mobilbahis',
            'logo_url': 'https://via.placeholder.com/150x60/F77F00/FFFFFF?text=MOBILBAHIS',
            'welcome_bonus': '100 TL Bedava Bahis'
        },
        {
            'id': 'site-007',
            'name': 'Betebet',
            'logo_url': 'https://via.placeholder.com/150x60/06A77D/FFFFFF?text=BETEBET',
            'welcome_bonus': '500 TL Kayıp Bonusu'
        },
        {
            'id': 'site-008',
            'name': 'Kralbet',
            'logo_url': 'https://via.placeholder.com/150x60/D62828/FFFFFF?text=KRALBET',
            'welcome_bonus': '150 Freespin'
        },
        {
            'id': 'site-009',
            'name': 'Superbahis',
            'logo_url': 'https://via.placeholder.com/150x60/003049/FFFFFF?text=SUPERBAHIS',
            'welcome_bonus': '2000 TL Yatırım Bonusu'
        },
        {
            'id': 'site-010',
            'name': 'Betpas',
            'logo_url': 'https://via.placeholder.com/150x60/774936/FFFFFF?text=BETPAS',
            'welcome_bonus': '250 TL Deneme Bonusu'
        },
        {
            'id': 'site-011',
            'name': 'Betist',
            'logo_url': 'https://via.placeholder.com/150x60/7209B7/FFFFFF?text=BETIST',
            'welcome_bonus': '400 TL + 100 Freespin'
        },
        {
            'id': 'site-012',
            'name': 'Dinamobet',
            'logo_url': 'https://via.placeholder.com/150x60/E63946/FFFFFF?text=DINAMOBET',
            'welcome_bonus': '1500 TL Hoşgeldin Paketi'
        }
    ]
    
    for site in sites:
        await db.sites.insert_one(site)
        print(f'✅ Site created: {site["name"]}')
    
    # Create prizes
    prizes = [
        # Sekabet
        {'id': 'prize-001', 'name': '1000 TL Nakit', 'site_id': 'site-001', 'description': 'Sekabet hesabınıza 1000 TL nakit yatırılacak', 'weight': 1},
        {'id': 'prize-002', 'name': '500 TL Bonus', 'site_id': 'site-001', 'description': 'Sekabet hesabınıza 500 TL bonus yatırılacak', 'weight': 2},
        {'id': 'prize-003', 'name': '100 TL Freebet', 'site_id': 'site-001', 'description': 'Sekabet hesabınıza 100 TL freebet tanımlanacak', 'weight': 5},
        
        # Supertotobet
        {'id': 'prize-004', 'name': '100 Freespin', 'site_id': 'site-002', 'description': 'Supertotobet hesabınıza 100 freespin tanımlanacak', 'weight': 4},
        {'id': 'prize-005', 'name': '50 Freespin', 'site_id': 'site-002', 'description': 'Supertotobet hesabınıza 50 freespin tanımlanacak', 'weight': 8},
        {'id': 'prize-006', 'name': '250 TL Bonus', 'site_id': 'site-002', 'description': 'Supertotobet hesabınıza 250 TL bonus yatırılacak', 'weight': 3},
        
        # Bets10
        {'id': 'prize-007', 'name': '750 TL Nakit', 'site_id': 'site-003', 'description': 'Bets10 hesabınıza 750 TL nakit yatırılacak', 'weight': 2},
        {'id': 'prize-008', 'name': '200 TL Freebet', 'site_id': 'site-003', 'description': 'Bets10 hesabınıza 200 TL freebet tanımlanacak', 'weight': 4},
        {'id': 'prize-009', 'name': '75 Freespin', 'site_id': 'site-003', 'description': 'Bets10 hesabınıza 75 freespin tanımlanacak', 'weight': 6},
        
        # Youwin
        {'id': 'prize-010', 'name': '500 TL Nakit', 'site_id': 'site-004', 'description': 'Youwin hesabınıza 500 TL nakit yatırılacak', 'weight': 2},
        {'id': 'prize-011', 'name': '150 TL Bonus', 'site_id': 'site-004', 'description': 'Youwin hesabınıza 150 TL bonus yatırılacak', 'weight': 5},
        
        # Betboo
        {'id': 'prize-012', 'name': '300 TL Freebet', 'site_id': 'site-005', 'description': 'Betboo hesabınıza 300 TL freebet tanımlanacak', 'weight': 3},
        {'id': 'prize-013', 'name': '100 Freespin', 'site_id': 'site-005', 'description': 'Betboo hesabınıza 100 freespin tanımlanacak', 'weight': 5},
        
        # Mobilbahis
        {'id': 'prize-014', 'name': '200 TL Nakit', 'site_id': 'site-006', 'description': 'Mobilbahis hesabınıza 200 TL nakit yatırılacak', 'weight': 4},
        {'id': 'prize-015', 'name': '50 TL Freebet', 'site_id': 'site-006', 'description': 'Mobilbahis hesabınıza 50 TL freebet tanımlanacak', 'weight': 10},
        
        # Betebet
        {'id': 'prize-016', 'name': '400 TL Bonus', 'site_id': 'site-007', 'description': 'Betebet hesabınıza 400 TL bonus yatırılacak', 'weight': 3},
        {'id': 'prize-017', 'name': '60 Freespin', 'site_id': 'site-007', 'description': 'Betebet hesabınıza 60 freespin tanımlanacak', 'weight': 7},
        
        # Kralbet
        {'id': 'prize-018', 'name': '350 TL Nakit', 'site_id': 'site-008', 'description': 'Kralbet hesabınıza 350 TL nakit yatırılacak', 'weight': 3},
        {'id': 'prize-019', 'name': '80 Freespin', 'site_id': 'site-008', 'description': 'Kralbet hesabınıza 80 freespin tanımlanacak', 'weight': 6},
        
        # Superbahis
        {'id': 'prize-020', 'name': '1500 TL Bonus', 'site_id': 'site-009', 'description': 'Superbahis hesabınıza 1500 TL bonus yatırılacak', 'weight': 1},
        {'id': 'prize-021', 'name': '250 TL Freebet', 'site_id': 'site-009', 'description': 'Superbahis hesabınıza 250 TL freebet tanımlanacak', 'weight': 4},
        
        # Betpas
        {'id': 'prize-022', 'name': '180 TL Nakit', 'site_id': 'site-010', 'description': 'Betpas hesabınıza 180 TL nakit yatırılacak', 'weight': 5},
        {'id': 'prize-023', 'name': '40 Freespin', 'site_id': 'site-010', 'description': 'Betpas hesabınıza 40 freespin tanımlanacak', 'weight': 9},
        
        # Betist
        {'id': 'prize-024', 'name': '600 TL Bonus', 'site_id': 'site-011', 'description': 'Betist hesabınıza 600 TL bonus yatırılacak', 'weight': 2},
        {'id': 'prize-025', 'name': '120 Freespin', 'site_id': 'site-011', 'description': 'Betist hesabınıza 120 freespin tanımlanacak', 'weight': 5},
        
        # Dinamobet
        {'id': 'prize-026', 'name': '800 TL Nakit', 'site_id': 'site-012', 'description': 'Dinamobet hesabınıza 800 TL nakit yatırılacak', 'weight': 2},
        {'id': 'prize-027', 'name': '150 TL Freebet', 'site_id': 'site-012', 'description': 'Dinamobet hesabınıza 150 TL freebet tanımlanacak', 'weight': 5},
        {'id': 'prize-028', 'name': '90 Freespin', 'site_id': 'site-012', 'description': 'Dinamobet hesabınıza 90 freespin tanımlanacak', 'weight': 7},
    ]
    
    for prize in prizes:
        await db.prizes.insert_one(prize)
    print(f'✅ {len(prizes)} prizes created')
    
    # Create rules
    rules = [
        {
            'id': 'rule-001',
            'title': 'Günlük Çark Hakkı',
            'description': 'Her kullanıcı günde 1 kere ücretsiz çark çevirme hakkına sahiptir.',
            'order': 1
        },
        {
            'id': 'rule-002',
            'title': 'Ekstra Çark Hakları',
            'description': 'Admin tarafından tanımlanan ekstra çark hakları ile günlük limitin üzerinde çark çevirebilirsiniz.',
            'order': 2
        },
        {
            'id': 'rule-003',
            'title': 'Ödül Kazanma',
            'description': 'Çarkı çevirdiğinizde rastgele bir ödül kazanırsınız. Her ödülün farklı kazanma olasılığı vardır.',
            'order': 3
        },
        {
            'id': 'rule-004',
            'title': 'Site Kullanıcı Adı',
            'description': 'Ödül kazandığınızda, o sitenin kullanıcı adınızı girmeniz gerekir. Ödülünüz bu hesaba tanımlanacaktır.',
            'order': 4
        },
        {
            'id': 'rule-005',
            'title': 'Admin Onayı',
            'description': 'Kazandığınız ödüller admin onayından sonra hesabınıza tanımlanır. Durum takibi için profilinizi kontrol edebilirsiniz.',
            'order': 5
        },
        {
            'id': 'rule-006',
            'title': 'Ödül Çeşitleri',
            'description': 'Kazanabileceğiniz ödüller arasında Nakit, Freebet, Freespin ve Bonus bulunmaktadır.',
            'order': 6
        },
        {
            'id': 'rule-007',
            'title': 'Hesap Doğrulama',
            'description': 'Ödül alabilmek için verdiğiniz site kullanıcı adının size ait olması gerekmektedir.',
            'order': 7
        },
        {
            'id': 'rule-008',
            'title': 'İletişim',
            'description': 'Ödülünüzle ilgili sorun yaşarsanız, Telegram üzerinden destek ekibimizle iletişime geçebilirsiniz.',
            'order': 8
        }
    ]
    
    for rule in rules:
        await db.rules.insert_one(rule)
    print(f'✅ {len(rules)} rules created')
    
    print('\n🎉 Demo data creation completed!')
    client.close()

if __name__ == '__main__':
    asyncio.run(create_demo_data())
