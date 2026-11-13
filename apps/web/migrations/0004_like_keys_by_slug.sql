-- UI libraries, state management and templates were liked under their repository (ui:owner/name), which changes when the owner renames or transfers it. NSGo's move from oneo-me/nsgo to nsgo-dev/nsgo left the likes of its template and UI under keys no entry has. They are now liked under their slug, like every other kind (packages/catalog/src/likes.ts); this moves each entry's likes from every repository key it has had to its slug key. There were no state management entries.
--
-- OR IGNORE skips a row whose visitor already likes the entry under its new key (the same visitor under two old keys), and the DELETE below drops what is left of the old keys.

UPDATE OR IGNORE likes SET item = 'template:nsgo-init' WHERE item IN ('template:oneo-me/nsgo', 'template:nsgo-dev/nsgo');
UPDATE OR IGNORE likes SET item = 'ui:nsgo-ui' WHERE item IN ('ui:oneo-me/nsgo', 'ui:nsgo-dev/nsgo');
UPDATE OR IGNORE likes SET item = 'ui:nsgo-kubai-icons' WHERE item = 'ui:oneo-me/nsgo-icons-kubai';

DELETE FROM likes WHERE item IN ('template:oneo-me/nsgo', 'template:nsgo-dev/nsgo', 'ui:oneo-me/nsgo', 'ui:nsgo-dev/nsgo', 'ui:oneo-me/nsgo-icons-kubai');
