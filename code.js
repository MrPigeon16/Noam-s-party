"use strict";

// const variables
const ticketNumberDIV = document.querySelector(".ticket-number");
const scannedDIV = document.querySelector(".scanned");
const holderNameDIV = document.querySelector(".holder-name");
const resultDIV = document.getElementById("result");
const buttonDIV = document.getElementById("redeem");
const statusDIV = document.getElementById("status");
const refreshDIV = document.getElementById("refresh");

let lastScannedTicket = "";

// Backend URLs
const BACKEND_URL = "https://backend-wx19.onrender.com/submit";
const BACKEND_URL_REEDEM = "https://backend-wx19.onrender.com/redeem";

// Camera and QR handler
const html5QrCode = new Html5Qrcode("reader");
Html5Qrcode.getCameras()
  .then((devices) => {
    if (devices && devices.length) {
      const cameraId = devices[0].id;
      html5QrCode.start(
        cameraId,
        {
          fps: 60, // Optional, frames per second
          qrbox: 500, // Optional, scanning box size
        },
        onScanSuccess
      );
    }
  })
  .catch((err) => {
    console.error("Camera error: ", err);
  });

// QR Code handler:
function onScanSuccess(decodedText) {
  lastScannedTicket = decodedText;
  resultDIV.innerText = `${lastScannedTicket}`;
  checkTicket(lastScannedTicket);
  console.log(lastScannedTicket);
  return lastScannedTicket;
}

// Function to check ticket with back-end
async function checkTicket(ticketHash) {
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hash: ticketHash }),
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

// Redeem button event handler (get value from input)
buttonDIV.addEventListener("click", () => {
  if (!lastScannedTicket) {
    statusDIV.textContent = "Nothing to redeem";
    return;
  }
  redeemTicket(lastScannedTicket);
});

// Function to redeem ticket
async function redeemTicket(ticketHash) {
  try {
    const response = await fetch(BACKEND_URL_REEDEM, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hash: ticketHash }), // Only send the hash!
    });

    if (response.ok) {
      statusDIV.textContent = "Redeemed!";
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

// Refresh button event handler
refreshDIV.addEventListener("click", () => {
  statusDIV.textContent = "Ready to scan...";
  ticketNumberDIV.textContent = "None";
  holderNameDIV.textContent = "None";
  scannedDIV.textContent = "None";
  resultDIV.textContent = "WATING FOR SCAN ID";

  lastScannedTicket = "";
});
