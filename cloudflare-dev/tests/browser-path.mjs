import {existsSync} from 'node:fs';
// Codex Cloud and GitHub's Ubuntu runner expose Chromium under different paths.
export const browserPath=process.env.RUTASEC_CHROMIUM_PATH||['/usr/bin/chromium','/usr/bin/google-chrome','/usr/bin/chromium-browser'].find(existsSync);
