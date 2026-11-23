# 🏆 เกณฑ์การให้คะแนนทั้งหมด — NBs SMP (Scoring Blueprint)

เอกสารรวบรวมเกณฑ์การคิดคะแนนและกติกาการให้แต้มทั้งหมดของเซิร์ฟเวอร์ **NBs SMP** (ซีซัน 2–4 สัปดาห์) โดยระบบจะคำนวณคะแนนรวมของแต่ละทีมแบบเรียลไทม์ และอัปเดตขึ้น Sidebar ตารางคะแนนขวามือทุกวินาที

---

## 📊 1. ภาพรวมสัดส่วนคะแนน (Scoring Overview)

ระบบออกแบบตามสัดส่วนที่สมดุล เพื่อให้ผู้เล่นทุกสาย (PvE, PvP, เกษตร, คราฟต์, ผจญภัย) มีโอกาสชนะเท่าเทียมกัน:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🌾 สายอาชีพ & เควส (~45%) │ 🐉 บอส & ของชิงชัย (~35%) │ ⚔️ PvP (~20%) │
└────────────────────────────────────────────────────────────────────────┘
```

* **เป้าหมายคะแนนทีมแชมป์:** ~1,500 – 2,000 แต้ม
* **ระบบความแฟร์รองรับทุกขนาดทีม (Solo / Duo / Trio / 4 คน):** 
  * ทุกรายการความสำเร็จ (เควส, สมุดเช็กลิสต์, Advancements) ล็อกโควตานับคะแนนเข้าทีมได้ **สูงสุด 1 ครั้งต่อทีม** 
  * ทีม 1 คน (Solo) สามารถทำภารกิจได้ครบทุกสายอาชีพ
  * บอสและของชิงชัยมีระบบ **Hard Cap (เพดานคะแนนสูงสุดต่อทีม)** เพื่อป้องกันการปั๊มฟาร์มไม่จำกัด

---

## 🐉 2. บอส, อีเวนต์ & ไอเทมชิงชัย (~35%)

รายการของชิงชัยและบอสหลักของเกม ทุกทีมมีเพดานโควตาแต้มสูงสุดเท่ากัน:

| รายการ | คะแนน | เพดานสูงสุดต่อทีม (Hard Cap) | คะแนนรวมสูงสุด | เงื่อนไขและกติกา |
| :--- | :---: | :---: | :---: | :--- |
| **Dragon Egg** | **150** | 1 ฟองในโลก | **150** แต้ม | **ขโมยได้** • นับคะแนนทันทีเมื่อพกอยู่ในตัวผู้เล่น หรือเก็บในกล่องเขตธงทีม |
| **Nether Star (Wither)** | **30** / ดวง | สูงสุด 5 ดวง/ทีม | **150** แต้ม | **ขโมยได้** • นับคะแนนทันทีเมื่อพกอยู่ในตัวผู้เล่น หรือเก็บในกล่องเขตธงทีม |
| **Warden** | **45** / ตัว | สูงสุด 4 ตัว/ทีม | **180** แต้ม | สมาชิกในทีมต้องลงมือสังหารจริง (ตรวจจับอัตโนมัติ) |
| **Ominous Trial Chamber** | **30** / รอบ | สูงสุด 5 รอบ/ทีม | **150** แต้ม | นับเมื่อสมาชิกในทีมใช้ `ominous_trial_key` ไข Ominous Vault สำเร็จ |
| **Elder Guardian** | **20** / ตัว | สูงสุด 6 ตัว/ทีม | **120** แต้ม | สังหารในวิหารใต้น้ำ Ocean Monument (เทียบเท่าวิหาร 2 แห่ง) |
| **Illager Raid** | **15** / รอบ | สูงสุด 10 รอบ/ทีม | **150** แต้ม | ชนะศึก Bad Omen Raid (มีระบบล็อก Cooldown 10 วินาทีป้องกันนับเบิ้ลในทีม) |

> ⚠️ **กฎการเก็บของชิงชัย (ห้ามเก็บใน Ender Chest, Bundle หรือ Shulker Box):**
> * `Dragon Egg`, `Nether Star`, และ `ป้ายชื่อคะแนน PvP` **ห้ามเก็บใน Ender Chest, กระเป๋า Bundle หรือกล่อง Shulker Box (ทั้งแบบบล็อกที่วางในโลกและไอเทมในตัว) เด็ดขาด!**
>   * หากนำไปใส่ใน **Ender Chest, Bundle หรือ Shulker Box** ระบบจะ **ดีดไอเทมลงพื้นทันที** พร้อมส่งเสียงและข้อความเตือนภัย โดยไม่ทำให้ไอเทมสูญหาย
> * ไอเทมชิงชัยจะถูกนับคะแนนให้ทีม **เมื่อพกติดตัวอยู่ในตัวผู้เล่นของทีม หรือเก็บไว้ในกล่องธรรมดา (Chest / Trapped Chest / Barrel) ในรัศมี 32 บล็อกของธงอาณาเขตทีมตนเองเท่านั้น**
> * 🚨 **ระบบตรวจจับการซ่อนของนอกเขตธง (Wilderness Chest Detection):**
>   * หากนำ `Dragon Egg`, `Nether Star`, หรือ `ป้ายชื่อคะแนน PvP` ไปซ่อนไว้ในกล่องหรือถังที่ **อยู่นอกรัศมี 32 บล็อกของธงอาณาเขต**
>   * ระบบจะ **ประกาศแจ้งเตือนถึงผู้เล่นทุกคนในเซิร์ฟเวอร์ทันทีในช่องแชต พร้อมระบุพิกัด [X, Y, Z]** ของกล่องใบนั้น! (เช่น `"⚠️ [แจ้งเตือน] ขณะนี้มี ไข่มังกร (Dragon Egg) ถูกซ่อนอยู่นอกอาณาเขตธง! พิกัด [ X: 150, Y: 64, Z: -320 ]"` พร้อมแจ้งเตือนซ้ำทุก 2 นาทีตราบใดที่ยังไม่ถูกเก็บ)
>   * **ผู้เล่นทุกคนสามารถตรวจสอบพิกัดของที่ถูกซ่อนอยู่นอกเขตธงทั้งหมดได้ตลอดเวลา** ผ่านปุ่ม `[ 📦 พิกัดของนอกเขต ]` ในสมุดคู่มือ (`/trigger guide`) หรือพิมพ์คำสั่ง **`/trigger check_hidden`** ในแชต
>   * กล่องที่ซ่อนไอเทมจะมี **เอฟเฟกต์ละอองระยิบระยับ (Sparkling Glitter & End Rod FX) ลอยฟุ้งอยู่ในรัศมี 20 บล็อกรอบกล่อง** ตลอดเวลา ทำให้ผู้เล่นคนอื่นสามารถมองเห็นและตามหาได้ง่าย!
>   * หากไอเทมถูกหยิบออกไปหรือกล่องถูกทำลาย ระบบจะแจ้งเตือนว่าไอเทมถูกนำออกไปแล้ว และเอฟเฟกต์จะหายไปทันที

---

## ⚔️ 3. ระบบ PvP & ความมั่งคั่ง (~20%)

ระบบเปิดให้ต่อสู้ PvP และดรอปป้ายชื่อคะแนนได้ตลอดเวลาทุกวัน (24/7):

| รายการ | คะแนน | เงื่อนไขและรายละเอียด |
| :--- | :---: | :--- |
| **ป้ายชื่อคะแนน PvP (Bounty)** | **15** / ชิ้น | ดรอปที่จุดตายทันทีเมื่อสังหารผู้เล่นต่างทีม (`killed_by_player`) • **ขโมยได้** • **นับคะแนนทันทีเมื่อพกติดตัว หรือเก็บไว้ในกล่องในเขตธงทีม** • **มี Cooldown กันปั๊ม 5 นาที (6,000 ticks)** ต่อเหยื่อคนเดิม หากฆ่าเหยื่อที่ยังติด Cooldown จะไม่ได้รับป้ายชื่อ |
| **Top Killer อันดับ 1** | **+80** แต้ม | โบนัสคะแนนทีมพิเศษมอบให้ผู้เล่นที่มีสถิติฆ่า PvP สูงสุดในเซิร์ฟเวอร์ |
| **Top Killer อันดับ 2** | **+40** แต้ม | โบนัสคะแนนทีมพิเศษมอบให้ผู้เล่นที่มีสถิติฆ่า PvP สูงสุดอันดับ 2 |
| **The Wealthiest (เพชรอันดับ 1)** | **+80** แต้ม | โบนัสมอบให้ทีมที่มียอดฝากเพชรสะสมใน **ธนาคารเพชรที่ The Citadel `(0, 0)`** มากที่สุด |

* *หมายเหตุ:* ในทีมเดียวกันเปิดระบบ **Friendly Fire = False** ไม่สามารถทำดาเมจเพื่อนร่วมทีมได้ตลอดเวลา

---

## 🛠️ 4. ระบบ 4 สายอาชีพ (Career Paths & Milestones)

ผู้เล่นสามารถเปิดเมนูอาชีพได้ด้วยคำสั่ง `/trigger career` โดยแต่ละสายมีทั้งบัฟพิเศษ (Perk), เช็กลิสต์สะสมของ, และความสำเร็จเฉพาะสาย (นับสูงสุด 1 ครั้งต่อทีม):

```
🌾 เกษตรกร (Farmer)          ⚒️ ช่างตีเหล็ก (Blacksmith)
⚔️ นักล่ามอนสเตอร์ (Hunter)    🧭 นักผจญภัย (Adventurer)
```

---

### 🌾 4.1 เกษตรกร (Farmer)
* **Passive Perk:** ได้รับเอฟเฟกต์ `Haste I + Saturation` ตลอดเวลาเมื่อถือจอบ (Hoe) ในมือหลัก (Main-hand)

#### เช็กลิสต์สะสมพืชผล (Plants Checklist):
* **Common (3 แต้ม):** ข้าว (Wheat), แครอท (Carrot), มันฝรั่ง (Potato), บีทรูท (Beetroot), ฟักทอง (Pumpkin), แตงโม (Melon)
* **Uncommon (5 แต้ม):** อ้อย (Sugar Cane), ไผ่ (Bamboo), กระบองเพชร (Cactus), สาหร่าย (Kelp), Sweet Berries, เห็ดแดง (Red Mushroom), เห็ดน้ำตาล (Brown Mushroom)
* **Rare (10 แต้ม):** เมล็ดโกโก้ (Cocoa Beans), แตงกวาทะเล (Sea Pickle), Glow Berries, Nether Wart, Chorus Fruit, Weeping Vines, Twisting Vines
* **Epic (20 แต้ม):** Torchflower, Pitcher Plant

#### เช็กลิสต์ต้นไม้ (Trees Checklist):
* **Common (3 แต้ม):** Oak, Birch, Spruce
* **Uncommon (5 แต้ม):** Dark Oak, Acacia, Jungle
* **Rare (10 แต้ม):** Mangrove, Cherry, Pale Oak, Crimson Fungus, Warped Fungus, Azalea

#### เช็กลิสต์สัตว์ (Animals Checklist — นับจากการผสมพันธุ์/เชื่อง):
* **Common (5 แต้ม):** วัว (Cow), หมู (Pig), ไก่ (Chicken), แกะ (Sheep)
* **Uncommon (10 แต้ม):** ม้า (Horse), ลามะ (Llama), กระต่าย (Rabbit), จิ้งจอก (Fox), ปลาในถัง (Fish in Bucket), หมาป่า (Wolf), แมว (Cat), กบ (Frog), แพะ (Goat)
* **Rare (20 แต้ม):** นกแก้ว (Parrot), อูฐ (Camel), อาร์มาดิลโล (Armadillo), ผึ้ง (Bee), เต่า (Turtle), แพนด้า (Panda), Axolotl สีปกติ
* **Epic (30 แต้ม):** Strider, ล่อ (Mule)
* **Legendary (50 แต้ม):** Red Mooshroom, Sniffer
* **Mythic / God Tier:** Brown Mooshroom (**80** แต้ม), Blue Axolotl (**50** แต้ม — ปรับสมดุลผลกระทบ RNG 1/1200)

#### Farmer's Milestones (รวม 335 แต้ม):
| Advancement | คะแนน | เงื่อนไข |
| :--- | :---: | :--- |
| `Serious Dedication` | **25** | อัปเกรดจอบเป็น Netherite Hoe |
| `A Complete Catalogue` | **60** | เชื่องแมวครบทุกสายพันธุ์ |
| `The Whole Pack` | **60** | เชื่องหมาป่าครบทุกสายพันธุ์ |
| `A Balanced Diet` | **70** | กินอาหารครบทุกชนิดในเกม |
| `Two by Two` | **120** | ผสมพันธุ์สัตว์ครบทุกชนิด |

---

### ⚒️ 4.2 ช่างตีเหล็ก (Blacksmith)
* **Passive Perk:** ได้รับเอฟเฟกต์ `Fire Resistance` กันไฟ/ลาวาอัตโนมัติเมื่อเลือดเหลือ 5 หัวใจหรือต่ำกว่า (HP ≤ 10)

#### เช็กลิสต์ขุดแร่และวัตถุดิบ (Ores & Minerals Checklist):
* **Common (3 แต้ม):** Coal, Copper Ingot, Iron Ingot, Redstone, Lapis Lazuli
* **Uncommon (10 แต้ม):** Gold Ingot, Nether Quartz, Amethyst Shard
* **Rare (20 แต้ม):** Diamond, Emerald
* **Epic (40 แต้ม):** Netherite Ingot
* **Legendary (70 แต้ม):** Heavy Core

#### คราฟต์อุปกรณ์ Masterpiece (`recipe_crafted` — ต้องลงมือคราฟต์เอง):
* คราฟต์ชุดเกราะ Diamond ครบ 4 ชิ้น: **25** แต้ม
* คราฟต์ชุดเกราะ Netherite ครบ 4 ชิ้น: **60** แต้ม
* คราฟต์กระบอง Mace: **60** แต้ม
* คราฟต์ Beacon: **50** แต้ม

#### สะสมลายเกราะ Armor Trim Templates (Cap สูงสุด 10 จาก 18 ลาย):
* ลายทั่วไป (Coast / Dune / Wild / Sentry / Host / Raiser / Shaper): **10** แต้ม/ชิ้น
* ลายหายาก (Eye / Vex / Tide / Spire / Snout / Rib / Wayfinder / Flow / Bolt): **25** แต้ม/ชิ้น
* ลาย `Ward`: **40** แต้ม
* ลาย `Silence`: **70** แต้ม

#### Blacksmith's Milestones (รวม 255 แต้ม):
| Advancement | คะแนน | เงื่อนไข |
| :--- | :---: | :--- |
| `Diamonds!` | **15** | ได้รับเพชรเม็ดแรก |
| `Cover Me with Diamonds` | **25** | สวมใส่เกราะเพชรครบชุด |
| `Crafting a New Look` | **25** | ตกแต่งเกราะด้วย Armor Trim ครั้งแรก |
| `Cover Me in Debris` | **50** | สวมใส่เกราะ Netherite ครบชุด |
| `Over-Overkill` | **60** | ทำดาเมจด้วย Mace เกิน 100 ดาเมจในการทุบครั้งเดียว |
| `Smithing with Style` | **80** | ตกแต่งเกราะด้วย Trim ลายหายากครบตามเงื่อนไข |

---

### ⚔️ 4.3 นักล่ามอนสเตอร์ (Monster Hunter)
* **Passive Perk:** ได้รับเอฟเฟกต์ `Night Vision` (15 วินาทีต่อเนื่องไม่กระพริบ) + `Strength I` เมื่อต่อสู้กับมอนสเตอร์ (PvE)

#### สมุดบันทึกล่ามอนสเตอร์ (Monsters Hunted Checklist):
* **Common (5 แต้ม):** Zombie, Skeleton, Spider, Creeper, Drowned, Husk, Stray, Bogged
* **Uncommon (10 แต้ม):** Enderman, Witch, Slime, Pillager, Vindicator, Phantom, Blaze, Magma Cube, Piglin, Hoglin
* **Rare (20 แต้ม):** Ghast, Cave Spider, Silverfish, Guardian, Evoker, Ravager, Breeze, Shulker, Piglin Brute, Zoglin
* **Epic (35 แต้ม):** Wither Skeleton, Vex, Endermite, Creaking

#### ไอเทมดรอปหายาก & หัวมอนสเตอร์:
* Breeze Rod: **20** แต้ม
* Totem of Undying: **25** แต้ม
* Wither Skeleton Skull: **30** แต้ม
* Trident: **35** แต้ม
* หัวมอนสเตอร์จาก Charged Creeper (Zombie / Skeleton / Creeper / Piglin Head): **30** แต้ม/หัว (*Cap สูงสุด 3 ชนิด/ทีม = 90 แต้ม*)

#### Hunter's Milestones (รวม 225 แต้ม):
| Advancement | คะแนน | เงื่อนไข |
| :--- | :---: | :--- |
| `Take Aim` | **10** | ยิงธนูโดนเป้าหมาย |
| `Voluntary Exile` | **15** | สังหารกัปตันกลุ่มโจร (Pillager Captain) |
| `Return to Sender` | **25** | ปัดลูกไฟ Ghast กลับไปสังหารมัน |
| `Hero of the Village` | **35** | ชนะการป้องกันหมู่บ้านจาก Raid |
| `Two Birds, One Arrow` | **50** | ยิง Phantom ตาย 2 ตัวด้วยหน้าไม้ติดทะลวง (Piercing) ลูกเดียว |
| `Monsters Hunted` | **90** | สังหารมอนสเตอร์ครบทุกชนิดในเกม |

---

### 🧭 4.4 นักผจญภัย (Adventurer)
* **Passive Perk:** ได้รับเอฟเฟกต์ `Speed I + Dolphin's Grace` (ว่ายน้ำและเดินทางรวดเร็ว) — *ระบบจะปิดบัฟนี้ชั่วคราวทันทีเมื่อติดสถานะต่อสู้กับผู้เล่น (Combat Tag) เพื่อป้องกันการใช้หนี PvP*

