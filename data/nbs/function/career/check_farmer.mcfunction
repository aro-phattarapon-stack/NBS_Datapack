# ==========================================
# เช็กลิสต์สายเกษตรกร (Farmer): พืช, ต้นไม้, และสัตว์ (1 ครั้งต่อทีม)
# ==========================================
# 1. พืช (Plants)
function nbs:career/sync_item {cat:"farmer",key:"pl_wheat",item:"minecraft:wheat",pts:3,name:"[Farmer] ข้าวสาลี (Wheat)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_carrot",item:"minecraft:carrot",pts:3,name:"[Farmer] แครอท (Carrot)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_potato",item:"minecraft:potato",pts:3,name:"[Farmer] มันฝรั่ง (Potato)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_beetroot",item:"minecraft:beetroot",pts:3,name:"[Farmer] บีทรูท (Beetroot)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_pumpkin",item:"minecraft:pumpkin",pts:3,name:"[Farmer] ฟักทอง (Pumpkin)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_melon",item:"minecraft:melon_slice",pts:3,name:"[Farmer] แตงโม (Melon)"}

function nbs:career/sync_item {cat:"farmer",key:"pl_sugarcane",item:"minecraft:sugar_cane",pts:5,name:"[Farmer] อ้อย (Sugar Cane)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_bamboo",item:"minecraft:bamboo",pts:5,name:"[Farmer] ไผ่ (Bamboo)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_cactus",item:"minecraft:cactus",pts:5,name:"[Farmer] กระบองเพชร (Cactus)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_kelp",item:"minecraft:kelp",pts:5,name:"[Farmer] สาหร่าย (Kelp)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_sweet_berries",item:"minecraft:sweet_berries",pts:5,name:"[Farmer] เบอร์รี่หวาน (Sweet Berries)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_red_mush",item:"minecraft:red_mushroom",pts:5,name:"[Farmer] เห็ดแดง (Red Mushroom)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_brown_mush",item:"minecraft:brown_mushroom",pts:5,name:"[Farmer] เห็ดน้ำตาล (Brown Mushroom)"}

function nbs:career/sync_item {cat:"farmer",key:"pl_cocoa",item:"minecraft:cocoa_beans",pts:10,name:"[Farmer] เมล็ดโกโก้ (Cocoa Beans)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_pickle",item:"minecraft:sea_pickle",pts:10,name:"[Farmer] แตงกวาทะเล (Sea Pickle)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_glow_berries",item:"minecraft:glow_berries",pts:10,name:"[Farmer] เบอร์รี่เรืองแสง (Glow Berries)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_nether_wart",item:"minecraft:nether_wart",pts:10,name:"[Farmer] หูดเนเธอร์ (Nether Wart)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_chorus",item:"minecraft:chorus_fruit",pts:10,name:"[Farmer] ผลคอรัส (Chorus Fruit)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_vines",item:"minecraft:weeping_vines",pts:10,name:"[Farmer] เถาวัลย์เนเธอร์ (Nether Vines)"}

function nbs:career/sync_item {cat:"farmer",key:"pl_torchflower",item:"minecraft:torchflower",pts:20,name:"[Farmer] ดอกคบเพลิง (Torchflower)"}
function nbs:career/sync_item {cat:"farmer",key:"pl_pitcher",item:"minecraft:pitcher_plant",pts:20,name:"[Farmer] หม้อข้าวหม้อแกงลิง (Pitcher Plant)"}

# 2. ต้นไม้ (Trees)
function nbs:career/sync_item {cat:"farmer",key:"tr_oak",item:"minecraft:oak_log",pts:3,name:"[Farmer] ไม้โอ๊ก (Oak)"}
function nbs:career/sync_item {cat:"farmer",key:"tr_birch",item:"minecraft:birch_log",pts:3,name:"[Farmer] ไม้เบิร์ช (Birch)"}
function nbs:career/sync_item {cat:"farmer",key:"tr_spruce",item:"minecraft:spruce_log",pts:3,name:"[Farmer] ไม้สปรูซ (Spruce)"}
function nbs:career/sync_item {cat:"farmer",key:"tr_dark_oak",item:"minecraft:dark_oak_log",pts:5,name:"[Farmer] ไม้ดาร์กโอ๊ก (Dark Oak)"}
function nbs:career/sync_item {cat:"farmer",key:"tr_acacia",item:"minecraft:acacia_log",pts:5,name:"[Farmer] ไม้อะเคเซีย (Acacia)"}
function nbs:career/sync_item {cat:"farmer",key:"tr_jungle",item:"minecraft:jungle_log",pts:5,name:"[Farmer] ไม้จังเกิล (Jungle)"}
function nbs:career/sync_item {cat:"farmer",key:"tr_mangrove",item:"minecraft:mangrove_log",pts:10,name:"[Farmer] ไม้โกงกาง (Mangrove)"}
function nbs:career/sync_item {cat:"farmer",key:"tr_cherry",item:"minecraft:cherry_log",pts:10,name:"[Farmer] ไม้ซากุระ (Cherry)"}
function nbs:career/sync_item {cat:"farmer",key:"tr_pale_oak",item:"minecraft:pale_oak_log",pts:10,name:"[Farmer] ไม้โอ๊กซีด (Pale Oak)"}
function nbs:career/sync_item {cat:"farmer",key:"tr_crimson",item:"minecraft:crimson_stem",pts:10,name:"[Farmer] ต้นเห็ดเนเธอร์ (Crimson/Warped)"}
function nbs:career/sync_item {cat:"farmer",key:"tr_azalea",item:"minecraft:flowering_azalea",pts:10,name:"[Farmer] อาซาเลีย (Flowering Azalea)"}

