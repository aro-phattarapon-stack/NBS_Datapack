# รอจนกว่า Chunk รอบ (0, 0) ทั้ง 45x45 บล็อกจะโหลดเสร็จจริง (ป้องกันคำสั่ง /fill ล้มเหลวตอนเปิดโลกใหม่) แล้วจึงสร้างป้อมทันที!
execute unless score #citadel_ready nbs_wg_tmp matches 1 unless entity @e[tag=citadel_built_anchor] if loaded -22 64 -22 if loaded 22 64 22 if loaded -22 64 22 if loaded 22 64 -22 if loaded 0 64 0 run function nbs_worldgen:build_citadel
