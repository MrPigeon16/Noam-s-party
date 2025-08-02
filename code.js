"use strict"

const ticketCheckDIV = document.querySelector(".ticket-check");
const ticketNumberDIV = document.querySelector(".ticket-number");
const scannedDIV = document.querySelector(".scanned");
const holderNameDIV = document.querySelector(".holder-name");
const resultDIV = document.getElementById("result");
const buttonDIV = document.getElementById("redeem");
const statusDIV = document.getElementById("status");
const refreshDIV = document.getElementById("refresh");

// Backend URLs
const BACKEND_URL = "https://backend-wx19.onrender.com/submit";
const BACKEND_URL_REEDEM = "https://backend-wx19.onrender.com/redeem";

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

// Function to redeem ticket
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
            // Optionally, refresh ticket info after redeem
            checkTicket(ticketHash);
            return;
        } else {
            statusDIV.textContent = "Redeem failed!";
        }
        
    } catch (error) {
        statusDIV.textContent = "Error connecting to server.";
        console.error(error);
    }
}

// Redeem button event handler (get value from input)
buttonDIV.addEventListener("click", () => {
    if (!ticketCheckDIV) {
        statusDIV.textContent = "No input field found!";
        return;
    }
    const ticketNumber = ticketCheckDIV.value;
    if (ticketNumber === "") {
        statusDIV.textContent = "Nothing to redeem";
        return;
    }
    redeemTicket(ticketNumber);
});

// Refresh button event handler
refreshDIV.addEventListener("click", () => {
    statusDIV.textContent = "Ready to Scan";
    ticketNumberDIV.textContent = "None";
    holderNameDIV.textContent = "None";
    scannedDIV.textContent = "None";
    if (ticketCheckDIV) ticketCheckDIV.value = "";
});

// QR Code handler:
function onScanSuccess(decodedText, decodedResult) {
    resultDIV.innerText = `${decodedText}`;
    checkTicket(decodedText);
    if (ticketCheckDIV) ticketCheckDIV.value = decodedText;
    return decodedText;
}

// Camera and QR handler
const html5QrCode = new Html5Qrcode("reader");
Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      const cameraId = devices[1].id; // Use the first camera by default
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