import cv2
import numpy as np
import sys

def process1(p):
    img = cv2.imread(p)
    gi = img[:, :, 1]  # Green channel
    return gi

def process2(gi):
    _, th = cv2.threshold(gi, 0, 255, cv2.THRESH_OTSU)
    return th

def process3(th):
    th4 = cv2.adaptiveThreshold(th, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 14)
    return th4

def process4(th4):
    gi_th = cv2.threshold(th4, 220, 255, cv2.THRESH_BINARY_INV)[1]
    gi_floodFill = gi_th.copy()
    h, w = gi_th.shape[:2]
    mask = np.zeros((h+2, w+2), np.uint8)
    cv2.floodFill(gi_floodFill, mask, (0, 0), 255)
    gi_floodFill_inv = cv2.bitwise_not(gi_floodFill)
    gi_out = gi_th | gi_floodFill_inv
    return gi_out

def process5(gi_out):
    kernel = np.ones((5, 5), np.uint8)
    open = cv2.morphologyEx(gi_out, cv2.MORPH_OPEN, kernel)
    close = cv2.morphologyEx(open, cv2.MORPH_CLOSE, kernel)
    return close

def process7(close, gi):
    mask = np.ones(close.shape[:2], np.uint8)
    hist = cv2.calcHist([gi], [0], mask, [256], [0, 256])
    values = hist.ravel()
    sd = np.std(values)
    return sd < 580  # Threshold for reaction detection

def detect_reaction(p):
    gi = process1(p)
    th = process2(gi)
    th4 = process3(th)
    gi_out = process4(th4)
    close = process5(gi_out)
    return process7(close, gi)

def detect_blood_group(anti_a, anti_b, anti_d, control):
    blood = [
        detect_reaction(anti_a),
        detect_reaction(anti_b),
        detect_reaction(anti_d),
        detect_reaction(control)
    ]
    if blood[3]:  # Control reaction indicates invalid result
        return "Invalid"
    elif not blood[0] and not blood[1] and blood[2]:
        return "O+"
    elif not blood[0] and not blood[1] and not blood[2]:
        return "O-"
    elif blood[0] and not blood[1] and blood[2]:
        return "A+"
    elif blood[0] and not blood[1] and not blood[2]:
        return "A-"
    elif not blood[0] and blood[1] and blood[2]:
        return "B+"
    elif not blood[0] and blood[1] and not blood[2]:
        return "B-"
    elif blood[0] and blood[1] and blood[2]:
        return "AB+"
    elif blood[0] and blood[1] and not blood[2]:
        return "AB-"
    else:
        return "Unknown"

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python detect_blood_group.py <anti_a> <anti_b> <anti_d> <control>")
        sys.exit(1)
    anti_a, anti_b, anti_d, control = sys.argv[1:]
    result = detect_blood_group(anti_a, anti_b, anti_d, control)
    print(result)