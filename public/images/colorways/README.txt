APEX product colorway mockups — drop-in folder
==============================================

Put alternate-colour product images in THIS folder and they appear
automatically on the matching product page, under "Also available in".
A file that is not present is simply skipped — nothing breaks, and no code
change is needed to turn a colorway on. Just add the correctly-named file.

Image specs
-----------
- White seamless background, one product per image, roughly square crop.
- >= 800 px, .webp preferred (or .png/.jpg — those get converted to .webp).
- Brand colors: red #ED1C24, navy #000066.

Expected filenames (add any subset you have)
--------------------------------------------
Canopy tents   : canopy-red.webp, canopy-charcoal.webp, canopy-white.webp
Table covers   : tablecover-red.webp, tablecover-charcoal.webp
Banner stands  : banner-red.webp, banner-white.webp
Backdrop       : backdrop-red.webp, backdrop-charcoal.webp

To add a new name/colour, edit src/data/colorways.js (the manifest) and drop
the matching file here. Use the image prompts provided for consistent results.
