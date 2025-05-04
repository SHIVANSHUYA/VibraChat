// ✅ Firebase Configuration (Replace with your actual Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyDy8IYzLC9Wm60CPaSAgQUj7lIsQsy3lBY",
    authDomain: "rmcs-2d752.firebaseapp.com",
    databaseURL: "https://rmcs-2d752-default-rtdb.firebaseio.com",
    projectId: "rmcs-2d752",
    storageBucket: "rmcs-2d752.appspot.com",
    messagingSenderId: "188615853008",
    appId: "1:188615853008:web:f59c668e5d834ae1a8efd5",
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ✅ Ensure script runs after DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    console.log("Page Loaded. Fetching Chats...");
    fetchChats();
});

// ✅ Function to convert image to Base64 and upload to Firebase
window.uploadImage = function () {
    console.log("Upload function called!");
    const fileInput = document.getElementById("imageUpload");

    if (!fileInput || fileInput.files.length === 0) {
        alert("Please select an image.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const base64String = event.target.result;
        console.log("Base64:", base64String);

        // Upload to Firebase with timestamp
        const chatRef = database.ref("chats").push();
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        chatRef.set({
            user: currentUser.name, // Replace with dynamic user data
            image: base64String,
            timestamp: Date.now()
        }).then(() => {
            console.log("Image uploaded successfully.");
            fileInput.value = ""; // Clear file input after upload
        }).catch((error) => {
            console.error("Error uploading image: ", error);
        });
    };

    reader.readAsDataURL(file);
};



// ✅ Function to fetch and display messages (text & images)
