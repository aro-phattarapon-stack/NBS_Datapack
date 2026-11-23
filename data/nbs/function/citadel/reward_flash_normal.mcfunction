# รางวัลทีมลำดับถัดมาที่ส่งเควสด่วนทันเวลา (+25 แต้ม)
$scoreboard players add #team_$(team) team_quest_pts 25
scoreboard players add @s player_quests_done 1
$tellraw @a [{"text":"⚡ [เควสด่วน] ","color":"gold","bold":true},{"text":"Team $(team) ","color":"aqua","bold":true},{"text":"ส่ง ","color":"gray"},{"text":"$(name)","color":"yellow","bold":true},{"text":" สำเร็จ! (+25 แต้ม)","color":"green"}]
execute at @s run playsound minecraft:entity.player.levelup master @a ~ ~ ~ 0.8 1.2
