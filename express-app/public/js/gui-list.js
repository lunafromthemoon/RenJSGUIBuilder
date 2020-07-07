
var guiList = JSON.parse(window.localStorage.getItem('RenJSGuiList'));
console.log(guiList)

if (!guiList) {
	guiList = ['Quickstart2'];
	window.localStorage.setItem('RenJSGuiList',JSON.stringify(guiList))
}

for (var i = guiList.length - 1; i >= 0; i--) {
	var gui = JSON.parse(window.localStorage.getItem(guiList[i]));
	var card = $('.gui-template').clone();
	card.find('.card-title').html(guiList[i]);
	card.find('.btn-download').attr('href','/download/'+guiList[i]);
	card.find('.btn-edit').attr('href','/edit?name='+guiList[i]);
	card.find('.resolution').html(`resolution: ${gui.resolution[0]}x${gui.resolution[1]}`)
	if (gui.assets.main.background){
		card.find('.card-img-top').attr('src',`/assets/${guiList[i]}/mainbackground.png`)
	}
	$('.card-columns').append(card);
	card.removeClass('gui-template');
	card.removeClass('d-none');
}

$('.btn-new-gui').click(function () {
	var name = $('#gui-name').val();
	if (name.length < 1 || name.includes(' ')){
		alert("Name problem")
	}
	var w = $('#gui-width').val();
	var h = $('#gui-height').val();
	window.location.href = `/edit?name=${name}&w=${w}&h=${h}`;
})