
function updateTime(){
const dateElement = document.getElementById("dateAndTime");
const now = new Date();
const formatted = now.toLocaleString();
dateElement.textContent = formatted;
}

updateTime();
setInterval(updateTime, 1000);

//todolist script (by chatgpt)
