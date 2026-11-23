# ==========================================
# สร้างป้อมปราการ The Citadel (0, 0) ขนาด 31x31 + ลานสวนล้อมรอบ + เคลียร์ต้นไม้ไม่เฉือนเขา + โดม 2 ชั้น + Beacon
# ==========================================
scoreboard objectives add nbs_wg_tmp dummy
forceload add -24 -24 24 24

kill @e[tag=spawn_anchor]
kill @e[tag=citadel_built_anchor]
kill @e[type=minecraft:text_display,tag=citadel_title]
kill @e[tag=citadel_npc]
kill @e[tag=citadel_npc_hit]

# 1. เสกหมุดและไต่ลงผ่านเรือนยอดไม้/เห็ดยักษ์ จนแตะพื้นดินแข็งจริง แล้วขยับขึ้น +1 บล็อกให้โดดเด่นเหนือตีนเขา/แม่น้ำ
summon minecraft:marker 0 120 0 {Tags:["spawn_anchor","citadel_built_anchor"]}
spreadplayers 0 0 0 1 false @e[tag=spawn_anchor,limit=1]
scoreboard players set #wg_steps nbs_wg_tmp 0
execute as @e[tag=spawn_anchor,limit=1] at @s run function nbs_worldgen:ground_anchor
execute as @e[tag=spawn_anchor,limit=1] at @s align xyz run tp @s ~0.5 ~1 ~0.5

# 2. เคลียร์ต้นไม้ ใบไม้ เถาวัลย์ และเห็ดยักษ์รอบป้อมในรัศมี 24 บล็อกออกทั้งต้น (แบ่งชั้นละ <= 32,768 บล็อก กันตอ/ใบไม้โดนผ่าครึ่งโดยไม่เฉือนภูเขาดิน)
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-24 ~20 ~-24 ~24 ~28 ~24 minecraft:air replace #nbs_worldgen:foliage_clear
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-24 ~10 ~-24 ~24 ~19 ~24 minecraft:air replace #nbs_worldgen:foliage_clear
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-24 ~ ~-24 ~24 ~9 ~24 minecraft:air replace #nbs_worldgen:foliage_clear
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-23 ~-4 ~-23 ~23 ~-1 ~23 minecraft:air replace #nbs_worldgen:foliage_clear

# ปาดหน้าผาเฉพาะแนวชิดป้อมและทางเดินไล่ระดับเบาๆ ให้เปิดโล่ง
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-19 ~5 ~-19 ~19 ~16 ~19 minecraft:air
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-17 ~2 ~-17 ~17 ~4 ~17 minecraft:air
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~ ~-15 ~15 ~1 ~15 minecraft:air
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-5 ~-1 ~-20 ~5 ~1 ~20 minecraft:air
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-20 ~-1 ~-5 ~20 ~1 ~5 minecraft:air

# 3. ฐานรากหินลึก 30 บล็อก (แทนที่เฉพาะอากาศ/น้ำ ไม่ลบภูเขาเดิม) + ลานหญ้า/มอสล้อมป้อมถึงเสาไฟ (±19)
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-19 ~-15 ~-19 ~19 ~-3 ~19 minecraft:mossy_stone_bricks replace #nbs_worldgen:ground_passthrough
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~-30 ~-15 ~15 ~-16 ~15 minecraft:deepslate_bricks replace #nbs_worldgen:ground_passthrough
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-19 ~-2 ~-19 ~19 ~-2 ~19 minecraft:grass_block replace #nbs_worldgen:ground_passthrough

# เสารากค้ำ 4 มุมลึกลงถึงก้นฐาน + ขอบสวนธรรมชาติรอบป้อม
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~-25 ~-15 ~-14 ~-2 ~-14 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~14 ~-25 ~-15 ~15 ~-2 ~-14 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~-25 ~14 ~-14 ~-2 ~15 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~14 ~-25 ~14 ~15 ~-2 ~15 minecraft:deepslate_bricks

execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-17 ~-2 ~-17 ~17 ~-2 ~17 minecraft:mossy_stone_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-16 ~-2 ~-16 ~16 ~-2 ~16 minecraft:stone_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~-2 ~-15 ~15 ~-2 ~15 minecraft:stone_bricks

# ทางเดินหินเชื่อมประตู 4 ทิศ (กว้าง 5 บล็อก ยื่นออก 4 ทิศ) + โคมไฟริมทาง
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-2 ~-2 ~-20 ~2 ~-2 ~-17 minecraft:polished_andesite
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-2 ~-2 ~17 ~2 ~-2 ~20 minecraft:polished_andesite
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-20 ~-2 ~-2 ~-17 ~-2 ~2 minecraft:polished_andesite
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~17 ~-2 ~-2 ~20 ~-2 ~2 minecraft:polished_andesite

execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-3 ~-1 ~-19 minecraft:cobblestone_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-3 ~ ~-19 minecraft:lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~3 ~-1 ~-19 minecraft:cobblestone_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~3 ~ ~-19 minecraft:lantern

execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-3 ~-1 ~19 minecraft:cobblestone_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-3 ~ ~19 minecraft:lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~3 ~-1 ~19 minecraft:cobblestone_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~3 ~ ~19 minecraft:lantern

execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~19 ~-1 ~-3 minecraft:cobblestone_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~19 ~ ~-3 minecraft:lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~19 ~-1 ~3 minecraft:cobblestone_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~19 ~ ~3 minecraft:lantern

execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-19 ~-1 ~-3 minecraft:cobblestone_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-19 ~ ~-3 minecraft:lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-19 ~-1 ~3 minecraft:cobblestone_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-19 ~ ~3 minecraft:lantern

# 4. ปูพื้นป้อมปราการขนาด 31x31 + ทางเดินกากบาทเข้าสู่ 4 ประตู
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~-1 ~-15 ~15 ~-1 ~15 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-14 ~-1 ~-14 ~14 ~-1 ~14 minecraft:stone_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-9 ~-1 ~-9 ~9 ~-1 ~9 minecraft:polished_deepslate
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-14 ~-1 ~-2 ~14 ~-1 ~2 minecraft:polished_andesite
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-2 ~-1 ~-14 ~2 ~-1 ~14 minecraft:polished_andesite
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-14 ~-1 ~-1 ~14 ~-1 ~1 minecraft:chiseled_stone_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-1 ~-1 ~-14 ~1 ~-1 ~14 minecraft:chiseled_stone_bricks

# 5. เสา Beacon กลางป้อม (0, 0) ยิงแสงขึ้นฟ้าตรงจุดรวมพล
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-1 ~-3 ~-1 ~1 ~-3 ~1 minecraft:iron_block
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~ ~-2 ~ minecraft:beacon
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~ ~-1 ~ minecraft:white_stained_glass

# 6. ตารางไฟสว่าง (Sea Lantern + Shroomlight) ฝังทั่วลาน
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-4 ~-1 ~-4 minecraft:sea_lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~4 ~-1 ~-4 minecraft:sea_lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-4 ~-1 ~4 minecraft:sea_lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~4 ~-1 ~4 minecraft:sea_lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-12 ~-1 ~-4 minecraft:sea_lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~12 ~-1 ~-4 minecraft:sea_lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-12 ~-1 ~4 minecraft:sea_lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~12 ~-1 ~4 minecraft:sea_lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-4 ~-1 ~-12 minecraft:sea_lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~4 ~-1 ~-12 minecraft:sea_lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-4 ~-1 ~12 minecraft:sea_lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~4 ~-1 ~12 minecraft:sea_lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-12 ~-1 ~-12 minecraft:shroomlight
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~12 ~-1 ~-12 minecraft:shroomlight
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-12 ~-1 ~12 minecraft:shroomlight
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~12 ~-1 ~12 minecraft:shroomlight
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~ ~-1 ~-11 minecraft:shroomlight
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~ ~-1 ~11 minecraft:shroomlight
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~11 ~-1 ~ minecraft:shroomlight
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-11 ~-1 ~ minecraft:shroomlight

# 7. กำแพงขอบป้อม + บันไดทางขึ้นกว้าง 7 บล็อกทั้ง 4 ทิศ
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~ ~-15 ~15 ~ ~-15 minecraft:deepslate_brick_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~ ~15 ~15 ~ ~15 minecraft:deepslate_brick_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~ ~-15 ~-15 ~ ~15 minecraft:deepslate_brick_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~15 ~ ~-15 ~15 ~ ~15 minecraft:deepslate_brick_wall

execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-3 ~ ~-15 ~3 ~ ~-15 minecraft:air
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-3 ~ ~15 ~3 ~ ~15 minecraft:air
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~ ~-3 ~-15 ~ ~3 minecraft:air
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~15 ~ ~-3 ~15 ~ ~3 minecraft:air

execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-3 ~-1 ~-16 ~3 ~-1 ~-16 minecraft:deepslate_brick_stairs[facing=south]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-3 ~-1 ~16 ~3 ~-1 ~16 minecraft:deepslate_brick_stairs[facing=north]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~16 ~-1 ~-3 ~16 ~-1 ~3 minecraft:deepslate_brick_stairs[facing=west]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-16 ~-1 ~-3 ~-16 ~-1 ~3 minecraft:deepslate_brick_stairs[facing=east]

