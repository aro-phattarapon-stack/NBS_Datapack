# ตรวจแต่ละทีม (1-8) ว่าปลดล็อก Advancement $(adv) แล้วหรือยัง
$execute unless data storage nbs:adv done.$(key).t1 if entity @a[scores={team_id=1},advancements={$(adv)=true}] run function nbs:career/award_team_adv {team:1,key:"$(key)",pts:$(pts),name:"$(name)"}
$execute unless data storage nbs:adv done.$(key).t2 if entity @a[scores={team_id=2},advancements={$(adv)=true}] run function nbs:career/award_team_adv {team:2,key:"$(key)",pts:$(pts),name:"$(name)"}
$execute unless data storage nbs:adv done.$(key).t3 if entity @a[scores={team_id=3},advancements={$(adv)=true}] run function nbs:career/award_team_adv {team:3,key:"$(key)",pts:$(pts),name:"$(name)"}
$execute unless data storage nbs:adv done.$(key).t4 if entity @a[scores={team_id=4},advancements={$(adv)=true}] run function nbs:career/award_team_adv {team:4,key:"$(key)",pts:$(pts),name:"$(name)"}
$execute unless data storage nbs:adv done.$(key).t5 if entity @a[scores={team_id=5},advancements={$(adv)=true}] run function nbs:career/award_team_adv {team:5,key:"$(key)",pts:$(pts),name:"$(name)"}
$execute unless data storage nbs:adv done.$(key).t6 if entity @a[scores={team_id=6},advancements={$(adv)=true}] run function nbs:career/award_team_adv {team:6,key:"$(key)",pts:$(pts),name:"$(name)"}
$execute unless data storage nbs:adv done.$(key).t7 if entity @a[scores={team_id=7},advancements={$(adv)=true}] run function nbs:career/award_team_adv {team:7,key:"$(key)",pts:$(pts),name:"$(name)"}
$execute unless data storage nbs:adv done.$(key).t8 if entity @a[scores={team_id=8},advancements={$(adv)=true}] run function nbs:career/award_team_adv {team:8,key:"$(key)",pts:$(pts),name:"$(name)"}