#### เช็กลิสต์ค้นพบ 16 โครงสร้างโบราณ (Structures Checklist):
* **Uncommon (15 แต้ม):** Village, Desert Temple, Jungle Temple, Shipwreck, Pillager Outpost, Igloo, Ruined Portal
* **Rare (25 แต้ม):** Ocean Monument, Nether Fortress, Bastion Remnant, Trail Ruins, Trial Chambers
* **Epic (45 แต้ม):** Woodland Mansion, Ancient City, Stronghold, End City

#### ของโบราณ, แผ่นเพลง & ขุมทรัพย์:
* Pottery Sherds: **10** แต้ม/ลาย (*Cap สูงสุด 12 จาก 23 ลาย = 120 แต้ม*)
* แผ่นเพลงทั่วไป (13 / Cat / Blocks / Chirp / Far / Mall / Mellohi / Stal / Strad / Ward / 11 / Wait): **15** แต้ม/แผ่น
* แผ่นเพลงหายาก (`Otherside` / `Relic` / `Precipice`): **35** แต้ม/แผ่น
* แผ่นเพลงในตำนาน (`Pigstep` / `Creator`): **40** แต้ม/แผ่น
* Recovery Compass: **30** แต้ม
* Conduit: **40** แต้ม
* Dragon Head: **45** แต้ม
* Enchanted Golden Apple (God Apple): **50** แต้ม
* Elytra: **50** แต้ม

