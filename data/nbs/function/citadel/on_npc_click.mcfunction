# ทำงานทันทีเมื่อผู้เล่น (@s) คลิกขวาที่ NPC ประจำป้อม The Citadel
advancement revoke @s only nbs:citadel_npc

# ยิง Raycast จากระดับสายตาไปยัง Hitbox ของ NPC ทั้ง 3 ตัว
scoreboard players set #npc_found rnd_temp 0
execute anchored eyes positioned ^ ^ ^0.5 run function nbs:citadel/raycast_npc