# 8. ซุ้มประตูโค้ง 4 ทิศ (ใช้ Stairs กลับหัว + Slab) และหอคอย 4 มุมพร้อมใบเสมา (Crenellations)
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-4 ~ ~-15 ~-4 ~4 ~-15 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~4 ~ ~-15 ~4 ~4 ~-15 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-4 ~5 ~-15 ~4 ~5 ~-15 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-4 ~6 ~-15 ~4 ~6 ~-15 minecraft:deepslate_brick_slab[type=bottom]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-3 ~4 ~-15 minecraft:deepslate_brick_stairs[facing=west,half=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~3 ~4 ~-15 minecraft:deepslate_brick_stairs[facing=east,half=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-2 ~4 ~-15 ~2 ~4 ~-15 minecraft:deepslate_brick_slab[type=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~ ~3 ~-15 minecraft:lantern[hanging=true]

execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-4 ~ ~15 ~-4 ~4 ~15 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~4 ~ ~15 ~4 ~4 ~15 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-4 ~5 ~15 ~4 ~5 ~15 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-4 ~6 ~15 ~4 ~6 ~15 minecraft:deepslate_brick_slab[type=bottom]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-3 ~4 ~15 minecraft:deepslate_brick_stairs[facing=west,half=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~3 ~4 ~15 minecraft:deepslate_brick_stairs[facing=east,half=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-2 ~4 ~15 ~2 ~4 ~15 minecraft:deepslate_brick_slab[type=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~ ~3 ~15 minecraft:lantern[hanging=true]

execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~15 ~ ~-4 ~15 ~4 ~-4 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~15 ~ ~4 ~15 ~4 ~4 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~15 ~5 ~-4 ~15 ~5 ~4 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~15 ~6 ~-4 ~15 ~6 ~4 minecraft:deepslate_brick_slab[type=bottom]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~15 ~4 ~-3 minecraft:deepslate_brick_stairs[facing=north,half=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~15 ~4 ~3 minecraft:deepslate_brick_stairs[facing=south,half=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~15 ~4 ~-2 ~15 ~4 ~2 minecraft:deepslate_brick_slab[type=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~15 ~3 ~ minecraft:lantern[hanging=true]

execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~ ~-4 ~-15 ~4 ~-4 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~ ~4 ~-15 ~4 ~4 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~5 ~-4 ~-15 ~5 ~4 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~6 ~-4 ~-15 ~6 ~4 minecraft:deepslate_brick_slab[type=bottom]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-15 ~4 ~-3 minecraft:deepslate_brick_stairs[facing=north,half=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-15 ~4 ~3 minecraft:deepslate_brick_stairs[facing=south,half=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~4 ~-2 ~-15 ~4 ~2 minecraft:deepslate_brick_slab[type=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-15 ~3 ~ minecraft:lantern[hanging=true]

# หอคอยมุม 4 มุม (3x3x6 + ใบเสมา + Soul Lantern)
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~ ~-15 ~-13 ~5 ~-13 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-15 ~6 ~-15 minecraft:deepslate_brick_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-13 ~6 ~-15 minecraft:deepslate_brick_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-15 ~6 ~-13 minecraft:deepslate_brick_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-14 ~6 ~-14 minecraft:soul_lantern

execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~13 ~ ~-15 ~15 ~5 ~-13 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~15 ~6 ~-15 minecraft:deepslate_brick_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~13 ~6 ~-15 minecraft:deepslate_brick_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~15 ~6 ~-13 minecraft:deepslate_brick_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~14 ~6 ~-14 minecraft:soul_lantern

execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-15 ~ ~13 ~-13 ~5 ~15 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-15 ~6 ~15 minecraft:deepslate_brick_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-13 ~6 ~15 minecraft:deepslate_brick_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-15 ~6 ~13 minecraft:deepslate_brick_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-14 ~6 ~14 minecraft:soul_lantern

execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~13 ~ ~13 ~15 ~5 ~15 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~15 ~6 ~15 minecraft:deepslate_brick_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~13 ~6 ~15 minecraft:deepslate_brick_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~15 ~6 ~13 minecraft:deepslate_brick_wall
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~14 ~6 ~14 minecraft:soul_lantern

# 9. เสาโถงกลาง 4 ต้น + หลังคาโดม 2 ชั้นมีมิติ (กัน Phantom และให้ลำแสง Beacon ทะลุยอดโดม)
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-8 ~ ~-8 ~-8 ~7 ~-8 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~8 ~ ~-8 ~8 ~7 ~-8 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-8 ~ ~8 ~-8 ~7 ~8 minecraft:deepslate_bricks
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~8 ~ ~8 ~8 ~7 ~8 minecraft:deepslate_bricks

# คันทวย/ฐานเสาโค้งด้านบน
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-7 ~7 ~-8 minecraft:deepslate_brick_stairs[facing=west,half=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-8 ~7 ~-7 minecraft:deepslate_brick_stairs[facing=north,half=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~7 ~7 ~-8 minecraft:deepslate_brick_stairs[facing=east,half=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~8 ~7 ~-7 minecraft:deepslate_brick_stairs[facing=north,half=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-7 ~7 ~8 minecraft:deepslate_brick_stairs[facing=west,half=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-8 ~7 ~7 minecraft:deepslate_brick_stairs[facing=south,half=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~7 ~7 ~8 minecraft:deepslate_brick_stairs[facing=east,half=top]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~8 ~7 ~7 minecraft:deepslate_brick_stairs[facing=south,half=top]

# หลังคาชั้นที่ 1 (ชายคา y=8)
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-10 ~8 ~-10 ~10 ~8 ~10 minecraft:deepslate_brick_slab[type=bottom]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-9 ~8 ~-9 ~9 ~8 ~9 minecraft:polished_deepslate
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-7 ~8 ~-7 ~7 ~8 ~7 minecraft:light_gray_stained_glass

# หลังคาชั้นที่ 2 (โดมยกยอด y=9 & ยอดแก้ว y=10)
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-6 ~9 ~-6 ~6 ~9 ~6 minecraft:deepslate_brick_slab[type=bottom]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-5 ~9 ~-5 ~5 ~9 ~5 minecraft:white_stained_glass
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-2 ~10 ~-2 ~2 ~10 ~2 minecraft:deepslate_brick_slab[type=bottom]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-1 ~10 ~-1 ~1 ~10 ~1 minecraft:white_stained_glass

execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-7 ~4 ~-8 minecraft:lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~7 ~4 ~-8 minecraft:lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-7 ~4 ~8 minecraft:lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~7 ~4 ~8 minecraft:lantern

# 10. ตกแต่งโถงกลาง: พุ่ม Azalea รอบเสา 4 มุม, ม้านั่งรอเริ่มเกม, ซุ้มหลัง NPC 3 ตัว, และโต๊ะใช้งาน
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-9 ~-1 ~-9 ~-7 ~-1 ~-7 minecraft:moss_block
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-8 ~-1 ~-8 ~-8 ~-1 ~-8 minecraft:sea_lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-7 ~ ~-7 minecraft:flowering_azalea
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~7 ~-1 ~-9 ~9 ~-1 ~-7 minecraft:moss_block
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~8 ~-1 ~-8 ~8 ~-1 ~-8 minecraft:sea_lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~7 ~ ~-7 minecraft:flowering_azalea
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-9 ~-1 ~7 ~-7 ~-1 ~9 minecraft:moss_block
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-8 ~-1 ~8 ~-8 ~-1 ~8 minecraft:sea_lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-7 ~ ~7 minecraft:flowering_azalea
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~7 ~-1 ~7 ~9 ~-1 ~9 minecraft:moss_block
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~8 ~-1 ~8 ~8 ~-1 ~8 minecraft:sea_lantern
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~7 ~ ~7 minecraft:flowering_azalea

# ม้านั่งหินรอเริ่มเกม (Waiting Lounge) 4 มุมหันเข้าหากลางโถง
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-4 ~ ~-5 ~-4 ~ ~-3 minecraft:stone_brick_stairs[facing=west]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~4 ~ ~-5 ~4 ~ ~-3 minecraft:stone_brick_stairs[facing=east]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-4 ~ ~3 ~-4 ~ ~5 minecraft:stone_brick_stairs[facing=west]
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~4 ~ ~3 ~4 ~ ~5 minecraft:stone_brick_stairs[facing=east]

# ซุ้มตกแต่งด้านหลัง NPC 3 ตัว & โต๊ะใช้งาน
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~-1 ~ ~-9 ~1 ~1 ~-9 minecraft:bookshelf
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-6 ~ ~-5 minecraft:crafting_table
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run fill ~9 ~ ~-1 ~9 ~ ~1 minecraft:gold_block
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~9 ~1 ~ minecraft:emerald_block
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~6 ~ ~-5 minecraft:anvil
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-9 ~ ~-1 minecraft:smithing_table
execute at @e[tag=spawn_anchor,limit=1] align xyz positioned ~ ~ ~ run setblock ~-9 ~ ~1 minecraft:lectern

# 11. บันทึกสถานะสร้างเสร็จแล้ว ตั้งจุดเกิดโลก วาร์ปคนที่รออยู่ขึ้นมาบนลานป้อม และส่งสัญญาณให้ NBs_Datapack เสก NPC 3 ตัว
scoreboard players set #citadel_ready nbs_wg_tmp 1
execute at @e[tag=spawn_anchor,limit=1] run setworldspawn ~ ~ ~
execute at @e[tag=spawn_anchor,limit=1] as @a[distance=..48] run tp @s ~ ~ ~
function #nbs:on_citadel_built
