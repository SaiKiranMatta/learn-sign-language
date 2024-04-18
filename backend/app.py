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
