# บันทึกว่าทีมนี้ส่งเควสสำเร็จแล้ว บวกคะแนน และประกาศทั้งเซิร์ฟเวอร์
$data modify storage nbs:citadel quests.q$(q).t$(team) set value 1b
$scoreboard players add #team_$(team) team_quest_pts $(pts)
scoreboard players add @s player_quests_done 1
$tellraw @a [{"text":"🏰 [The Citadel] ","color":"gold","bold":true},{"text":"Team $(team) ","color":"aqua","bold":true},{"text":"ส่งเควส ","color":"gray"},{"text":"$(name)","color":"yellow","bold":true},{"text":" สำเร็จ! (+$(pts) แต้ม)","color":"green"}]
execute at @s run playsound minecraft:ui.toast.challenge_complete master @a ~ ~ ~ 0.8 1.2