#### Adventurer's Milestones (รวม 215 แต้ม):
| Advancement | คะแนน | เงื่อนไข |
| :--- | :---: | :--- |
| `Respecting the Remnants` | **20** | กู้เศษกระเบื้อง Pottery Sherd ด้วยแปรง Brush |
| `Careful Restoration` | **25** | ประกอบหม้อ Decorated Pot จากแผ่นกระเบื้อง 4 แผ่น |
| `Hot Tourist Destinations` | **40** | สำรวจ Biome ในเนเธอร์ครบทุกชนิด |
| `The City at the End of the Game` | **40** | เดินทางไปถึงเมือง End City |
| `Adventuring Time` | **90** | ค้นพบ Biome ในโลกปกติ (Overworld) ครบทุกชนิด |

---

## 📜 5. เควสส่งของที่ The Citadel (Citadel Fixed Contracts)

เควสส่งมอบไอเทมประจำเมืองหลวง **The Citadel `(0, 0)`** ผู้เล่นต้องเดินทางมายืนในเขตปราสาท (`tag=in_spawn`) และเปิดเมนู `/trigger citadel` เพื่อกดส่งของ (โควตา **ส่งได้เควสละ 1 ครั้งต่อทีม** รวม 16 เควส = **800 แต้ม/ทีม**):

