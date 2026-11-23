# นำผู้เล่นเข้าสู่ทีม $(team) พร้อมแสดงชื่อทีมและสีจริงที่ตั้งไว้
$team join team_$(team) @s
$tellraw @s [{"text":"[NBs SMP] ","color":"green","bold":true},{"text":"คุณได้เข้าร่วมทีม ","color":"yellow"},{"text":"$(name)","color":"$(color)","bold":true}]
execute at @s run playsound minecraft:entity.experience_orb.pickup master @s ~ ~ ~ 1 1.2
