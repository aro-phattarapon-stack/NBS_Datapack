# ==========================================
# ระบบจัดการและซิงค์ทีม (Vanilla /team <-> Scoreboard team_id 1-8)
# ==========================================
scoreboard players enable @a join_team

# 1. เปิดเมนูรายชื่อทีมทั้งหมดที่เปิดอยู่ (/trigger join_team set 98)
execute as @a[scores={join_team=98}] run function nbs:team/open_join_menu

# 2. ล็อกทีมหลังเริ่มเกมแล้ว (#game_state == 1): ห้ามคนที่เลือกทีมแล้วสลับทีมหรือออกจากทีม (อนุญาตเฉพาะคนยังไม่มีทีม team_id=0 เข้าทีมได้)
execute if score #game_state game_state matches 1 as @a[scores={join_team=1..8,team_id=1..8}] run tellraw @s [{"text":"❌ [ระบบทีม] ","color":"red","bold":true},{"text":"เกมเริ่มแล้ว! ไม่สามารถเปลี่ยนทีมได้","color":"yellow"}]
execute if score #game_state game_state matches 1 as @a[scores={join_team=99,team_id=1..8}] run tellraw @s [{"text":"❌ [ระบบทีม] ","color":"red","bold":true},{"text":"เกมเริ่มแล้ว! ไม่สามารถออกจากทีมได้","color":"yellow"}]
execute if score #game_state game_state matches 1 as @a[scores={join_team=1..99,team_id=1..8}] unless score @s join_team matches 98 at @s run playsound minecraft:block.note_block.bass master @s ~ ~ ~ 1 0.8

# 3. ประมวลผลคำสั่งเลือกทีม (1-8) สำหรับช่วง Lobby หรือผู้เล่นเข้าใหม่ที่ยังไม่มีทีม (team_id=0)
execute if score #game_state game_state matches 0 as @a[scores={join_team=1..8}] run function nbs:team/try_join_team
execute if score #game_state game_state matches 1 as @a[scores={join_team=1..8,team_id=0}] run function nbs:team/try_join_team

# 4. ออกจากทีม (99) — ทำได้เฉพาะช่วง Lobby (#game_state == 0)
execute if score #game_state game_state matches 0 as @a[scores={join_team=99}] run team leave @s
execute if score #game_state game_state matches 0 as @a[scores={join_team=99}] run tellraw @s [{"text":"[NBs SMP] ","color":"gray","bold":true},{"text":"คุณได้ออกจากทีมแล้ว","color":"yellow"}]

scoreboard players set @a[scores={join_team=1..}] join_team 0

# 5. ซิงค์ทีม Vanilla (/team) -> team_id เสมอ (รองรับทั้ง 1-8 ทีม)
execute as @a[team=team_1] run scoreboard players set @s team_id 1
execute as @a[team=team_2] run scoreboard players set @s team_id 2
execute as @a[team=team_3] run scoreboard players set @s team_id 3
execute as @a[team=team_4] run scoreboard players set @s team_id 4
execute as @a[team=team_5] run scoreboard players set @s team_id 5
execute as @a[team=team_6] run scoreboard players set @s team_id 6
execute as @a[team=team_7] run scoreboard players set @s team_id 7
execute as @a[team=team_8] run scoreboard players set @s team_id 8
execute as @a[team=] run scoreboard players set @s team_id 0
