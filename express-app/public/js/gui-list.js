
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip()

    if (!guiList) {
		guiList = [];
	}

	for (var i = guiList.length - 1; i >= 0; i--) {
		var card = $('.gui-template').clone();
		card.find('.card-title').html(guiList[i].name);
		card.find('.btn-generate').attr('href','/generate_gui/'+guiList[i].name);
		card.find('.btn-edit').attr('href','/edit?name='+guiList[i].name);
		card.find('.btn-clone').attr('target',guiList[i].name);
		card.find('.btn-remove').attr('target',guiList[i].name);
		card.find('.resolution').html(`resolution: ${guiList[i].resolution[0]}x${guiList[i].resolution[1]}`)
		if (guiList[i].preview){
			card.find('.card-img-top').attr('src',guiList[i].preview)
		}
		$('.card-columns').append(card);
		card.removeClass('gui-template');
		card.removeClass('d-none');
	}

	$('.btn-clone').click(function () {
		var target = $(this).attr('target');
		$('.btn-clone-gui').attr('target',target);
		$('#clone-gui-modal').modal('show');
	})
	     
	$('.btn-new-gui').click(function () {
		var name = $('#gui-name').val();
		if (name.length < 1 || name.includes(' ')){
			$('#new-gui-error > p').html("The name can't be empty or contain whitespaces.")
			$('#new-gui-error').show();
			return;
		}
		if (guiList.find(x => x.name === name)){
			$('#new-gui-error > p').html("The name is already used for another GUI.")
			$('#new-gui-error').show();
			return;
		}
		var w = parseInt($('#gui-width').val());
		var h = parseInt($('#gui-height').val());
		if (isNaN(w) || isNaN(h) || w<=0 || h <=0){
			$('#new-gui-error > p').html("The width and height of the GUI have to be positive numbers.")
			$('#new-gui-error').show();
			return;
		}

		$('#new-gui-error').hide();
		$('#new-gui-modal').hide();
		
		window.location.href = `/edit?name=${name}&w=${w}&h=${h}`;
	})

	$('.btn-clone-gui').click(function () {
		var name = $('#gui-cloned-name').val();
		var target = $(this).attr('target')
		if (name.length < 1 || name.includes(' ')){
			$('#cloned-gui-error > p').html("The name can't be empty or contain whitespaces.")
			$('#cloned-gui-error').show();
			return;
		}
		if (guiList.find(x => x.name === name)){
			$('#cloned-gui-error > p').html("The name is already used for another GUI.")
			$('#cloned-gui-error').show();
			return;
		}
		$('#cloned-gui-error').hide();
		// $('#clone-gui-modal').modal('hide');
		$.ajax({
	        url: `/clone_gui/${target}/${name}` ,
	        type: 'GET',
	        success: function (dataR) {
	        	console.log(dataR)
	          window.location.href = `/edit?name=${name}`;
	        },
	        error: function (xhr, status, error) {
	            console.log('Error: ' + error.message);
	        }
	    });
	})
	$('.btn-remove').click(function () {
		var card = $(this).closest('.card');
		var name = $(this).attr('target');
		$.ajax({
	        url: `/remove_gui/${name}` ,
	        type: 'GET',
	        success: function (dataR) {
	        	console.log(dataR)
	          card.remove();
	        },
	        error: function (xhr, status, error) {
	            console.log('Error: ' + error.message);
	        }
	    });
		
		// window.location.href = `/edit?name=${name}&w=${w}&h=${h}`;
	})
});


