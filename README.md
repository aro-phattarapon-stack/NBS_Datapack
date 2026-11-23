# ⚔️ NBs SMP — Core Datapack & Game Design Blueprint (MC 26.3)

Datapack หลักและเอกสารสรุปโครงสร้างกติกา/ระบบคะแนนทั้งหมดของเซิร์ฟเวอร์ **NBs SMP** (Survival Multiplayer ระดับ Hardmode แบบแบ่งซีซันละ **2–4 สัปดาห์**)

* 📖 คู่มือคำสั่งทั้งหมดในระบบ: [COMMANDS.md](./COMMANDS.md)
* ⚡ คู่มือคำสั่งฉบับย่อสำหรับแปะใน Discord: [docs/commands_cheatsheet.md](./docs/commands_cheatsheet.md)
* 📊 หน้า Dashboard สรุปคะแนนแบบ Interactive HTML: [docs/scoring_overview.html](./docs/scoring_overview.html)

---

## 🎯 1. คอนเซปต์หลักและกติกาเซิร์ฟเวอร์ (Core Rules)

* **เป้าหมาย:** เอาชีวิตรอด บริหารทรัพยากร ทำภารกิจสายอาชีพ ล่าบอส และชิงของสำคัญเพื่อสะสม **คะแนนรวมทีม** ให้สูงที่สุดเมื่อจบซีซัน (2–4 สัปดาห์)
* **กฎหลัก:**
  1. **Hardmode Survival** (ความยากระดับ Hard)
  2. **Raid Day PvP:** ห้าม PvP นอกวัน Raid Day (ในทีมเดียวกันปิด Friendly Fire ตลอดเวลา)
  3. **Diamond is Economy:** ใช้เพชรเป็นสกุลเงินหลักในการซื้อธงอาณาเขตเพิ่มที่ **The Citadel `(0, 0)`** และสะสมความมั่งคั่ง
  4. **Name Visible Off:** ซ่อนป้ายชื่อผู้เล่นต่างทีม (`hideForOtherTeams`) เห็นเฉพาะสมาชิกทีมเดียวกัน
  5. **รองรับทุกขนาดทีม (Solo / Duo / Trio / 4 คน):** เพดานคะแนนของบอส, อีเวนต์, Advancements และเควสส่งของที่ **The Citadel** ล็อกโควตาเป็น **"ต่อทีม (Once / Cap per Team)"** เพื่อให้ทีมคนน้อยมีเพดานคะแนนสูงสุดเท่ากับทีม 4 คน

---

## 🏰 2. The Citadel `(0, 0)` — ป้อมปราการศูนย์กลางโลก

พิกัด `(0, 0)` (พื้นที่ Safezone `160x160` บล็อกรอบหมุด `spawn_anchor`) ทำหน้าที่เป็นทั้ง **ห้องรอเริ่มเกม (Waiting Lobby)** และ **เมืองหลวงกลางแมป** ตลอดทั้งซีซัน:

### 2.1 ช่วง Waiting / Lobby & ระบบทีม (`team_1` – `team_4`)
* เมื่อเข้าเซิร์ฟเวอร์ในช่วงรอเริ่มเกม (`#game_state = 0`) ผู้เล่นจะอยู่ที่ **The Citadel** และได้รับ **สมุดเลือกทีม (Written Book)** อัตโนมัติ
* คลิกขวาเปิดสมุดเพื่อกดเข้าร่วม `Team 1` (แดง), `Team 2` (น้ำเงิน), `Team 3` (เขียว), `Team 4` (เหลือง) หรือออกจากทีมได้ทันที
* ระบบซิงค์ระหว่าง `/team` ของ Vanilla กับ Scoreboard `team_id` (1–4) และสีบน Sidebar อัตโนมัติ (แอดมินใช้ `/team modify` ปรับชื่อและสีทีมได้อิสระ)
* **เมื่อแอดมินกดเริ่มเกม (`/function nbs:game/start` หรือกดจากหน้าแอดมินในสมุด):**
  * ระบบสุ่มจุดเกิด **1 จุดต่อ 1 ทีม** ในระยะ 200–4,800 บล็อก (4 ทิศทางรอบโลก ไม่ตกในเขต The Citadel 100%)
  * สมาชิกทีมเดียวกันจะถูกวาร์ปไปเกิดจุดเดียวกัน พร้อมบัฟกันดาเมจ 5 วินาที, ลบสมุดเลือกทีม และได้รับ **ธงอาณาเขตประจำทีม 1 ต้น**
