# ==========================================
# ระบบ 4 สายอาชีพ, Passive Perks, Combat Tag และ Team Milestones
# ==========================================
scoreboard players add @a career_id 0
scoreboard players add @a combat_tag 0
scoreboard players remove @a[scores={combat_tag=1..}] combat_tag 1

scoreboard players enable @a career

# 1. เปิดเมนูเลือกสายอาชีพ (/trigger career หรือ set 1 / set 99) หรือดูสรุปเช็กลิสต์ (set 98)
execute as @a[scores={career=1}] run function nbs:career/open_menu
execute as @a[scores={career=99}] run function nbs:career/open_menu
execute as @a[scores={career=98}] run function nbs:career/show_checklist

# 2. ล็อกสายอาชีพหลังเริ่มเกมแล้ว (#game_state == 1): ห้ามคนที่มีอาชีพแล้ว (career_id 1..4) กดเปลี่ยนสายอาชีพใหม่
execute if score #game_state game_state matches 1 as @a[scores={career=11..14,career_id=1..4}] run tellraw @s [{"text":"❌ [สายอาชีพ] ","color":"red","bold":true},{"text":"เกมเริ่มแล้ว! ไม่สามารถเปลี่ยนสายอาชีพได้ (ดูเช็กลิสต์ได้อย่างเดียว)","color":"yellow"}]
execute if score #game_state game_state matches 1 as @a[scores={career=11..14,career_id=1..4}] at @s run playsound minecraft:block.note_block.bass master @s ~ ~ ~ 1 0.8

# 3. อนุญาตให้เลือกสายอาชีพ (11=Farmer, 12=Blacksmith, 13=Hunter, 14=Adventurer) เฉพาะช่วง Lobby หรือคนเข้าใหม่ที่ยังไม่มีอาชีพ (career_id=0)
tag @a remove picking_new_career
execute if score #game_state game_state matches 0 as @a[scores={career=11..14}] run tag @s add picking_new_career
execute if score #game_state game_state matches 1 as @a[scores={career=11..14,career_id=0}] run tag @s add picking_new_career

execute as @a[tag=picking_new_career,scores={career=11}] run scoreboard players set @s career_id 1
execute as @a[tag=picking_new_career,scores={career=11}] run tellraw @s [{"text":"🌾 [สายอาชีพ] ","color":"green","bold":true},{"text":"คุณเลือกสาย ","color":"gray"},{"text":"เกษตรกร (Farmer)","color":"green","bold":true},{"text":" — Passive: ถือจอบใน Main-hand ได้ Haste I + Saturation","color":"yellow"}]

execute as @a[tag=picking_new_career,scores={career=12}] run scoreboard players set @s career_id 2
execute as @a[tag=picking_new_career,scores={career=12}] run tellraw @s [{"text":"⚒️ [สายอาชีพ] ","color":"gray","bold":true},{"text":"คุณเลือกสาย ","color":"gray"},{"text":"ช่างตีเหล็ก (Blacksmith)","color":"white","bold":true},{"text":" — Passive: เมื่อเลือด ≤ 5 หัวใจ ได้ Fire Resistance","color":"yellow"}]

execute as @a[tag=picking_new_career,scores={career=13}] run scoreboard players set @s career_id 3
execute as @a[tag=picking_new_career,scores={career=13}] run tellraw @s [{"text":"⚔️ [สายอาชีพ] ","color":"red","bold":true},{"text":"คุณเลือกสาย ","color":"gray"},{"text":"นักล่ามอนสเตอร์ (Monster Hunter)","color":"red","bold":true},{"text":" — Passive: Night Vision + Strength I (PvE)","color":"yellow"}]

execute as @a[tag=picking_new_career,scores={career=14}] run scoreboard players set @s career_id 4
execute as @a[tag=picking_new_career,scores={career=14}] run tellraw @s [{"text":"🧭 [สายอาชีพ] ","color":"aqua","bold":true},{"text":"คุณเลือกสาย ","color":"gray"},{"text":"นักผจญภัย (Adventurer)","color":"aqua","bold":true},{"text":" — Passive: Speed I + Dolphin's Grace (ปิดเมื่อติด PvP)","color":"yellow"}]

execute as @a[tag=picking_new_career] at @s run playsound minecraft:entity.experience_orb.pickup master @s ~ ~ ~ 1 1.2
tag @a remove picking_new_career
scoreboard players set @a[scores={career=1..}] career 0

# 4. แจก Passive Perks ทุกๆ 40 Tick (2 วินาที) เพื่อไม่ให้กิน TPS
scoreboard players add #career_tick rnd_temp 1
execute if score #career_tick rnd_temp matches 40.. run function nbs:career/apply_perks
