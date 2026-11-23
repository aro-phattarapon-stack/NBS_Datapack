# ==========================================
# คำสั่งเริ่มเกมสำหรับแอดมิน (/function nbs:game/start) — ตรวจสอบความพร้อมแบบ Type-Safe ก่อนเริ่มเกม!
# ==========================================
# 1. ตรวจสอบ Default 4 ทีมและบังคับกำหนดค่าเริ่มต้นให้ผู้เล่นทุกคน (ป้องกันค่า NULL)
function nbs:team/ensure_defaults
scoreboard players add @a team_id 0
scoreboard players add @a career_id 0

# 2. ซิงค์ Vanilla Team -> team_id และตรวจความถูกต้องของ Type & ช่วงค่า (Type-Safe Validation)
execute as @a[team=team_1] run scoreboard players set @s team_id 1
execute as @a[team=team_2] run scoreboard players set @s team_id 2
execute as @a[team=team_3] run scoreboard players set @s team_id 3
execute as @a[team=team_4] run scoreboard players set @s team_id 4
execute as @a[team=team_5] run scoreboard players set @s team_id 5
execute as @a[team=team_6] run scoreboard players set @s team_id 6
execute as @a[team=team_7] run scoreboard players set @s team_id 7
execute as @a[team=team_8] run scoreboard players set @s team_id 8
execute as @a[team=] run scoreboard players set @s team_id 0

# ห้ามผู้เล่นค้างอยู่ในทีมที่ถูกปิดใช้งาน หรือมี team_id นอกช่วง 1..8
execute unless score #t1_active game_state matches 1 as @a[scores={team_id=1}] run function nbs:team/kick_inactive_team
execute unless score #t2_active game_state matches 1 as @a[scores={team_id=2}] run function nbs:team/kick_inactive_team
execute unless score #t3_active game_state matches 1 as @a[scores={team_id=3}] run function nbs:team/kick_inactive_team
execute unless score #t4_active game_state matches 1 as @a[scores={team_id=4}] run function nbs:team/kick_inactive_team
execute unless score #t5_active game_state matches 1 as @a[scores={team_id=5}] run function nbs:team/kick_inactive_team
execute unless score #t6_active game_state matches 1 as @a[scores={team_id=6}] run function nbs:team/kick_inactive_team
execute unless score #t7_active game_state matches 1 as @a[scores={team_id=7}] run function nbs:team/kick_inactive_team
execute unless score #t8_active game_state matches 1 as @a[scores={team_id=8}] run function nbs:team/kick_inactive_team
execute as @a unless score @s team_id matches 1..8 run scoreboard players set @s team_id 0

# ตรวจสอบค่าสายอาชีพต้องอยู่ในช่วง 1..4 เท่านั้น (1=Farmer, 2=Blacksmith, 3=Hunter, 4=Adventurer)
execute as @a unless score @s career_id matches 1..4 run scoreboard players set @s career_id 0

# 3. นับจำนวนผู้เล่นที่เล่นจริง (ไม่ใช่ Spectator) และจำนวนคนที่ยังไม่เลือกทีม / ยังไม่เลือกสายอาชีพ
scoreboard players set #ready_players rnd_temp 0
scoreboard players set #no_team_cnt rnd_temp 0
scoreboard players set #no_career_cnt rnd_temp 0
execute as @a[gamemode=!spectator] run scoreboard players add #ready_players rnd_temp 1
execute as @a[gamemode=!spectator,scores={team_id=0}] run scoreboard players add #no_team_cnt rnd_temp 1
execute as @a[gamemode=!spectator,scores={career_id=0}] run scoreboard players add #no_career_cnt rnd_temp 1

# 4. เช็กกรณีไม่มีผู้เล่นเลย
execute if score #ready_players rnd_temp matches 0 run tellraw @a [{"text":"❌ [NBs SMP] ","color":"red","bold":true},{"text":"ไม่พบผู้เล่นที่พร้อมเริ่มเกม (ทุกคนอยู่ในโหมด Spectator)","color":"yellow"}]

