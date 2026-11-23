# ==========================================
# ระบบสุ่มจุดเกิดและเกิดใหม่ (RTP System)
# ==========================================
# (Objective death_track และ rnd_temp ถูกประกาศรวมศูนย์ไว้ใน score_setup แล้ว)

# 1. เมื่อผู้เล่นที่มีแท็ก just_died "กดปุ่มเกิดใหม่แล้ว" (@e[type=minecraft:player] จะจับเฉพาะตัวละครที่มีชีวิตแล้วเท่านั้น ไม่จับตอนค้างหน้าจอ You Died!)
# 1.1 กรณีกลับมาเกิดในเขต Spawn กลาง (0, 0) เพราะไม่มีเตียง/Respawn Anchor:
execute if score #game_state game_state matches 1 at @e[tag=spawn_anchor] positioned ~-86 -64 ~-86 as @e[type=minecraft:player,tag=just_died,dx=172,dy=384,dz=172] at @s run function nbs:rtp/respawn_rtp
execute if score #game_state game_state matches 0 at @e[tag=spawn_anchor] positioned ~-86 -64 ~-86 as @e[type=minecraft:player,tag=just_died,dx=172,dy=384,dz=172] run tag @s remove just_died

# 1.2 กรณีเกิดที่เตียง/Respawn Anchor (มีชีวิตแล้วและอยู่นอกเขต Spawn กลาง) -> ปลดแท็กทิ้ง ให้อยู่ที่เตียงตามปกติ
execute as @e[type=minecraft:player,tag=just_died] run tag @s remove just_died

# 2. บันทึกผู้เล่นที่เพิ่งตายใน Tick นี้ (เมื่อตายให้ติดแท็ก just_died รอจนกว่าจะกดปุ่มเกิดใหม่)
execute as @a[scores={death_track=1..}] run tag @s add just_died
scoreboard players set @a[scores={death_track=1..}] death_track 0