* **ผู้เล่นที่เข้าทีหลัง (Late Join):** จะได้รับสมุดเลือกทีมที่ The Citadel ก่อน เมื่อเลือกทีมแล้วระบบจะวาร์ปตามไปจุดเกิดของทีมให้อัตโนมัติ

### 2.2 ระบบธงอาณาเขตลายพิเศษประจำทีม (Territory Banner System)
* แต่ละทีมมี **ธงอาณาเขตลายพิเศษ (`banner_patterns`) และสีประจำทีม** (แยกจากธงสีธรรมดาที่ใช้ตกแต่งบ้าน):
  * 🚩 **Team 1:** ธงแดงลายขอบทอง (`red_banner`)
  * 🚩 **Team 2:** ธงน้ำเงินลายขอบขาว (`blue_banner`)
  * 🚩 **Team 3:** ธงเขียวลายขอบขาว (`green_banner`)
  * 🚩 **Team 4:** ธงเหลืองลายขอบขาว (`yellow_banner`)
* **การได้มาและการขยายอาณาเขต (สูงสุด 3 ต้น/ทีม):**
  * **ต้นที่ 1 (Starter Flag):** แจกฟรีเมื่อเข้าสู่เกม
  * **ต้นที่ 2–3 (หรือซื้อทดแทนต้นที่ถูกทำลาย):** ต้องพก **เพชร (Diamonds)** เดินทางจากฐานในป่ากลับมาซื้อที่ **The Citadel `(0, 0)`** (เช่น ต้นที่ 2 = 32 Diamonds, ต้นที่ 3 = 64 Diamonds)
* **ความสามารถของธงอาณาเขต (รัศมี 32 บล็อก):**
  * มีป้ายชื่อลอย (`text_display`) และ Particle (`minecraft:dust`) สีประจำทีมรอบเสาธง
  * หีบ/ถังที่อยู่ในรัศมี 32 บล็อกของธงทีมใด จะนับคะแนนของชิงชัยเข้าทีมนั้นอัตโนมัติ
  * ศัตรูที่เดินเข้ามาในรัศมี 32 บล็อกจะติดสถานะขุดบล็อกช้าลงเหลือ **25% (`0.25`)**
  * ห้ามปักธงใกล้ธงศัตรูในระยะ 48 บล็อก

---

## 📊 3. โครงสร้างระบบคะแนนสมดุล (Balanced Scoring Blueprint)

ออกแบบตามสัดส่วน: **สายอาชีพ & เควส ~45% | บอส & ของชิงชัย ~35% | PvP & ความมั่งคั่ง ~20%** (เป้าหมายทีมแชมป์ ~1,500–2,000 แต้ม)

### 3.1 บอส, อีเวนต์ & ไอเทมชิงชัย (~35%)
> **กฎป้องกันการซ่อนของ:** ห้ามเก็บ `Dragon Egg`, `Nether Star`, และ `ป้ายชื่อคะแนน PvP` ไว้ใน **Ender Chest** (ระบบจะดีดไอเทมลงพื้นอัตโนมัติทีละช่องโดยไม่สูญหาย)

