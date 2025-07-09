
//  Firebase Config
<<<<<<< HEAD
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
=======

>>>>>>> f48a3da (Solved firebase issue)

//  Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

//  Sign-Up Handler
document.getElementById("signup-form").addEventListener("submit", function (e) {
  e.preventDefault(); // prevent form reload

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const warning = document.getElementById("password-warning");

  //  Validate inputs
  if (!name || !email || !password || !confirmPassword) {
    warning.textContent = "Please fill in all fields.";
    return;
  }

  //  Password strength check
  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!strongPassword.test(password)) {
    warning.textContent = "Password too weak. Must be at least 8 characters with upper, lower, digit, and special char.";
    return;
  }

  //  Confirm password match
  if (password !== confirmPassword) {
    warning.textContent = "Passwords do not match. Please try again.";
    return;
  }

  
  warning.textContent = "";

  // Sign up with Firebase
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      alert(`Welcome ${name}! Get ready to dive into learning databases!`);
      console.log("Signed Up:", userCredential.user);
      window.location.href = "mainpage.html";
    })
    .catch((error) => {
      warning.textContent = error.message;
      console.error("Sign-up error:", error);
    });
});
