# จับคู่รหัสเควส 11-44 ไปยังข้อมูลไอเทมทั้ง 3 ชิ้นและคะแนนรางวัล
# Farmer (11-14)
$execute if score @s citadel matches 11 run function nbs:citadel/try_quest_3 {team:$(team),q:"$(q)",pts:25,name:"Farmer Rank D",req:"Hay Bale 16, Carrot 64, Potato 64",i1:"minecraft:hay_block",n1:16,i2:"minecraft:carrot",n2:64,i3:"minecraft:potato",n3:64}
$execute if score @s citadel matches 12 run function nbs:citadel/try_quest_3 {team:$(team),q:"$(q)",pts:45,name:"Farmer Rank C",req:"Golden Carrot 32, Honey Block 4, Pumpkin Pie 16",i1:"minecraft:golden_carrot",n1:32,i2:"minecraft:honey_block",n2:4,i3:"minecraft:pumpkin_pie",n3:16}
$execute if score @s citadel matches 13 run function nbs:citadel/try_quest_3 {team:$(team),q:"$(q)",pts:60,name:"Farmer Rank B",req:"Cake 8, Golden Apple 8, Sea Pickle 16",i1:"minecraft:cake",n1:8,i2:"minecraft:golden_apple",n2:8,i3:"minecraft:sea_pickle",n3:16}
$execute if score @s citadel matches 14 run function nbs:citadel/try_quest_3 {team:$(team),q:"$(q)",pts:70,name:"Farmer Rank A",req:"Torchflower 4, Pitcher Plant 4, Golden Apple 16",i1:"minecraft:torchflower",n1:4,i2:"minecraft:pitcher_plant",n2:4,i3:"minecraft:golden_apple",n3:16}

# Blacksmith (21-24)
$execute if score @s citadel matches 21 run function nbs:citadel/try_quest_3 {team:$(team),q:"$(q)",pts:25,name:"Blacksmith Rank D",req:"Iron Block 8, Copper Block 16, Coal Block 16",i1:"minecraft:iron_block",n1:8,i2:"minecraft:copper_block",n2:16,i3:"minecraft:coal_block",n3:16}
$execute if score @s citadel matches 22 run function nbs:citadel/try_quest_3 {team:$(team),q:"$(q)",pts:45,name:"Blacksmith Rank C",req:"Gold Block 4, Diamond 12, Anvil 2",i1:"minecraft:gold_block",n1:4,i2:"minecraft:diamond",n2:12,i3:"minecraft:anvil",n3:2}
$execute if score @s citadel matches 23 run function nbs:citadel/try_quest_3 {team:$(team),q:"$(q)",pts:60,name:"Blacksmith Rank B",req:"Diamond Block 2, Netherite Ingot 2, Amethyst Block 16",i1:"minecraft:diamond_block",n1:2,i2:"minecraft:netherite_ingot",n2:2,i3:"minecraft:amethyst_block",n3:16}
$execute if score @s citadel matches 24 run function nbs:citadel/try_quest_3 {team:$(team),q:"$(q)",pts:70,name:"Blacksmith Rank A",req:"Netherite Ingot 4, Lodestone 2, Tinted Glass 32",i1:"minecraft:netherite_ingot",n1:4,i2:"minecraft:lodestone",n2:2,i3:"minecraft:tinted_glass",n3:32}

# Monster Hunter (31-34)
$execute if score @s citadel matches 31 run function nbs:citadel/try_quest_3 {team:$(team),q:"$(q)",pts:25,name:"Monster Hunter Rank D",req:"Bone Block 16, Gunpowder 64, String 64",i1:"minecraft:bone_block",n1:16,i2:"minecraft:gunpowder",n2:64,i3:"minecraft:string",n3:64}
$execute if score @s citadel matches 32 run function nbs:citadel/try_quest_3 {team:$(team),q:"$(q)",pts:45,name:"Monster Hunter Rank C",req:"Ender Pearl 16, Blaze Rod 16, Magma Cream 16",i1:"minecraft:ender_pearl",n1:16,i2:"minecraft:blaze_rod",n2:16,i3:"minecraft:magma_cream",n3:16}
$execute if score @s citadel matches 33 run function nbs:citadel/try_quest_3 {team:$(team),q:"$(q)",pts:60,name:"Monster Hunter Rank B",req:"Ghast Tear 8, Phantom Membrane 16, Breeze Rod 8",i1:"minecraft:ghast_tear",n1:8,i2:"minecraft:phantom_membrane",n2:16,i3:"minecraft:breeze_rod",n3:8}
$execute if score @s citadel matches 34 run function nbs:citadel/try_quest_3 {team:$(team),q:"$(q)",pts:70,name:"Monster Hunter Rank A",req:"Wither Skull 2, Totem of Undying 2, Sculk Catalyst 8",i1:"minecraft:wither_skeleton_skull",n1:2,i2:"minecraft:totem_of_undying",n2:2,i3:"minecraft:sculk_catalyst",n3:8}

# Adventurer (41-44)
$execute if score @s citadel matches 41 run function nbs:citadel/try_quest_3 {team:$(team),q:"$(q)",pts:25,name:"Adventurer Rank D",req:"Compass 2, Empty Map 4, Spyglass 1",i1:"minecraft:compass",n1:2,i2:"minecraft:map",n2:4,i3:"minecraft:spyglass",n3:1}
$execute if score @s citadel matches 42 run function nbs:citadel/try_quest_3 {team:$(team),q:"$(q)",pts:45,name:"Adventurer Rank C",req:"Amethyst Shard 32, Glow Ink Sac 16, Saddle 2",i1:"minecraft:amethyst_shard",n1:32,i2:"minecraft:glow_ink_sac",n2:16,i3:"minecraft:saddle",n3:2}
$execute if score @s citadel matches 43 run function nbs:citadel/try_quest_3 {team:$(team),q:"$(q)",pts:60,name:"Adventurer Rank B",req:"Nautilus Shell 4, Prismarine Shard 32, Name Tag 2",i1:"minecraft:nautilus_shell",n1:4,i2:"minecraft:prismarine_shard",n2:32,i3:"minecraft:name_tag[!minecraft:custom_data]",n3:2}
$execute if score @s citadel matches 44 run function nbs:citadel/try_quest_3 {team:$(team),q:"$(q)",pts:70,name:"Adventurer Rank A",req:"Heart of the Sea 1, Echo Shard 6, Shulker Shell 4",i1:"minecraft:heart_of_the_sea",n1:1,i2:"minecraft:echo_shard",n2:6,i3:"minecraft:shulker_shell",n3:4}