| รายการ | คะแนน | โควตาสูงสุดต่อทีม (Hard Cap) & กติกา |
| :--- | :---: | :--- |
| **Dragon Egg** | **150** แต้ม | มี 1 ฟองในโลก, **ขโมยได้** (นับให้ทีมที่ครอบครองในตัวหรือในกล่องเขตธง) |
| **Nether Star (Wither)** | **30** แต้ม/ดวง | **ขโมยได้**, **Cap สูงสุด 5 ดวง/ทีม (150 แต้ม)** กันฟาร์ม Wither ไม่จำกัด |
| **Warden** | **45** แต้ม/ตัว | **Cap สูงสุด 4 ตัว/ทีม (180 แต้ม)** กันฟาร์ม Sculk Shrieker |
| **Ominous Trial Chamber** | **30** แต้ม/รอบ | **Cap สูงสุด 5 รอบ/ทีม (150 แต้ม)** นับเมื่อใช้ `ominous_trial_key` ไข Ominous Vault |
| **Elder Guardian** | **20** แต้ม/ตัว | **Cap สูงสุด 6 ตัว/ทีม (120 แต้ม)** (เทียบเท่าวิหารใต้น้ำ 2 แห่ง) |
| **Illager Raid** | **15** แต้ม/รอบ | **Cap สูงสุด 10 รอบ/ทีม (150 แต้ม)** กันปั๊ม Raid Farm |

---

### 3.2 PvP (เฉพาะวัน Raid Day) & ความมั่งคั่ง (~20%)

| รายการ | คะแนน | เงื่อนไขคุมสมดุล |
| :--- | :---: | :--- |
| **ป้ายชื่อคะแนน PvP (Bounty)** | **15** แต้ม/หัว | ดรอปเมื่อผู้เล่นถูกผู้เล่นสังหาร (`killed_by_player`), **ขโมยได้**, มี Cooldown กันปั๊มฆ่าคนเดิมซ้ำ |
| **Top Killer อันดับ 1 / 2** | **+80 / +40** แต้ม | โบนัสสรุปท้ายซีซัน |
| **The Wealthiest (เพชรอันดับ 1)** | **+80** แต้ม | ฝากเข้า **ธนาคารเพชรทีมที่ The Citadel `(0, 0)`** (ไม่ต้องดองเพชรในกล่องและไม่กิน TPS) |

---

### 3.3 ระบบ 4 สายอาชีพ (Career Paths & Milestones)

* **กติกาการแบ่งสายอาชีพ (รองรับ Solo / Duo / Trio / 4 คน):**
  * 1 ทีมมีโควตาเข้าถึงแต้มทั้ง 4 สายอาชีพเท่ากัน (ทีม 4 คนแบ่งคนละ 1 สาย / ทีม Duo ถือคนละ 2 สาย / ทีม Solo ทำได้ครบทุกสาย) และทุกรายการสะสมนับเข้าทีมได้ **สูงสุด 1 ครั้งต่อทีม**
  * ของคราฟต์ตรวจด้วย `recipe_crafted` (ต้องลงมือคราฟต์เอง กันโยนของวนในทีม)

#### 🌾 1) เกษตรกร (Farmer)
* **Passive Perk:** ได้ `Haste I + Saturation` เฉพาะตอนถือจอบ (Hoe) ใน **Main-hand** เท่านั้น
* **เช็กลิสต์สะสมพืช (Plants):**
  * Common (`3` แต้ม): ข้าว, แครอท, มันฝรั่ง, บีทรูท, ฟักทอง, แตงโม
  * Uncommon (`5` แต้ม): อ้อย, ไผ่, กระบองเพชร, สาหร่าย (Kelp), Sweet Berries, เห็ดแดง/น้ำตาล
  * Rare (`10` แต้ม): โกโก้, แตงกวาทะเล, Glow Berries, Nether Wart, Chorus Fruit, เถาวัลย์เนเธอร์
  * Epic (`20` แต้ม): Torchflower, Pitcher Plant