# 3. สัตว์ (Animals — ตรวจจากการเพาะพันธุ์ Two by Two และถังสัตว์)
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:cow",key:"an_cow",pts:5,name:"[Farmer] เพาะพันธุ์วัว (Cow)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:pig",key:"an_pig",pts:5,name:"[Farmer] เพาะพันธุ์หมู (Pig)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:chicken",key:"an_chicken",pts:5,name:"[Farmer] เพาะพันธุ์ไก่ (Chicken)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:sheep",key:"an_sheep",pts:5,name:"[Farmer] เพาะพันธุ์แกะ (Sheep)"}

function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:horse",key:"an_horse",pts:10,name:"[Farmer] เพาะพันธุ์ม้า (Horse)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:llama",key:"an_llama",pts:10,name:"[Farmer] เพาะพันธุ์ลามะ (Llama)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:rabbit",key:"an_rabbit",pts:10,name:"[Farmer] เพาะพันธุ์กระต่าย (Rabbit)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:fox",key:"an_fox",pts:10,name:"[Farmer] เพาะพันธุ์จิ้งจอก (Fox)"}
function nbs:career/sync_item {cat:"farmer",key:"an_fish_bucket",item:"minecraft:tropical_fish_bucket",pts:10,name:"[Farmer] ปลาในถังน้ำ (Fish in Bucket)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:wolf",key:"an_wolf",pts:10,name:"[Farmer] เพาะพันธุ์หมาป่า (Wolf)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:cat",key:"an_cat",pts:10,name:"[Farmer] เพาะพันธุ์แมว (Cat)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:frog",key:"an_frog",pts:10,name:"[Farmer] เพาะพันธุ์กบ (Frog)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:goat",key:"an_goat",pts:10,name:"[Farmer] เพาะพันธุ์แพะ (Goat)"}

function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:camel",key:"an_camel",pts:20,name:"[Farmer] เพาะพันธุ์อูฐ (Camel)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:armadillo",key:"an_armadillo",pts:20,name:"[Farmer] เพาะพันธุ์อาร์มาดิลโล (Armadillo)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:bee",key:"an_bee",pts:20,name:"[Farmer] เพาะพันธุ์ผึ้ง (Bee)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:turtle",key:"an_turtle",pts:20,name:"[Farmer] เพาะพันธุ์เต่า (Turtle)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:panda",key:"an_panda",pts:20,name:"[Farmer] เพาะพันธุ์แพนด้า (Panda)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:axolotl",key:"an_axolotl",pts:20,name:"[Farmer] เพาะพันธุ์แอกโซลอเติล (Axolotl)"}

function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:strider",key:"an_strider",pts:30,name:"[Farmer] เพาะพันธุ์สไตรเดอร์ (Strider)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:mule",key:"an_mule",pts:30,name:"[Farmer] เพาะพันธุ์ล่อ (Mule)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:mooshroom",key:"an_mooshroom",pts:50,name:"[Farmer] เพาะพันธุ์มูชรูม (Mooshroom)"}
function nbs:career/sync_crit {cat:"farmer",adv:"minecraft:husbandry/bred_all_animals",crit:"minecraft:sniffer",key:"an_sniffer",pts:50,name:"[Farmer] เพาะพันธุ์สนิฟเฟอร์ (Sniffer)"}
function nbs:career/sync_item {cat:"farmer",key:"an_blue_axolotl",item:"minecraft:axolotl_bucket[bucket_entity_data={Variant:4}]",pts:60,name:"[Farmer] แอกโซลอเติลสีน้ำเงิน (Blue Axolotl)"}
