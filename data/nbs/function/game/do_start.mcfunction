# ==========================================
# ประมวลผลเริ่มเกมจริงและสุ่มวาร์ปแยกตามทีม (เรียกเมื่อผ่าน Ready Check หรือ Admin กด Force Start)
# ==========================================
function nbs:team/ensure_defaults
scoreboard players set #game_state game_state 1
scoreboard players set #raid_day game_state 0
scoreboard players set #flash_timer rnd_temp 0
scoreboard players set #flash_cooldown rnd_temp 1800
bossbar set nbs:flash_quest visible false

# ล้างพิกัดจุดเกิดทีมเก่าและสถานะการวาร์ปเดิม เพื่อให้ทุกคนถูกสุ่มวาร์ปแยกตามทีมพร้อมกัน
kill @e[type=minecraft:marker,tag=team_spawn]
data remove storage nbs:game team_spawn
tag @a remove rtp_joined
tag @a remove just_died

# อัปเดตชื่อและสีทีมบน Scoreboard Sidebar ให้ตรงล่าสุด
function nbs:team/refresh_all_styles

# วาร์ปผู้เล่นทุกคนที่มีทีมแล้ว (team_id 1-8) และไม่ใช่ Spectator ไปยังจุดเกิดทีมของตัวเอง
execute as @a[gamemode=!spectator,scores={team_id=1..8}] at @s run function nbs:rtp/join_team_spawn

# แจ้งเตือนผู้เล่นที่ยังไม่ได้เลือกทีม (เฉพาะกรณี Admin กด Force Start ข้ามคนที่ยังไม่เลือก)
execute as @a[gamemode=!spectator,scores={team_id=0}] run tellraw @s [{"text":"⚠️ [NBs SMP] ","color":"gold","bold":true},{"text":"เกมเริ่มแล้ว! กรุณาเลือกทีมและสายอาชีพให้ครบเพื่อวาร์ปไปยังจุดเกิดของทีม","color":"yellow"}]

# แจ้งเตือนทั้งเซิร์ฟเวอร์
tellraw @a [{"text":"🚀 [NBs SMP] ","color":"gold","bold":true},{"text":"แอดมินได้เริ่มเกมแล้ว! สมาชิกแต่ละทีมถูกส่งไปยังจุดเกิดในป่าเรียบร้อย","color":"green"}]
playsound minecraft:ui.toast.challenge_complete master @a ~ ~ ~ 1 1
