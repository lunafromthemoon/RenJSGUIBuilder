
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip()
     
	$('.btn-new-gui').click(function () {
		var name = $('#gui-name').val();
		if (name.length < 1 || name.includes(' ')){
			alert("Name problem")
		}
		var w = $('#gui-width').val();
		var h = $('#gui-height').val();
		window.location.href = `/edit?name=${name}&w=${w}&h=${h}`;
	})
});

// var guiList = JSON.parse(window.localStorage.getItem('RenJSGuiList'));
// console.log(guiList)

if (!guiList) {
	guiList = [];
	// window.localStorage.setItem('RenJSGuiList',JSON.stringify(guiList))
}

for (var i = guiList.length - 1; i >= 0; i--) {
	console.log(guiList[i])
	var card = $('.gui-template').clone();
	card.find('.card-title').html(guiList[i].name);
	card.find('.btn-download').attr('href','/download/'+guiList[i].name);
	card.find('.btn-edit').attr('href','/edit?name='+guiList[i].name);
	card.find('.resolution').html(`resolution: ${guiList[i].resolution[0]}x${guiList[i].resolution[1]}`)
	if (guiList[i].preview){
		card.find('.card-img-top').attr('src',guiList[i].preview)
	}
	$('.card-columns').append(card);
	card.removeClass('gui-template');
	card.removeClass('d-none');
}
