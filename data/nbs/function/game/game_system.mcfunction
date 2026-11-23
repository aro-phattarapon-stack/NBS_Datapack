# ==========================================
# ระบบสถานะเกม (Waiting Lobby -> Active Game) และสมุดคู่มือ (/trigger guide)
# ==========================================
scoreboard players enable @a guide
execute as @a[scores={guide=1..}] run function nbs:game/give_guide_book
scoreboard players set @a[scores={guide=1..}] guide 0

# Fallback: หากไม่ได้ลงแพ็ก NBs_Worldgen แยก ให้รอจนกว่า Chunk รอบ (0,0) จะโหลดจริงแล้วสร้างป้อม 31x31 + 3 NPC อัตโนมัติ
execute if score #has_worldgen_pack game_state matches 0 unless entity @e[tag=citadel_built_anchor] if loaded -22 64 -22 if loaded 22 64 22 if loaded -22 64 22 if loaded 22 64 -22 if loaded 0 64 0 run function nbs:spawn/build_citadel

# กรณีที่ 1: ช่วง Waiting / Lobby (#game_state == 0)
# ดึงผู้เล่นที่เพิ่งเข้าโลกครั้งแรกแล้วยังอยู่นอกเขต The Citadel (0,0) มารวมตัวที่ลาน The Citadel
execute if score #game_state game_state matches 0 as @a[tag=!in_spawn,tag=!admin,gamemode=!spectator] at @e[tag=spawn_anchor,limit=1] run tp @s ~ ~ ~

# แจกสมุดเลือกทีมให้ผู้เล่นที่ยังไม่มีสมุด (ตรวจรวมถึงเมาส์ player.cursor ป้องกันเสกซ้ำตอนลากย้ายช่อง)
execute if score #game_state game_state matches 0 as @a[gamemode=!spectator] unless items entity @s container.* minecraft:written_book[custom_data={team_book:1b}] unless items entity @s weapon.offhand minecraft:written_book[custom_data={team_book:1b}] unless items entity @s player.cursor minecraft:written_book[custom_data={team_book:1b}] run function nbs:game/give_team_book

# แสดง Actionbar แจ้งความพร้อมใน Lobby ว่าเลือกทีมและสายอาชีพครบหรือยัง
execute if score #game_state game_state matches 0 as @a[gamemode=!spectator,scores={team_id=0,career_id=0}] run title @s actionbar {"text":"⚠️ เปิดสมุดในมือ: กรุณา [เลือกทีม] และ [เลือกสายอาชีพ] ก่อนเริ่มเกม!","color":"yellow"}
execute if score #game_state game_state matches 0 as @a[gamemode=!spectator,scores={team_id=1..8,career_id=0}] run title @s actionbar {"text":"⚠️ เลือกทีมแล้ว! กรุณาเปิดสมุดกด [เลือกสายอาชีพ] ก่อนเริ่มเกม","color":"aqua"}
execute if score #game_state game_state matches 0 as @a[gamemode=!spectator,scores={team_id=0,career_id=1..4}] run title @s actionbar {"text":"⚠️ เลือกอาชีพแล้ว! กรุณาเปิดสมุดกด [เลือกทีม] ก่อนเริ่มเกม","color":"gold"}

# กรณีที่ 2: เกมเริ่มแล้ว (#game_state == 1) — จัดการผู้เล่นที่เข้ามาทีหลัง (Late Join)
# 2.1 ถ้ายังเลือกทีม (1-8) หรือสายอาชีพ (1-4) ไม่ครบ -> ดึงมารอในเขต The Citadel และแจกสมุดเลือกทีม
execute if score #game_state game_state matches 1 as @a[tag=!rtp_joined,gamemode=!spectator,scores={team_id=0},tag=!in_spawn,tag=!admin] at @e[tag=spawn_anchor,limit=1] run tp @s ~ ~ ~
execute if score #game_state game_state matches 1 as @a[tag=!rtp_joined,gamemode=!spectator,scores={career_id=0},tag=!in_spawn,tag=!admin] at @e[tag=spawn_anchor,limit=1] run tp @s ~ ~ ~

execute if score #game_state game_state matches 1 as @a[tag=!rtp_joined,gamemode=!spectator,scores={team_id=0}] unless items entity @s container.* minecraft:written_book[custom_data={team_book:1b}] unless items entity @s weapon.offhand minecraft:written_book[custom_data={team_book:1b}] unless items entity @s player.cursor minecraft:written_book[custom_data={team_book:1b}] run function nbs:game/give_team_book
execute if score #game_state game_state matches 1 as @a[tag=!rtp_joined,gamemode=!spectator,scores={career_id=0}] unless items entity @s container.* minecraft:written_book[custom_data={team_book:1b}] unless items entity @s weapon.offhand minecraft:written_book[custom_data={team_book:1b}] unless items entity @s player.cursor minecraft:written_book[custom_data={team_book:1b}] run function nbs:game/give_team_book

execute if score #game_state game_state matches 1 as @a[tag=!rtp_joined,gamemode=!spectator,scores={team_id=0}] run title @s actionbar {"text":"เปิดสมุดในมือเพื่อ [เลือกทีม] และ [เลือกสายอาชีพ] ก่อนเข้าสู่เกม!","color":"yellow"}
execute if score #game_state game_state matches 1 as @a[tag=!rtp_joined,gamemode=!spectator,scores={team_id=1..8,career_id=0}] run title @s actionbar {"text":"เลือกทีมแล้ว! เปิดสมุดเพื่อกด [เลือกสายอาชีพ] ก่อนวาร์ปเข้าสู่ป่า","color":"aqua"}

# 2.2 ถ้าเลือกทั้งทีม (team_id 1-8) และสายอาชีพ (career_id 1-4) ครบแล้ว -> ลบสมุดออกและวาร์ปไปจุดเกิดทีมทันที!
execute if score #game_state game_state matches 1 as @a[tag=!rtp_joined,gamemode=!spectator,scores={team_id=1..8,career_id=1..4}] at @s run function nbs:rtp/join_team_spawn
