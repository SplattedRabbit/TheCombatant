import fs from 'fs';

const phbPath = './data/spells-phb.json';
const phb = JSON.parse(fs.readFileSync(phbPath, 'utf8'));

const fullDescriptions = {
  analyze_dweomer: "You discern all spells and magical properties present in the target creature or object, and whether each item is cursed. For each spell affecting the target, you learn its name, caster level, and what it does. For each magic item, you learn its functions, how to activate them, and how many charges remain.",
  animate_dead: "This spell turns the corpses of once-living creatures into undead skeletons or zombies that obey your spoken commands. The undead can follow you or remain in an area and attack any creature (or specific types of creatures) entering the place. You can create up to 2 HD worth of undead per caster level per casting, and control up to 4 HD per caster level total.",
  antilife_shell: "You bring into being a mobile, hemispherical energy field that prevents the entrance of most types of living creatures. The field hedges out aberrations, animals, dragons, fey, giants, humanoids, magical beasts, monstrous humanoids, oozes, plants, and vermin, but not constructs, elementals, outsiders, or undead.",
  bless_weapon: "This spell makes a weapon strike true against evil foes. The weapon becomes good-aligned and greatly enhances its ability to bypass damage reduction. In addition, all critical threats against evil foes are automatically confirmed as critical hits.",
  disrupting_weapon: "This spell makes a melee weapon deadly to undead. Any undead creature with Hit Dice equal to or less than your caster level must succeed on a Will save or be instantly destroyed upon being struck by this weapon.",
  helping_hand: "You create a ghostly, semi-translucent hand that points in the direction of a person you designate and leads you to that person. If the subject moves, the hand changes course to follow.",
  holy_smite: "You draw down holy power to smite your enemies. The spell deals 1d8 points of damage per two caster levels (maximum 5d8) to each evil creature in the area and blinds it for 1 round. A successful Will save reduces damage to half and negates the blinded condition. Evil outsiders take 1d6 points of damage per caster level (maximum 10d6).",
  refuge: "You create a powerful magic anchor in a prepared object (such as a ring or statuette). When the person holding the object speaks a command word and breaks it, that person and their gear are instantly transported to your abode, or you are instantly transported to the object's side.",
  repulsion: "An invisible, mobile field surrounds you and prevents creatures from approaching you. Any creature attempting to move toward you must succeed on a Will save; if it fails, it cannot move toward you for the duration of the spell.",
  wall_of_force: "A wall of force spell creates an invisible wall of pure, indestructible magical force. The wall cannot be moved and is impervious to all damage and spells except for a disintegrate spell or a Mage's Disjunction."
};

for (const [key, desc] of Object.entries(fullDescriptions)) {
  if (phb[key]) {
    phb[key].description = desc;
  }
}

fs.writeFileSync(phbPath, JSON.stringify(phb, null, 2), 'utf8');
console.log('Filled in all 10 missing descriptions in spells-phb.json');
