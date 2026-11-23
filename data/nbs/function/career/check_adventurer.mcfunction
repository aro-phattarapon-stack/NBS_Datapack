# ==========================================
# เช็กลิสต์สายนักผจญภัย (Adventurer): 16 โครงสร้าง, Pottery Sherds (Cap 12/23), แผ่นเพลง & ของโบราณ
# ==========================================
scoreboard players add #t1_sherd team_boss_cnt 0
scoreboard players add #t2_sherd team_boss_cnt 0
scoreboard players add #t3_sherd team_boss_cnt 0
scoreboard players add #t4_sherd team_boss_cnt 0
scoreboard players add #t5_sherd team_boss_cnt 0
scoreboard players add #t6_sherd team_boss_cnt 0
scoreboard players add #t7_sherd team_boss_cnt 0
scoreboard players add #t8_sherd team_boss_cnt 0

# 1. ค้นพบโครงสร้างโบราณ 16 แห่ง (ตรวจจาก nbs:adventurer_structures)
function nbs:career/sync_crit {cat:"adventurer",adv:"nbs:adventurer_structures",crit:"village",key:"st_village",pts:15,name:"[Adventurer] ค้นพบหมู่บ้าน (Village)"}
function nbs:career/sync_crit {cat:"adventurer",adv:"nbs:adventurer_structures",crit:"desert_pyramid",key:"st_desert",pts:15,name:"[Adventurer] ค้นพบพีระมิดทะเลทราย (Desert Temple)"}
function nbs:career/sync_crit {cat:"adventurer",adv:"nbs:adventurer_structures",crit:"jungle_pyramid",key:"st_jungle",pts:15,name:"[Adventurer] ค้นพบวิหารป่าดงดิบ (Jungle Temple)"}
function nbs:career/sync_crit {cat:"adventurer",adv:"nbs:adventurer_structures",crit:"shipwreck",key:"st_shipwreck",pts:15,name:"[Adventurer] ค้นพบซากเรืออับปาง (Shipwreck)"}
function nbs:career/sync_crit {cat:"adventurer",adv:"nbs:adventurer_structures",crit:"pillager_outpost",key:"st_outpost",pts:15,name:"[Adventurer] ค้นพบหอคอยกองโจร (Pillager Outpost)"}
function nbs:career/sync_crit {cat:"adventurer",adv:"nbs:adventurer_structures",crit:"igloo",key:"st_igloo",pts:15,name:"[Adventurer] ค้นพบกระท่อมน้ำแข็ง (Igloo)"}
function nbs:career/sync_crit {cat:"adventurer",adv:"nbs:adventurer_structures",crit:"ruined_portal",key:"st_portal",pts:15,name:"[Adventurer] ค้นพบซากประตูมิติ (Ruined Portal)"}

function nbs:career/sync_crit {cat:"adventurer",adv:"nbs:adventurer_structures",crit:"monument",key:"st_monument",pts:25,name:"[Adventurer] ค้นพบวิหารใต้น้ำ (Ocean Monument)"}
function nbs:career/sync_crit {cat:"adventurer",adv:"nbs:adventurer_structures",crit:"fortress",key:"st_fortress",pts:25,name:"[Adventurer] ค้นพบป้อมปราการเนเธอร์ (Nether Fortress)"}
function nbs:career/sync_crit {cat:"adventurer",adv:"nbs:adventurer_structures",crit:"bastion_remnant",key:"st_bastion",pts:25,name:"[Adventurer] ค้นพบป้อมพิกลิน (Bastion Remnant)"}
function nbs:career/sync_crit {cat:"adventurer",adv:"nbs:adventurer_structures",crit:"trail_ruins",key:"st_trail",pts:25,name:"[Adventurer] ค้นพบซากโบราณสถาน (Trail Ruins)"}
function nbs:career/sync_crit {cat:"adventurer",adv:"nbs:adventurer_structures",crit:"trial_chambers",key:"st_trial",pts:25,name:"[Adventurer] ค้นพบห้องบททดสอบ (Trial Chambers)"}

function nbs:career/sync_crit {cat:"adventurer",adv:"nbs:adventurer_structures",crit:"mansion",key:"st_mansion",pts:45,name:"[Adventurer] ค้นพบคฤหาสน์กลางป่า (Woodland Mansion)"}
function nbs:career/sync_crit {cat:"adventurer",adv:"nbs:adventurer_structures",crit:"ancient_city",key:"st_ancient",pts:45,name:"[Adventurer] ค้นพบเมืองโบราณใต้พิภพ (Ancient City)"}
function nbs:career/sync_crit {cat:"adventurer",adv:"nbs:adventurer_structures",crit:"stronghold",key:"st_stronghold",pts:45,name:"[Adventurer] ค้นพบปราการใต้ดิน (Stronghold)"}
function nbs:career/sync_crit {cat:"adventurer",adv:"nbs:adventurer_structures",crit:"end_city",key:"st_endcity",pts:45,name:"[Adventurer] ค้นพบนครแห่งจุดจบ (End City)"}

