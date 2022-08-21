// Side navigation
// w3_open
$(function() {
   $(document).on('click','#btnSidebar', function(e) {
       let navBar = $("#navSidebar");
       navBar.style.width="25%";
       navBar.style.fontSize = "40px";
       navBar.style.paddingTop = "10%";
       navBar.style.display = "block";
   });
});

// w3_close
$(function() {
    $(document).on('click','#navSidebarClose', function(e) {
        $("#navSidebar").style.display = "none";
    });
});