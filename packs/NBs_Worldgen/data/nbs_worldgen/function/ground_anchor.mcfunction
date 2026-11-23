# ไล่ตำแหน่ง spawn_anchor ลงด้านล่างทะลุใบไม้/ลำต้น/เห็ดยักษ์/เถาวัลย์/น้ำ/อากาศ จนเจอพื้นดินจริง (หรือหยุดที่ระดับน้ำทะเล y=63)
execute store result score #cur_y nbs_wg_tmp run data get entity @s Pos[1] 1
execute if score #wg_steps nbs_wg_tmp matches ..96 if score #cur_y nbs_wg_tmp matches 64.. at @s if block ~ ~-1 ~ #nbs_worldgen:ground_passthrough run tp @s ~ ~-1 ~
execute if score #wg_steps nbs_wg_tmp matches ..96 if score #cur_y nbs_wg_tmp matches 64.. at @s if block ~ ~-1 ~ #nbs_worldgen:ground_passthrough run scoreboard players add #wg_steps nbs_wg_tmp 1
execute if score #wg_steps nbs_wg_tmp matches ..96 if score #cur_y nbs_wg_tmp matches 64.. at @s if block ~ ~-1 ~ #nbs_worldgen:ground_passthrough run function nbs_worldgen:ground_anchor
