# คำสั่งเสกป้ายชื่อคะแนน (+15 แต้ม) สำหรับทดสอบ
execute as @p run give @s minecraft:name_tag[custom_data={score_tag:1b},custom_name={text:"ป้ายชื่อคะแนน (+15)",color:"gold",bold:true,italic:false},lore=[{text:"ได้รับจากการสังหารผู้เล่น (Raid Day)",color:"gray",italic:false},{text:"มูลค่า 15 คะแนน",color:"yellow",italic:false},{text:"⚠️ ห้ามซ่อนใน Ender Chest",color:"red",italic:false}]] 1
execute as @p run tellraw @s [{"text":"[NBs SMP] ","color":"green","bold":true},{"text":"เสกป้ายชื่อคะแนน (+15) สำเร็จแล้ว!","color":"yellow"}]
