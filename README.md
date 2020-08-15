# mic

Sends audio from browser to Node server. Useful for when you're too lazy to buy a real microphone so you use your other laptop as a mic because your main laptop doesn't have a webcam.

## How

1. Browser [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
1. Send audio data every 10 ms via websocket to Node
1. Node server pipes audio data to ffplay stdin

## Run

1. `yarn install`
1. `yarn build`
1. `node dist/app.js`
1. Connect to server on 2nd device ie. via local network
