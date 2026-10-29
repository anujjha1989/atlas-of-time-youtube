# 2. Narration with Kokoro, and exact pronunciation

## 2.1 Why Kokoro

Kokoro v1.0 (Apache-2.0) runs locally on a Mac, Linux box or Raspberry Pi 5, is free, consistent across
sessions and sounds natural. ElevenLabs was tried and rejected: rate limits (HTTP 429) on long scripts, cost,
and the owner preferred Kokoro's voice. Use **one voice for everything**, quotes included: `af_heart`,
speed **0.95**.

Setup:
```bash
pip install kokoro-onnx soundfile
# download kokoro-v1.0.int8.onnx and voices-v1.0.bin from https://github.com/thewh1teagle/kokoro-onnx/releases
```

## 2.2 Pronunciation: the lexicon

Kokoro converts English text to IPA (espeak-style) and speaks the IPA. Non-English names come out
anglicised. Panipat before fixing:

| Word | Kokoro default | Heard as | Lexicon IPA |
|---|---|---|---|
| Babur | bˈæbɜː | "BAB-er" | bˈɑːbʊɹ |
| lakhs | lˈækz | "laks" | lˈɑːkʰ |
| Humayun | hjˈuːmeɪˌʌn | "HYOO-may-un" | hʊmˈɑːjuːn |
| Mughal | mˈoʊɡəl | "MO-gul" | mˈʊɡəl |
| Panipat | pˈænɪpˌæt | "PAN-ee-pat" | pˈɑːnɪpət |
| Kabul | kˈæbʌl | "KAB-ul" | kˈɑːbʊl |
| Khwaja | kˌeɪˈeɪtʃwˈɑːdʒə | spelled out "K-H-…" | χwˈɑːdʒə |
| Timur | tˈɪmɚ | "TIM-er" | tɪmˈʊɹ |
| Agra | ˈæɡɹə | "AG-ra" | ˈɑːɡɹə |

The full 52-entry lexicon is `examples/panipat-1526/lexicon.json`. Process:

1. List every proper noun and foreign word in the script (people, places, titles, units such as "lakh").
2. Add the possessive and plural forms as separate entries ("Babur's", "Lodis"): matching is whole-word.
3. `python3 tools/narrate.py script.json --lexicon lexicon.json --check` prints default vs lexicon IPA.
4. Write IPA using Kokoro's symbol set. Useful symbols (all in Kokoro's vocabulary): `ɑː` (father),
   `ʊ` (put), `ə` (about), `iː`, `uː`, `oː`, `eː`, aspirated `kʰ`, `pʰ`, `tʰ`, `χ` (Urdu/Persian "kh"),
   retroflex `ɖ`, `ʈ`; stress mark `ˈ` before the stressed syllable, `ˌ` secondary.
5. Hindi/Urdu rules of thumb: "a" is usually `ɑː` or `ə` (never `æ`); final "-ur/-ir" → `ʊɹ/ɪɹ`; "kh" → `χ`
   (Persian loans) or `kʰ` (Indic); "Delhi" → `dˈɛliː`; stress usually on the long vowel.
6. Record, then **listen to every sentence that contains a lexicon word**
   (`grep -n "Babur\|Humayun" rec/phonemes.log`).

## 2.2a Years: always "fifteen twenty-seven", never "one thousand five hundred…"

Kokoro reads a bare 1527 as "one thousand five hundred twenty-seven". Nobody says a year that way,
and the channel owner flagged it on the first film. `tools/narrate.py` now passes every sentence
through `tools/years.py` before phonemising, so any four-digit number from 1000 to 2099 is spoken as a year:

| Written | Spoken |
|---|---|
| 1527 | fifteen twenty-seven |
| 1500 | fifteen hundred |
| 1505 | fifteen oh five |
| 1520s | fifteen twenties |
| 2008 / 2015 | two thousand and eight / twenty fifteen |

Consequences for the script:
- Write years as digits (the subtitles show them as digits too).
- Write counts in words ("fifteen hundred men", "two hundred and one thousand horsemen"); a bare
  "1500 men" would be read as the year "fifteen hundred", and "1250 men" as "twelve fifty men".
  Figures with a comma ("1,500") are left alone and read as numbers.
- No lexicon entries for years are needed any more.
- Check after recording: `grep -n "θˈaʊzənd" rec/phonemes.log` should list only genuine counts.
  Run `python3 tools/years.py` to see the conversion examples.

## 2.3 Recording

```bash
python3 tools/narrate.py script.json --lexicon lexicon.json --out rec --voice af_heart --speed 0.95 \
    --model kokoro-v1.0.int8.onnx --voices voices-v1.0.bin
```

- One WAV per sentence (24 kHz mono): `rec/<beatId>_<n>.wav`. Per-sentence files let you fix one sentence
  without re-recording the film, and give exact timings for subtitles.
- `rec/timings.json` maps each beat to `[[sentence, seconds], …]`. It drives the timeline and subtitles.
- Re-recording: delete the affected WAVs and run again; existing files are skipped.
- On a Raspberry Pi 5 the 166 Panipat sentences took ~10 minutes and the CPU reached ~67 °C (fine).
  Set `OMP_NUM_THREADS=3` on a Pi to leave a core free.

## 2.4 Quality checks

- Listen to the first and last minute, and every quote.
- Very short sentences (one or two words: "Samarkand.") can sound clipped; merge them with a neighbour if so.
- Check numbers ("1761" should be "seventeen sixty-one"), abbreviations, and "St", "Mt" and so on.
- If the voice speeds up on long sentences, split them in the script.
