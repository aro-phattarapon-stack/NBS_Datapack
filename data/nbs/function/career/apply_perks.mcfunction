# รีเซ็ตตัวนับรอบเป็น 0
scoreboard players set #career_tick rnd_temp 0

# 1. Farmer: ถือจอบใน Main-hand ได้ Haste I + Saturation
execute as @a[scores={career_id=1}] if items entity @s weapon.mainhand #minecraft:hoes run effect give @s minecraft:haste 3 0 true
execute as @a[scores={career_id=1}] if items entity @s weapon.mainhand #minecraft:hoes run effect give @s minecraft:saturation 2 0 true

# 2. Blacksmith: เลือด <= 10 (5 หัวใจ) ได้ Fire Resistance
execute as @a[scores={career_id=2,player_hp=1..10}] run effect give @s minecraft:fire_resistance 4 0 true

# 3. Monster Hunter: Night Vision (15 วิ ไม่กระพริบ) + Strength I (เฉพาะนอก Combat Tag PvP)
execute as @a[scores={career_id=3}] run effect give @s minecraft:night_vision 15 0 true
execute as @a[scores={career_id=3,combat_tag=0}] run effect give @s minecraft:strength 3 0 true

# 4. Adventurer: Speed I + Dolphin's Grace เมื่ออยู่ในน้ำ (เฉพาะนอก Combat Tag PvP)
execute as @a[scores={career_id=4,combat_tag=0}] run effect give @s minecraft:speed 3 0 true
execute as @a[scores={career_id=4,combat_tag=0}] at @s if block ~ ~ ~ minecraft:water run effect give @s minecraft:dolphins_grace 3 0 true
