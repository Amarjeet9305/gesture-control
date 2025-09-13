const webcam = document.getElementById("video");
const gestureText = document.getElementById("gesture");
const player = document.getElementById("player");

// Access webcam
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { webcam.srcObject = stream; });

// Send frames to backend
function sendFrame() {
    const canvas = document.createElement("canvas");
    canvas.width = webcam.videoWidth;
    canvas.height = webcam.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(webcam, 0, 0);

    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append("frame", blob, "frame.jpg");

        fetch("/upload_frame", { method: "POST", body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.gesture) {
                    gestureText.textContent = "Gesture: " + data.gesture;
                    controlVideo(data.gesture);
                }
            });
    }, "image/jpeg");
}

// Map gestures to video controls
function controlVideo(gesture) {
    switch (gesture) {
        case "Play/Pause":
            if (player.paused) {
                player.play();
            } else {
                player.pause();
            }
            break;

        case "Volume Up":
            player.volume = Math.min(1, player.volume + 0.1);
            break;

        case "Volume Down":
            player.volume = Math.max(0, player.volume - 0.1);
            break;

        case "Forward":
            player.currentTime += 5;
            break;

        case "Backward":
            player.currentTime = Math.max(0, player.currentTime - 5);
            break;
    }
}

// Send one frame per second
setInterval(sendFrame, 1000);
