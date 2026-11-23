# พิมพ์คะแนนเช็กลิสต์แยกสายอาชีพและโควตาของสะสมของ Team $(team)
$scoreboard players add #t$(team)_c_farmer team_career_pts 0
$scoreboard players add #t$(team)_c_blacksmith team_career_pts 0
$scoreboard players add #t$(team)_c_hunter team_career_pts 0
$scoreboard players add #t$(team)_c_adventurer team_career_pts 0
$scoreboard players add #t$(team)_trim team_boss_cnt 0
$scoreboard players add #t$(team)_head team_boss_cnt 0
$scoreboard players add #t$(team)_sherd team_boss_cnt 0

$tellraw @s [{"text":" • 🌾 Farmer (พืช/ไม้/สัตว์): ","color":"green"},{"score":{"name":"#t$(team)_c_farmer","objective":"team_career_pts"},"color":"gold","bold":true},{"text":" แต้ม","color":"gray"}]
$tellraw @s [{"text":" • ⚒️ Blacksmith (แร่/เกราะ/Trim): ","color":"white"},{"score":{"name":"#t$(team)_c_blacksmith","objective":"team_career_pts"},"color":"gold","bold":true},{"text":" แต้ม (Trims: ","color":"gray"},{"score":{"name":"#t$(team)_trim","objective":"team_boss_cnt"},"color":"aqua"},{"text":"/10)","color":"gray"}]
$tellraw @s [{"text":" • ⚔️ Monster Hunter (ล่ามอน/ดรอป/หัว): ","color":"red"},{"score":{"name":"#t$(team)_c_hunter","objective":"team_career_pts"},"color":"gold","bold":true},{"text":" แต้ม (หัวมอน: ","color":"gray"},{"score":{"name":"#t$(team)_head","objective":"team_boss_cnt"},"color":"aqua"},{"text":"/3)","color":"gray"}]
$tellraw @s [{"text":" • 🧭 Adventurer (โครงสร้าง/Sherd/ของโบราณ): ","color":"aqua"},{"score":{"name":"#t$(team)_c_adventurer","objective":"team_career_pts"},"color":"gold","bold":true},{"text":" แต้ม (Sherds: ","color":"gray"},{"score":{"name":"#t$(team)_sherd","objective":"team_boss_cnt"},"color":"aqua"},{"text":"/12)","color":"gray"}]
$tellraw @s [{"text":" ⭐ รวมคะแนนเช็กลิสต์อาชีพของทีม: ","color":"yellow","bold":true},{"score":{"name":"#team_$(team)","objective":"team_career_pts"},"color":"gold","bold":true},{"text":" แต้ม","color":"yellow"}]
