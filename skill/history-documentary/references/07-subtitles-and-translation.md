# 7. Subtitles and translation

## 7.1 English

```bash
python3 tools/mksrt.py --timeline template/src/timeline.json --timings rec/timings.json \
   --out subtitles-en.srt --chapters chapters.txt
```

Cues come straight from the script, so there are no transcription errors. Each sentence starts at its exact frame
and lasts its recorded duration. Long sentences are split into cues of up to ~80 characters, wrapped to two
lines, and timed in proportion to their length. `chapters.txt` gives the chapter timestamps for the description;
the first must be `0:00`, or YouTube won't show chapters.

## 7.2 Other languages (Hindi done for Panipat)

Translate **whole sentences, not cues**. Hindi (and most languages) orders words differently, so cue-by-cue
translation produces broken lines. Steps:

1. Print the narrated sentences in order:
   ```bash
   python3 -c "import json;t=json.load(open('template/src/timeline.json'));i=0
   for c in t['chapters']:
     for b in c['beats']:
       for f,s in b['sents']: print(i,s); i+=1"
   ```
2. Translate each into natural, spoken-register prose (a JSON list of strings, same order, same count).
   For Hindi: Hindustani register with Urdu loanwords where they are natural to the period (बादशाह, सुल्तान,
   ज़िरहबख़्तर, ख़ज़ाना), names in their usual Hindi spelling (बाबर, हुमायूँ, इब्राहिम लोदी, पानीपत, कोहिनूर),
   numbers in Indian style (एक लाख, सत्तर लाख), quotes translated faithfully, not paraphrased. Keep the
   attribution phrases ("बाबर के शब्दों में:").
3. Build the file: `python3 tools/mksrt.py … --translation hi.json --out subtitles-hi.srt --width 40`.
   The script asserts the sentence count matches.
4. Spot-check five cues for timing, and have a native speaker read the file if possible.

The Panipat Hindi translation is `examples/panipat-1526/hi.json`.

## 7.3 On YouTube

Upload `subtitles-en.srt` as English and `subtitles-hi.srt` as Hindi (Studio → Subtitles). Also add a
translated **title and description** for each language (Studio → Subtitles → Add language → Title &
description). Viewers whose YouTube is set to that language see them, and they are indexed for search
("पानीपत का युद्ध").
