# เมนูเมื่อคลิกขวาที่ NPC ครูฝึกอาชีพ & จัดการทีม (Career & Team Master)
tellraw @s {"text":"========================================","color":"dark_gray","bold":true}
tellraw @s {"text":" ⚔️ ครูฝึกอาชีพ & ทีม — The Citadel (0, 0)","color":"light_purple","bold":true}
tellraw @s {"text":"========================================","color":"dark_gray","bold":true}
tellraw @s [{"text":" 🛠️ [เลือก / เปลี่ยนสายอาชีพ (4 สายอาชีพ)]  ","color":"aqua","bold":true,"click_event":{"action":"run_command","command":"/trigger career"}},{"text":"📋 [ดูเช็กลิสต์คะแนนอาชีพทีม]","color":"yellow","bold":true,"click_event":{"action":"run_command","command":"/trigger career set 98"}}]
tellraw @s [{"text":" 👥 [เลือก / ดูรายชื่อทีม]  ","color":"green","bold":true,"click_event":{"action":"run_command","command":"/trigger join_team set 98"}},{"text":"📘 [รับสมุดคู่มือกติกา (ถ้าต้องการ)]","color":"blue","bold":true,"click_event":{"action":"run_command","command":"/trigger guide"}}]
tellraw @s {"text":"========================================","color":"dark_gray","bold":true}
execute at @s run playsound minecraft:entity.villager.ambient master @s ~ ~ ~ 1 1.0
