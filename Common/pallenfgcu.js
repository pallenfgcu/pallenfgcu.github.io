// Side navigation
function w3_open() {
    var x = document.getElementById("navSidebar");
    x.style.width = "100%";
    x.style.fontSize = "40px";
    x.style.paddingTop = "10%";
    x.style.display = "block";
}

function w3_close() {
    document.getElementById("navSidebar").style.display = "none";
}