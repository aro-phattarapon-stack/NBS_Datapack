# ==========================================
# ระบบสมุดสถิติและคะแนนบอส (Trigger ทำงานทุก Tick, คำนวณหนักทุก 20 Ticks = 1Hz)
# ==========================================
scoreboard players enable @a view_stats
execute as @a[scores={view_stats=1..}] run function nbs:scoreboard/show_stats_book
scoreboard players set @a[scores={view_stats=1..}] view_stats 0

scoreboard players add #stats_tick rnd_temp 1
execute if score #stats_tick rnd_temp matches 20.. run function nbs:scoreboard/stats_tick_1hz
