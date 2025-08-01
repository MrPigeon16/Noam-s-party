"use strict"

const ticketCheckDIV = document.querySelector(".ticket-check");
const submitButtonDIV = document.querySelector(".submit");
const ticketNumberDIV = document.querySelector(".ticket-number")
const scannedDIV = document.querySelector(".scanned")
const holderNameDIV = document.querySelector(".holder-name")
const resultDIV = document.getElementById("result")

const myDataBase = [
    {
        ticketHolder: "Noam Binyamin",
        ticketID: "1",
        scanned: false
    },
    {
        ticketHolder: "Ilay Binyamin",
        ticketID: "1313",
        scanned: false
    },
    {
        ticketHolder: "Michal Shamir",
        ticketID: "12345",
        scanned: false
    }
]

/*
submitButtonDIV.addEventListener("click", () =>{
    const ticketNumber = ticketCheckDIV.value;
    //ticketCheckDIV.value = "" // reset the submit box value for the next one

    if (ticketNumber === "") {
        console.log("Nothing to check")
        return;
    }

    const foundTicket = myDataBase.find(ticket => ticket.ticketID === ticketNumber)
    
    ticketNumberDIV.textContent = `Ticket Number: ${foundTicket.ticketID}`
    holderNameDIV.textContent = `Ticket Holder: ${foundTicket.ticketHolder}`
    scannedDIV.textContent = `Scanned?: ${foundTicket.scanned}`
});
*/

function onScanSuccess(decodedText, decodedResult) {
    // Handle the scanned code as you like
    resultDIV.innerText = `Scanned: ${decodedText}`;
  }

const html5QrCode = new Html5Qrcode("reader");

Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      const cameraId = devices[0].id;
      html5QrCode.start(
        cameraId,
        {
          fps: 60,    // Optional, frames per second
          qrbox: 410  // Optional, scanning box size
        },
        onScanSuccess
      );
    }
  }).catch(err => {
    console.error("Camera error: ", err);
  });

function handleFile(file) {
  const html5QrCode = new Html5Qrcode("reader");
  html5QrCode.scanFile(file, true)
    .then(decodedText => {
      document.getElementById("result").innerText = `Scanned from file: ${decodedText}`;
    })
    .catch(err => console.error("Scan failed", err));
}
