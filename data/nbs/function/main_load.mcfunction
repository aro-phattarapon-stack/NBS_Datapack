say Welcome

# 1. สร้าง Scoreboard พื้นฐานทั้งหมดก่อนเรียกฟังก์ชันตั้งค่าระบบอื่นๆ (ป้องกันค่า NULL ตอนสร้างโลกใหม่)
scoreboard objectives add game_state dummy
scoreboard objectives add join_team trigger
scoreboard objectives add citadel trigger
scoreboard objectives add career trigger
scoreboard objectives add guide trigger
scoreboard objectives add career_id dummy
scoreboard objectives add combat_tag dummy
scoreboard objectives add pvp_cd dummy
scoreboard objectives add team_id dummy
scoreboard objectives add flag_count dummy
scoreboard objectives add check_flag trigger
scoreboard objectives add check_hidden trigger
scoreboard objectives add flag_x dummy
scoreboard objectives add flag_y dummy
scoreboard objectives add flag_z dummy
scoreboard objectives add player_kills playerKillCount
scoreboard objectives add player_deaths deathCount
scoreboard objectives add killed_by_player minecraft.killed_by:minecraft.player
scoreboard objectives add death_track deathCount
scoreboard objectives add time_since_death minecraft.custom:minecraft.time_since_death
scoreboard objectives add rnd_temp dummy
scoreboard objectives add player_hp health
scoreboard objectives add alert_timer dummy
scoreboard objectives add open_shulker minecraft.custom:minecraft.open_shulker_box

# Scoreboard ตรวจจับการวางธงอาณาเขตแยกตามสีทีม 1-8 (แดง, น้ำเงิน, เขียว, เหลือง, ม่วง, ฟ้าคราม, ส้ม, ขาว)
scoreboard objectives add place_flag_1 minecraft.used:minecraft.red_banner
scoreboard objectives add place_flag_2 minecraft.used:minecraft.blue_banner
scoreboard objectives add place_flag_3 minecraft.used:minecraft.green_banner
scoreboard objectives add place_flag_4 minecraft.used:minecraft.yellow_banner
scoreboard objectives add place_flag_5 minecraft.used:minecraft.magenta_banner
scoreboard objectives add place_flag_6 minecraft.used:minecraft.cyan_banner
scoreboard objectives add place_flag_7 minecraft.used:minecraft.orange_banner
scoreboard objectives add place_flag_8 minecraft.used:minecraft.white_banner

scoreboard players add #game_state game_state 0
scoreboard players add #raid_day game_state 0
scoreboard players add #world_id game_state 0
execute unless score #world_id game_state matches 1.. store result score #world_id game_state run random value 100000..999999

# 2. ติดตั้งตารางคะแนน, ระบบทีม (Default 4 ทีม), ขอบเขตโลก
function nbs:scoreboard/score_setup
function nbs:team/team_setup
function nbs:border/border_setup

# 3. บังคับโหลด Chunk จุดศูนย์กลาง (0, 0) ตลอดเวลา — การสร้างป้อม Fallback จะรอจน Chunk โหลดจริงใน game_system
forceload add -24 -24 24 24

scoreboard players set #has_worldgen_pack game_state 0
function #nbs_worldgen:installed
execute if score #has_worldgen_pack game_state matches 0 unless entity @e[tag=citadel_built_anchor] if loaded -22 64 -22 if loaded 22 64 22 if loaded 0 64 0 run function nbs:spawn/build_citadel
execute if entity @e[tag=spawn_anchor] unless entity @e[type=minecraft:interaction,tag=citadel_npc_hit] if loaded 0 64 0 run function nbs:spawn/summon_citadel_npcs
execute at @e[tag=spawn_anchor,limit=1] run setworldspawn ~ ~ ~

# 4. ติดตั้ง Bossbar สำหรับระบบ Random Boost Quest (เควสด่วน)
bossbar add nbs:flash_quest {"text":"⚡ เควสด่วน","color":"gold","bold":true}
bossbar set nbs:flash_quest color yellow
bossbar set nbs:flash_quest style notched_10
bossbar set nbs:flash_quest max 1500
bossbar set nbs:flash_quest visible false
scoreboard players add #flash_timer rnd_temp 0
scoreboard players add #flash_first rnd_temp 0
execute unless score #flash_cooldown rnd_temp matches 1.. run scoreboard players set #flash_cooldown rnd_temp 1800
