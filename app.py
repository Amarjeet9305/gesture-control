from flask import Flask, render_template, Response, request, jsonify
import cv2
import mediapipe as mp
import numpy as np

app = Flask(__name__)

# MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5)

finger_coordinates = [(8, 6), (12, 10), (16, 14), (20, 18)]
thumb_coordinate = (4, 2)

def detect_gesture(frame):
    img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(img_rgb)
    if not results.multi_hand_landmarks:
        return None

    hand_points = []
    h, w, _ = frame.shape
    for lm in results.multi_hand_landmarks[0].landmark:
        hand_points.append((int(lm.x * w), int(lm.y * h)))

    # Count fingers
    up_count = sum(1 for coord in finger_coordinates if hand_points[coord[0]][1] < hand_points[coord[1]][1])
    if hand_points[thumb_coordinate[0]][0] > hand_points[thumb_coordinate[1]][0]:
        up_count += 1

    gestures = {
        1: "Play/Pause",
        2: "Volume Up",
        3: "Volume Down",
        4: "Forward",
        5: "Backward"
    }
    return gestures.get(up_count, None)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload_frame', methods=['POST'])
def upload_frame():
    file = request.files['frame']
    npimg = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    gesture = detect_gesture(frame)
    return jsonify({"gesture": gesture})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
