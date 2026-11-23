# ตรวจหา NPC Hitbox (ขนาด 1.1x2.15) ตามแนวสายตาของผู้เล่นครอบคลุมทั้งหัวและตัว
execute if score #npc_found rnd_temp matches 0 positioned ~-0.8 ~-2.2 ~-0.8 if entity @e[type=minecraft:interaction,tag=npc_quest,dx=1.6,dy=2.3,dz=1.6] run function nbs:citadel/open_quest_npc
execute if score #npc_found rnd_temp matches 0 positioned ~-0.8 ~-2.2 ~-0.8 if entity @e[type=minecraft:interaction,tag=npc_quest,dx=1.6,dy=2.3,dz=1.6] run scoreboard players set #npc_found rnd_temp 1

execute if score #npc_found rnd_temp matches 0 positioned ~-0.8 ~-2.2 ~-0.8 if entity @e[type=minecraft:interaction,tag=npc_bank,dx=1.6,dy=2.3,dz=1.6] run function nbs:citadel/open_bank_npc
execute if score #npc_found rnd_temp matches 0 positioned ~-0.8 ~-2.2 ~-0.8 if entity @e[type=minecraft:interaction,tag=npc_bank,dx=1.6,dy=2.3,dz=1.6] run scoreboard players set #npc_found rnd_temp 1

execute if score #npc_found rnd_temp matches 0 positioned ~-0.8 ~-2.2 ~-0.8 if entity @e[type=minecraft:interaction,tag=npc_career,dx=1.6,dy=2.3,dz=1.6] run function nbs:citadel/open_career_npc
execute if score #npc_found rnd_temp matches 0 positioned ~-0.8 ~-2.2 ~-0.8 if entity @e[type=minecraft:interaction,tag=npc_career,dx=1.6,dy=2.3,dz=1.6] run scoreboard players set #npc_found rnd_temp 1

# ขยับไปตามแนวสายตาทีละ 0.4 บล็อก (สูงสุด 6.5 บล็อก) จนกว่าจะเจอ NPC
execute if score #npc_found rnd_temp matches 0 positioned ^ ^ ^0.4 as @s[distance=..6.5] run function nbs:citadel/raycast_npc
