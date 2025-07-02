

const firebaseConfig = {
<<<<<<< HEAD
  apiKey: "AIzaSyBCCPdCayYXPzozji9uopVfEv-2cCvuejE",
  authDomain: "gui-based-rdbms.firebaseapp.com",
  projectId: "gui-based-rdbms",
  storageBucket: "gui-based-rdbms.firebasestorage.app",
  messagingSenderId: "1077077176403",
  appId: "1:1077077176403:web:406b53d703079279e856a6",
  measurementId: "G-8ECYVQDDPV"
=======
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
>>>>>>> 67a5b10 (Add firebase authentication and add firebase credentials in env file.)
};

const errorMessages = {
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/email-already-in-use": "This email is already registered.",
  // "auth/internal-error" : "User not found. Please sign up first.",
  "auth/invalid-email": "Invalid email format. Please check your email."
  
};

//Initialize firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault(); // prevent form reload

  
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }
  
    

    auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const name = document.getElementById("name").value.trim();
      alert(`Welcome back ${name} !`);
      console.log("User:", userCredential.user);
      // Redirect only after successful login
      window.location.href = "mainpage.html";
    })
    .catch((error) => {
  let key = "unknown-error";

  try {
    const parsed = JSON.parse(error.message);
    key = parsed.error?.message || "unknown-error";
  } catch (e) {
    console.error("Failed to parse error.message:", e);
  }

  document.getElementById("login-warning").textContent = key;
});



});
