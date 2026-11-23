# ==========================================
# ระบบการสังหารผู้เล่น (PvP Kill Drop, Raid Day Check & Cooldown)
# ==========================================
scoreboard players add @a pvp_cd 0
scoreboard players add @a total_pvp_kills 0
scoreboard players add @a lifetime_kills 0
scoreboard players add @a lifetime_deaths 0
scoreboard players add @a kill_streak 0
scoreboard players add @a best_streak 0
scoreboard players remove @a[scores={pvp_cd=1..}] pvp_cd 1

# 1. กรณีเป็นวัน Raid Day (#raid_day == 1)
# 1.1 ดรอปป้ายชื่อคะแนน (+15) ที่จุดคนตาย (เฉพาะผู้เล่นที่ถูกฆ่าและไม่ติด Cooldown กันปั๊ม 5 นาที)
execute if score #raid_day game_state matches 1 as @a[scores={killed_by_player=1..,pvp_cd=0}] at @s run summon minecraft:item ~ ~0.5 ~ {Item:{id:"minecraft:name_tag",count:1,components:{"minecraft:custom_data":{score_tag:1b},"minecraft:custom_name":{text:"ป้ายชื่อคะแนน (+15)",color:"gold",bold:true,italic:false},"minecraft:lore":[{text:"ได้รับจากการสังหารผู้เล่น (Raid Day)",color:"gray",italic:false},{text:"มูลค่า 15 คะแนน",color:"yellow",italic:false},{text:"⚠️ ห้ามซ่อนใน Ender Chest",color:"red",italic:false}]}}}

# 1.2 กรณีคนตายหลุดออกเกมในจังหวะตายพอดี ให้ดรอปที่ตัวคนฆ่าแทน
execute if score #raid_day game_state matches 1 as @a[scores={player_kills=1..}] unless entity @a[scores={killed_by_player=1..}] at @s run summon minecraft:item ~ ~0.5 ~ {Item:{id:"minecraft:name_tag",count:1,components:{"minecraft:custom_data":{score_tag:1b},"minecraft:custom_name":{text:"ป้ายชื่อคะแนน (+15)",color:"gold",bold:true,italic:false},"minecraft:lore":[{text:"ได้รับจากการสังหารผู้เล่น (Raid Day)",color:"gray",italic:false},{text:"มูลค่า 15 คะแนน",color:"yellow",italic:false},{text:"⚠️ ห้ามซ่อนใน Ender Chest",color:"red",italic:false}]}}}

# 1.3 บวกสถิติ Top Killer เฉพาะเมื่อเหยื่อไม่ติด Cooldown กันปั๊ม
execute if score #raid_day game_state matches 1 if entity @a[scores={killed_by_player=1..,pvp_cd=0}] as @a[scores={player_kills=1..}] run scoreboard players operation @s total_pvp_kills += @s player_kills
execute if score #raid_day game_state matches 1 as @a[scores={killed_by_player=1..,pvp_cd=0}] at @s run tellraw @a [{"text":"⚔️ [Raid Day] ","color":"red","bold":true},{"selector":"@s","color":"yellow"},{"text":" ถูกสังหาร! ดรอป ","color":"gray"},{"text":"[ป้ายชื่อคะแนน +15]","color":"gold","bold":true}]
execute if score #raid_day game_state matches 1 as @a[scores={player_kills=1..}] if entity @a[scores={killed_by_player=1..,pvp_cd=0}] at @s run playsound minecraft:entity.player.levelup master @a ~ ~ ~ 1 1.2

# แจ้งเตือนหากติด Cooldown กันปั๊ม Kill
execute if score #raid_day game_state matches 1 if entity @a[scores={killed_by_player=1..,pvp_cd=1..}] as @a[scores={player_kills=1..}] run tellraw @s [{"text":"⏳ [PvP] ","color":"yellow","bold":true},{"text":"ผู้เล่นนี้เพิ่งถูกสังหารไปไม่นาน (ติด Cooldown 5 นาที) จึงไม่ดรอปป้ายชื่อคะแนน","color":"gray"}]

# ตั้ง Cooldown 5 นาที (6000 ticks) ให้เหยื่อที่เพิ่งดรอปป้ายชื่อในวัน Raid Day
execute if score #raid_day game_state matches 1 run scoreboard players set @a[scores={killed_by_player=1..,pvp_cd=0}] pvp_cd 6000

# 2. กรณีนอกวัน Raid Day (#raid_day == 0)
execute if score #raid_day game_state matches 0 as @a[scores={player_kills=1..}] run tellraw @s [{"text":"🕊️ [NBs SMP] ","color":"yellow","bold":true},{"text":"ยังไม่ใช่วัน Raid Day! การสังหารผู้เล่นจะไม่ได้รับป้ายชื่อคะแนน","color":"gray"}]

# 3. สะสมสถิติส่วนตัวระยะยาว (Lifetime K/D & Streak) ก่อนรีเซ็ตตัวนับรอบ Tick
execute as @a[scores={player_kills=1..}] run scoreboard players operation @s lifetime_kills += @s player_kills
execute as @a[scores={player_kills=1..}] run scoreboard players operation @s kill_streak += @s player_kills
execute as @a[scores={player_kills=1..}] if score @s kill_streak > @s best_streak run scoreboard players operation @s best_streak = @s kill_streak
execute as @a[scores={player_deaths=1..}] run scoreboard players operation @s lifetime_deaths += @s player_deaths
scoreboard players set @a[scores={player_deaths=1..}] kill_streak 0

# 4. รีเซ็ตตัวตรวจจับรอบนั้น
scoreboard players set @a player_kills 0
scoreboard players set @a player_deaths 0
scoreboard players set @a killed_by_player 0
