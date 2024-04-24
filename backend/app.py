from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse
from reportlab.graphics import renderPM
import os
from typing import Dict
from cairosvg import svg2png

app = FastAPI()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.post("/convert-svg-to-png/")
async def convert_svg_to_png(data: Dict[str, str]):
    try:
        svg_data = data.get("svgData")
        png_file_path = os.path.join(UPLOAD_DIR, "image.png")
        svg2png(bytestring=svg_data, write_to=png_file_path)
        return JSONResponse(content={"message": "SVG successfully converted to PNG"}, status_code=200)        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error converting SVG to PNG: {str(e)}")

@app.get("/")
async def default_response():
    return {"message": "Hello World"}

from fastapi import FastAPI, WebSocket
from aiortc import RTCPeerConnection, MediaStreamTrack, RTCSessionDescription, RTCIceCandidate
from aiortc.contrib.media import MediaBlackhole, MediaRelay, MediaPlayer, MediaRecorder
import aiortc.mediastreams as ms
import uuid
import json
import os
import cv2
from av import VideoFrame
ROOT = os.path.dirname(__file__)
import pickle
import cv2
import mediapipe as mp
import numpy as np

model_dict = pickle.load(open('./model.p', 'rb'))
model = model_dict['model']

cap = cv2.VideoCapture(0)

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

hands = mp_hands.Hands(static_image_mode=True, min_detection_confidence=0.8)

labels_dict = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E',
    5: 'F',
    6: 'G',
    7: 'H',
    8: 'I',
    9: 'J',
    10: 'K',
    11: 'L',
    12: 'M',
    13: 'N',
    14: 'O',
    15: 'P',
    16: 'Q',
    17: 'R',
    18: 'S',
    19: 'T',
    20: 'U',
    21: 'V',
    22: 'W',
    23: 'X',
    24: 'Y',
    25: 'Z'
}

# app = FastAPI()

relay = MediaRelay()  # Provide the path to where you want to record

# This dictionary stores the peer connections
peer_connections = {}





live_labels = set()



class WebSocketVideoStream:
    def __init__(self):
        self.frames = []

    def add_frame(self, frame):
        self.frames.append(frame)
    
    def len_frame(self):
        return len(self.frames)

    def get_live_frame(self):
        if self.frames:
            return self.frames[-1]
        return None

    def get_batch(self, batch_size):
        if len(self.frames) >= batch_size:
            batch = self.frames[-batch_size:]
            self.frames = self.frames[-16:]
            return batch
        return None
    

video_stream = WebSocketVideoStream()

class VideoTransformTrack(MediaStreamTrack):
    """
    A video stream track that transforms frames from another track.
    """

    kind = "video"

    def __init__(self, track, transform):
        super().__init__()  # don't forget this!
        self.track = track
        self.transform = transform
        # self.labels_found=set()

    async def recv(self):
        rawFrame = await self.track.recv()
        frame = rawFrame.to_ndarray(format="bgr24")
        video_stream.add_frame(frame)
        # print(action_recognizer.input_length)
        # print(frame.shape)
        # print(video_stream.len_frame())
        
        try:
            data_aux = []
            x_ = []
            y_ = []

            
            # H, W, _ = frame.shape

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            results = hands.process(frame_rgb)
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    mp_drawing.draw_landmarks(
                        frame,  # image to draw
                        hand_landmarks,  # model output
                        mp_hands.HAND_CONNECTIONS,  # hand connections
                        mp_drawing_styles.get_default_hand_landmarks_style(),
                        mp_drawing_styles.get_default_hand_connections_style())

                for hand_landmarks in results.multi_hand_landmarks:
                    for i in range(len(hand_landmarks.landmark)):
                        x = hand_landmarks.landmark[i].x
                        y = hand_landmarks.landmark[i].y

                        x_.append(x)
                        y_.append(y)

                    for i in range(len(hand_landmarks.landmark)):
                        x = hand_landmarks.landmark[i].x
                        y = hand_landmarks.landmark[i].y
                        data_aux.append(x - min(x_))
                        data_aux.append(y - min(y_))

                # x1 = int(min(x_) * W) - 10
                # y1 = int(min(y_) * H) - 10

                # x2 = int(max(x_) * W) - 10
                # y2 = int(max(y_) * H) - 10

                prediction = model.predict([np.asarray(data_aux)])

                predicted_character = labels_dict[int(prediction[0])]

                # cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 0), 4)
                # cv2.putText(frame, predicted_character, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 1.3, (0, 0, 0), 3,
                #             cv2.LINE_AA)
                print("Predicted character:", predicted_character)
                live_labels.add(predicted_character)
            # cv2.imshow('frame', frame)
            key = cv2.waitKey(1)
            # if key == 27:  # Escape key
            #     break
        except Exception as e:
            print(f"An error occurred: {e}")
        return rawFrame



