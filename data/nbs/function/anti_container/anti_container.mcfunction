# ==========================================
# ระบบป้องกันการซ่อนไอเทมนับคะแนนใน Bundle และ Shulker Box
# (Dragon Egg, Nether Star, ป้ายชื่อคะแนน PvP)
# ==========================================

# 1. ตรวจจับการเปิด Shulker Box เพื่อปักหมุดตรวจสอบบล็อกกล่อง Shulker Box ในโลก
execute as @a[scores={open_shulker=1..}] at @s anchored eyes positioned ^ ^ ^0.5 run function nbs:anti_container/raycast_shulker
scoreboard players set @a[scores={open_shulker=1..}] open_shulker 0

# 2. ตรวจสอบบล็อก Shulker Box ทุกตัวในโลกที่มีการเปิดใช้งาน (ถ้ามีของนับคะแนนจะดีดออกทันที)
execute as @e[type=minecraft:marker,tag=shulker_anchor] at @s run function nbs:anti_container/check_placed_shulker

# 3. ตรวจสอบ Bundle ในตัวผู้เล่นและ Ender Chest (ดีดของออกทันที)
execute as @a if data entity @s Inventory[{components:{"minecraft:bundle_contents":[{id:"minecraft:dragon_egg"}]}}] at @s run function nbs:anti_container/clean_egg_bundle
execute as @a if data entity @s Inventory[{components:{"minecraft:bundle_contents":[{id:"minecraft:nether_star"}]}}] at @s run function nbs:anti_container/clean_star_bundle
execute as @a if data entity @s Inventory[{components:{"minecraft:bundle_contents":[{id:"minecraft:name_tag",components:{"minecraft:custom_data":{score_tag:1b}}}]}}] at @s run function nbs:anti_container/clean_tag_bundle

execute as @a if data entity @s EnderItems[{components:{"minecraft:bundle_contents":[{id:"minecraft:dragon_egg"}]}}] at @s run function nbs:anti_container/clean_egg_bundle_ender
execute as @a if data entity @s EnderItems[{components:{"minecraft:bundle_contents":[{id:"minecraft:nether_star"}]}}] at @s run function nbs:anti_container/clean_star_bundle_ender
execute as @a if data entity @s EnderItems[{components:{"minecraft:bundle_contents":[{id:"minecraft:name_tag",components:{"minecraft:custom_data":{score_tag:1b}}}]}}] at @s run function nbs:anti_container/clean_tag_bundle_ender

# 4. ตรวจสอบไอเทม Shulker Box ในตัวผู้เล่นและ Ender Chest (ดีดของออกทันที)
execute as @a if data entity @s Inventory[{components:{"minecraft:container":[{item:{id:"minecraft:dragon_egg"}}]}}] at @s run function nbs:anti_container/clean_egg_shulker_item
execute as @a if data entity @s Inventory[{components:{"minecraft:container":[{item:{id:"minecraft:nether_star"}}]}}] at @s run function nbs:anti_container/clean_star_shulker_item
execute as @a if data entity @s Inventory[{components:{"minecraft:container":[{item:{id:"minecraft:name_tag",components:{"minecraft:custom_data":{score_tag:1b}}}}]}}] at @s run function nbs:anti_container/clean_tag_shulker_item

execute as @a if data entity @s EnderItems[{components:{"minecraft:container":[{item:{id:"minecraft:dragon_egg"}}]}}] at @s run function nbs:anti_container/clean_egg_shulker_item_ender
execute as @a if data entity @s EnderItems[{components:{"minecraft:container":[{item:{id:"minecraft:nether_star"}}]}}] at @s run function nbs:anti_container/clean_star_shulker_item_ender
execute as @a if data entity @s EnderItems[{components:{"minecraft:container":[{item:{id:"minecraft:name_tag",components:{"minecraft:custom_data":{score_tag:1b}}}}]}}] at @s run function nbs:anti_container/clean_tag_shulker_item_ender
