import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { SSLApp } from "uWebSockets.js";

const ffplay = spawn("ffplay", ["-nodisp", "-"]);
ffplay.on("close", () => {
  console.log("ffplay closed");
});
ffplay.on("error", (err) => console.error(err));
ffplay.on("message", (message) => console.log(message));

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
