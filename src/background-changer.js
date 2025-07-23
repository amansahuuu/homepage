// Load saved background on page load
window.onload = () => {
  const savedBg = localStorage.getItem("customBg");
  if (savedBg) document.body.style.backgroundImage = `url('${savedBg}')`;
};

// Background changer with localStorage
function changeBg(file) {
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const bgUrl = e.target.result;
      document.body.style.backgroundImage = `url('${bgUrl}')`;
      localStorage.setItem("customBg", bgUrl);
    };
    reader.readAsDataURL(file);
  }
}

// Event listener
document.getElementById("bgUpload").onchange = (e) =>
  changeBg(e.target.files[0]);
