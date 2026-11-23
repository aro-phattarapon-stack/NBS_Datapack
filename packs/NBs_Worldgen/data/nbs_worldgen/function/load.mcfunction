# เตรียม Scoreboard และ Forceload รอบจุดศูนย์กลาง (0, 0) — การสร้างจริงจะทำงานทันทีใน tick เมื่อ Chunk โหลดเสร็จสมบูรณ์
scoreboard objectives add nbs_wg_tmp dummy
scoreboard players add #citadel_ready nbs_wg_tmp 0
forceload add -24 -24 24 24