# 2. Pottery Sherds 23 ลาย (Cap สูงสุด 12 ลายต่อทีม, max_prev = 11)
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_angler",item:"minecraft:angler_pottery_sherd",pts:10,name:"[Adventurer] Angler Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_archer",item:"minecraft:archer_pottery_sherd",pts:10,name:"[Adventurer] Archer Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_arms_up",item:"minecraft:arms_up_pottery_sherd",pts:10,name:"[Adventurer] Arms Up Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_blade",item:"minecraft:blade_pottery_sherd",pts:10,name:"[Adventurer] Blade Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_brewer",item:"minecraft:brewer_pottery_sherd",pts:10,name:"[Adventurer] Brewer Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_burn",item:"minecraft:burn_pottery_sherd",pts:10,name:"[Adventurer] Burn Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_danger",item:"minecraft:danger_pottery_sherd",pts:10,name:"[Adventurer] Danger Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_explorer",item:"minecraft:explorer_pottery_sherd",pts:10,name:"[Adventurer] Explorer Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_flow",item:"minecraft:flow_pottery_sherd",pts:10,name:"[Adventurer] Flow Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_friend",item:"minecraft:friend_pottery_sherd",pts:10,name:"[Adventurer] Friend Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_guster",item:"minecraft:guster_pottery_sherd",pts:10,name:"[Adventurer] Guster Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_heart",item:"minecraft:heart_pottery_sherd",pts:10,name:"[Adventurer] Heart Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_heartbreak",item:"minecraft:heartbreak_pottery_sherd",pts:10,name:"[Adventurer] Heartbreak Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_howl",item:"minecraft:howl_pottery_sherd",pts:10,name:"[Adventurer] Howl Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_miner",item:"minecraft:miner_pottery_sherd",pts:10,name:"[Adventurer] Miner Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_mourner",item:"minecraft:mourner_pottery_sherd",pts:10,name:"[Adventurer] Mourner Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_plenty",item:"minecraft:plenty_pottery_sherd",pts:10,name:"[Adventurer] Plenty Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_prize",item:"minecraft:prize_pottery_sherd",pts:10,name:"[Adventurer] Prize Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_scrape",item:"minecraft:scrape_pottery_sherd",pts:10,name:"[Adventurer] Scrape Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_sheaf",item:"minecraft:sheaf_pottery_sherd",pts:10,name:"[Adventurer] Sheaf Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_shelter",item:"minecraft:shelter_pottery_sherd",pts:10,name:"[Adventurer] Shelter Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_skull",item:"minecraft:skull_pottery_sherd",pts:10,name:"[Adventurer] Skull Pottery Sherd"}
function nbs:career/sync_capped_item {cat:"adventurer",cap_id:"sherd",max_prev:11,key:"sh_snort",item:"minecraft:snort_pottery_sherd",pts:10,name:"[Adventurer] Snort Pottery Sherd"}

# 3. แผ่นเพลง & ของโบราณหายาก
function nbs:career/sync_item {cat:"adventurer",key:"dc_13",item:"minecraft:music_disc_13",pts:15,name:"[Adventurer] Music Disc (13)"}
function nbs:career/sync_item {cat:"adventurer",key:"dc_cat",item:"minecraft:music_disc_cat",pts:15,name:"[Adventurer] Music Disc (Cat)"}
function nbs:career/sync_item {cat:"adventurer",key:"dc_otherside",item:"minecraft:music_disc_otherside",pts:35,name:"[Adventurer] Music Disc (Otherside)"}
function nbs:career/sync_item {cat:"adventurer",key:"dc_relic",item:"minecraft:music_disc_relic",pts:35,name:"[Adventurer] Music Disc (Relic)"}
function nbs:career/sync_item {cat:"adventurer",key:"dc_precipice",item:"minecraft:music_disc_precipice",pts:35,name:"[Adventurer] Music Disc (Precipice)"}
function nbs:career/sync_item {cat:"adventurer",key:"dc_pigstep",item:"minecraft:music_disc_pigstep",pts:40,name:"[Adventurer] Music Disc (Pigstep)"}
function nbs:career/sync_item {cat:"adventurer",key:"dc_creator",item:"minecraft:music_disc_creator",pts:40,name:"[Adventurer] Music Disc (Creator)"}

function nbs:career/sync_item {cat:"adventurer",key:"af_recovery",item:"minecraft:recovery_compass",pts:30,name:"[Adventurer] เข็มทิศกู้คืน (Recovery Compass)"}
function nbs:career/sync_item {cat:"adventurer",key:"af_conduit",item:"minecraft:conduit",pts:40,name:"[Adventurer] คอนดูอิท (Conduit)"}
function nbs:career/sync_item {cat:"adventurer",key:"af_dragon_head",item:"minecraft:dragon_head",pts:45,name:"[Adventurer] หัวมังกร (Dragon Head)"}
function nbs:career/sync_item {cat:"adventurer",key:"af_egapple",item:"minecraft:enchanted_golden_apple",pts:50,name:"[Adventurer] แอปเปิลทองคำร่ายมนตร์ (Enchanted Golden Apple)"}
function nbs:career/sync_item {cat:"adventurer",key:"af_elytra",item:"minecraft:elytra",pts:50,name:"[Adventurer] ปีกอิไลตรา (Elytra)"}
