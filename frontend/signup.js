document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault(); // prevent form reload

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  
  if(!strongPassword.test(password)){
    document.getElementById("password-warning").textContent="Password too weak";
    return;
  }
  const confirmPassword = document.getElementById("confirm-password").value;

  if(password !== confirmPassword ){
     document.getElementById("password-warning").textContent="Password did not match. Please try again..";
    return;
  }
  if (!name || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }
  fetch("http://localhost:5501/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, password })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    alert("✅ Account created!");
  } else {
    alert("❌ Signup failed: " + data.message);
  }
})
.catch(err => {
  console.error("Error:", err);
  alert("⚠️ Server error");
});


  // Here you would normally send the data to the server
  console.log("Signed Up with:", { name, email });
  alert("Account created (mock)!");
});
