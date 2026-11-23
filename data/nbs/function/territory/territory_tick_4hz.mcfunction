# ==========================================
# รอบสแกนธงอาณาเขต 4Hz (ทุกๆ 5 Ticks)
# ==========================================
scoreboard players set #territory_tick rnd_temp 0

# 1. ตรวจสอบสภาพธงว่าถูกทำลายหรือไม่
execute as @e[type=minecraft:marker,tag=flag_anchor,scores={team_id=1}] at @s unless block ~ ~ ~ minecraft:red_banner unless block ~ ~ ~ minecraft:red_wall_banner run function nbs:territory/break_flag_anchor
execute as @e[type=minecraft:marker,tag=flag_anchor,scores={team_id=2}] at @s unless block ~ ~ ~ minecraft:blue_banner unless block ~ ~ ~ minecraft:blue_wall_banner run function nbs:territory/break_flag_anchor
execute as @e[type=minecraft:marker,tag=flag_anchor,scores={team_id=3}] at @s unless block ~ ~ ~ minecraft:green_banner unless block ~ ~ ~ minecraft:green_wall_banner run function nbs:territory/break_flag_anchor
execute as @e[type=minecraft:marker,tag=flag_anchor,scores={team_id=4}] at @s unless block ~ ~ ~ minecraft:yellow_banner unless block ~ ~ ~ minecraft:yellow_wall_banner run function nbs:territory/break_flag_anchor
execute as @e[type=minecraft:marker,tag=flag_anchor,scores={team_id=5}] at @s unless block ~ ~ ~ minecraft:magenta_banner unless block ~ ~ ~ minecraft:magenta_wall_banner run function nbs:territory/break_flag_anchor
execute as @e[type=minecraft:marker,tag=flag_anchor,scores={team_id=6}] at @s unless block ~ ~ ~ minecraft:cyan_banner unless block ~ ~ ~ minecraft:cyan_wall_banner run function nbs:territory/break_flag_anchor
execute as @e[type=minecraft:marker,tag=flag_anchor,scores={team_id=7}] at @s unless block ~ ~ ~ minecraft:orange_banner unless block ~ ~ ~ minecraft:orange_wall_banner run function nbs:territory/break_flag_anchor
execute as @e[type=minecraft:marker,tag=flag_anchor,scores={team_id=8}] at @s unless block ~ ~ ~ minecraft:white_banner unless block ~ ~ ~ minecraft:white_wall_banner run function nbs:territory/break_flag_anchor

# เคลียร์และป้องกันหมุดธงที่หลุดเข้าไปในเขต Spawn (in_spawn)
execute at @e[tag=spawn_anchor] positioned ~-86 -64 ~-86 as @e[type=minecraft:marker,tag=flag_anchor,dx=172,dy=384,dz=172] at @s run setblock ~ ~ ~ minecraft:air destroy
execute at @e[tag=spawn_anchor] positioned ~-86 -64 ~-86 as @e[type=minecraft:marker,tag=flag_anchor,dx=172,dy=384,dz=172] at @s run function nbs:territory/break_flag_anchor

# 2. Particle สีทีม (ทุกๆ 2 รอบของ 4Hz = 10 Ticks / 2Hz)
scoreboard players add #flag_fx_tick rnd_temp 1
execute if score #flag_fx_tick rnd_temp matches 2.. as @e[type=minecraft:marker,tag=flag_anchor] at @s run function nbs:territory/flag_particles
execute if score #flag_fx_tick rnd_temp matches 2.. run scoreboard players set #flag_fx_tick rnd_temp 0

# 3. สร้างรัศมีขุดช้า 32 บล็อก (Debuff ศัตรูที่เดินเข้าใกล้ฐาน)
tag @a remove in_enemy_territory
execute as @e[type=minecraft:marker,tag=flag_anchor] at @s run function nbs:territory/check_flag_radius

execute as @a[tag=in_enemy_territory,tag=!admin] run attribute @s minecraft:block_break_speed base set 0.25
execute as @a[tag=!in_enemy_territory,tag=!in_spawn] run attribute @s minecraft:block_break_speed base set 1
