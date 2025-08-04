"use strict";

// UI elements for the camera and scanning process
const bodyDIV = document.querySelector("body");
const resultDIV = document.getElementById("result");
const statusDIV = document.getElementById("status");

// UI elements for displaying ticket information
const ticketNumberDIV = document.querySelector(".ticket-number");
const holderNameDIV = document.querySelector(".holder-name");
const scannedDIV = document.querySelector(".scanned");
const peopleListDIV = document.querySelector(".people-list");

// UI elements for buttons
const redeemButtonDIV = document.getElementById("redeem");
const refreshButtonDIV = document.getElementById("refresh");

//UI elements for the status area:
const statusBoxScannedDIV = document.getElementById("status-box-scanned");
const statusBoxLeftDIV = document.getElementById("status-box-left");
const statusBoxTotalDIV = document.getElementById("status-box-total");

// Variable to store the last scanned ticket
let lastScannedTicket = "";

// Backend URLs
const BACKEND_URL = "https://backend-wx19.onrender.com/submit";
const BACKEND_URL_REEDEM = "https://backend-wx19.onrender.com/redeem";
const BACKEND_URL_COMPLETE = "https://backend-wx19.onrender.com/COMPLETE";

// get all users from the back-end
get_all_users();

// Camera handler
const html5QrCode = new Html5Qrcode("reader");
Html5Qrcode.getCameras()
  .then((devices) => {
    let cameraId;
    if (devices && devices.length) {
      if (devices.length < 2) {
        cameraId = devices[0].id;
      } else if (devices.length >= 2) {
        // If there are multiple cameras, select the second one
        cameraId = devices[1].id;
      }

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
  // Prevent re-scanning the same ticket
  if (decodedText === lastScannedTicket) return;

  // Storing the last scanned ticket
  lastScannedTicket = decodedText;

  // Displaying the scanned ticket ID
  resultDIV.innerText = `${lastScannedTicket}`;

  // Checking the ticket with the back-end
  checkTicket(lastScannedTicket);

  // Returning the last scanned ticket
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
      // If the response is not ok, it means the ticket was not found
      statusDIV.textContent = "Ticket not found!";
      ticketNumberDIV.textContent = "not found";
      holderNameDIV.textContent = "not found";
      scannedDIV.textContent = "not found";
      bodyDIV.className = ""; // Resetting the body class
      bodyDIV.classList.add("bad-bg");
      return;
    }

    // If the response is ok, parse the JSON data
    const data = await response.json();

    // storing the guest data
    const guest = data.guest;

    // Updating the UI with the guest data
    statusDIV.textContent = "Ticket found!";
    ticketNumberDIV.textContent = `${guest.id}`;
    holderNameDIV.textContent = `${guest.name}`;
    scannedDIV.textContent = `${guest.inside}`;

    // Checking if guest's ticket already scanned and changint the background color accordingly
    bodyDIV.className = ""; // Resetting the body class
    if (guest.inside) {
      bodyDIV.classList.add("scanned-bg");
    } else {
      bodyDIV.classList.add("good-bg");
    }

    // get all users from the back-end and update the UI
    get_all_users();
  } catch (error) {
    // If there is an error connecting to the server, display an error message
    statusDIV.textContent = "Error connecting to server.";
    ticketNumberDIV.textContent = "Error";
    holderNameDIV.textContent = "Error";
    scannedDIV.textContent = "Error";
    bodyDIV.className = ""; // Resetting the body class
    bodyDIV.classList.add("bad-bg");
    console.error(error);
  }
}

async function get_all_users() {
  try {
    const response = await fetch(BACKEND_URL_COMPLETE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ INFO: "Asking for all users" }), // Only send the hash!
    });

    // Function to read the list of people and display them
    function peopleListReader(guests) {
      // Clear the existing list
      peopleListDIV.innerHTML = "";

      // index for the total number of guests:
      let i = 1;

      // Loop through each guest and create a div for their name and scanned status
      Object.entries(guests).forEach(([guest, status]) => {
        // Create a new div for each person
        const personNameDIV = document.createElement("div");
        personNameDIV.textContent = guest; // person's name

        const personStatusDIV = document.createElement("div");
        // person's scanned status
        if (status === "Yes") {
          personStatusDIV.textContent = "Redeemed";
        } else if (status === "No") {
          personStatusDIV.textContent = "Not Redeemed";
        }

        // Create a div for the person's index
        const personIndexDIV = document.createElement("div");
        personIndexDIV.textContent = `${i}.`; // person's index

        // create a div for the person's row in the list
        const personRowDIV = document.createElement("div");

        if (status === "Yes") {
          personRowDIV.classList.add("person-row-scanned");
        } else if (status === "No") {
          personRowDIV.classList.add("person-row");
        }

        // append the person's name and status to the row
        personRowDIV.appendChild(personIndexDIV);
        personRowDIV.appendChild(personNameDIV);
        personRowDIV.appendChild(personStatusDIV);

        // Append the person's name and scanned status
        peopleListDIV.appendChild(personRowDIV);

        i++; // Increment the index for each guest
      });

      // Update the status box with the total number of guests
      statusBoxTotalDIV.textContent = `Total Guests: ${
        Object.keys(guests).length
      }`;
      statusBoxScannedDIV.textContent = `Redeemed Guests: ${
        Object.values(guests).filter((status) => status === "Yes").length
      }`;
      statusBoxLeftDIV.textContent = `To Redeemed: ${
        Object.values(guests).filter((status) => status === "No").length
      }`;
    }

    // If the response is ok, update the status and check the ticket again and run the peopleListReader function
    if (response.ok) {
      const data = await response.json();
      const guests = data.guest_info;
      peopleListReader(guests);
      return;
    } else {
      // If the response is not ok, display a failure message
      statusDIV.textContent = "User Update failed!";
    }
  } catch (error) {
    statusDIV.textContent = "Error connecting to server.";
    console.error(error);
  }
}

// Redeem button event handler
redeemButtonDIV.addEventListener("click", () => {
  // If no ticket has been scanned, display a message
  if (!lastScannedTicket) {
    statusDIV.textContent = "Nothing to redeem";
    return;
  }
  // If a ticket has been scanned, redeem it
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

    // If the response is ok, update the status and check the ticket again
    if (response.ok) {
      statusDIV.textContent = "Redeemed!";
      checkTicket(ticketHash);
      return;
    } else {
      // If the response is not ok, display a failure message
      statusDIV.textContent = "Redeem failed!";
    }
  } catch (error) {
    statusDIV.textContent = "Error connecting to server.";
    console.error(error);
  }
}

// Refresh button event handler
refreshButtonDIV.addEventListener("click", () => {
  // Resetting the UI elements
  statusDIV.textContent = "Ready to scan...";
  ticketNumberDIV.textContent = "-";
  holderNameDIV.textContent = "-";
  scannedDIV.textContent = "-";
  resultDIV.textContent = "Waiting for Scan ID...";
  bodyDIV.className = ""; // Resetting the body class
  bodyDIV.classList.add("plain-bg");

  // resetting the last scanned ticket
  lastScannedTicket = "";

  // get all users from the back-end
  get_all_users();
});