* **เช็กลิสต์ต้นไม้ (Trees):**
  * Common (`3` แต้ม): Oak, Birch, Spruce
  * Uncommon (`5` แต้ม): Dark Oak, Acacia, Jungle
  * Rare (`10` แต้ม): Mangrove, Cherry, Pale Oak, Crimson/Warped Fungus, Azalea
* **เช็กลิสต์สัตว์ (Animals — นับจากการผสมพันธุ์/เชื่อง):**
  * Common (`5` แต้ม): วัว, หมู, ไก่, แกะ
  * Uncommon (`10` แต้ม): ม้า, ลามะ, กระต่าย, จิ้งจอก, ปลาในถัง, หมาป่า, แมว, กบ, แพะ
  * Rare (`20` แต้ม): นกแก้ว, อูฐ, อาร์มาดิลโล, ผึ้ง, เต่า, แพนด้า, Axolotl สีปกติ
  * Epic (`30` แต้ม): Strider, ล่อ (Mule)
  * Legendary (`50` แต้ม): Red Mooshroom, Sniffer
  * Mythic / God Tier: Brown Mooshroom (`80`), Blue Axolotl (`50–60` — ปรับลดผลกระทบจาก RNG 1/1200)
* **Farmer's Milestones (Vanilla Advancements — รวม 335 แต้ม):**
  * `Serious Dedication` (`25`), `A Complete Catalogue` (`60`), `The Whole Pack` (`60`), `A Balanced Diet` (`70`), `Two by Two` (`120`)

#### ⚒️ 2) ช่างตีเหล็ก (Blacksmith)
* **Passive Perk:** ลดดาเมจไฟ/ลาวา หรือได้ `Fire Resistance` ชั่วคราวเมื่อ HP ต่ำกว่า 50%
* **เช็กลิสต์แร่และวัตถุดิบ (ขุดโดยไม่ใช้ Silk Touch / หลอม):**
  * Common (`3` แต้ม): Coal, Copper, Iron, Redstone, Lapis
  * Uncommon (`10` แต้ม): Gold, Quartz, Amethyst
  * Rare (`20` แต้ม): Diamond, Emerald
  * Epic (`40` แต้ม): Netherite Ingot
  * Legendary (`70` แต้ม): Heavy Core
* **คราฟต์อุปกรณ์ Masterpiece (`recipe_crafted`):**
  * ชุดเกราะ Diamond ครบเซ็ต (`25`), ชุดเกราะ Netherite ครบเซ็ต (`60`), Mace (`60`), Beacon (`50`)
* **สะสม Armor Trim Templates (Cap สูงสุด 10 จาก 18 ลาย):**
  * ลายทั่วไป (`10` แต้ม) • ลายหายาก Eye/Vex/Tide/Spire/Snout/Rib/Wayfinder (`25` แต้ม) • `Ward` (`40`) • `Silence` (`70`)
* **Blacksmith's Milestones (รวม 255 แต้ม):**
  * `Diamonds!` (`15`), `Cover Me with Diamonds` (`25`), `Crafting a New Look` (`25`), `Cover Me in Debris` (`50`), `Over-Overkill` (`60`), `Smithing with Style` (`80`)

#### ⚔️ 3) นักล่ามอนสเตอร์ (Monster Hunter)
* **Passive Perk:** ได้ `Night Vision` (บัฟรอบละ 15 วินาที ไม่กระพริบ) + `Strength I` เมื่อต่อสู้กับมอนสเตอร์ (PvE)
* **สมุดล่ามอนสเตอร์ (นับชนิดละ 1 ครั้งจาก `player_killed_entity`):**
  * Common (`5` แต้ม): Zombie, Skeleton, Spider, Creeper, Drowned, Husk, Stray, Bogged
  * Uncommon (`10` แต้ม): Enderman, Witch, Slime, Pillager, Vindicator, Phantom, Blaze, Magma Cube, Piglin, Hoglin
  * Rare (`20` แต้ม): Ghast, Cave Spider, Silverfish, Guardian, Evoker, Ravager, Breeze, Shulker, Piglin Brute, Zoglin
  * Epic (`35` แต้ม): Wither Skeleton, Vex, Endermite, Creaking
