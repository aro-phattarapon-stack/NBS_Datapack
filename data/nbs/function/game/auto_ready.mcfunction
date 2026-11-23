# สุ่มทีม + สายอาชีพให้ผู้เล่นทุกคนที่ยังเลือกไม่ครบ แล้วเช็กความพร้อมอีกครั้ง (1-Click Ready)
function nbs:team/auto_assign
function nbs:career/auto_assign
tellraw @a [{"text":"✅ [NBs SMP] ","color":"green","bold":true},{"text":"จัดทีมและสายอาชีพให้คนที่ยังไม่พร้อมครบทุกคนแล้ว! กด ","color":"gray"},{"text":"[ ▶ เริ่มเกมทันที ]","color":"green","bold":true,"click_event":{"action":"run_command","command":"/function nbs:game/start"}}]
