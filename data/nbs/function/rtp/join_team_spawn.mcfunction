# ดึง team_id ของผู้เล่นมาตรวจสอบและวาร์ปไปยังพิกัดจุดเกิดของทีม (เก็บใน storage nbs:game team_spawn)
execute store result storage nbs:temp jts.team int 1 run scoreboard players get @s team_id
function nbs:rtp/ensure_team_spawn with storage nbs:temp jts

# ลบสมุดเลือกทีมออกจากตัว และแจกเฉพาะธงอาณาเขตประจำทีม (1 ต้น — ไม่แจกสมุดคู่มือรกกระเป๋า)
clear @s minecraft:written_book[custom_data={team_book:1b}]
function nbs:territory/give_flag

# ให้สถานะกันดาเมจ 5 วินาที และเปลี่ยนเป็นโหมด Survival ทันที
tag @s remove in_spawn
gamemode survival @s[gamemode=adventure]
effect give @s minecraft:resistance 5 255 true
effect give @s minecraft:slow_falling 5 1 true
effect give @s minecraft:fire_resistance 5 1 true

# บันทึกสถานะเข้าสู่เกมแล้ว
tag @s add rtp_joined

# แจ้งเตือนและเอฟเฟกต์ต้อนรับ
title @s times 10 70 20
title @s title {"text":"ยินดีต้อนรับสู่ NBs SMP!","color":"gold","bold":true}
title @s subtitle {"text":"วาร์ปเข้าสู่จุดเกิดของทีมในป่าเรียบร้อยแล้ว!","color":"yellow"}
playsound minecraft:entity.player.levelup master @s ~ ~ ~ 1 1
