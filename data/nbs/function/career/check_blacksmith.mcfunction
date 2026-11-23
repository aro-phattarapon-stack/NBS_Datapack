# ==========================================
# เช็กลิสต์สายช่างตีเหล็ก (Blacksmith): แร่, อุปกรณ์ Masterpiece, และ Armor Trims (Cap 10/18)
# ==========================================
scoreboard players add #t1_trim team_boss_cnt 0
scoreboard players add #t2_trim team_boss_cnt 0
scoreboard players add #t3_trim team_boss_cnt 0
scoreboard players add #t4_trim team_boss_cnt 0
scoreboard players add #t5_trim team_boss_cnt 0
scoreboard players add #t6_trim team_boss_cnt 0
scoreboard players add #t7_trim team_boss_cnt 0
scoreboard players add #t8_trim team_boss_cnt 0

# 1. แร่และวัตถุดิบ (Ores & Ingots)
function nbs:career/sync_item {cat:"blacksmith",key:"or_coal",item:"minecraft:coal",pts:3,name:"[Blacksmith] ถ่านหิน (Coal)"}
function nbs:career/sync_item {cat:"blacksmith",key:"or_copper",item:"minecraft:copper_ingot",pts:3,name:"[Blacksmith] ทองแดง (Copper Ingot)"}
function nbs:career/sync_item {cat:"blacksmith",key:"or_iron",item:"minecraft:iron_ingot",pts:3,name:"[Blacksmith] เหล็ก (Iron Ingot)"}
function nbs:career/sync_item {cat:"blacksmith",key:"or_redstone",item:"minecraft:redstone",pts:3,name:"[Blacksmith] เรดสโตน (Redstone)"}
function nbs:career/sync_item {cat:"blacksmith",key:"or_lapis",item:"minecraft:lapis_lazuli",pts:3,name:"[Blacksmith] ลาพิส (Lapis Lazuli)"}

function nbs:career/sync_item {cat:"blacksmith",key:"or_gold",item:"minecraft:gold_ingot",pts:10,name:"[Blacksmith] ทองคำ (Gold Ingot)"}
function nbs:career/sync_item {cat:"blacksmith",key:"or_quartz",item:"minecraft:quartz",pts:10,name:"[Blacksmith] ควอตซ์ (Nether Quartz)"}
function nbs:career/sync_item {cat:"blacksmith",key:"or_amethyst",item:"minecraft:amethyst_shard",pts:10,name:"[Blacksmith] อเมทิสต์ (Amethyst Shard)"}

function nbs:career/sync_item {cat:"blacksmith",key:"or_diamond",item:"minecraft:diamond",pts:20,name:"[Blacksmith] เพชร (Diamond)"}
function nbs:career/sync_item {cat:"blacksmith",key:"or_emerald",item:"minecraft:emerald",pts:20,name:"[Blacksmith] มรกต (Emerald)"}
function nbs:career/sync_item {cat:"blacksmith",key:"or_netherite",item:"minecraft:netherite_ingot",pts:40,name:"[Blacksmith] แท่งเนเธอไรต์ (Netherite Ingot)"}
function nbs:career/sync_item {cat:"blacksmith",key:"or_heavy_core",item:"minecraft:heavy_core",pts:70,name:"[Blacksmith] แกนหนักโบราณ (Heavy Core)"}

# 2. อุปกรณ์ Masterpiece
function nbs:career/sync_item {cat:"blacksmith",key:"gr_dia_chest",item:"minecraft:diamond_chestplate",pts:25,name:"[Blacksmith] เกราะเพชร (Diamond Armor)"}
function nbs:career/sync_item {cat:"blacksmith",key:"gr_net_chest",item:"minecraft:netherite_chestplate",pts:60,name:"[Blacksmith] เกราะเนเธอไรต์ (Netherite Armor)"}
function nbs:career/sync_item {cat:"blacksmith",key:"gr_mace",item:"minecraft:mace",pts:60,name:"[Blacksmith] ค้อนศึก (Mace)"}
function nbs:career/sync_item {cat:"blacksmith",key:"gr_beacon",item:"minecraft:beacon",pts:50,name:"[Blacksmith] บีคอน (Beacon)"}

# 3. Armor Trim Templates (Cap สูงสุด 10 ลายต่อทีม, max_prev = 9)
function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_coast",item:"minecraft:coast_armor_trim_smithing_template",pts:10,name:"[Blacksmith] Coast Armor Trim"}
function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_dune",item:"minecraft:dune_armor_trim_smithing_template",pts:10,name:"[Blacksmith] Dune Armor Trim"}
function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_sentry",item:"minecraft:sentry_armor_trim_smithing_template",pts:10,name:"[Blacksmith] Sentry Armor Trim"}
function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_wild",item:"minecraft:wild_armor_trim_smithing_template",pts:10,name:"[Blacksmith] Wild Armor Trim"}
function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_shaper",item:"minecraft:shaper_armor_trim_smithing_template",pts:10,name:"[Blacksmith] Shaper Armor Trim"}
function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_raiser",item:"minecraft:raiser_armor_trim_smithing_template",pts:10,name:"[Blacksmith] Raiser Armor Trim"}
function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_host",item:"minecraft:host_armor_trim_smithing_template",pts:10,name:"[Blacksmith] Host Armor Trim"}
function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_flow",item:"minecraft:flow_armor_trim_smithing_template",pts:10,name:"[Blacksmith] Flow Armor Trim"}
function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_bolt",item:"minecraft:bolt_armor_trim_smithing_template",pts:10,name:"[Blacksmith] Bolt Armor Trim"}

function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_eye",item:"minecraft:eye_armor_trim_smithing_template",pts:25,name:"[Blacksmith] Eye Armor Trim"}
function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_vex",item:"minecraft:vex_armor_trim_smithing_template",pts:25,name:"[Blacksmith] Vex Armor Trim"}
function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_tide",item:"minecraft:tide_armor_trim_smithing_template",pts:25,name:"[Blacksmith] Tide Armor Trim"}
function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_spire",item:"minecraft:spire_armor_trim_smithing_template",pts:25,name:"[Blacksmith] Spire Armor Trim"}
function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_snout",item:"minecraft:snout_armor_trim_smithing_template",pts:25,name:"[Blacksmith] Snout Armor Trim"}
function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_rib",item:"minecraft:rib_armor_trim_smithing_template",pts:25,name:"[Blacksmith] Rib Armor Trim"}
function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_wayfinder",item:"minecraft:wayfinder_armor_trim_smithing_template",pts:25,name:"[Blacksmith] Wayfinder Armor Trim"}

function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_ward",item:"minecraft:ward_armor_trim_smithing_template",pts:40,name:"[Blacksmith] Ward Armor Trim"}
function nbs:career/sync_capped_item {cat:"blacksmith",cap_id:"trim",max_prev:9,key:"tm_silence",item:"minecraft:silence_armor_trim_smithing_template",pts:70,name:"[Blacksmith] Silence Armor Trim"}