| รหัส | สายอาชีพ / ระดับ | ไอเทมที่ต้องส่งมอบ | คะแนนที่ได้รับ |
| :---: | :--- | :--- | :---: |
| **11** | 🌾 Farmer Rank D | Hay Bale 16 + Carrot 64 + Potato 64 | **25** แต้ม |
| **12** | 🌾 Farmer Rank C | Golden Carrot 32 + Honey Block 4 + Pumpkin Pie 16 | **45** แต้ม |
| **13** | 🌾 Farmer Rank B | Cake 8 + Golden Apple 8 + Sea Pickle 16 | **60** แต้ม |
| **14** | 🌾 Farmer Rank A | Torchflower 4 + Pitcher Plant 4 + Golden Apple 16 | **70** แต้ม |
| **21** | ⚒️ Blacksmith Rank D | Iron Block 8 + Copper Block 16 + Coal Block 16 | **25** แต้ม |
| **22** | ⚒️ Blacksmith Rank C | Gold Block 4 + Diamond 12 + Anvil 2 | **45** แต้ม |
| **23** | ⚒️ Blacksmith Rank B | Diamond Block 2 + Netherite Ingot 2 + Amethyst Block 16 | **60** แต้ม |
| **24** | ⚒️ Blacksmith Rank A | Netherite Ingot 4 + Lodestone 2 + Tinted Glass 32 | **70** แต้ม |
| **31** | ⚔️ Monster Hunter Rank D | Bone Block 16 + Gunpowder 64 + String 64 | **25** แต้ม |
| **32** | ⚔️ Monster Hunter Rank C | Ender Pearl 16 + Blaze Rod 16 + Magma Cream 16 | **45** แต้ม |
| **33** | ⚔️ Monster Hunter Rank B | Ghast Tear 8 + Phantom Membrane 16 + Breeze Rod 8 | **60** แต้ม |
| **34** | ⚔️ Monster Hunter Rank A | Wither Skeleton Skull 2 + Totem of Undying 2 + Sculk Catalyst 8 | **70** แต้ม |
| **41** | 🧭 Adventurer Rank D | Compass 2 + Empty Map 4 + Spyglass 1 | **25** แต้ม |
| **42** | 🧭 Adventurer Rank C | Amethyst Shard 32 + Glow Ink Sac 16 + Saddle 2 | **45** แต้ม |
| **43** | 🧭 Adventurer Rank B | Nautilus Shell 4 + Prismarine Shard 32 + Name Tag 2 | **60** แต้ม |
| **44** | 🧭 Adventurer Rank A | Heart of the Sea 1 + Echo Shard 6 + Shulker Shell 4 | **70** แต้ม |

