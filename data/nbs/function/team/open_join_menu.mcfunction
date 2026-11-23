# เมนูเลือกทีมแบบไดนามิกสำหรับผู้เล่น (/trigger join_team set 98) — แสดงเฉพาะทีมที่เปิดอยู่พร้อมชื่อและสีจริง
function nbs:team/ensure_defaults
tellraw @s {"text":"========================================","color":"dark_gray","bold":true}
tellraw @s {"text":" 👥 เลือกเข้าร่วมทีม (คลิกที่ชื่อทีมได้เลย)","color":"gold","bold":true}
tellraw @s {"text":"========================================","color":"dark_gray","bold":true}

execute if score #t1_active game_state matches 1 run function nbs:team/print_join_row with storage nbs:team t1
execute if score #t2_active game_state matches 1 run function nbs:team/print_join_row with storage nbs:team t2
execute if score #t3_active game_state matches 1 run function nbs:team/print_join_row with storage nbs:team t3
execute if score #t4_active game_state matches 1 run function nbs:team/print_join_row with storage nbs:team t4
execute if score #t5_active game_state matches 1 run function nbs:team/print_join_row with storage nbs:team t5
execute if score #t6_active game_state matches 1 run function nbs:team/print_join_row with storage nbs:team t6
execute if score #t7_active game_state matches 1 run function nbs:team/print_join_row with storage nbs:team t7
execute if score #t8_active game_state matches 1 run function nbs:team/print_join_row with storage nbs:team t8

tellraw @s [{"text":"  [ ✖ ออกจากทีมปัจจุบัน ]","color":"gray","bold":true,"click_event":{"action":"run_command","command":"/trigger join_team set 99"}}]
tellraw @s {"text":"========================================","color":"dark_gray","bold":true}
