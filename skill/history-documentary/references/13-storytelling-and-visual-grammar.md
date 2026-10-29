# 13. Storytelling and visual grammar (lessons from the best battle channels)

Studied October 2026 from two reference films: Epic History TV, *The Hundred Days: Battle of Waterloo* (35 min),
and Kings and Generals, *Alexander the Great: All Battles and Conquests* (5 h 41 min). Method: frames sampled every
20 s and 120 s respectively into contact sheets, and a Whisper transcript of the whole Waterloo film and the first
30 minutes of Alexander (`mlx_whisper`, model `mlx-community/whisper-small.en-mlx`, on the Mac). Learn the craft;
never copy their art, maps or words.

## 13.1 Structure

1. **Cold open on the battle morning, before the title.** A date line alone ("Sunday 18th June 1815."), the
   place, the numbers of men and guns, one line of what is at stake, a quote or a moment ("The Rana is coming."),
   then the title card. Under a minute.
2. **Background in the past tense; the battle in the present tense.** "At 1 pm a deafening cannonade commences."
   The switch puts the viewer on the field.
3. **A sources chapter early on** (Kings and Generals does this constantly): who wrote the account, when, for
   whom, and their bias ("Arrian's account was based on Ptolemy and is often biased in Alexander's favour";
   "these numbers are certainly questionable"; "what happened next is not entirely clear"). For us: one short
   chapter ("Who tells the story"), then attribute at each disputed point.
4. **An "armies" chapter**: inventories in threes ("Firstly… Secondly… Finally…"), each strength with the reason
   it works and its weakness. This is where unit cards and 3D unit spotlights belong.
5. **The ground before the fight**: what the terrain does (reverse slope, farms as "breakwaters", a lake for
   water, a low hill), shown on the map with a terrain profile.
6. **The battle against a clock.** Times in the narration ("Around 11.30am…", "At 4pm…") and in the corner of
   every battle map. When the sources give no hours, use what they do give (Babur: "one watch" after sunrise,
   "between the first and second prayers").
7. **Cross-cut between sectors** of the field, and back ("Meanwhile, at Hougoumont…").
8. **Aftermath**: the losses with attributed figures (or "no reliable figure"), an eyewitness description of the
   field the next day, what the victor did next.
9. **End on a cliffhanger that leads to the next film** ("He will fight on."; for us: "…would face Babur's
   grandson's army, at Haldighati."). A series is a binge, and the next video is the end screen.

## 13.2 Sentences

- **A ticking clock and dramatic irony**: "Napoleon must win before the Prussians arrive. But he doesn't know how
  little time he has."
- **Decision points told as choices**: "The Emperor could order Grouchy to cross the Dyle… But he dismisses the
  idea." / "Babur wants to fight at once. Khalifa talks him out of it."
- **Why it works, in one line**, every time a tactic appears: "So long as the men hold formation, they are safe
  from the cavalry." / "A matchlock hits hard, but it is slow to reload… so the guns fight from behind carts."
- **Fragments for rhythm**: "Dawn." "And fast." "The guard falls back." One per scene at most.
- **Concrete numbers**: men, guns, distances, minutes ("half a mile of open ground", "fifth horse shot from
  under him").
- **Name the honest gaps**: "Why Sanga did not strike while the camp was half built, the sources don't say."
- **Character as contradiction** (Kings and Generals' openings): "He could be as vicious and brutal as he could be
  generous and kind." Use it only where the sources support both halves.
- **Eyewitnesses by name and role**: "Ensign Gronow, 1st Foot Guards". Ours: Babur himself, his officers as he
  quotes them, later chroniclers clearly marked as later.

## 13.3 Visual grammar (what to build in Remotion)

| Element | How they do it | Our build |
|---|---|---|
| Tactical map | ~70% of battle screen time; textured terrain; unit blocks with flags/emblems; formations drawn as lines of small blocks | `map/Battle` plate on real terrain; unit blocks with each side's emblem; formation lines |
| Clock | Time in the top right of every battle map, advancing | `Clock` overlay fed by the beat's `clock` field in `script.json` |
| Movement | Thick yellow arrows that grow; pulsing highlight circles on the unit being discussed | Animated arrow and ring components, driven per beat |
| People | Cut-out portrait with a nameplate (name + role) pops onto the map when first named | `PortraitCard` (painting crop + plate) over maps |
| Army composition | A legend panel listing unit types; unit-name banners over 3D footage | `ArmyPanel` and `UnitBanner` over 3D unit spotlights |
| Quotes | Dark smoky background, centred italic serif, attribution line under it | Our quote card, with a dark battle-smoke variant |
| Paintings | Cut between map sequences for the human moment | Folio shots (period paintings) between map beats |
| Terrain | Hand-drawn panorama of the ridge with the line marked | A terrain-profile card from the DEM |
| Strategic map | Region map with year stamp, territories coloured, leader medallions on capitals | Our regional map plate with a year stamp and medallions |
| Dialogue scenes (K&G) | Illustrated characters talking | Skip: we have no illustrator; use folios and portraits |

Ratio to aim for in battle chapters: about two thirds tactical map, one third 3D and paintings. The map carries
understanding; 3D and paintings carry feeling. Every 3D shot should answer "what is happening here" with a
banner or a map cut right after it.

## 13.4 Script fields this adds

- `clock` on a beat (e.g. `"clock": "about 9:00"`, `"noon"`): shown top right on battle maps.
- Visual id prefixes that name the grammar: `map-…` (strategic), `map-b-…` (tactical battle map), `k3d-…` (3D),
  `portrait-…`, `panel-…` (army composition), `unit-…` (unit spotlight), `card-…` (text card), `folio-…`
  (painting).

## 13.5 What we keep that they don't do

- A calm single narrator, no sponsor reads mid-film, every claim sourced and the disputed ones attributed in the
  narration, and a description with sources and notes on numbers. That is our difference; keep it.
