# เสก NPC 3 ตัวประจำป้อม The Citadel (0, 0) และป้ายต้อนรับกลางลานรอบหมุด spawn_anchor
kill @e[type=minecraft:text_display,tag=citadel_title]
kill @e[tag=citadel_npc]
kill @e[tag=citadel_npc_hit]

# 1. ทิศเหนือ (0, -7): ผู้ดูแลเควส
execute at @e[tag=spawn_anchor,limit=1] positioned ~ ~ ~-7 run summon minecraft:villager ~ ~ ~ {Tags:["citadel_npc"],NoAI:1b,Invulnerable:1b,Silent:1b,PersistenceRequired:1b,Rotation:[0f,0f],VillagerData:{profession:"minecraft:librarian",type:"minecraft:plains",level:5}}
execute at @e[tag=spawn_anchor,limit=1] positioned ~ ~ ~-7 run summon minecraft:interaction ~ ~ ~ {Tags:["citadel_npc","citadel_npc_hit","npc_quest"],width:1.1f,height:2.15f,response:1b}
execute at @e[tag=spawn_anchor,limit=1] positioned ~ ~ ~-7 run summon minecraft:text_display ~ ~2.55 ~ {Tags:["citadel_npc"],billboard:"center",background:1073741824,view_range:0.4f,text:["",{"text":"📜 ผู้ดูแลเควส (Quest Master)\n","color":"yellow","bold":true},{"text":"[คลิกขวาเพื่อส่งเควส 16 ใบ & เควสด่วน]","color":"green"}]}

# 2. ทิศตะวันออก (+7, 0): นายธนาคาร & คลังธง
execute at @e[tag=spawn_anchor,limit=1] positioned ~7 ~ ~ run summon minecraft:villager ~ ~ ~ {Tags:["citadel_npc"],NoAI:1b,Invulnerable:1b,Silent:1b,PersistenceRequired:1b,Rotation:[90f,0f],VillagerData:{profession:"minecraft:armorer",type:"minecraft:plains",level:5}}
execute at @e[tag=spawn_anchor,limit=1] positioned ~7 ~ ~ run summon minecraft:interaction ~ ~ ~ {Tags:["citadel_npc","citadel_npc_hit","npc_bank"],width:1.1f,height:2.15f,response:1b}
execute at @e[tag=spawn_anchor,limit=1] positioned ~7 ~ ~ run summon minecraft:text_display ~ ~2.55 ~ {Tags:["citadel_npc"],billboard:"center",background:1073741824,view_range:0.4f,text:["",{"text":"💎 นายธนาคาร & คลังธง\n","color":"aqua","bold":true},{"text":"[คลิกขวาเพื่อซื้อธง 32 เพชร & ฝากเพชรทีม]","color":"green"}]}

# 3. ทิศตะวันตก (-7, 0): ครูฝึกอาชีพ & ทีม
execute at @e[tag=spawn_anchor,limit=1] positioned ~-7 ~ ~ run summon minecraft:villager ~ ~ ~ {Tags:["citadel_npc"],NoAI:1b,Invulnerable:1b,Silent:1b,PersistenceRequired:1b,Rotation:[-90f,0f],VillagerData:{profession:"minecraft:weaponsmith",type:"minecraft:plains",level:5}}
execute at @e[tag=spawn_anchor,limit=1] positioned ~-7 ~ ~ run summon minecraft:interaction ~ ~ ~ {Tags:["citadel_npc","citadel_npc_hit","npc_career"],width:1.1f,height:2.15f,response:1b}
execute at @e[tag=spawn_anchor,limit=1] positioned ~-7 ~ ~ run summon minecraft:text_display ~ ~2.55 ~ {Tags:["citadel_npc"],billboard:"center",background:1073741824,view_range:0.4f,text:["",{"text":"⚔️ ครูฝึกอาชีพ & จัดการทีม\n","color":"light_purple","bold":true},{"text":"[คลิกขวาเพื่อเลือกอาชีพ / เช็กลิสต์ / เลือกทีม]","color":"green"}]}

# 4. ป้ายลอยต้อนรับเหนือแท่น Beacon กลางเมือง
execute at @e[tag=spawn_anchor,limit=1] run summon minecraft:text_display ~ ~4.2 ~ {Tags:["citadel_title"],billboard:"center",background:1073741824,view_range:0.6f,text:["",{"text":"🏰 THE CITADEL (0, 0)\n","color":"gold","bold":true},{"text":"เขตปลอดภัย (ห้าม PvP) — คลิกขวาที่ NPC รอบลานเพื่อใช้งาน","color":"yellow"}]}
