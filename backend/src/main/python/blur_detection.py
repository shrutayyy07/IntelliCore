#!/usr/bin/env python3
"""
Blur Detection Script - Uses Laplacian variance to determine if an image is blurry.
Called from Java via ProcessBuilder.
Output: JSON to stdout
"""
import sys
import json
import os

def detect_blur(image_path: str, threshold: float = 100.0) -> dict:
    try:
        import cv2
        import numpy as np

        if not os.path.exists(image_path):
            return {"error": f"File not found: {image_path}", "blurry": False, "score": 0}

        img = cv2.imread(image_path)
        if img is None:
            return {"error": "Could not read image", "blurry": False, "score": 0}

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        blurry = variance < threshold

        return {
            "blurry": bool(blurry),
            "score": round(float(variance), 2),
            "threshold": threshold,
            "status": "blurry" if blurry else "clear"
        }
    except ImportError:
        # Fallback when cv2 not available - basic PIL approach
        try:
            from PIL import Image, ImageFilter
            import statistics

            img = Image.open(image_path).convert("L")
            edges = img.filter(ImageFilter.FIND_EDGES)
            pixels = list(edges.getdata())
            variance = statistics.variance(pixels) if len(pixels) > 1 else 0
            blurry = variance < threshold
            return {
                "blurry": bool(blurry),
                "score": round(float(variance), 2),
                "threshold": threshold,
                "status": "blurry" if blurry else "clear",
                "method": "PIL"
            }
        except Exception as e:
            return {"error": str(e), "blurry": False, "score": -1}
    except Exception as e:
        return {"error": str(e), "blurry": False, "score": -1}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: blur_detection.py <image_path> [threshold]"}))
        sys.exit(1)

    path = sys.argv[1]
    thresh = float(sys.argv[2]) if len(sys.argv) > 2 else 100.0
    result = detect_blur(path, thresh)
    print(json.dumps(result))
