import io
import base64
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np

app = Flask(__name__)
CORS(app)

deepface_loaded = False
DeepFace = None

def load_deepface():
    global deepface_loaded, DeepFace
    if not deepface_loaded:
        from deepface import DeepFace as DF
        DeepFace = DF
        deepface_loaded = True

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "deepface_loaded": deepface_loaded})

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        load_deepface()

        data = request.json
        if not data or "image" not in data:
            return jsonify({"error": "image field required (base64)"}), 400

        image_b64 = data["image"]
        if "," in image_b64:
            image_b64 = image_b64.split(",", 1)[1]

        image_bytes = base64.b64decode(image_b64)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_array = np.array(image)

        results = DeepFace.analyze(
            img_array,
            actions=["emotion"],
            enforce_detection=False,
            silent=True,
        )

        if isinstance(results, list):
            result = results[0]
        else:
            result = results

        emotions = result.get("emotion", {})
        dominant = str(result.get("dominant_emotion", "unknown"))

        face_region = result.get("region", {})
        clean_region = {k: int(v) for k, v in face_region.items() if v is not None}

        clean_emotions = {}
        for key in ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"]:
            val = emotions.get(key, 0)
            clean_emotions[key] = float(round(float(val), 2))

        return jsonify({
            "dominant_emotion": dominant,
            "emotions": clean_emotions,
            "face_detected": bool(clean_region.get("w", 0) > 0),
            "face_region": clean_region,
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "dominant_emotion": "unknown",
            "emotions": {},
            "face_detected": False,
            "error": str(e),
        })

if __name__ == "__main__":
    print("[deepface] Starting emotion analysis service on port 5050...")
    print("[deepface] First request will be slow (loading model)...")
    app.run(host="0.0.0.0", port=5050, debug=False)
