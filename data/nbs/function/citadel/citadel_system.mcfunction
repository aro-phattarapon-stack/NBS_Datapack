# ==========================================
# ระบบป้อมปราการ The Citadel (0, 0) — ร้านค้าธง, ธนาคารเพชร, และเควสส่งของ 16 ใบ
# ==========================================
scoreboard players enable @a citadel

# 1. เปิดเมนู The Citadel (/trigger citadel set 1) — เปิดอ่านได้ทุกที่
execute as @a[scores={citadel=1}] run function nbs:citadel/open_menu

# 2. รายการที่ต้องยืนอยู่ในเขต The Citadel (tag=in_spawn) และต้องมีทีม (team_id 1-8)
execute as @a[scores={citadel=2..},tag=!in_spawn] run tellraw @s [{"text":"❌ [The Citadel] ","color":"red","bold":true},{"text":"คุณต้องเดินทางมาอยู่ในเขต The Citadel (0, 0) ก่อนจึงจะส่งของหรือซื้อธงได้!","color":"yellow"}]
execute as @a[tag=in_spawn,scores={citadel=2..,team_id=0}] run tellraw @s [{"text":"❌ [The Citadel] ","color":"red","bold":true},{"text":"คุณต้องเข้าร่วมทีมก่อนใช้งานเมนูนี้!","color":"yellow"}]

# 2.1 ซื้อธงอาณาเขตเพิ่ม (32 Diamonds)
execute as @a[tag=in_spawn,scores={citadel=2,team_id=1..8}] run function nbs:citadel/buy_flag

# 2.2 ฝากเพชรเข้าธนาคารทีม (The Wealthiest: 16 หรือ 64 Diamonds)
execute as @a[tag=in_spawn,scores={citadel=3,team_id=1..8}] run function nbs:citadel/deposit_diamonds {amt:16}
execute as @a[tag=in_spawn,scores={citadel=4,team_id=1..8}] run function nbs:citadel/deposit_diamonds {amt:64}

# 2.3 ส่งเควส The Citadel (11-44, จำกัด 1 ครั้งต่อทีม) และส่งเควสด่วน (5)
execute as @a[tag=in_spawn,scores={citadel=5,team_id=1..8}] run function nbs:citadel/submit_flash_quest
execute as @a[tag=in_spawn,scores={citadel=11..44,team_id=1..8}] run function nbs:citadel/dispatch_quest

# 3. รีเซ็ตค่า Trigger
scoreboard players set @a[scores={citadel=1..}] citadel 0
