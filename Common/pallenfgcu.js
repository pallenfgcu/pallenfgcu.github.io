// Side navigation
// w3_open
$(function() {
   $(document).on('click','#btnSidebar', function(e) {
       $("#navSidebar").style.width="25%";
       $("#navSidebar").style.fontSize = "40px";
       $("#navSidebar").style.paddingTop = "10%";
       $("#navSidebar").style.display = "block";
   });
});

// w3_close
$(function() {
    $(document).on('click','#navSidebarClose', function(e) {
        $("#navSidebar").style.display = "none";
    });
});