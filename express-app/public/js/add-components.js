$('.custom-file-input').on('change',function(e){
    if (e.target.files && e.target.files[0]) {
      var fileName = e.target.files[0].name;
      lastUpload = e.target.files[0];
      $(this).next('.custom-file-label').html(fileName);
      if ($(this).attr('id')=='font-input'){
        var fontName = fileName.split(".")[0];
        $('#font-name').val(fontName)
      } else {
        var widthComponent = $(this).closest('.modal-body').find('.asset-width');
        var heightComponent = $(this).closest('.modal-body').find('.asset-height');
        var reader = new FileReader();
        reader.onload = function (file) {
          var image = new Image();
          image.src = file.target.result;
          image.onload = function() {
            if (widthComponent){
              widthComponent.val(this.width)
              heightComponent.val(this.height)
            }
            $('.img-preview').attr('src', this.src);
          };
          
        }
        reader.readAsDataURL(lastUpload);
      }
    }
})

function loadFont(name,fileName) {
  $("<style>")
    .prop("type", "text/css")
    .html(`\
      @font-face {\
          font-family: '${name}';\
          src: url('/assets/${gui.name}/${fileName}');\
          src: url('/assets/${gui.name}/${fileName}').format('truetype');\
      }`)
    .appendTo("head");
  var temp = $(".font-template").clone();

  temp.removeClass('font-template');
  temp.find('h4').css('font-family',name);
  temp.find('.card-header').html(name);
  $("#fonts-container").append(temp)
  temp.find('.font-text').on('input',function(e){
    var val = $(this).val();
    $(this).siblings('h4').html(val);
  })
  temp.show();
  $(".font-select").append(`<option>${name}</option>`);
}

var listComponents = {
  slider: ['x','y','width','height','binding'],
  image: ['x','y'],
  animation: ['x','y','width','height'],
  button: ['x','y','width','height','binding','slot'],
  saveslot: ['x','y','slot']
}

$('.upload-list-component').click(function(e){
  var component = $(this).attr('component');
  addComponent('gen',component,listComponents[component])
})

$('.upload-bg-component').click(function(e){
  addComponent(currentMenu+'background','background',[])
})

$('.upload-loading-bar-component').click(function(e){
  addComponent('loading-bar','loading-bar',['x','y','width','height'])
})

$('.upload-choice-component').click(function(e){
  var choiceType = $('#choice-start-type input:checked').val();
  var isBoxCentered = $('#choice-start-box-centered').is(':checked');
  var isCentered = $('#choice-start-centered').is(':checked');
  addComponent(choiceType,choiceType,['x','y','width','height','separation','size','font','color','chosen-color','align','offset-x','offset-y'],{isCentered:isCentered,isBoxCentered:isBoxCentered,choiceType:choiceType})
})

$('.upload-ctc-component').click(function(e){
  var ctcStyle = $('#ctc-start-style input:checked').val();
  addComponent('ctc','ctc',['x','y','width','height'],{animationStyle:ctcStyle})
})

$('.upload-name-box-component').click(function(e){
  var isCentered = $('#name-box-start-centered').is(':checked');
  addComponent('name-box','name-box',['x','y','size','font','color','align','offset-x','offset-y'],{isCentered:isCentered})
})

$('.upload-message-box-component').click(function(e){
  addComponent('message-box','message-box',['x','y','size','font','color','align','offset-x','offset-y','text-width'])
})

$('.upload-font').click(function(e){
  var name = $("#font-name").val();
  uploadAsset(lastUpload,name,function(fileName){
    loadFont(name,fileName)
    gameLoader.addFont(name,fileName)
  });
})

$('#button-start-binding').on('change',function(e){
  var val = $("#button-start-binding").val();
  $("#button-start-slot-value").toggle((val =="save" || val == "load"));
})

$('.upload-label-component').click(function(e){
  var text = $("#label-start-text").val();
  var size = $("#label-start-size").val();
  var x = $("#label-start-x").val();
  var y = $("#label-start-y").val();
  var font = $("#label-start-font").val();
  var color = $("#label-start-color").val();
  gameLoader.addLabel(x,y,size,text,font,color)
})

$('.modal').on('shown.bs.modal', function (e) {
  $('.tools').hide()
  selected = null;
  var thumbnail = $(this).find('.img-preview').attr('thumbnail');
  $(this).find('.img-preview').attr('src', thumbnail);
  $(this).find('.custom-file-label').html("Choose file");
});

$('#ctc-start-style input:radio').on('click',function(e){
  $("#ctc-spritesheet-options").toggle($(this).attr('opt') == 'spritesheet')
});

function uploadAsset(file, asset, callback){
  var data = new FormData();
  data.append('file', file);
  $.ajax({
        url: `/upload_asset/${gui.name}/${currentMenu}${asset}` ,
        data: data,
        dataType: 'json',
        type: 'POST',
        processData: false,
        contentType: false,
        success: function (dataR) {
            callback(dataR.fileName)
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        }
    });
}



function addComponent(id,name,propNames,extra) {
  var props = { id: id }
  if (id == 'gen'){
    props.id = genAssetId('img');
  }
  for (var i = propNames.length - 1; i >= 0; i--) {
    var val = $(`#${name}-start-${propNames[i]}`).val();
    props[propNames[i]] = val;
  }
  if (name=='animation'){
    props.isAnimation = true;
  }
  if(extra){
    for(key in extra){
      props[key] = extra[key];
    }
  }
  uploadAsset(lastUpload,props.id,function(fileName){
    props.fileName = fileName;
    gameLoader.addComponent(name,props)
  });
}