---

## ⚡ 6. เควสด่วน Bossbar (Flash Boost Quests)

ภารกิจสุ่มอีเวนต์ด่วนปรากฏบนแถบ Bossbar ด้านบนจอ (นับถอยหลัง 25 นาที / 1,500 วินาที):
* **สถานที่ส่ง:** ต้องนำไอเทมมาส่งที่ **The Citadel `(0, 0)`** ผ่านเมนู `/trigger citadel` (กดส่งเควสด่วน)
* **การคิดคะแนน:**
  * 🥇 **ทีมแรกที่ส่งสำเร็จ:** รับ **+35 แต้ม** (คะแนนฐาน 25 + โบนัสทีมแรก 10)
  * 🥈 **ทีมถัดไปที่ส่งทันในเวลานับถอยหลัง:** รับ **+25 แต้ม** (แต่ละทีมส่งได้สูงสุด 1 ครั้งต่อรอบเควสด่วน)

---

## 🏅 7. ความสำเร็จระดับสูง (Hard Vanilla Advancements)

ความสำเร็จพิเศษที่นับคะแนนเข้าทีมอัตโนมัติเมื่อสมาชิกในทีมทำสำเร็จ (นับสูงสุด 1 ครั้งต่อทีม):

### Tier 1: ท้าทายระดับต้น (25 – 40 แต้ม)
* `Return to Sender` (**25** แต้ม) — ปัดลูกไฟ Ghast สังหารมัน
* `Star Trader` (**25** แต้ม) — แลกของกับ Villager ที่ความสูงขีดจำกัดโลก (Build Limit y=319)
* `Subspace Bubble` (**30** แต้ม) — เดินทางข้ามมิติเนเธอร์ระยะทางเทียบเท่า 7 กิโลเมตรในโลกปกติ
* `Arbalistic` (**30** แต้ม) — ยิงหน้าไม้ลูกเดียวสังหารม็อบต่างชนิดกัน 5 ตัว
* `Uneasy Alliance` (**40** แต้ม) — ช่วย Ghast กลับมายัง Overworld แล้วสังหารมัน
* `Cover Me in Debris` (**40** แต้ม) — สวมใส่ชุดเกราะ Netherite ครบ 4 ชิ้น

