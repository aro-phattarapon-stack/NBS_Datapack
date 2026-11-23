# รีเซ็ตตัวนับรอบเป็น 0
scoreboard players set #score_tick rnd_temp 0

# ==========================================
# 1. รีเซ็ตคะแนนทีม (1-8) และตัวนับ Nether Star
# ==========================================
scoreboard players set #t1_star team_boss_cnt 0
scoreboard players set #t2_star team_boss_cnt 0
scoreboard players set #t3_star team_boss_cnt 0
scoreboard players set #t4_star team_boss_cnt 0
scoreboard players set #t5_star team_boss_cnt 0
scoreboard players set #t6_star team_boss_cnt 0
scoreboard players set #t7_star team_boss_cnt 0
scoreboard players set #t8_star team_boss_cnt 0

scoreboard players set ทีมที่_1 team_score 0
scoreboard players set ทีมที่_2 team_score 0
scoreboard players set ทีมที่_3 team_score 0
scoreboard players set ทีมที่_4 team_score 0
scoreboard players set ทีมที่_5 team_score 0
scoreboard players set ทีมที่_6 team_score 0
scoreboard players set ทีมที่_7 team_score 0
scoreboard players set ทีมที่_8 team_score 0

# 2.1 คะแนนของชิงชัยจากกล่องทุกใบที่อยู่ในรัศมีธงอาณาเขต (32 บล็อก)
execute as @e[type=minecraft:marker,tag=chest_anchor] at @s run function nbs:scoreboard/count_single_chest

# 2.1.1 คะแนนของชิงชัยที่พกอยู่ในตัวผู้เล่นของแต่ละทีม (Dragon Egg, Nether Star, ป้ายชื่อคะแนน)
execute as @a[scores={team_id=1..8},gamemode=!spectator] run function nbs:scoreboard/count_player_items

# 2.2 คะแนนและตัวคูณของทีม 1 ถึง 8 (เฉพาะเมื่อเริ่มเกมแล้ว #game_state == 1 เพื่อป้องกันการแจกแต้มซ้ำตอนอยู่ Lobby)
execute if score #game_state game_state matches 1 run function nbs:citadel/tick_flash_quest
execute if score #game_state game_state matches 1 run function nbs:career/check_team_advs
execute if score #game_state game_state matches 1 run function nbs:career/check_career_checklists

function nbs:scoreboard/calc_team_total {team:1}
function nbs:scoreboard/calc_team_total {team:2}
function nbs:scoreboard/calc_team_total {team:3}
function nbs:scoreboard/calc_team_total {team:4}
function nbs:scoreboard/calc_team_total {team:5}
function nbs:scoreboard/calc_team_total {team:6}
function nbs:scoreboard/calc_team_total {team:7}
function nbs:scoreboard/calc_team_total {team:8}

# 2.3 โบนัส The Wealthiest (เฉพาะทีมที่เปิดใช้งานอยู่และฝากเพชรในธนาคาร The Citadel มากที่สุด +80 แต้ม)
scoreboard players set #max_dia item_count 1
execute if score #t1_active game_state matches 1 if score #team_1 team_diamonds > #max_dia item_count run scoreboard players operation #max_dia item_count = #team_1 team_diamonds
execute if score #t2_active game_state matches 1 if score #team_2 team_diamonds > #max_dia item_count run scoreboard players operation #max_dia item_count = #team_2 team_diamonds
execute if score #t3_active game_state matches 1 if score #team_3 team_diamonds > #max_dia item_count run scoreboard players operation #max_dia item_count = #team_3 team_diamonds
execute if score #t4_active game_state matches 1 if score #team_4 team_diamonds > #max_dia item_count run scoreboard players operation #max_dia item_count = #team_4 team_diamonds
execute if score #t5_active game_state matches 1 if score #team_5 team_diamonds > #max_dia item_count run scoreboard players operation #max_dia item_count = #team_5 team_diamonds
execute if score #t6_active game_state matches 1 if score #team_6 team_diamonds > #max_dia item_count run scoreboard players operation #max_dia item_count = #team_6 team_diamonds
execute if score #t7_active game_state matches 1 if score #team_7 team_diamonds > #max_dia item_count run scoreboard players operation #max_dia item_count = #team_7 team_diamonds
execute if score #t8_active game_state matches 1 if score #team_8 team_diamonds > #max_dia item_count run scoreboard players operation #max_dia item_count = #team_8 team_diamonds