# 5. ถ้ายังมีคนเลือกทีม หรือเลือกสายอาชีพไม่ครบ -> บล็อกการเริ่มเกมและประกาศรายชื่อทันที!
execute if score #ready_players rnd_temp matches 1.. if score #no_team_cnt rnd_temp matches 1.. run scoreboard players set #start_blocked rnd_temp 1
execute if score #ready_players rnd_temp matches 1.. unless score #no_team_cnt rnd_temp matches 1.. if score #no_career_cnt rnd_temp matches 1.. run scoreboard players set #start_blocked rnd_temp 1
execute if score #ready_players rnd_temp matches 1.. if score #no_team_cnt rnd_temp matches 0 if score #no_career_cnt rnd_temp matches 0 run scoreboard players set #start_blocked rnd_temp 0

execute if score #ready_players rnd_temp matches 1.. if score #start_blocked rnd_temp matches 1 run tellraw @a {"text":"========================================","color":"dark_red","bold":true}
execute if score #ready_players rnd_temp matches 1.. if score #start_blocked rnd_temp matches 1 run tellraw @a [{"text":"❌ [NBs SMP] ยังไม่สามารถเริ่มเกมได้! ","color":"red","bold":true},{"text":"มีผู้เล่นยังเลือกทีมหรือสายอาชีพไม่ครบ:","color":"yellow"}]
execute if score #ready_players rnd_temp matches 1.. if score #no_team_cnt rnd_temp matches 1.. run tellraw @a [{"text":" • ยังไม่ได้เลือกทีม: ","color":"red","bold":true},{"selector":"@a[gamemode=!spectator,scores={team_id=0}]","color":"yellow","bold":true}]
execute if score #ready_players rnd_temp matches 1.. if score #no_career_cnt rnd_temp matches 1.. run tellraw @a [{"text":" • ยังไม่ได้เลือกสายอาชีพ: ","color":"aqua","bold":true},{"selector":"@a[gamemode=!spectator,scores={career_id=0}]","color":"white","bold":true}]
execute if score #ready_players rnd_temp matches 1.. if score #start_blocked rnd_temp matches 1 run tellraw @a [{"text":" 👉 กดเพื่อเลือกตอนนี้: ","color":"gray"},{"text":"[👥 เลือกทีม] ","color":"green","bold":true,"click_event":{"action":"run_command","command":"/trigger join_team set 98"}},{"text":"[🛠️ เลือกสายอาชีพ]","color":"aqua","bold":true,"click_event":{"action":"run_command","command":"/trigger career"}}]
execute if score #ready_players rnd_temp matches 1.. if score #start_blocked rnd_temp matches 1 run tellraw @a [{"text":" 🛡️ แอดมิน: ","color":"gold","bold":true},{"text":"[🎲 สุ่มทีม+อาชีพให้คนที่ยังไม่พร้อม] ","color":"yellow","bold":true,"click_event":{"action":"run_command","command":"/function nbs:game/auto_ready"}},{"text":"[⚡ บังคับเริ่มเกมทันที]","color":"red","bold":true,"click_event":{"action":"run_command","command":"/function nbs:game/do_start"}}]
execute if score #ready_players rnd_temp matches 1.. if score #start_blocked rnd_temp matches 1 run tellraw @a {"text":"========================================","color":"dark_red","bold":true}
execute if score #ready_players rnd_temp matches 1.. if score #start_blocked rnd_temp matches 1 run playsound minecraft:block.note_block.bass master @a ~ ~ ~ 1 0.8

# 6. ถ้าทุกคน (ไม่ใช่ Spectator) เลือกทีมและสายอาชีพครบถูกต้องแล้ว -> เริ่มเกมและสุ่มวาร์ปเข้าป่าทันที!
execute if score #ready_players rnd_temp matches 1.. if score #start_blocked rnd_temp matches 0 run function nbs:game/do_start
