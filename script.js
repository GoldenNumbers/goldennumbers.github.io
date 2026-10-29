const helloButton = document.getElementById("helloButton");
const buttonMessage = document.getElementById("buttonMessage");
const year = document.getElementById("year");

if (helloButton && buttonMessage) {
  helloButton.addEventListener("click", () => {
    buttonMessage.textContent = "It works! Your JavaScript is running.";
  });
}

if (year) {
  year.textContent = new Date().getFullYear();
}
