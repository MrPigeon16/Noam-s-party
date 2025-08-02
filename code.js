"use strict"

const ticketNumberDIV = document.querySelector(".ticket-number")
const scannedDIV = document.querySelector(".scanned")
const holderNameDIV = document.querySelector(".holder-name")
const resultDIV = document.getElementById("result")
const buttonDIV = document.getElementById("redeem")
const statusDIV = document.getElementById("status")
const refreshDIV = document.getElementById("refresh")

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
            statusDIV.textContent = "Ticket not found!";
            ticketNumberDIV.textContent = "not found";
            holderNameDIV.textContent = "not found";
            scannedDIV.textContent = "not found";
            return;
        }

        const data = await response.json();
        const guest = data.guest;

        statusDIV.textContent = "Ticket found!";  
        ticketNumberDIV.textContent = `${guest.id}`;
        holderNameDIV.textContent = `${guest.name}`;
        scannedDIV.textContent = `${guest.inside}`;

    } catch (error) {
        statusDIV.textContent = "Error connecting to server.";
        ticketNumberDIV.textContent = "Error";
        holderNameDIV.textContent = "Error";
        scannedDIV.textContent = "Error";
        console.error(error);
    }
}


const BACKEND_URL_REEDEM = "https://backend-wx19.onrender.com/valid";

async function redeemTicket(ticketHash) {
    try {
        const response = await fetch(BACKEND_URL_REEDEM, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ hash: ticketHash }) // Only send the hash!
        });

        if (response.ok) {
            statusDIV.textContent = "Redeemed!";
            return;
        }
        
    } catch (error) {
        statusDIV.textContent = "Error connecting to server.";
        console.error(error);
    }
}

buttonDIV.addEventListener("click", (decodedText) => {
  const ticketNumber = decodedText;
  if (ticketNumber === "") {
    statusDIV.textContent = "Nothing to redeem";
    return;
  }
  redeemTicket(ticketNumber);
});

refreshDIV.addEventListener("click", () => {
    statusDIV.textContent = "Ready to Scan";
    ticketNumberDIV.textContent = "None";
    holderNameDIV.textContent = "None";
    scannedDIV.textContent = "None";
});

// QR Code handeler:
function onScanSuccess(decodedText, decodedResult) {
    resultDIV.innerText = `${decodedText}`;
    checkTicket(decodedText);
    return decodedText;
}

// Camera and QR handeler
const html5QrCode = new Html5Qrcode("reader");
Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      const cameraId = devices[1].id;
      html5QrCode.start(
        cameraId,
        {
          fps: 60,    // Optional, frames per second
          qrbox: 500  // Optional, scanning box size
        },
        onScanSuccess
      );
    }
  }).catch(err => {
    console.error("Camera error: ", err);
  });