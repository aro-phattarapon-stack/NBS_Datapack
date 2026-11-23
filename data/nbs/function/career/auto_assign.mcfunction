# สุ่มเลือกสายอาชีพ (1-4) ให้ผู้เล่นที่ยังไม่ได้เลือกสายอาชีพ (career_id == 0)
scoreboard players add @a career_id 0
scoreboard players set #assigned_career rnd_temp 0

tag @a remove just_assigned_career
execute as @a[gamemode=!spectator,scores={career_id=0}] run tag @s add just_assigned_career
execute as @a[tag=just_assigned_career] run scoreboard players add #assigned_career rnd_temp 1
execute as @a[tag=just_assigned_career] store result score @s career_id run random value 1..4

execute as @a[tag=just_assigned_career,scores={career_id=1}] run tellraw @s [{"text":"🎲 [สายอาชีพ] ","color":"green","bold":true},{"text":"คุณได้รับสายอาชีพสุ่ม: ","color":"gray"},{"text":"🌾 เกษตรกร (Farmer)","color":"green","bold":true}]
execute as @a[tag=just_assigned_career,scores={career_id=2}] run tellraw @s [{"text":"🎲 [สายอาชีพ] ","color":"green","bold":true},{"text":"คุณได้รับสายอาชีพสุ่ม: ","color":"gray"},{"text":"⚒️ ช่างตีเหล็ก (Blacksmith)","color":"white","bold":true}]
execute as @a[tag=just_assigned_career,scores={career_id=3}] run tellraw @s [{"text":"🎲 [สายอาชีพ] ","color":"green","bold":true},{"text":"คุณได้รับสายอาชีพสุ่ม: ","color":"gray"},{"text":"⚔️ นักล่ามอนสเตอร์ (Hunter)","color":"red","bold":true}]
execute as @a[tag=just_assigned_career,scores={career_id=4}] run tellraw @s [{"text":"🎲 [สายอาชีพ] ","color":"green","bold":true},{"text":"คุณได้รับสายอาชีพสุ่ม: ","color":"gray"},{"text":"🧭 นักผจญภัย (Adventurer)","color":"aqua","bold":true}]
tag @a remove just_assigned_career

execute if score #assigned_career rnd_temp matches 0 run tellraw @a [{"text":"ℹ️ [สายอาชีพ] ","color":"aqua","bold":true},{"text":"ผู้เล่นทุกคนมีสายอาชีพครบอยู่แล้ว","color":"gray"}]
execute if score #assigned_career rnd_temp matches 1.. run tellraw @a [{"text":"🎲 [สายอาชีพ] ","color":"aqua","bold":true},{"text":"สุ่มสายอาชีพให้ผู้เล่นที่ยังไม่ได้เลือกเรียบร้อยแล้ว!","color":"yellow"}]
