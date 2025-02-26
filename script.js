// This script is for fetching the user info who are logging in to the site.

// Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Firebase Configuration (Replace with your Firebase details)
const firebaseConfig = {
  databaseURL: "https://vibra-info-device-logger-default-rtdb.firebaseio.com/",
  authDomain: "vibra-info-device-logger.firebaseapp.com",
  projectId: "vibra-info-device-logger",
  storageBucket: "vibra-info-device-logger.firebasestorage.app",
  messagingSenderId: "1060342625087",
  appId: "1:1060342625087:web:dad47283c662612ac9998a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function getIPAddresses() {
  let ipv4 = "Unknown",
    ipv6 = "Unknown";
  try {
    const ipv4Response = await fetch("https://api64.ipify.org?format=json");
    ipv4 = (await ipv4Response.json()).ip;
  } catch (error) {
    console.error("Error fetching IPv4:", error);
  }

  try {
    const ipv6Response = await fetch("https://api64.ipify.org?format=json");
    ipv6 = (await ipv6Response.json()).ip;
  } catch (error) {
    console.error("Error fetching IPv6:", error);
  }

  return { ipv4, ipv6 };
}

async function getDeviceInfo() {
  const deviceInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    vendor: navigator.vendor,
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    onlineStatus: navigator.onLine ? "Online" : "Offline",
    touchSupport: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    maxTouchPoints: navigator.maxTouchPoints,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory || "Unknown",
    connectionType: "Unknown",
    downlink: "Unknown",
    effectiveType: "Unknown",
    rtt: "Unknown",
    ipv4Address: "Fetching...",
    ipv6Address: "Fetching...",
    location: "Fetching...",
    timestamp: new Date().toISOString(),
  };

  // Fetch IPv4 & IPv6
  const { ipv4, ipv6 } = await getIPAddresses();
  deviceInfo.ipv4Address = ipv4;
  deviceInfo.ipv6Address = ipv6;

  // Fetch Network Info
  if (navigator.connection) {
    deviceInfo.connectionType = navigator.connection.type || "Unknown";
    deviceInfo.downlink = navigator.connection.downlink || "Unknown";
    deviceInfo.effectiveType = navigator.connection.effectiveType || "Unknown";
    deviceInfo.rtt = navigator.connection.rtt || "Unknown";
  }

  // Fetch Geolocation (Requires Permission)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        deviceInfo.location = `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`;
        saveToFirebase(deviceInfo);
      },
      () => {
        deviceInfo.location = "Permission denied";
        saveToFirebase(deviceInfo);
      }
    );
  } else {
    deviceInfo.location = "Not supported";
    saveToFirebase(deviceInfo);
  }
}


// Function to save data to Firebase
function saveToFirebase(data) {
  // Retrieve the data from localStorage
  let userData = localStorage.getItem("currentUser");

  if (!userData) {
    console.warn("No user data found in localStorage.");
    return;
  }

  try {
    // Parse the JSON string into an object
    let userObject = JSON.parse(userData);

    if (!userObject.name || !userObject.email) {
      console.error("Invalid user data: Missing name or email");
      return;
    }

    // Generate user ID (Avoid spaces in Firebase keys)
    const userId = `${userObject.name.replace(/\s+/g, "_")}_${userObject.email.replace(/[@.]/g, "_")}`;

    // Initialize Firebase database
    const database = getDatabase();

    // Save data to Firebase
    set(ref(database, "deviceInfo/" + userId), data)    
      .then(() => console.log("Data successfully stored in Firebase"))
      .catch((error) => console.error("Error saving data:", error));

    // Display the saved data
    document.getElementById("info-output").innerText = JSON.stringify(data, null, 2);
    console.log("Device Information:", data);
  } catch (error) {
    console.error("Error parsing user data:", error);
  }
}


// Auto-run on page load
window.onload = getDeviceInfo;
