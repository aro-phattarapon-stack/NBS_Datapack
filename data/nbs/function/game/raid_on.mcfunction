# เปิดโหมด Raid Day (เปิด PvP + ดรอปป้ายชื่อคะแนน +15)
scoreboard players set #raid_day game_state 1
tellraw @a [{"text":"⚔️ [NBs SMP] ","color":"red","bold":true},{"text":"เข้าสู่ช่วง RAID DAY แล้ว! เปิดการต่อสู้ PvP และการชิงของนอกเขต The Citadel","color":"gold"}]
title @a times 10 60 20
title @a title {"text":"⚔️ RAID DAY เริ่มขึ้นแล้ว!","color":"red","bold":true}
title @a subtitle {"text":"ระวังตัวด้วย! PvP และการดรอปป้ายชื่อคะแนนทำงานแล้ว","color":"yellow"}
playsound minecraft:event.raid.horn master @a ~ ~ ~ 1 1
