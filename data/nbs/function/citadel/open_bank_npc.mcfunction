# เมนูเมื่อคลิกขวาที่ NPC นายธนาคาร & คลังธง (Treasury Keeper)
tellraw @s {"text":"========================================","color":"dark_gray","bold":true}
tellraw @s {"text":" 💎 นายธนาคาร & คลังธง — The Citadel (0, 0)","color":"aqua","bold":true}
tellraw @s {"text":"========================================","color":"dark_gray","bold":true}
tellraw @s [{"text":" 🚩 [ซื้อธงอาณาเขตเพิ่ม (ใช้ 32 Diamonds)]","color":"red","bold":true,"click_event":{"action":"run_command","command":"/trigger citadel set 2"}}]
tellraw @s [{"text":" 💎 ฝากเพชรเข้าธนาคารทีม (ชิงโบนัส +80): ","color":"gray"},{"text":"[ฝาก 16 เม็ด] ","color":"aqua","bold":true,"click_event":{"action":"run_command","command":"/trigger citadel set 3"}},{"text":"[ฝาก 64 เม็ด]","color":"aqua","bold":true,"click_event":{"action":"run_command","command":"/trigger citadel set 4"}}]
tellraw @s {"text":" 💡 กดเลือกปุ่มด้านบนเพื่อแลก/ฝากเพชรจากกระเป๋าของคุณได้ทันที","color":"gray"}
tellraw @s {"text":"========================================","color":"dark_gray","bold":true}
execute at @s run playsound minecraft:entity.villager.celebrate master @s ~ ~ ~ 0.8 1.2
