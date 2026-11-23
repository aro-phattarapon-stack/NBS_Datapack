# เมนูจัดการทีมแบบใช้ง่ายสำหรับแอดมิน (/function nbs:team/admin_menu)
function nbs:team/ensure_defaults
tellraw @s {"text":"========================================","color":"dark_gray","bold":true}
tellraw @s [{"text":" ⚙️ จัดการทีม (Easy Team Manager)  ","color":"gold","bold":true},{"text":"[➕เพิ่ม 1 ทีม]","color":"green","bold":true,"click_event":{"action":"run_command","command":"/function nbs:team/add_team"}}]
tellraw @s [{"text":" จำนวนทีม (1-Click): ","color":"gray"},{"text":"[2] ","color":"white","bold":true,"click_event":{"action":"run_command","command":"/function nbs:team/set_count {count:2}"}},{"text":"[3] ","color":"white","bold":true,"click_event":{"action":"run_command","command":"/function nbs:team/set_count {count:3}"}},{"text":"[4★Default] ","color":"green","bold":true,"click_event":{"action":"run_command","command":"/function nbs:team/set_count {count:4}"}},{"text":"[5] ","color":"white","bold":true,"click_event":{"action":"run_command","command":"/function nbs:team/set_count {count:5}"}},{"text":"[6] ","color":"white","bold":true,"click_event":{"action":"run_command","command":"/function nbs:team/set_count {count:6}"}},{"text":"[7] ","color":"white","bold":true,"click_event":{"action":"run_command","command":"/function nbs:team/set_count {count:7}"}},{"text":"[8]","color":"white","bold":true,"click_event":{"action":"run_command","command":"/function nbs:team/set_count {count:8}"}}]
tellraw @s [{"text":" เครื่องมือด่วน: ","color":"gray"},{"text":"[🎲สุ่มทีมให้คนไร้ทีม] ","color":"aqua","bold":true,"click_event":{"action":"run_command","command":"/function nbs:team/auto_assign"}},{"text":"[🔄รีเซ็ต 4 ทีม] ","color":"yellow","bold":true,"click_event":{"action":"run_command","command":"/function nbs:team/reset_teams"}},{"text":"[▶เริ่มเกม]","color":"green","bold":true,"click_event":{"action":"run_command","command":"/function nbs:game/start"}}]
tellraw @s {"text":"========================================","color":"dark_gray","bold":true}

execute if score #t1_active game_state matches 1 run function nbs:team/print_admin_row with storage nbs:team t1
execute if score #t2_active game_state matches 1 run function nbs:team/print_admin_row with storage nbs:team t2
execute if score #t3_active game_state matches 1 run function nbs:team/print_admin_row with storage nbs:team t3
execute if score #t4_active game_state matches 1 run function nbs:team/print_admin_row with storage nbs:team t4
execute if score #t5_active game_state matches 1 run function nbs:team/print_admin_row with storage nbs:team t5
execute if score #t6_active game_state matches 1 run function nbs:team/print_admin_row with storage nbs:team t6
execute if score #t7_active game_state matches 1 run function nbs:team/print_admin_row with storage nbs:team t7
execute if score #t8_active game_state matches 1 run function nbs:team/print_admin_row with storage nbs:team t8

tellraw @s {"text":" 💡 แก้ชื่อง่ายสุด: ตั้งชื่อกระดาษในทั่ง (Anvil) ถือในมือแล้วกด [🏷️ชื่อจากของในมือ] หรือกด [✏️พิมพ์ชื่อ] แล้วเติมชื่อใน \"\" ได้เลย!","color":"gray"}
tellraw @s {"text":"========================================","color":"dark_gray","bold":true}