* **ของดรอปหายาก & หัวมอนสเตอร์:**
  * Breeze Rod (`20`), Totem of Undying (`25`), Wither Skeleton Skull (`30`), Trident (`35`)
  * หัวมอนสเตอร์จาก Charged Creeper (`30` แต้ม/หัว — **Cap สูงสุด 3 ชนิด/ทีม**)
* **Hunter's Milestones (รวม 225 แต้ม):**
  * `Take Aim` (`10`), `Voluntary Exile` (`15`), `Return to Sender` (`25`), `Hero of the Village` (`35`), `Two Birds, One Arrow` (`50`), `Monsters Hunted` (`90`)

#### 🧭 4) นักผจญภัย (Adventurer)
* **Passive Perk:** ได้ `Speed I + Dolphin's Grace` (ปิดการทำงานอัตโนมัติเมื่อติด Combat Tag โดนผู้เล่นตี กันใช้หนี PvP)
* **ค้นพบโครงสร้างโบราณ (16 แห่ง):**
  * Uncommon (`15` แต้ม): Village, Desert Temple, Jungle Temple, Shipwreck, Pillager Outpost, Igloo, Ruined Portal
  * Rare (`25` แต้ม): Ocean Monument, Nether Fortress, Bastion Remnant, Trail Ruins, Trial Chambers
  * Epic (`45` แต้ม): Woodland Mansion, Ancient City, Stronghold, End City
* **ของโบราณ, แผ่นเพลง & Pottery Sherds:**
  * Pottery Sherds (`10` แต้ม/ลาย — **Cap สูงสุด 12 จาก 23 ลาย**)
  * แผ่นเพลงทั่วไป (`15`), `Otherside`/`Relic`/`Precipice` (`35`), `Pigstep`/`Creator` (`40`)
  * Recovery Compass (`30`), Conduit (`40`), Dragon Head (`45`), Enchanted Golden Apple (`50`), Elytra (`50`)
* **Adventurer's Milestones (รวม 215 แต้ม):**
  * `Respecting the Remnants` (`20`), `Careful Restoration` (`25`), `Hot Tourist Destinations` (`40`), `The City at the End of the Game` (`40`), `Adventuring Time` (`90`)

---

## 📜 4. เควสส่งของที่ The Citadel (Citadel Fixed Contracts)

* **กติกา:** เป็นเควสแบบ **Fix ตายตัว** (ไม่ใช่รายสัปดาห์) ผู้เล่นต้องหอบไอเทมจากฐานในป่าเดินทางมายืนในเขต **The Citadel `(0, 0)`** (`tag=in_spawn`) เพื่อกดส่งมอบ
* **ความแฟร์สำหรับ Solo / Duo / Trio:** ล็อกโควตาส่งได้ **เควสละ 1 ครั้งต่อทีม** ตลอดซีซัน (รวม 4 สาย = **800 แต้ม/ทีม**)

