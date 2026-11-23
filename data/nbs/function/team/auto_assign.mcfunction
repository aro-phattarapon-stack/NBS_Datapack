# สุ่มกระจายผู้เล่นที่ยังไม่มีทีม (team_id=0, ไม่ใช่ Spectator) เข้าสู่ทีมที่เปิดใช้งานอยู่อย่างสมดุล
function nbs:team/ensure_defaults
scoreboard players add @a team_id 0

scoreboard players set #assigned_cnt rnd_temp 0
execute as @a[gamemode=!spectator,scores={team_id=0}] run function nbs:team/assign_one_player

execute if score #assigned_cnt rnd_temp matches 0 run tellraw @a [{"text":"ℹ️ [ระบบทีม] ","color":"aqua","bold":true},{"text":"ผู้เล่นทุกคนมีทีมอยู่แล้ว ไม่มีคนไร้ทีมให้สุ่ม","color":"gray"}]
execute if score #assigned_cnt rnd_temp matches 1.. run tellraw @a [{"text":"🎲 [ระบบทีม] ","color":"green","bold":true},{"text":"แอดมินได้สุ่มจัดทีมให้ผู้เล่นที่ยังไม่มีทีมเรียบร้อยแล้ว!","color":"yellow"}]
