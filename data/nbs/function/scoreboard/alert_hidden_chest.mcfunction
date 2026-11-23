# ==========================================
# จัดการแจ้งเตือนและการนับเวลาเตือนซ้ำของกล่องที่ซ่อนอยู่นอกเขตธง
# ==========================================

# ดึงพิกัด X, Y, Z ของกล่องลงตัวแปร Scoreboard
execute store result score #pos flag_x run data get entity @s Pos[0]
execute store result score #pos flag_y run data get entity @s Pos[1]
execute store result score #pos flag_z run data get entity @s Pos[2]

# กรณีเพิ่งตรวจพบครั้งแรก (ยังไม่มีแท็ก hidden_chest)
execute unless entity @s[tag=hidden_chest] at @s run forceload add ~ ~
execute unless entity @s[tag=hidden_chest] run scoreboard players set @s alert_timer 120
execute unless entity @s[tag=hidden_chest] run function nbs:scoreboard/send_hidden_alert
tag @s add hidden_chest

# นับถอยหลังตัวเตือนซ้ำ (ทุกๆ 1 วินาที ลดลง 1)
scoreboard players remove @s alert_timer 1
execute if score @s alert_timer matches ..0 run function nbs:scoreboard/remind_hidden_chest
