# รางวัลทีมแรกที่ส่งเควสด่วนทัน (+25 + โบนัส +10 = +35 แต้ม)
scoreboard players set #flash_first rnd_temp 1
$scoreboard players add #team_$(team) team_quest_pts 35
scoreboard players add @s player_quests_done 1
$tellraw @a [{"text":"⚡ [เควสด่วน - ทีมแรก!] ","color":"gold","bold":true},{"text":"Team $(team) ","color":"aqua","bold":true},{"text":"ส่ง ","color":"gray"},{"text":"$(name)","color":"yellow","bold":true},{"text":" เป็นทีมแรก! (+35 แต้ม)","color":"green","bold":true}]
execute at @s run playsound minecraft:ui.toast.challenge_complete master @a ~ ~ ~ 0.9 1.3
