document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault(); // prevent form reload

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  // Here you would normally send the data to the server
  console.log("Logging in with:", { name, email});
  alert("Login successful (mock)!");
  window.location.href = "mainpage.html";
});
