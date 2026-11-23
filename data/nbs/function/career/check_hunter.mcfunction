# ==========================================
# เช็กลิสต์สายนักล่ามอนสเตอร์ (Monster Hunter): ล่ามอน 30 ชนิด, ของดรอป, หัวมอน (Cap 3)
# ==========================================
scoreboard players add #t1_head team_boss_cnt 0
scoreboard players add #t2_head team_boss_cnt 0
scoreboard players add #t3_head team_boss_cnt 0
scoreboard players add #t4_head team_boss_cnt 0
scoreboard players add #t5_head team_boss_cnt 0
scoreboard players add #t6_head team_boss_cnt 0
scoreboard players add #t7_head team_boss_cnt 0
scoreboard players add #t8_head team_boss_cnt 0

# 1. สมุดล่ามอนสเตอร์ (ตรวจจาก Criterion ของ minecraft:adventure/kill_all_mobs)
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:zombie",key:"mb_zombie",pts:5,name:"[Hunter] สังหาร Zombie"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:skeleton",key:"mb_skeleton",pts:5,name:"[Hunter] สังหาร Skeleton"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:spider",key:"mb_spider",pts:5,name:"[Hunter] สังหาร Spider"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:creeper",key:"mb_creeper",pts:5,name:"[Hunter] สังหาร Creeper"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:drowned",key:"mb_drowned",pts:5,name:"[Hunter] สังหาร Drowned"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:husk",key:"mb_husk",pts:5,name:"[Hunter] สังหาร Husk"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:stray",key:"mb_stray",pts:5,name:"[Hunter] สังหาร Stray"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:bogged",key:"mb_bogged",pts:5,name:"[Hunter] สังหาร Bogged"}

function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:enderman",key:"mb_enderman",pts:10,name:"[Hunter] สังหาร Enderman"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:witch",key:"mb_witch",pts:10,name:"[Hunter] สังหาร Witch"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:slime",key:"mb_slime",pts:10,name:"[Hunter] สังหาร Slime"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:pillager",key:"mb_pillager",pts:10,name:"[Hunter] สังหาร Pillager"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:vindicator",key:"mb_vindicator",pts:10,name:"[Hunter] สังหาร Vindicator"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:phantom",key:"mb_phantom",pts:10,name:"[Hunter] สังหาร Phantom"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:blaze",key:"mb_blaze",pts:10,name:"[Hunter] สังหาร Blaze"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:magma_cube",key:"mb_magma",pts:10,name:"[Hunter] สังหาร Magma Cube"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:piglin",key:"mb_piglin",pts:10,name:"[Hunter] สังหาร Piglin"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:hoglin",key:"mb_hoglin",pts:10,name:"[Hunter] สังหาร Hoglin"}

function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:ghast",key:"mb_ghast",pts:20,name:"[Hunter] สังหาร Ghast"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:cave_spider",key:"mb_cavespider",pts:20,name:"[Hunter] สังหาร Cave Spider"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:silverfish",key:"mb_silverfish",pts:20,name:"[Hunter] สังหาร Silverfish"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:guardian",key:"mb_guardian",pts:20,name:"[Hunter] สังหาร Guardian"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:evoker",key:"mb_evoker",pts:20,name:"[Hunter] สังหาร Evoker"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:ravager",key:"mb_ravager",pts:20,name:"[Hunter] สังหาร Ravager"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:breeze",key:"mb_breeze",pts:20,name:"[Hunter] สังหาร Breeze"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:shulker",key:"mb_shulker",pts:20,name:"[Hunter] สังหาร Shulker"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:piglin_brute",key:"mb_brute",pts:20,name:"[Hunter] สังหาร Piglin Brute"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:zoglin",key:"mb_zoglin",pts:20,name:"[Hunter] สังหาร Zoglin"}

function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:wither_skeleton",key:"mb_witherskel",pts:35,name:"[Hunter] สังหาร Wither Skeleton"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:vex",key:"mb_vex",pts:35,name:"[Hunter] สังหาร Vex"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:endermite",key:"mb_endermite",pts:35,name:"[Hunter] สังหาร Endermite"}
function nbs:career/sync_crit {cat:"hunter",adv:"minecraft:adventure/kill_all_mobs",crit:"minecraft:creaking",key:"mb_creaking",pts:35,name:"[Hunter] สังหาร Creaking"}

# 2. ของดรอปหายาก
function nbs:career/sync_item {cat:"hunter",key:"dr_breeze_rod",item:"minecraft:breeze_rod",pts:20,name:"[Hunter] Breeze Rod"}
function nbs:career/sync_item {cat:"hunter",key:"dr_totem",item:"minecraft:totem_of_undying",pts:25,name:"[Hunter] Totem of Undying"}
function nbs:career/sync_item {cat:"hunter",key:"dr_wither_skull",item:"minecraft:wither_skeleton_skull",pts:30,name:"[Hunter] Wither Skeleton Skull"}
function nbs:career/sync_item {cat:"hunter",key:"dr_trident",item:"minecraft:trident",pts:35,name:"[Hunter] ตรีศูล (Trident)"}

# 3. หัวมอนสเตอร์จาก Charged Creeper (Cap สูงสุด 3 ชนิดต่อทีม, max_prev = 2)
function nbs:career/sync_capped_item {cat:"hunter",cap_id:"head",max_prev:2,key:"hd_zombie",item:"minecraft:zombie_head",pts:30,name:"[Hunter] หัวซอมบี้ (Zombie Head)"}
function nbs:career/sync_capped_item {cat:"hunter",cap_id:"head",max_prev:2,key:"hd_skeleton",item:"minecraft:skeleton_skull",pts:30,name:"[Hunter] หัวสเกเลตัน (Skeleton Skull)"}
function nbs:career/sync_capped_item {cat:"hunter",cap_id:"head",max_prev:2,key:"hd_creeper",item:"minecraft:creeper_head",pts:30,name:"[Hunter] หัวครีปเปอร์ (Creeper Head)"}
function nbs:career/sync_capped_item {cat:"hunter",cap_id:"head",max_prev:2,key:"hd_piglin",item:"minecraft:piglin_head",pts:30,name:"[Hunter] หัวพิกลิน (Piglin Head)"}
