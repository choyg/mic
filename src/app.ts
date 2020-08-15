import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { SSLApp } from "uWebSockets.js";

let ffplay: ChildProcessWithoutNullStreams;
const startFfplay = () => {
  // https://ffmpeg.org/ffplay.html
  // Set loglevel to 8: 'Only show fatal errors. These are errors after which the process absolutely cannot continue.'
  // Automatically respawns after a fatal error
  ffplay = spawn("ffplay", ["-nodisp", "-loglevel", "8", "-"]);
  ffplay.on("close", () => {
    startFfplay();
  });
  ffplay.stderr.on("data", (data) => {
    process.stdout.write(data);
    ffplay.kill("SIGABRT");
  });
};

startFfplay();

// Must be SSL because 'mic' device will not connect on localhost
// Browsers will reject unencrypted connection when requesting mic permission
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Security
SSLApp({
  key_file_name: "key.pem",
  cert_file_name: "cert.pem",
})
  .get("/", (res, req) => {
    const filePath = path.join(__dirname, "static", "index.html");
    const file = fs.readFileSync(filePath);
    res.end(file);
  })
  .get("/*", (res, req) => {
    try {
      const filePath = path.join(__dirname, "static", req.getUrl().slice(1));
      const file = fs.readFileSync(filePath);
      res.end(file);
    } catch (err) {
      res.writeStatus("404");
      res.end();
    }
  })
  .ws("/*", {
    maxPayloadLength: 25000,
    message: (ws, message, isBinary) => {
      if (!isBinary) return console.log(message);
      ffplay.stdin.write(
        Buffer.from(message),
        (err) => err && console.error(err)
      );
    },
  })
  .listen(3000, () => {});
