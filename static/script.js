const video = document.getElementById("video");
const gestureText = document.getElementById("gesture");

// Access webcam
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    });

function sendFrame() {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append("frame", blob, "frame.jpg");

        fetch("/upload_frame", { method: "POST", body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.gesture) {
                    gestureText.textContent = "Gesture: " + data.gesture;
                }
            });
    }, "image/jpeg");
}

setInterval(sendFrame, 1000); // send 1 frame per second
