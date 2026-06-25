# 2026-06-26 04:32 Data Quality Audit

## Checked scope

- Single-page entry remains `index.html`.
- Public data remains centralized in `data.js`.
- Map and card interaction remain centralized in `app.js`.
- The page already has a fallback path when the map library, map tiles, or data file are unavailable.

## Maintenance rules added for future edits

1. Every public activity item should include a start date, end date, source link, location note, and update note.
2. Ended items should not be shown in the active public list.
3. Unclear locations should be marked as under review instead of being displayed as precise points.
4. Social posts may be used only as discovery clues; final details should be checked against official pages, public registration pages, public notices, or reliable news pages.
5. English entries should include the same core fields as Chinese entries: name, type, place, host, topic, eligibility, source, and update note.
6. If the data list grows, mobile performance should be protected with categories, search, and limited map rendering.

## Next recommended code change

Show `window.TCSM_DATA.updatedAt` on the homepage as a bilingual data freshness note. This helps visitors understand when the public dataset was last reviewed and which items still require source confirmation.

## Risk notes

- External map tiles can be unstable, so the card list must remain usable without the map.
- Some public web platforms change layouts frequently, so source links should be reviewed regularly.
- Location precision should be conservative when the source does not provide a clear public address or area.
