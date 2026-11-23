# Fallback ไล่หมุด spawn_anchor ทะลุใบไม้/ลำต้น/เห็ดยักษ์/เถาวัลย์/น้ำ ลงพื้นดินจริง (กรณีโหลดเฉพาะ NBs_Datapack เดี่ยว)
execute store result score #cur_y rnd_temp run data get entity @s Pos[1] 1
execute if score #wg_steps rnd_temp matches ..96 if score #cur_y rnd_temp matches 64.. at @s if block ~ ~-1 ~ #nbs:ground_passthrough run tp @s ~ ~-1 ~
execute if score #wg_steps rnd_temp matches ..96 if score #cur_y rnd_temp matches 64.. at @s if block ~ ~-1 ~ #nbs:ground_passthrough run scoreboard players add #wg_steps rnd_temp 1
execute if score #wg_steps rnd_temp matches ..96 if score #cur_y rnd_temp matches 64.. at @s if block ~ ~-1 ~ #nbs:ground_passthrough run function nbs:spawn/ground_anchor
