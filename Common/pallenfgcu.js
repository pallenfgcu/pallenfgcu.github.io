function nav_sidebar_open() {
    var x = document.getElementById("nav_sidebar");
    x.style.width = "25%";
    x.style.fontSize = "24px";
    x.style.paddingTop = "10%";
    x.style.display = "block";
}


function nav_sidebar_close() {
    document.getElementById("nav_sidebar").style.display = "none";
}