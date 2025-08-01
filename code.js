"use strict"

const submitButtonDIV = document.querySelector(".submit");
const ticketNumberDIV = document.querySelector(".ticket-number")
const scannedDIV = document.querySelector(".scanned")
const holderNameDIV = document.querySelector(".holder-name")
const resultDIV = document.getElementById("result")
const buttonDIV = document.getElementById("redeem")
const statusDIV = document.getElementById("status")

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
            ticketNumberDIV.textContent = "Ticket Number: ";
            holderNameDIV.textContent = "Ticket Holder: ";
            scannedDIV.textContent = "Scanned?: ";
            return;
        }

        const data = await response.json();
        const guest = data.guest;

        statusDIV.textContent = "Ticket found!";  
        ticketNumberDIV.textContent = `Ticket Number: ${guest.id}`;
        holderNameDIV.textContent = `Ticket Holder: ${guest.name}`;
        scannedDIV.textContent = `Scanned?: ${guest.inside}`;

    } catch (error) {
        statusDIV.textContent = "Error connecting to server.";
        ticketNumberDIV.textContent = "Ticket Number: ";
        holderNameDIV.textContent = "Ticket Holder: ";
        scannedDIV.textContent = "Scanned?: ";
        console.error(error);
    }
}


const BACKEND_URL_REEDEM = "https://backend-wx19.onrender.com/redeem";

async function redeemTicket(ticketHash) {
    try {
        const response = await fetch(BACKEND_URL_REEDEM, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ hash: ticketHash, redeem: true})
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

// If you want to use the QR code scanner:
function onScanSuccess(decodedText, decodedResult) {
    resultDIV.innerText = `${decodedText}`;
    checkTicket(decodedText);
    return decodedText;
}

buttonDIV.addEventListener("click", (decodedText) => {
  const ticketNumber = decodedText;
  if (ticketNumber === "") {
    statusDIV.textContent = "Nothing to redeem";
    return;
  }
  redeemTicket(ticketNumber);
});

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