"""Rebuild public/fonts/plus-jakarta-sans-latin-500-800.woff2.

Source: @fontsource-variable/plus-jakarta-sans (Latin, wght 200-800, OFL).
We keep only what headings, nav and buttons use, to fit the 100 KB first-load
budget (docs/UI_REVAMP_PLAN.md):
  - Basic Latin plus the punctuation the site's copy uses (– — ‘ ’ “ ” • … → × ′ ″ é)
  - the wght axis narrowed to 500-800
27.3 KB -> ~11.8 KB.

    npm pack @fontsource-variable/plus-jakarta-sans && tar xzf *.tgz
    pip install fonttools brotli
    python3 scripts/build-font.py package/files/plus-jakarta-sans-latin-wght-normal.woff2
"""
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

UNICODES = ("U+0020-007E,U+00A0,U+00A9,U+00AE,U+00B7,U+00D7,U+00E9,U+2013,U+2014,"
            "U+2018,U+2019,U+201C,U+201D,U+2022,U+2026,U+2192,U+2032,U+2033")
OUT = "public/fonts/plus-jakarta-sans-latin-500-800.woff2"

font = TTFont(sys.argv[1])
opts = subset.Options()
opts.flavor = "woff2"
opts.layout_features = ["kern", "liga", "calt", "tnum", "case"]
opts.name_IDs = ["*"]
opts.notdef_outline = True
sub = subset.Subsetter(opts)
sub.populate(unicodes=subset.parse_unicodes(UNICODES))
sub.subset(font)  # subset before instancing: instancing first trips a fontTools KeyError
font = instancer.instantiateVariableFont(font, {"wght": (500, 800)})
font.flavor = "woff2"
font.save(OUT)
print("wrote", OUT)