| สายเควส | 🥉 Rank D (**25 แต้ม**) | 🥈 Rank C (**45 แต้ม**) | 🥇 Rank B (**60 แต้ม**) | 💎 Rank A (**70 แต้ม**) |
| :--- | :--- | :--- | :--- | :--- |
| **🌾 เสบียงเกษตร (Farmer)** | Hay Bale 16 + Carrot 64 + Potato 64 | Golden Carrot 32 + Honey Block 4 + Pumpkin Pie 16 | Cake 8 + Golden Apple 8 + Sea Pickle 16 | Torchflower 4 + Pitcher Plant 4 + Golden Apple 16 |
| **⚒️ คลังแสงช่างเหล็ก (Blacksmith)** | Iron Block 8 + Copper Block 16 + Coal Block 16 | Gold Block 4 + Diamond 12 + Anvil 2 | Diamond Block 2 + Netherite Ingot 2 + Amethyst Block 16 | Netherite Ingot 4 + Lodestone 2 + Tinted Glass 32 |
| **⚔️ สัญญาล่าอสูร (Monster Hunter)** | Bone Block 16 + Gunpowder 64 + String 64 | Ender Pearl 16 + Blaze Rod 16 + Magma Cream 16 | Ghast Tear 8 + Phantom Membrane 16 + Breeze Rod 8 | Wither Skeleton Skull 2 + Totem of Undying 2 + Sculk Catalyst 8 |
| **🧭 สมบัติโบราณ (Adventurer)** | Compass 2 + Empty Map 4 + Spyglass 1 | Amethyst Shard 32 + Glow Ink Sac 16 + Saddle 2 | Nautilus Shell 4 + Prismarine Shard 32 + Name Tag 2 | Heart of the Sea 1 + Echo Shard 6 + Shulker Shell 4 |

---

## 🏅 5. Hard Advancements (ภารกิจท้าทายกลาง — นับ 1 ครั้งต่อทีม)

* **Tier 1 (25–40 แต้ม):** `Return to Sender` (25), `Star Trader` (25), `Subspace Bubble` (30), `Arbalistic` (30), `Uneasy Alliance` (40), `Cover Me in Debris` (40)
* **Tier 2 (50–80 แต้ม):** `Caves & Cliffs` (50), `Great View From Up Here` (50), `Sniper Duel` (50), `Two Birds, One Arrow` (50), `Over-Overkill` (60), `Smithing with Style` (80), `Monsters Hunted` (80)
* **Tier 3 (90–150 แต้ม):** `A Furious Cocktail` (90), `Adventuring Time` (90), `How Did We Get Here?` (150)

---

## 📂 6. โครงสร้างระบบใน Datapack (`data/nbs/`)

* `function/main_load.mcfunction` & `main_tick.mcfunction` — จุดเริ่มต้นโหลดระบบและลูปหลัก
* `function/game/` — ระบบสถานะเกม (`game_system`), สมุดเลือกทีม (`give_team_book`), คำสั่งเริ่มเกม (`start`), และรีเซ็ตกลับ Lobby (`reset`)
* `function/team/` — ตั้งค่า 4 ทีมหลัก (`team_setup`) และซิงค์ `/team` กับ `team_id` (`team_system`)
* `function/spawn/` — ระบบเขตปลอดภัย **The Citadel `(0, 0)`** (`spawn_system`)
* `function/rtp/` — ระบบสุ่มเกิด 4 ทิศทาง 5,000 บล็อก (`do_spread`), วาร์ปเข้าจุดเกิดทีม (`join_team_spawn`), และสุ่มเกิดใหม่เมื่อตายไม่มีเตียง (`respawn_rtp`)
* `function/territory/` — ระบบธงอาณาเขตลายพิเศษประจำทีม (`give_flag`, `place_flag_anchor`, `break_flag_anchor`, `flag_particles`, `check_flag_radius`)
* `function/kill_reward/` — ระบบดรอปป้ายชื่อคะแนนเมื่อสังหารผู้เล่น (`kill_system`, `give_nametag`)
* `function/anti_enderchest/` — ระบบดีดของชิงชัยออกจาก Ender Chest ทีละช่อง (`anti_enderchest`, `eject_slot`)
* `function/scoreboard/` — ระบบคำนวณคะแนนทีมทุก 20 Tick (`score_system`, `recalc_scores`), สแกนกล่องทีม (`count_single_chest`, `sum_chest_items`), และสมุดสถิติ (`stats_system`, `show_stats_book`)
* `advancement/trial_clear.json` — ตรวจจับการไข Ominous Vault เพื่อบวกสถิติ `stat_trial`
