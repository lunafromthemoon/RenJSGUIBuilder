$('.btn-generate').click(function(){
  $('#generating-modal').show();
  var guiName = $(this).attr('target');
  console.log("Generating "+guiName)
  // $('#btn-save-gui').html('Saving...');
  $.ajax({
        url: `/generate_gui/${guiName}` ,
        type: 'GET',
        success: function (dataR) {
          console.log("Generated")
          $('#generating-modal').hide();
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        }
    });
});

console.log("added thing")