### Tier 2: ท้าทายระดับกลาง (50 – 80 แต้ม)
* `Caves & Cliffs` (**50** แต้ม) — ทิ้งตัวดิ่งจากเพดานโลกสู่ก้นบึ้งโลก (y=319 ลงไปถึง y=-59) แล้วรอดชีวิต
* `Great View From Up Here` (**50** แต้ม) — ลอยตัวด้วยสถานะ Levitation สูงขึ้น 50 บล็อกจากการโจมตีของ Shulker
* `Sniper Duel` (**50** แต้ม) — ยิงธนูสังหาร Skeleton จากระยะห่างเกิน 50 บล็อกในแนวนอน
* `Two Birds, One Arrow` (**50** แต้ม) — ยิงหน้าไม้ติดทะลวง (Piercing) ทะลุ Phantom ตาย 2 ตัวในนัดเดียว
* `Over-Overkill` (**60** แต้ม) — ใช้กระบอง Mace ทุบโจมตีสร้างความเสียหายเกิน 100 ดาเมจในครั้งเดียว
* `Smithing with Style` (**80** แต้ม) — นำเกราะไปตกแต่งด้วย Armor Trim ลายพิเศษครบตามเงื่อนไข
* `Monsters Hunted` (**80** แต้ม) — สังหารมอนสเตอร์ครบทุกสายพันธุ์