async def handle_offer(websocket: WebSocket, pc: RTCPeerConnection, message: dict):
    print(message["offer"]["sdp"])
    offer = RTCSessionDescription(
        sdp=message["offer"]["sdp"], type=message["offer"]["type"]
    )
    await pc.setRemoteDescription(offer)
    print("set remote description")

    recorder = MediaBlackhole()
    

    answer = await pc.createAnswer()
    print(answer.sdp)
    await pc.setLocalDescription(answer)

    await websocket.send_text(json.dumps({
        "type": "answer",
        "answer": {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
    }))

async def handle_candidate(pc: RTCPeerConnection, message: dict):
    candidate_info = message["candidate"]["candidate"].split()
    candidate = RTCIceCandidate(
        candidate_info[1], candidate_info[0], candidate_info[4], 
        int(candidate_info[5]), int(candidate_info[3]), candidate_info[2], 
        candidate_info[7],
        sdpMid=message["candidate"]["sdpMid"], sdpMLineIndex=message["candidate"]["sdpMLineIndex"]
    )
    await pc.addIceCandidate(candidate)

async def handle_end_track(websocket: WebSocket, recorder: MediaBlackhole):
    await websocket.send_text(json.dumps({"type": "track_end"}))
    await recorder.stop()
    print("Track ended")


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    pc = RTCPeerConnection()
    peer_connections[client_id] = pc

    @pc.on("track")
    async def on_track(track):
        if track.kind == "video":
            pc.addTrack(
                VideoTransformTrack(
                    relay.subscribe(track), transform="cartoon"
                )
            )
              # Or use MediaRecorder to record
            recorder = MediaBlackhole()
            # recorder = MediaRecorder("sample.mp4")
            recorder.addTrack(VideoTransformTrack(relay.subscribe(track), transform="cartoon"))
            await recorder.start()
            print("Video track added and recorder started")
            @track.on("ended")
            async def on_ended():
                await recorder.stop()

    async for message in websocket.iter_text():
        message = json.loads(message)

        if message["type"] == "offer":
            await handle_offer(websocket, pc, message)
        elif message["type"] == "candidate":
            await handle_candidate(pc, message)
        elif message["type"] == "end_track":
            recorder = MediaBlackhole()
            await handle_end_track(websocket, recorder)

    # Clean up after the connection is closed
    del peer_connections[client_id]
    await pc.close()

# @app.on_event("shutdown")
# async def on_shutdown():
#     # Close all peer connections
#     for pc in peer_connections.values():
#         await pc.close()


@app.get('/live_labels')
def get_live_labels():
    labels = list(live_labels)
    live_labels.clear()
    return JSONResponse({"labels" : labels})


import easyocr

def ocr_png_image(image_path):
    # Create an OCR reader object
    reader = easyocr.Reader(['en'])  # Specify language(s) here, e.g., ['en', 'de', 'fr']

    # Perform OCR on the image
    result = reader.readtext(image_path)
    return result

# Path to your PNG image
image_path = '/content/w.png'

# Perform OCR on the image
result_text = ocr_png_image(image_path)
print("OCR Result:")
for detection in result_text:
    print(detection[1])  # detection[1] contains the recognized text