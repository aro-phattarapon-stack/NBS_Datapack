# กำหนดค่าเริ่มต้น team_id = 0 สำหรับผู้เล่นที่ยังไม่เคยมีค่า
scoreboard players add @a team_id 0

# ==========================================
# 1. ระบบปักธงอาณาเขต (ตรวจจับทุก Tick เพื่อไม่พลาดจังหวะวางบล็อกธงทีม 1-8)
# ==========================================
execute as @a[scores={place_flag_1=1..}] at @s run function nbs:territory/place_flag_anchor
execute as @a[scores={place_flag_2=1..}] at @s run function nbs:territory/place_flag_anchor
execute as @a[scores={place_flag_3=1..}] at @s run function nbs:territory/place_flag_anchor
execute as @a[scores={place_flag_4=1..}] at @s run function nbs:territory/place_flag_anchor
execute as @a[scores={place_flag_5=1..}] at @s run function nbs:territory/place_flag_anchor
execute as @a[scores={place_flag_6=1..}] at @s run function nbs:territory/place_flag_anchor
execute as @a[scores={place_flag_7=1..}] at @s run function nbs:territory/place_flag_anchor
execute as @a[scores={place_flag_8=1..}] at @s run function nbs:territory/place_flag_anchor
scoreboard players set @a[scores={place_flag_1=1..}] place_flag_1 0
scoreboard players set @a[scores={place_flag_2=1..}] place_flag_2 0
scoreboard players set @a[scores={place_flag_3=1..}] place_flag_3 0
scoreboard players set @a[scores={place_flag_4=1..}] place_flag_4 0
scoreboard players set @a[scores={place_flag_5=1..}] place_flag_5 0
scoreboard players set @a[scores={place_flag_6=1..}] place_flag_6 0
scoreboard players set @a[scores={place_flag_7=1..}] place_flag_7 0
scoreboard players set @a[scores={place_flag_8=1..}] place_flag_8 0

# Trigger /trigger check_flag ทำงานทุก Tick เพื่อตอบสนองผู้เล่นทันที
function nbs:territory/check_team_flags

# ==========================================
# 2. งานสแกนธงและเขตขุดช้า: รันทุก 5 Ticks (4Hz) เพื่อลด Entity Scan ลง 75%
# ==========================================
scoreboard players add #territory_tick rnd_temp 1
execute if score #territory_tick rnd_temp matches 5.. run function nbs:territory/territory_tick_4hz
