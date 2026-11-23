# ปิดโหมด Raid Day (กลับสู่ช่วงปกติ)
scoreboard players set #raid_day game_state 0
tellraw @a [{"text":"🕊️ [NBs SMP] ","color":"green","bold":true},{"text":"จบช่วง Raid Day แล้ว กลับสู่โหมดเอาชีวิตรอดปกติ","color":"yellow"}]
playsound minecraft:entity.player.levelup master @a ~ ~ ~ 1 1
