# ==========================================
# ติดตั้งตารางคะแนนและแถบแสดงผลข้างจอ (รันครั้งเดียวตอนโหลด)
# ==========================================
scoreboard objectives add team_score dummy {"text":"คะแนนทีม","color":"gold","bold":true}
scoreboard objectives add player_score dummy
scoreboard objectives add item_count dummy
scoreboard objectives add item_value dummy
scoreboard objectives add chest_score dummy
scoreboard objectives add team_diamonds dummy
scoreboard objectives add team_quest_pts dummy
scoreboard objectives add team_adv_pts dummy
scoreboard objectives add team_career_pts dummy
scoreboard objectives add team_boss_cnt dummy
scoreboard objectives add total_pvp_kills dummy

# ตรวจจับการเปิดและวางกล่อง/ถัง/Shulker Box
scoreboard objectives add open_chest minecraft.custom:minecraft.open_chest
scoreboard objectives add open_barrel minecraft.custom:minecraft.open_barrel
scoreboard objectives add open_shulker minecraft.custom:minecraft.open_shulker_box
scoreboard objectives add place_chest minecraft.used:minecraft.chest
scoreboard objectives add place_trapped minecraft.used:minecraft.trapped_chest
scoreboard objectives add place_barrel minecraft.used:minecraft.barrel

# ==========================================
# ตัวแปรสำหรับระบบสมุดสถิติ (Stats Book) และคะแนนบอส
# ==========================================
scoreboard objectives add stat_dragon dummy {"text":"Ender Dragon","color":"light_purple"}
scoreboard objectives add stat_wither dummy {"text":"Wither","color":"dark_gray"}
scoreboard objectives add stat_warden dummy {"text":"Warden","color":"aqua"}
scoreboard objectives add stat_elder dummy {"text":"Elder Guardian","color":"blue"}
scoreboard objectives add stat_raid dummy {"text":"Illager Raid","color":"gold"}
scoreboard objectives add stat_trial dummy {"text":"Ominous Trial Chamber","color":"green"}

# ตัวแปรเก็บคะแนนที่คูณแล้วของแต่ละหมวด
scoreboard objectives add pts_dragon dummy
scoreboard objectives add pts_wither dummy
scoreboard objectives add pts_warden dummy
scoreboard objectives add pts_elder dummy
scoreboard objectives add pts_raid dummy
scoreboard objectives add pts_trial dummy

# ตัวตรวจจับเหตุการณ์จริงจากระบบของเกม
scoreboard objectives add raw_kill_dragon minecraft.killed:minecraft.ender_dragon
scoreboard objectives add raw_kill_wither minecraft.killed:minecraft.wither
scoreboard objectives add raw_kill_warden minecraft.killed:minecraft.warden
scoreboard objectives add raw_kill_elder minecraft.killed:minecraft.elder_guardian
scoreboard objectives add raw_win_raid minecraft.custom:minecraft.raid_win
scoreboard objectives add raw_win_trial dummy
scoreboard objectives add player_kills playerKillCount
scoreboard objectives add player_deaths deathCount
scoreboard objectives add killed_by_player minecraft.killed_by:minecraft.player
scoreboard objectives add lifetime_kills dummy
scoreboard objectives add lifetime_deaths dummy
scoreboard objectives add kill_streak dummy
scoreboard objectives add best_streak dummy
scoreboard objectives add play_time_ticks minecraft.custom:minecraft.play_time
scoreboard objectives add player_quests_done dummy
scoreboard objectives add death_track deathCount
scoreboard objectives add time_since_death minecraft.custom:minecraft.time_since_death
scoreboard objectives add rnd_temp dummy
scoreboard objectives add player_hp health
scoreboard objectives add alert_timer dummy

# สิทธิ์เปิดดูสมุดสถิติและดูพิกัดของนอกเขต
scoreboard objectives add view_stats trigger
scoreboard objectives add check_hidden trigger

# ==========================================
# สถิติผู้เล่นเชิงลึกในเกม (Vanilla Built-in — ไม่กิน TPS)
# ==========================================
scoreboard objectives add stat_mob_kills minecraft.custom:minecraft.mob_kills
scoreboard objectives add stat_dmg_dealt minecraft.custom:minecraft.damage_dealt
scoreboard objectives add stat_dmg_taken minecraft.custom:minecraft.damage_taken
scoreboard objectives add stat_walk_cm minecraft.custom:minecraft.walk_one_cm
scoreboard objectives add stat_sprint_cm minecraft.custom:minecraft.sprint_one_cm
scoreboard objectives add stat_swim_cm minecraft.custom:minecraft.swim_one_cm
scoreboard objectives add stat_aviate_cm minecraft.custom:minecraft.aviate_one_cm
scoreboard objectives add stat_animals_bred minecraft.custom:minecraft.animals_bred
scoreboard objectives add stat_fish_caught minecraft.custom:minecraft.fish_caught
scoreboard objectives add stat_traded minecraft.custom:minecraft.traded_with_villager
scoreboard objectives add stat_mine_dia1 minecraft.mined:minecraft.diamond_ore
scoreboard objectives add stat_mine_dia2 minecraft.mined:minecraft.deepslate_diamond_ore
scoreboard objectives add stat_mine_debris minecraft.mined:minecraft.ancient_debris

# อาวุธคู่ใจ (Favorite Weapon)
scoreboard objectives add wpn_neth_sword minecraft.used:minecraft.netherite_sword
scoreboard objectives add wpn_dia_sword minecraft.used:minecraft.diamond_sword
scoreboard objectives add wpn_iron_sword minecraft.used:minecraft.iron_sword
scoreboard objectives add wpn_neth_axe minecraft.used:minecraft.netherite_axe
scoreboard objectives add wpn_dia_axe minecraft.used:minecraft.diamond_axe
scoreboard objectives add wpn_mace minecraft.used:minecraft.mace
scoreboard objectives add wpn_trident minecraft.used:minecraft.trident
scoreboard objectives add wpn_bow minecraft.used:minecraft.bow
scoreboard objectives add wpn_crossbow minecraft.used:minecraft.crossbow

# แสดงผลคะแนนทีมด้านข้างจอ (รายชื่อทีมที่เปิดใช้งานและชื่อที่ตั้งเองจะถูกซิงค์ผ่าน nbs:team/team_setup)
scoreboard objectives setdisplay sidebar team_score