### Tier 3: ท้าทายระดับมหากาพย์ (90 – 150 แต้ม)
* `A Furious Cocktail` (**90** แต้ม) — มีสถานะเอฟเฟกต์ Potion ทุกชนิดพร้อมกันในเวลาเดียว (13 ชนิด)
* `Adventuring Time` (**90** แต้ม) — สำรวจ Biome ครบทุกชนิดใน Overworld (50+ ไบโอม)
* `How Did We Get Here?` (**150** แต้ม) — ติดสถานะเอฟเฟกต์ทั้งหมดที่มีในเกมพร้อมกัน (27+ เอฟเฟกต์)

---

## 🚩 8. กฎอาณาเขตและพื้นที่ปลอดภัย (Territory & Safezone Rules)

1. **การได้มาของธงอาณาเขต (Territory Banner):**
   * ได้รับฟรี 1 ต้นทันทีที่เริ่มเกมเข้าสู่โลก
   * ซื้อเพิ่มได้ที่ **The Citadel `(0, 0)`** ราคาต้นละ **32 Diamonds**
   * **จำกัดโควตาสูงสุด 3 ต้นต่อ 1 ทีม**
2. **คุณสมบัติอาณาเขต (รัศมี 32 บล็อก):**
   * มีป้ายชื่อลอยสีประจำทีมและละออง Particle สีทีม
   * **หีบ/ถังที่อยู่ในรัศมี 32 บล็อก จะนับคะแนนไอเทมชิงชัย (Dragon Egg, Nether Star, ป้ายชื่อ PvP) เข้าทีมเจ้าของธงอัตโนมัติ**
   * ศัตรูต่างทีมที่เดินเข้ามาในเขตธงจะติดสถานะขุดบล็อกช้าลงเหลือ **25% (`0.25`)**
