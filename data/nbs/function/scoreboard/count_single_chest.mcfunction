# 1. เช็กว่าตำแหน่งของหมุดนี้ยังมีบล็อกกล่องหรือถังอยู่จริงไหม ถ้าไม่มีให้ล้างสถานะและลบหมุดทิ้ง
execute if entity @s[tag=hidden_chest] unless block ~ ~ ~ minecraft:chest unless block ~ ~ ~ minecraft:trapped_chest unless block ~ ~ ~ minecraft:barrel run function nbs:scoreboard/clear_hidden_chest
execute unless block ~ ~ ~ minecraft:chest unless block ~ ~ ~ minecraft:trapped_chest unless block ~ ~ ~ minecraft:barrel run kill @s

# ==========================================
# 2. ตรวจสอบว่ากล่องนี้อยู่ในรัศมี 32 บล็อกของธงอาณาเขตทีมใด (นับคะแนนเฉพาะกล่องในเขตธงเท่านั้น!)
# ==========================================
scoreboard players set #chest_owner team_id 0
execute if entity @e[type=minecraft:marker,tag=flag_anchor,distance=..32] run scoreboard players operation #chest_owner team_id = @e[type=minecraft:marker,tag=flag_anchor,distance=..32,sort=nearest,limit=1] team_id

# ==========================================
# 3. รีเซ็ตตัวนับไอเทมชิงชัยในกล่อง และสแกนของในกล่อง
# ==========================================
scoreboard players set #egg_in_chest item_count 0
scoreboard players set #nametag_in_chest item_count 0
scoreboard players set #star_in_chest item_count 0

execute if data block ~ ~ ~ Items[0] run function nbs:scoreboard/calc_chest_items

# ==========================================
# 4. หากอยู่นอกรัศมีอาณาเขตธง (#chest_owner team_id == 0) ให้เช็กการซ่อนไอเทมนับคะแนน
# ==========================================
execute if score #chest_owner team_id matches 0 run function nbs:scoreboard/check_hidden_chest

# ==========================================
# 5. หากอยู่ในเขตธง (#chest_owner team_id 1..8) ให้นับคะแนนเข้าทีม
# ==========================================
# หากเคยติดแท็ก hidden_chest (เช่น เพิ่งปักธงครอบกล่องนอกเขต) ให้เคลียร์สถานะแจ้งเตือนออก
execute if score #chest_owner team_id matches 1.. if entity @s[tag=hidden_chest] run function nbs:scoreboard/clear_hidden_chest

# ==========================================
# 4. คำนวณคะแนนไข่มังกร (ฟองละ 150 แต้ม)
# ==========================================
scoreboard players set #val item_value 150
execute if score #egg_in_chest item_count matches 1.. run scoreboard players operation #egg_in_chest item_count *= #val item_value

# ==========================================
# 5. คำนวณคะแนนป้ายชื่อ (ชิ้นละ 15 แต้ม)
# ==========================================
scoreboard players set #val item_value 15
execute if score #nametag_in_chest item_count matches 1.. run scoreboard players operation #nametag_in_chest item_count *= #val item_value

