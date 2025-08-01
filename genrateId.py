import pandas as pd
import hashlib
import qrcode
from qreader import QReader
import cv2


def getExelNames():

    names = pd.read_excel("names.xlsx")
    # Replace 'ActualColumnName' with the real column name
    all_names = names['Names'].tolist()
    return all_names


def calculate_sha256(data_string):

    # Encode the string to bytes, as hashlib functions operate on bytes
    data_bytes = data_string.encode('utf-8')

    # Create a SHA-256 hash object
    sha256_hash = hashlib.sha256()

    # Update the hash object with the data
    sha256_hash.update(data_bytes)

    # Get the hexadecimal representation of the hash
    hex_digest = sha256_hash.hexdigest()

    return hex_digest


def readQR():
    qreader = QReader()

    # Get the image that contains the QR code
    image = cv2.cvtColor(cv2.imread("img0.png"), cv2.COLOR_BGR2RGB)

    # Use the detect_and_decode function to get the decoded QR data
    decoded_text = qreader.detect_and_decode(image=image)
    print(decoded_text)



def createQR(hashs):
    for hashing in range(len(hashs)):

        data = str(calculate_sha256(hashs[hashing]))   
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
            )
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        img.save(f"img{hashing}.png")
        

def main():
    x = getExelNames()





main()