3. **ข้อกำหนดและข้อห้ามในการปักธงอาณาเขต:**
   * 📏 **ระดับความสูง Y ที่อนุญาต (Y 25 ถึง Y 130):** อนุญาตให้วางธงอาณาเขตที่ระดับความสูงไม่ต่ำกว่า Y 25 และไม่สูงกว่า Y 130 เท่านั้น (ห้ามวางใต้ดินลึกต่ำกว่า Y 25 และห้ามสร้าง Skybase สูงเกิน Y 130)
   * 🔗 **ระยะการขยายอาณาเขต (ไม่เกิน 15 บล็อกจากขอบเดิม):** การวางธงต้นต่อๆ ไป (ต้นที่ 2–3) **ไม่อนุญาตให้วางห่างจากขอบอาณาเขตเดิมเกิน 15 บล็อก** (ระยะห่างจากหมุดธงเดิมของทีมไม่เกิน 47 บล็อก) เพื่อให้พื้นที่ฐานเชื่อมต่อกันเป็นผืนเดียว ไม่อนุญาตให้ตั้งฐานย่อยกระจัดกระจาย
   * ❌ **ห้ามปักธงในเขต Spawn / The Citadel `(0, 0)` (`tag=in_spawn` รัศมี 160×160 บล็อกรอบจุดศูนย์กลาง):** หากพยายามวาง ระบบจะดีดธงคืนเป็นไอเทมอัตโนมัติและไม่สร้างหมุดอาณาเขต
   * ❌ **ห้ามปักธงใกล้ธงศัตรูในระยะ 48 บล็อก:** เพื่อป้องกันการสร้างอาณาเขตซ้อนทับกัน
   * ❌ **ห้ามปักธงซ้ำในตำแหน่งเดิม (ระยะน้อยกว่า 1.5 บล็อก)**
