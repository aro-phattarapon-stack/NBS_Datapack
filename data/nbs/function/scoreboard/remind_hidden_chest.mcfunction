# ==========================================
# ทำการแจ้งเตือนซ้ำทุกๆ 2 นาที เมื่อไอเทมยังคงถูกซ่อนอยู่นอกเขตธง
# ==========================================
scoreboard players set @s alert_timer 120
execute store result score #pos flag_x run data get entity @s Pos[0]
execute store result score #pos flag_y run data get entity @s Pos[1]
execute store result score #pos flag_z run data get entity @s Pos[2]
function nbs:scoreboard/send_hidden_remind