# ==========================================
# 6. รวมคะแนนเข้าทีมที่เป็นเจ้าของธงอาณาเขต! (ต้องเก็บไว้ในกล่องเขตธงเท่านั้นจึงจะได้แต้ม)
# ==========================================
# รวมคะแนนไข่มังกรเข้าทีมเจ้าของกล่อง (1-8)
execute if score #chest_owner team_id matches 1 if score #egg_in_chest item_count matches 1.. run scoreboard players operation ทีมที่_1 team_score += #egg_in_chest item_count
execute if score #chest_owner team_id matches 2 if score #egg_in_chest item_count matches 1.. run scoreboard players operation ทีมที่_2 team_score += #egg_in_chest item_count
execute if score #chest_owner team_id matches 3 if score #egg_in_chest item_count matches 1.. run scoreboard players operation ทีมที่_3 team_score += #egg_in_chest item_count
execute if score #chest_owner team_id matches 4 if score #egg_in_chest item_count matches 1.. run scoreboard players operation ทีมที่_4 team_score += #egg_in_chest item_count
execute if score #chest_owner team_id matches 5 if score #egg_in_chest item_count matches 1.. run scoreboard players operation ทีมที่_5 team_score += #egg_in_chest item_count
execute if score #chest_owner team_id matches 6 if score #egg_in_chest item_count matches 1.. run scoreboard players operation ทีมที่_6 team_score += #egg_in_chest item_count
execute if score #chest_owner team_id matches 7 if score #egg_in_chest item_count matches 1.. run scoreboard players operation ทีมที่_7 team_score += #egg_in_chest item_count
execute if score #chest_owner team_id matches 8 if score #egg_in_chest item_count matches 1.. run scoreboard players operation ทีมที่_8 team_score += #egg_in_chest item_count

# รวมคะแนนป้ายชื่อเข้าทีมเจ้าของกล่อง (1-8)
execute if score #chest_owner team_id matches 1 if score #nametag_in_chest item_count matches 1.. run scoreboard players operation ทีมที่_1 team_score += #nametag_in_chest item_count
execute if score #chest_owner team_id matches 2 if score #nametag_in_chest item_count matches 1.. run scoreboard players operation ทีมที่_2 team_score += #nametag_in_chest item_count
execute if score #chest_owner team_id matches 3 if score #nametag_in_chest item_count matches 1.. run scoreboard players operation ทีมที่_3 team_score += #nametag_in_chest item_count
execute if score #chest_owner team_id matches 4 if score #nametag_in_chest item_count matches 1.. run scoreboard players operation ทีมที่_4 team_score += #nametag_in_chest item_count
execute if score #chest_owner team_id matches 5 if score #nametag_in_chest item_count matches 1.. run scoreboard players operation ทีมที่_5 team_score += #nametag_in_chest item_count
execute if score #chest_owner team_id matches 6 if score #nametag_in_chest item_count matches 1.. run scoreboard players operation ทีมที่_6 team_score += #nametag_in_chest item_count
execute if score #chest_owner team_id matches 7 if score #nametag_in_chest item_count matches 1.. run scoreboard players operation ทีมที่_7 team_score += #nametag_in_chest item_count
execute if score #chest_owner team_id matches 8 if score #nametag_in_chest item_count matches 1.. run scoreboard players operation ทีมที่_8 team_score += #nametag_in_chest item_count

# รวมจำนวน Nether Star เข้าตัวแปรทีม (1-8)
execute if score #chest_owner team_id matches 1 if score #star_in_chest item_count matches 1.. run scoreboard players operation #t1_star team_boss_cnt += #star_in_chest item_count
execute if score #chest_owner team_id matches 2 if score #star_in_chest item_count matches 1.. run scoreboard players operation #t2_star team_boss_cnt += #star_in_chest item_count
execute if score #chest_owner team_id matches 3 if score #star_in_chest item_count matches 1.. run scoreboard players operation #t3_star team_boss_cnt += #star_in_chest item_count
execute if score #chest_owner team_id matches 4 if score #star_in_chest item_count matches 1.. run scoreboard players operation #t4_star team_boss_cnt += #star_in_chest item_count
execute if score #chest_owner team_id matches 5 if score #star_in_chest item_count matches 1.. run scoreboard players operation #t5_star team_boss_cnt += #star_in_chest item_count
execute if score #chest_owner team_id matches 6 if score #star_in_chest item_count matches 1.. run scoreboard players operation #t6_star team_boss_cnt += #star_in_chest item_count
execute if score #chest_owner team_id matches 7 if score #star_in_chest item_count matches 1.. run scoreboard players operation #t7_star team_boss_cnt += #star_in_chest item_count
execute if score #chest_owner team_id matches 8 if score #star_in_chest item_count matches 1.. run scoreboard players operation #t8_star team_boss_cnt += #star_in_chest item_count
