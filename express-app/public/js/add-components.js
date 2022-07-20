

var listComponents = {
  slider: ['x','y','width','height','binding'],
  image: ['x','y'],
  animation: ['x','y','width','height'],
  button: ['x','y','width','height','binding','slot','sfx'],
  'save-slot': ['x','y','thumbnail-x','thumbnail-y','thumbnail-width','thumbnail-height','slot'],
}

$('.upload-list-component').click(function(e){
  var component = $(this).attr('component');
  console.log(component)
  addComponent(component,listComponents[component])
})

$('.upload-bg-component').click(function(e){
  addComponent('background',[])
})

$('.upload-background-music-component').click(function(e){
  gameLoader.loadBackgroundMusic($('#background-music-start-select').val(),true);
})

$('.upload-loading-bar-component').click(function(e){
  addComponent('loading-bar',['x','y','width','height'])
})

$('.upload-choice-component').click(function(e){
  var isBoxCentered = $('#choice-start-box-centered').is(':checked');
  var isTextCentered = $('#choice-start-text-centered').is(':checked');
  addComponent("choice",['x','y','sfx','width','height','separation','alignment','size','lineSpacing','font','color','chosen-color','align','offset-x','offset-y'],{isTextCentered:isTextCentered,isBoxCentered:isBoxCentered})
})

$('.upload-interrupt-component').click(function(e){
  var inlineWithChoice = $('#interrupt-start-box-inline').is(':checked');
  var textStyleAsChoice = $('#interrupt-start-text-style-same-as-choices').is(':checked');
  var textPositionAsChoice = $('#interrupt-start-text-position-same-as-choices').is(':checked');
  var isBoxCentered = $('#interrupt-start-box-centered').is(':checked');
  var isTextCentered = $('#interrupt-start-text-centered').is(':checked');
  addComponent("interrupt",['x','y','sfx','width','height','separation','alignment','size','lineSpacing','font','color','align','offset-x','offset-y'],{isTextCentered:isTextCentered,isBoxCentered:isBoxCentered,textStyleAsChoice:textStyleAsChoice,textPositionAsChoice:textPositionAsChoice,inlineWithChoice:inlineWithChoice})
})

$('.upload-ctc-component').click(function(e){
  var ctcStyle = $('#ctc-start-style input:checked').attr('opt');
  addComponent('ctc',['x','y','width','height'],{animationStyle:ctcStyle})
})

$('#name-box-start-tint-style-is-box').on('change',function(e){
  var val = $("#button-start-binding").val();
  $('#name-box-start-color').closest('.form-group').toggle($('#name-box-start-tint-style-is-box').is(':checked'));
})

$('.upload-name-box-component').click(function(e){
  var isTextCentered = $('#name-box-start-text-centered').is(':checked');
  var tintStyle = $('#name-box-start-tint-style-is-box').is(':checked') ? 'box' : 'text';
  addComponent('name-box',['x','y','size','lineSpacing','font','color','align','offset-x','offset-y'],{isTextCentered,tintStyle})
})

$('.upload-message-box-component').click(function(e){
  addComponent('message-box',['x','y','sfx','size','lineSpacing','font','color','align','offset-x','offset-y','text-width'])
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
  var lineSpacing = $("#label-start-lineSpacing").val();
  // console.log(font)
  var color = $("#label-start-color").val();
  gameLoader.addLabel(x,y,size,text,font,color,lineSpacing)
})

$('.modal').on('shown.bs.modal', function (e) {
  $('.tools').hide()
  $('.audio-preview').hide();
  selected = null;
  var thumbnail = $(this).find('.img-preview').attr('thumbnail');
  $(this).find('.img-preview').attr('src', thumbnail);
  $('.custom-file-input').val('')
  $(this).find('.custom-file-label').html("Choose file");
  $(this).find('.reset-input').val('');

  if ($(this).find('.thumbnail-prop').length && gui.config.saveload['save-slots'].length){
    $(this).find('#save-slot-start-thumbnail-x').val(gui.config.saveload['save-slots'][0]['thumbnail-x'])
    $(this).find('#save-slot-start-thumbnail-y').val(gui.config.saveload['save-slots'][0]['thumbnail-y'])
    $(this).find('#save-slot-start-thumbnail-width').val(gui.config.saveload['save-slots'][0]['thumbnail-width'])
    $(this).find('#save-slot-start-thumbnail-height').val(gui.config.saveload['save-slots'][0]['thumbnail-height'])
  }
  if ($(this).find('.text-font').length){
    if ($.isEmptyObject(gui.assets.fonts)){
      $(this).modal('hide')
      $("#error-modal").find(".modal-body").html(`<p>This component has text associated with it, and therefore it requires a font, but there are no fonts loaded yet. You can load a font on the fonts section.</p>`);
      $("#error-modal").modal('show');
    }
  }
  if ($(this).find('.text-font').length){
    if ($.isEmptyObject(gui.assets.fonts)){
      $(this).modal('hide')
      $("#error-modal").find(".modal-body").html(`<p>This component has text associated with it, and therefore it requires a font, but there are no fonts loaded yet. You can load a font on the fonts section.</p>`);
      $("#error-modal").modal('show');
    }
  }
});

$('#interrupt-modal').on('shown.bs.modal', function (e) {
  var choicesNotSet = (!gui.config.hud.choice)
  setOptions("interrupt-start","text-position-same-as-choices","text-position-not-same-as-choices-options",!choicesNotSet)
  setOptions("interrupt-start","text-style-same-as-choices","text-style-not-same-as-choices-options",!choicesNotSet)
  setOptions("interrupt-start","box-inline","box-not-inline-options",!choicesNotSet)
});

function setOptions(id,prop,options,set){
  $(`#${id}-${prop}`).prop('checked',set);
  $(`#${id}-${prop}`).toggleClass('disabled',!set);
  $(`#${id}-${options}`).toggle(!set);
}

$('#ctc-start-style input:radio').on('click',function(e){
  $("#ctc-spritesheet-options").toggle($(this).attr('opt') == 'spritesheet')
});





function addComponent(name,propNames,extra) {
  var props = { id: genAssetId(name) }
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
  // uploadAsset(lastUpload,props.id,function(fileName){
  //   gameLoader.addComponent(name,props,fileName)
  // });
}