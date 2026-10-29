# 1. Research and script

## 1.1 Pick the question, not just the topic

A good documentary answers one question a viewer would type or wonder about:
"How did 12,000 men beat 100,000 and 1,000 elephants?" (Panipat 1526). Write it down; every chapter must
move toward the answer, and the last chapter states it plainly ("He won because he combined old and new…").

## 1.2 Source hierarchy

1. **Primary sources** (participants, contemporaries): memoirs, chronicles, letters, inscriptions. For Panipat:
   the *Bābur-nāma*, tr. A. S. Beveridge (1922), free on Project Gutenberg (ebook 44608). Download the text and
   search it locally (`grep -n -i "panipat\|elephant\|mantelet" babur.txt`); quote only what you have read.
2. **Later chronicles** (one or two generations after): useful for colour, but mark them as later, e.g.
   "According to a later Afghan chronicle…" (Ahmad Yadgar's mango story).
3. **Modern scholarship and reference works**: for context, dates and disputes. Museum and UNESCO pages,
   university pages and encyclopaedias are fine for context; Wikipedia only to find better sources, or for
   uncontroversial facts such as a building's date.
4. **Never**: AI summaries, quote sites, unsourced listicles, YouTube videos.

Use only what you actually read. If a page won't load (robots, paywall), find another source rather than
citing what you think it says.

## 1.3 The fact table

Keep a table while researching; the script is checked against it.

| # | Claim | Source (title, page/URL) | Exact words if quoted | Confidence / dispute |
|---|---|---|---|---|
| 12 | Babur's army counted 12,000 at the Indus, incl. servants and traders | Bābur-nāma (Beveridge), crossing of the Indus, Dec 1525 | (copy the exact words from your text) | Babur's own count |

Disputed numbers (army sizes, casualties, dates) get their own list with who says what. Panipat:
Ibrahim's 100,000 men and 1,000 elephants are what Babur *heard*; historians think fewer; the date is Friday
20 April in Beveridge, often given as 21 April. The narration attributes ("Babur heard…"), and the description
has a "Notes on the numbers" section.

## 1.4 Structure

- **Cold open (~45 s)**: the moment of maximum tension (two armies on a plain at dawn), the stakes, and the
  question. First chapter in `script.json`, with `"title": ""` so it gets no chapter card.
- **8–9 titled chapters**, each 1–2 minutes, roman-numbered cards: "I · A Prince Without a Kingdom".
  Typical arc for a battle: protagonist → antagonist/state of the world → the road to battle → the armies and
  their methods → the prepared ground → the battle hour by hour → the death/turning point → the aftermath →
  why it mattered (and what came next).
- **Length**: 10–15 min. ~145 words/minute at Kokoro speed 0.95, plus card and pause time (each chapter card
  is 4.2 s; each beat has 0.75 s after it; each sentence 0.34 s). Panipat: 1,960 words → 13:41.

## 1.5 Writing for the ear

- One idea per sentence; 8–25 words; vary the length. Short sentences land the beats ("By noon, it was over.").
- Concrete over abstract: "seven hundred carts tied with ropes of rawhide", not "a defensive formation".
- Quote the primary source sparingly and set it up: "In Babur's words:" then the quote as its own sentence.
  Use the translation's wording exactly; trim only at sentence boundaries.
- Numbers: write them as words in the script ("twelve thousand") so the TTS reads them naturally;
  years as digits ("1526"): `tools/years.py` makes the narrator say "fifteen twenty-six" (see 2.2a).
  Never write a count as a bare four-digit figure, or it will be read as a year.
- Avoid parentheses, abbreviations and symbols. "Koh-i-Noor" is fine with a lexicon entry.
- A colon ends a sentence for timing (narrate.py splits on `. ? ! :`), which makes a natural pause before a list
  or quote. Use it deliberately.
- Tone: documentary. Not "the bloodiest battle ever", but "Babur estimated fifteen or sixteen thousand dead".

## 1.6 `script.json` format

```json
{
  "title": "Panipat 1526",
  "chapters": [
    { "id": "open", "title": "", "beats": [
      { "id": "o1", "v": "cold-plain", "t": "One morning in April 1526, two armies faced each other ... north of Delhi." },
      { "id": "o2", "v": "lodi-host", "t": "On one side stood the Sultan of Delhi, Ibrahim Lodi, ..." }
    ]},
    { "id": "babur", "title": "I · A Prince Without a Kingdom", "beats": [
      { "id": "b1", "v": "map-ferghana", "t": "Babur was born in 1483 in the Ferghana Valley, ... Through his mother, from Genghis Khan." }
    ]}
  ]
}
```

- `id` values must be unique; they name the WAV files and are referenced by the music plan (chapter ids).
- `v` is the visual for the whole beat; split a beat when the picture must change.
- Beats of 1–4 sentences, typically 8–20 seconds of speech: long enough to establish a shot, short enough to
  keep the picture moving.

## 1.7 Fact-check pass (do it; it catches real errors)

Go beat by beat against the fact table. For each sentence: is it in a source, is it attributed if disputed,
is a quote verbatim? Remove anything unsourced, even if it "is well known". Then read the whole script aloud
once at speaking pace to catch rhythm problems and repeated words.
