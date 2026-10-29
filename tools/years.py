"""Read years the way people say them: 1527 -> "fifteen twenty-seven", 1500 -> "fifteen hundred",
1505 -> "fifteen oh five", 1520s -> "fifteen twenties", 326 BCE stays as written (three-digit numbers are left alone),
2000 -> "two thousand", 2008 -> "two thousand and eight", 2015 -> "twenty fifteen".
Any four-digit number from 1000 to 2099 is treated as a year, so write counts in words in the script
("two hundred and one thousand horsemen"), never as bare four-digit figures."""
import re

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()

def two(n: int) -> str:
    if n < 20: return ONES[n]
    t, o = divmod(n, 10)
    return TENS[t] + ("" if o == 0 else "-" + ONES[o])

def plural(w: str) -> str:
    return w[:-1] + "ies" if w.endswith("y") else w + "s"

def year_words(y: int, decade: bool = False) -> str:
    hi, lo = divmod(y, 100)
    if 2000 <= y <= 2009 and not decade:
        return "two thousand" + ("" if y == 2000 else " and " + ONES[lo])
    if lo == 0:
        w = two(hi) + " hundred"
        return plural(w) if decade else w
    if lo < 10 and not decade:
        return two(hi) + " oh " + ONES[lo]
    w = two(hi) + " " + two(lo)
    return plural(w) if decade else w

YEAR = re.compile(r"(?<![\d,.£$₹])\b(1\d{3}|20\d{2})(s?)\b(?![,.]\d)")

def spoken_years(text: str) -> str:
    return YEAR.sub(lambda m: year_words(int(m.group(1)), bool(m.group(2))), text)

if __name__ == "__main__":
    for t in ["Saturday, the sixteenth of March 1527.", "In 1500 and 1505 and the 1520s.", "In 1576, Pratap.", "From 2000 to 2008, then 2015.", "A force of 1,500 men.", "Year 1600s; the 1900s."]:
        print(t, "->", spoken_years(t))
