var recordButton, stopButton, recorder, msg, fullBlob, ws;
const connectRecordButton = document.getElementById("connectrecord");
connectRecordButton.addEventListener("click", connectRecord);

function connectRecord() {
  ws = new WebSocket(`wss://${window.location.host}`);
  ws.onclose = (ev) => console.log(ev);

  recordButton = document.getElementById("record");
  stopButton = document.getElementById("stop");
  msg = document.getElementById("msg");

  // get audio stream from user's mic
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
    })
    .then(function (stream) {
      recordButton.disabled = false;
      recordButton.addEventListener("click", startRecording);
      stopButton.addEventListener("click", stopRecording);
      recorder = new MediaRecorder(stream);
      recorder.addEventListener("dataavailable", onRecordingReady);
    })
    .catch((err) => {
      msg.innerText = JSON.stringify(err);
    });
}

function startRecording() {
  recordButton.disabled = true;
  stopButton.disabled = false;
  recorder.start(10);
}

function stopRecording() {
  recordButton.disabled = false;
  stopButton.disabled = true;
  recorder.stop();
}

function onRecordingReady(e) {
  ws.send(e.data);
}
