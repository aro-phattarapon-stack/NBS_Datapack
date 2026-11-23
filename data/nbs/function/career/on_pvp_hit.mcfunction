# เมื่อผู้เล่นถูกผู้เล่นคนอื่นโจมตี -> ติด Combat Tag 10 วินาที (200 ticks) และถอดบัฟวิ่ง/ตีออกทันที
scoreboard players set @s combat_tag 200
execute if score @s career_id matches 3 run effect clear @s minecraft:strength
execute if score @s career_id matches 4 run effect clear @s minecraft:speed
execute if score @s career_id matches 4 run effect clear @s minecraft:dolphins_grace
advancement revoke @s only nbs:combat_tag
advancement revoke @s only nbs:combat_tag_attacker
