# ==========================================
# คำสั่งรีเซ็ตเกมกลับสู่ Lobby สำหรับแอดมิน (/function nbs:game/reset)
# ==========================================
scoreboard players set #game_state game_state 0
scoreboard players set #raid_day game_state 0
kill @e[type=minecraft:marker,tag=team_spawn]
kill @e[type=minecraft:marker,tag=flag_anchor]
kill @e[type=minecraft:text_display,tag=flag_text]
kill @e[type=minecraft:marker,tag=chest_anchor]
kill @e[type=minecraft:marker,tag=hidden_chest]
data remove storage nbs:game team_spawn
tag @a remove rtp_joined
tag @a remove just_died
clear @a minecraft:written_book[custom_data={guide_book:1b}]
advancement revoke @a everything

# ล้างผู้เล่นออกจากทีมเดิมเพื่อให้เลือกทีมใหม่ใน Lobby
team empty team_1
team empty team_2
team empty team_3
team empty team_4
team empty team_5
team empty team_6
team empty team_7
team empty team_8

# รีเซ็ตคะแนนซีซัน อาชีพ และเควสทีมทั้งหมด (คงชื่อ สี และจำนวนทีมที่แอดมินตั้งไว้)
scoreboard players set @a team_id 0
scoreboard players set @a career_id 0
scoreboard players set @a combat_tag 0
scoreboard players set @a pvp_cd 0
scoreboard players set @a total_pvp_kills 0
scoreboard players reset * lifetime_kills
scoreboard players reset * lifetime_deaths
scoreboard players reset * kill_streak
scoreboard players reset * best_streak
scoreboard players reset * player_quests_done
scoreboard players reset * stat_dragon
scoreboard players reset * stat_wither
scoreboard players reset * stat_warden
scoreboard players reset * stat_elder
scoreboard players reset * stat_raid
scoreboard players reset * stat_trial
scoreboard players reset * pts_dragon
scoreboard players reset * pts_wither
scoreboard players reset * pts_warden
scoreboard players reset * pts_elder
scoreboard players reset * pts_raid
scoreboard players reset * pts_trial
scoreboard players reset * player_score
execute store result score #world_id game_state run random value 100000..999999
scoreboard players reset * team_diamonds
scoreboard players reset * team_quest_pts
scoreboard players reset * team_adv_pts
scoreboard players reset * team_career_pts
scoreboard players reset * team_boss_cnt
data remove storage nbs:citadel quests
data remove storage nbs:citadel flash
data remove storage nbs:citadel flash_done
data remove storage nbs:adv done
data remove storage nbs:career done
scoreboard players set #flash_timer rnd_temp 0
scoreboard players set #flash_first rnd_temp 0
scoreboard players set #flash_cooldown rnd_temp 1800
bossbar set nbs:flash_quest visible false

function nbs:team/ensure_defaults
function nbs:team/refresh_all_styles

# วาร์ปผู้เล่นทุกคนกลับจุด Spawn / Lobby
execute at @e[tag=spawn_anchor,limit=1] run tp @a ~ ~ ~
tellraw @a [{"text":"↺ [NBs SMP] ","color":"yellow","bold":true},{"text":"รีเซ็ตกลับสู่หน้า Lobby แล้ว กรุณาเปิดสมุดเพื่อเลือกทีมและสายอาชีพใหม่!","color":"gray"}]
