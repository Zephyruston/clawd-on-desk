"use strict";

// electron-builder afterPack hook for Linux.
// Wraps the electron binary so --ozone-platform=x11 is auto-applied on Wayland
// sessions. This works around the fact that app.commandLine.appendSwitch is too
// late to change the Ozone platform (GPU already initialised by then).
//
// On non-Wayland sessions (X11 native), the wrapper passes through unchanged.

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

exports.default = async function (context) {
  // Only for Linux targets
  if (context.electronPlatformName !== "linux") return;

  const appDir = context.appOutDir;
  const electronBin = path.join(appDir, "clawd-on-desk");
  const electronReal = path.join(appDir, "clawd-on-desk.bin");

  if (!fs.existsSync(electronBin)) {
    console.log("build/linux-after-pack: electron binary not found, skipping wrapper");
    return;
  }

  // Don't double-wrap
  if (fs.existsSync(electronReal)) {
    console.log("build/linux-after-pack: wrapper already exists, skipping");
    return;
  }

  // Rename original binary
  fs.renameSync(electronBin, electronReal);
  fs.chmodSync(electronReal, 0o755);

  // Create wrapper script
  const wrapper = `#!/bin/bash
# Clawd on Desk launcher — auto-detect Wayland and force XWayland.
# Native Wayland/Ozone causes: no always-on-top, broken setShape, and
# transparent-window ghosting during drag.
if [ "\${XDG_SESSION_TYPE}" = "wayland" ] || [ -n "\${WAYLAND_DISPLAY}" ]; then
  exec "\${0%/*}/clawd-on-desk.bin" --ozone-platform=x11 "\$@"
else
  exec "\${0%/*}/clawd-on-desk.bin" "\$@"
fi
`;
  fs.writeFileSync(electronBin, wrapper, { mode: 0o755 });
  console.log("build/linux-after-pack: electron binary wrapped for Wayland → XWayland");
};
