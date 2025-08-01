"use strict"

const ticketCheckDIV = document.querySelector(".ticket-check");
const submitButtonDIV = document.querySelector(".submit");
const ticketNumberDIV = document.querySelector(".ticket-number")
const scannedDIV = document.querySelector(".scanned")
const holderNameDIV = document.querySelector(".holder-name")
const resultDIV = document.getElementById("result")

// Replace this with your Flask backend URL
const BACKEND_URL = "https://backend-wx19.onrender.com/submit";

// Function to check ticket with backend
async function checkTicket(ticketHash) {
    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ hash: ticketHash })
        });

        if (!response.ok) {
            resultDIV.textContent = "Ticket not found!";
            ticketNumberDIV.textContent = "";
            holderNameDIV.textContent = "";
            scannedDIV.textContent = "";
            return;
        }

        const data = await response.json();
        const guest = data.guest;
        ticketNumberDIV.textContent = `Ticket Number: ${guest.id}`;
        holderNameDIV.textContent = `Ticket Holder: ${guest.name}`;
        scannedDIV.textContent = `Scanned?: ${guest.inside}`;
        resultDIV.textContent = "Ticket found!";
    } catch (error) {
        resultDIV.textContent = "Error connecting to server.";
        ticketNumberDIV.textContent = "";
        holderNameDIV.textContent = "";
        scannedDIV.textContent = "";
        console.error(error);
    }
}

// If you want to use the QR code scanner:
function onScanSuccess(decodedText, decodedResult) {
    resultDIV.innerText = `${decodedText}`;
    checkTicket(decodedText);
}

const html5QrCode = new Html5Qrcode("reader");

Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      const cameraId = devices[0].id;
      html5QrCode.start(
        cameraId,
        {
          fps: 60,    // Optional, frames per second
          qrbox: 800  // Optional, scanning box size
        },
        onScanSuccess
      );
    }
  }).catch(err => {
    console.error("Camera error: ", err);
  });