execute if score #t1_active game_state matches 1 if score #team_1 team_diamonds = #max_dia item_count run scoreboard players add ทีมที่_1 team_score 80
execute if score #t2_active game_state matches 1 if score #team_2 team_diamonds = #max_dia item_count run scoreboard players add ทีมที่_2 team_score 80
execute if score #t3_active game_state matches 1 if score #team_3 team_diamonds = #max_dia item_count run scoreboard players add ทีมที่_3 team_score 80
execute if score #t4_active game_state matches 1 if score #team_4 team_diamonds = #max_dia item_count run scoreboard players add ทีมที่_4 team_score 80
execute if score #t5_active game_state matches 1 if score #team_5 team_diamonds = #max_dia item_count run scoreboard players add ทีมที่_5 team_score 80
execute if score #t6_active game_state matches 1 if score #team_6 team_diamonds = #max_dia item_count run scoreboard players add ทีมที่_6 team_score 80
execute if score #t7_active game_state matches 1 if score #team_7 team_diamonds = #max_dia item_count run scoreboard players add ทีมที่_7 team_score 80
execute if score #t8_active game_state matches 1 if score #team_8 team_diamonds = #max_dia item_count run scoreboard players add ทีมที่_8 team_score 80

# 2.4 โบนัส Top Killer อันดับ 1 (+80) และ อันดับ 2 (+40)
tag @a remove top1_killer
tag @a remove top2_killer
scoreboard players set #top1_kills item_count 0
scoreboard players set #top2_kills item_count 0

execute as @a[scores={team_id=1..8,total_pvp_kills=1..}] if score @s total_pvp_kills > #top1_kills item_count run scoreboard players operation #top1_kills item_count = @s total_pvp_kills
execute if score #top1_kills item_count matches 1.. as @a[scores={team_id=1..8}] if score @s total_pvp_kills = #top1_kills item_count run tag @s add top1_killer

execute if score #top1_kills item_count matches 2.. as @a[scores={team_id=1..8,total_pvp_kills=1..}] if score @s total_pvp_kills < #top1_kills item_count if score @s total_pvp_kills > #top2_kills item_count run scoreboard players operation #top2_kills item_count = @s total_pvp_kills
execute if score #top2_kills item_count matches 1.. as @a[scores={team_id=1..8}] if score @s total_pvp_kills = #top2_kills item_count run tag @s add top2_killer

execute if entity @a[tag=top1_killer,scores={team_id=1}] run scoreboard players add ทีมที่_1 team_score 80
execute if entity @a[tag=top1_killer,scores={team_id=2}] run scoreboard players add ทีมที่_2 team_score 80
execute if entity @a[tag=top1_killer,scores={team_id=3}] run scoreboard players add ทีมที่_3 team_score 80
execute if entity @a[tag=top1_killer,scores={team_id=4}] run scoreboard players add ทีมที่_4 team_score 80
execute if entity @a[tag=top1_killer,scores={team_id=5}] run scoreboard players add ทีมที่_5 team_score 80
execute if entity @a[tag=top1_killer,scores={team_id=6}] run scoreboard players add ทีมที่_6 team_score 80
execute if entity @a[tag=top1_killer,scores={team_id=7}] run scoreboard players add ทีมที่_7 team_score 80
execute if entity @a[tag=top1_killer,scores={team_id=8}] run scoreboard players add ทีมที่_8 team_score 80

execute if entity @a[tag=top2_killer,scores={team_id=1}] run scoreboard players add ทีมที่_1 team_score 40
execute if entity @a[tag=top2_killer,scores={team_id=2}] run scoreboard players add ทีมที่_2 team_score 40
execute if entity @a[tag=top2_killer,scores={team_id=3}] run scoreboard players add ทีมที่_3 team_score 40
execute if entity @a[tag=top2_killer,scores={team_id=4}] run scoreboard players add ทีมที่_4 team_score 40
execute if entity @a[tag=top2_killer,scores={team_id=5}] run scoreboard players add ทีมที่_5 team_score 40
execute if entity @a[tag=top2_killer,scores={team_id=6}] run scoreboard players add ทีมที่_6 team_score 40
execute if entity @a[tag=top2_killer,scores={team_id=7}] run scoreboard players add ทีมที่_7 team_score 40
execute if entity @a[tag=top2_killer,scores={team_id=8}] run scoreboard players add ทีมที่_8 team_score 40

# 2.5 ซ่อนทีมที่ถูกปิดใช้งาน (#t<N>_active == 0) ออกจากตาราง Sidebar
execute if score #t1_active game_state matches 0 run scoreboard players reset ทีมที่_1 team_score
execute if score #t2_active game_state matches 0 run scoreboard players reset ทีมที่_2 team_score
execute if score #t3_active game_state matches 0 run scoreboard players reset ทีมที่_3 team_score
execute if score #t4_active game_state matches 0 run scoreboard players reset ทีมที่_4 team_score
execute if score #t5_active game_state matches 0 run scoreboard players reset ทีมที่_5 team_score
execute if score #t6_active game_state matches 0 run scoreboard players reset ทีมที่_6 team_score
execute if score #t7_active game_state matches 0 run scoreboard players reset ทีมที่_7 team_score
execute if score #t8_active game_state matches 0 run scoreboard players reset ทีมที่_8 team_score
