$('#btn-generate-gui').on('click',function(e){
  $('#generating-modal').show();
  
  $('#btn-save-gui').html('Saving...');
  $.ajax({
        url: `/generate_gui/${gui.name}` ,
        type: 'GET',
        success: function (dataR) {
          $('#generating-modal').show();
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        }
    });
});