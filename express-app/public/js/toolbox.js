
$('.lock-selected').click(function(e){
  if (!selected) return;
  const icon = $(this).find('i');
  if (icon.hasClass('fa-lock-open')){
    // lock selected element
    $(this).html(`<i class="fas fa-lock"></i> Locked`);
    selected.lockedElement = true;
    console.log("Locking selected")
    console.log(selected)
    if (selected.draggableElement){
      console.log("making undraggable")
      selected.input.disableDrag();
    }
  } else {
    // unlock selected element
    selected.lockedElement = false;
    $(this).html(`<i class="fas fa-lock-open"></i> Unlocked`);
    if (selected.draggableElement){
      selected.input.enableDrag();
    }
  }
})

function elementCantBeRemovedError(){
  $("#error-modal").find(".modal-body").html(`<p>This component is locked and can't be removed. If you want to remove it, unlock it first.</p>`);
  $("#error-modal").modal('show');
}


$('.remove-single-selected').click(function(e){
  if (!selected || selected.lockedElement) return elementCantBeRemovedError();
  removeAsset(selected);
  //remove from selection list
  $(`.${selected.component}-item`).remove();
  delete gui.config[currentMenu][selected.component];
  var s = selected;
  selected = null;
  s.destroy();
  $('.tools').hide()
})


function removeAsset(component) {
  // console.log(component)
  var assetType = component.config.assetType;
  if (assetType!='none'){
    delete gui.assets[assetType][component.config.id]
  }
}

$('.remove-background-music-selected').click(function(e){
  stopAudioSample();
  gameLoader.loadBackgroundMusic('none');
  $('.tools').hide()
  $('.bg-music-item').remove();
});

$('.remove-choice-selected').click(function(e){
  if (!selected || selected.lockedElement) return elementCantBeRemovedError();
  $(`.${selected.component}-item`).remove();
  if (selected.interrupt){
    $(`.${selected.interrupt.component}-item`).remove();
    removeAsset(selected.interrupt)
    delete gui.config[currentMenu]['interrupt']
  }
  removeAsset(selected)
  delete gui.config[currentMenu]['choice']
  var s = selected;
  selected = null;
  s.destroy();
  $('.tools').hide()
});

$('.remove-interrupt-selected').click(function(e){
  if (!selected || selected.lockedElement) return elementCantBeRemovedError();
  $(`.${selected.component}-item`).remove();
  var choiceBox = gameLoader.spriteRefs[currentMenu+'choice'];
  if (choiceBox.interrupt){
    delete choiceBox.interrupt;
    choiceBox.removeChild(selected);
    arrangeChoices(choiceBox);  
  }
  removeAsset(selected)
  delete gui.config[currentMenu]['interrupt']
  var s = selected;
  selected = null;
  s.destroy();
  $('.tools').hide()
})

$('.remove-list-selected').click(function(e){
  if (!selected || selected.lockedElement) return elementCantBeRemovedError();
  removeAsset(selected)
  $(`#${selected.selectorIdx}`).remove();
  var list = gui.config[currentMenu][selected.listComponent];
  list.splice(list.findIndex(item => item.id === selected.config.id), 1)
  var s = selected;
  selected = null;
  s.destroy();
  $('.tools').hide()
})

$("#label-text").on('input',function (argument) {
  if (!selected) return;
  selected.text = $("#label-text").val();
  selected.config.text = $("#label-text").val();
})

$('.binding').on('change',function(e){
  if (!selected) return;
  selected.config.binding = $(this).val();
})

$('.slot').on('input',function(e){
  if (!selected) return;
  selected.config.slot = $(this).val();
})

$('.other-binding').on('input',function(e){
  if (!selected) return;
  selected.config['other-binding'] = $(this).val();
})

$('.asset-x').on('input',function(e){
  if (!selected) return;
  var x = parseInt($(this).val());
  selected.x = x;
  selected.config.x = x;
})

$('.asset-y').on('input',function(e){
  if (!selected) return;
  var y = parseInt($(this).val());
  selected.y = y;
  selected.config.y = y;
})

$(".text-size").on('input',function (argument) {
  if (!selected) return;
  var targetName = $(this).attr('target');
  var target = (targetName) ? selected[targetName] : selected;
  var size = parseInt($(this).val()) 
  target.fontSize = size + 'px';
  selected.config.size= size;
  if (selected.nextChoices){
    for (var i = 0; i < selected.nextChoices.length; i++) {
      selected.nextChoices[i].text.fontSize = target.fontSize;
    }
  }
  if (selected.interrupt && selected.interrupt.config.textStyleAsChoice) {
    selected.interrupt.text.fontSize = target.fontSize;
  }
})

$(".text-lineSpacing").on('input',function (argument) {
  if (!selected) return;
  var targetName = $(this).attr('target');
  var target = (targetName) ? selected[targetName] : selected;
  var lineSpacing = parseInt($(this).val()) 
  target.lineSpacing = lineSpacing;
  selected.config.lineSpacing = lineSpacing;
  if (selected.nextChoices){
    for (var i = 0; i < selected.nextChoices.length; i++) {
      selected.nextChoices[i].text.lineSpacing = target.lineSpacing;
    }
  }
  if (selected.interrupt && selected.interrupt.config.textStyleAsChoice) {
    selected.interrupt.text.lineSpacing = target.lineSpacing;
  }
})

$('.text-font').on('change',function(e){
  if (!selected) return;
  var targetName = $(this).attr('target');
  var target = (targetName) ? selected[targetName] : selected;
  target.font = $(this).val();
  selected.config.font = $(this).val();
  if (selected.nextChoices){
    for (var i = 0; i < selected.nextChoices.length; i++) {
      selected.nextChoices[i].text.font = target.font;
    }
  }
  if (selected.interrupt && selected.interrupt.config.textStyleAsChoice) {
    selected.interrupt.text.font = target.font;
  }
})

$('.text-color').on('change',function(e){
  if (!selected) return;
  var targetName = $(this).attr('target');
  var target = (targetName) ? selected[targetName] : selected;
  target.fill = $(this).val();
  if (targetName=="message"){
    setTextWithStyle(selected.sample,target)
  }
  
  selected.config.color = $(this).val();
  if (selected.nextChoices){
    for (var i = 0; i < selected.nextChoices.length; i++) {
      selected.nextChoices[i].text.fill = target.fill;
    }
  }
  if (selected.interrupt && selected.interrupt.config.textStyleAsChoice) {
    selected.interrupt.text.fill = target.fill;
  }
});

function colorToSigned24Bit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
}

$('#choice-chosen-color').on('change',function(e){
  if (!selected) return;
  selected.config['chosen-color'] = $(this).val();
  
  if (selected.nextChoices.length>0){
    selected.nextChoices[selected.nextChoices.length-1].tint = colorToSigned24Bit($(this).val());
  }
});

$('#choice-text-centered').on('change',function() {
  if (!selected) return;
  selected.config.isTextCentered = $(this).is(':checked');
  if(!selected.config.isTextCentered){
    $('#choice-offset-x').val(0)
    $('#choice-offset-y').val(0)
    selected.config['offset-x'] = 0;
    selected.config['offset-y'] = 0;
  }
  changeTextForAllBoxes();
})

function changeTextForAllBoxes() {
  changeTextPosition(selected,selected.text,selected.config)
  if (selected.nextChoices){
    for (var i = 0; i < selected.nextChoices.length; i++) {
      changeTextPosition(selected.nextChoices[i],selected.nextChoices[i].text,selected.config)
    }
  }
  if (selected.interrupt && selected.interrupt.config.textPositionAsChoice) {
    changeTextPosition(selected.interrupt,selected.interrupt.text,selected.config)
  }
}

$('#choice-align').on('change',function () {
  if (!selected) return;
  selected.config.align = $(this).val();
  changeTextForAllBoxes();
})

$('#choice-text-width').on('input',function () {
  if (!selected) return;
  selected.config['text-width'] = $(this).val();
  selected.text.wordWrapWidth = $(this).val();
})

$('#choice-offset-x').on('input',function () {
  if (!selected) return;
  selected.config['offset-x'] = $(this).val();
  changeTextForAllBoxes();
})

$('#choice-offset-y').on('input',function () {
  if (!selected) return;
  selected.config['offset-y'] = $(this).val();
  changeTextForAllBoxes();
})

$('#interrupt-text-centered').on('change',function() {
  if (!selected) return;
  selected.config.isTextCentered = $(this).is(':checked');
  if(!selected.config.isTextCentered){
    $('#interrupt-offset-x').val(0)
    $('#interrupt-offset-y').val(0)
    selected.config['offset-x'] = 0;
    selected.config['offset-y'] = 0;
  }
  changeTextPosition(selected,selected.text,selected.config)
})

$('#interrupt-align').on('change',function () {
  if (!selected) return;
  selected.config.align = $(this).val();
  changeTextPosition(selected,selected.text,selected.config)
})

$('#interrupt-offset-x').on('input',function () {
  if (!selected) return;
  selected.config['offset-x'] = $(this).val();
  changeTextPosition(selected,selected.text,selected.config)
})

$('#interrupt-offset-y').on('input',function () {
  if (!selected) return;
  selected.config['offset-y'] = $(this).val();
  changeTextPosition(selected,selected.text,selected.config)
})

$('#interrupt-text-style-same-as-choices').on('change',function() {
  if (!selected) return;
  selected.config.textStyleAsChoice = $(this).is(':checked');
  if (selected.config.textStyleAsChoice) {
      selected.config.size = gui.config.hud.choice.size
      selected.config.color = gui.config.hud.choice.color
      selected.config.font = gui.config.hud.choice.font
  }
  selected.text.fontSize = selected.config.size + 'px';
  selected.text.font = selected.config.font;
  selected.text.fill = selected.config.color;
})

$('#interrupt-text-position-same-as-choices').on('change',function() {
  if (!selected) return;
  selected.config.textPositionAsChoice = $(this).is(':checked');
  if (selected.config.textPositionAsChoice) {
      selected.config.align = gui.config.hud.choice.align
      selected.config['offset-x'] = gui.config.hud.choice['offset-x']
      selected.config['offset-y'] = gui.config.hud.choice['offset-y']
  }
  changeTextPosition(selected,selected.text,selected.config)
})

$('#interrupt-start-box-inline').on('change',function() {
  if (!selected) return;
  selected.config.inlineWithChoice = $(this).is(':checked');
  var choiceBox = gameLoader.spriteRefs[currentMenu+'choice'];
  if (!choiceBox){
    selected.config.inlineWithChoice = false;
    $(this).prop('checked',false);
    return;
  }
  if (selected.config.inlineWithChoice) {
    choiceBox.interrupt = selected;
    choiceBox.addChild(selected);
    arrangeChoices(choiceBox);
  } else {
    delete choiceBox.interrupt;
    choiceBox.removeChild(selected);
    arrangeChoices(choiceBox)
    selected.x = 0;
    selected.y = 0;
    selected.config.x = 0;
    selected.config.y = 0;
  }
  selected.input.enableDrag(!selected.config.inlineWithChoice);
})

$('#name-box-text-centered').on('change',function() {
  if (!selected) return;
  selected.config.isTextCentered = $(this).is(':checked');
  if(!selected.config.isTextCentered){
    $('#name-box-offset-x').val(0)
    $('#name-box-offset-y').val(0)
    selected.config['offset-x'] = 0;
    selected.config['offset-y'] = 0;
  }
  changeTextPosition(selected,selected.name,selected.config)
})

$('#name-box-align').on('change',function () {
  if (!selected) return;
  selected.config.align = $(this).val();
  changeTextPosition(selected,selected.name,selected.config)
})

$('#name-box-offset-x').on('input',function () {
  if (!selected) return;
  selected.config['offset-x'] = $(this).val();
  changeTextPosition(selected,selected.name,selected.config)
})

$('#name-box-offset-y').on('input',function () {
  if (!selected) return;
  selected.config['offset-y'] = $(this).val();
  changeTextPosition(selected,selected.name,selected.config)
})

$('#message-box-sample').on('input',function () {
  if (!selected) return;
  selected.sample = $(this).val();
  setTextWithStyle(selected.sample,selected.message)
})

$('#message-box-offset-x').on('input',function () {
  if (!selected) return;
  selected.config['offset-x'] = $(this).val();
  selected.message.x = $(this).val();
})

$('#message-box-offset-y').on('input',function () {
  if (!selected) return;
  selected.config['offset-y'] = $(this).val();
  selected.message.y = $(this).val();
})

$('#message-box-align').on('change',function () {
  if (!selected) return;
  selected.config.align = $(this).val();
  selected.message.align = $(this).val();
})

$('#message-box-text-width').on('input',function () {
  if (!selected) return;
  selected.config['text-width'] = $(this).val();
  selected.message.wordWrapWidth = $(this).val();
})

$('#choice-sample').on('input',function () {
  if (!selected) return;
  var samples = $(this).val();
  if (samples<1){
    samples = 1;
    $(this).val(samples);
  }
  var oldSamples = parseInt(selected.config.sample);
  if (samples < oldSamples){
    for (var i = selected.nextChoices.length - 1; i >= (samples-1); i--) {
      selected.nextChoices[i].destroy();
      selected.nextChoices.pop();
    }
  } else if (samples > oldSamples){
    if (selected.nextChoices.length>0){
      selected.nextChoices[selected.nextChoices.length-1].tint = 0xFFFFFF;
    }
    for (var i = 0; i < (samples-oldSamples); i++) {
      var nextChoice = createChoiceBox("choice",0,0,oldSamples+i,selected.config);
      selected.addChild(nextChoice);
      selected.nextChoices.push(nextChoice);
    }
  }
  selected.config.sample = samples;
  if (selected.nextChoices.length>0){
    selected.nextChoices[selected.nextChoices.length-1].tint = colorToSigned24Bit(selected.config['chosen-color'])
  }
  arrangeChoices(selected);
})

$('#choice-separation').on('input',function () {
  if (!selected) return;
  selected.config.separation = $(this).val();
  arrangeChoices(selected);
})

$('#choice-box-centered').on('change',function() {
  if (!selected) return;
  selected.config.isBoxCentered = $(this).is(':checked');
  if(!selected.config.isBoxCentered){
    selected.config.x = selected.x;
    selected.config.y = selected.y;
    $('#choice-box-x').val(selected.x)
    $('#choice-box-y').val(selected.y)
    selected.input.enableDrag(true);
    
  } else {
    arrangeChoices(selected);
    selected.input.enableDrag(false);
  }
  
})

function arrangeChoices(box) {
  var config = box.config;
  if (config.isBoxCentered){
    var s = config.sample;
    if (box.interrupt) {
      s++;
    }
    box.x = gui.resolution[0]/2 - config.width/2;
    box.y = gui.resolution[1]/2 - (config.height*s + parseInt(config.separation)*(s-1))/2;
  } else {
    box.x = box.config.x;
    box.y = box.config.y;
  }
  for (var i = 0; i < box.nextChoices.length; i++) {
    box.nextChoices[i].y = (i+1)*(parseInt(config.height)+parseInt(config.separation));
  }
  if (box.interrupt) {
    box.interrupt.y = (box.nextChoices.length+1)*(parseInt(config.height)+parseInt(config.separation))
  }
}

$('#background-music').on('change',function(e){
  gameLoader.loadBackgroundMusic($(this).val(),true);
})

$('.play-bg-music').click(function(e){
  const name = $(this).parent().find('.audio-music-select').val()
  playAudioSample(name,$(this));
})

function playMessageBox() {
  if (!selected) return;
  if (selected.playback){
    resetMessageBox();
  }
  selected.playing = true;
  var textSample = selected.message.text;
  selected.message.text = ""
  var position = 0;
  selected.sfx =  (selected.config.sfx != 'none') ? game.add.audio(selected.config.sfx) : null;
  selected.playback = setInterval(function(){
    if (position >= textSample.length){
      resetMessageBox();
      return;
    }
    selected.message.text += textSample[position];
    if (textSample[position] != " " && selected.sfx){
      selected.sfx.play();
    }
    position++;
  }, 150);
}

function stopMessageBox() {
  if (!selected) return;
  if (selected.playback){
    resetMessageBox();
  }
}

function resetMessageBox() {
  clearInterval(selected.playback);
  if (selected.sfx){
    selected.sfx.destroy();
  }
  delete selected.playback;
  setTextWithStyle(selected.sample,selected.message)
}

function showTools(tool){
  $('.tools').hide()
  $(`.${tool}-tools`).show()
  if (tool == 'button'){
    $(`#button-slot-value`).toggle((selected.config.binding == 'save' || selected.config.binding == 'load'))
    $('.slot').val(selected.config.slot);
    $(`#button-other-value`).toggle((selected.config.binding == 'other'))
    $('.other-binding').val(selected.config['other-binding']);
  }
  if (tool == 'name-box'){
    $('#name-box-text-centered').prop('checked',selected.config.isTextCentered);
    $(`#name-box-text-not-centered-options`).toggle(!selected.config.isTextCentered)
  }
  if (tool == 'choice') {
    $('#choice-box-centered').prop('checked',selected.config.isBoxCentered);
    $(`#choice-box-not-centered-options`).toggle(!selected.config.isBoxCentered);
    $('#choice-text-centered').prop('checked',selected.config.isTextCentered);
    $(`#choice-text-not-centered-options`).toggle(!selected.config.isTextCentered);
  }
  if (tool == 'interrupt') {
    $('#interrupt-text-position-same-as-choices').prop('checked',selected.config.textPositionAsChoice);
    $(`#interrupt-text-position-not-same-as-choices-options`).toggle(!selected.config.textPositionAsChoice);
    $('#interrupt-text-style-same-as-choices').prop('checked',selected.config.textStyleAsChoice);
    $(`#interrupt-text-style-not-same-as-choices-options`).toggle(!selected.config.textStyleAsChoice);
    $('#interrupt-box-centered').prop('checked',selected.config.isBoxCentered);
    $(`#interrupt-box-not-centered-options`).toggle(!selected.config.isBoxCentered);
    $('#interrupt-text-centered').prop('checked',selected.config.isTextCentered);
    $(`#interrupt-text-not-centered-options`).toggle(!selected.config.isTextCentered);
    $('#interrupt-state').toggle(selected.animations.frameTotal >= 4);
  }
  if (tool == 'message-box'){
    $('#message-box-sample').val(selected.sample)
  }
  if (selected && !selected.lockedElement){
    $('.lock-selected').html(`<i class="fas fa-lock-open"></i> Unlocked`);
  } else {
    $('.lock-selected').html(`<i class="fas fa-lock"></i> Locked`);
  }
  // if (tool == 'name-box' ||)
  // $('#choice-color').trigger('change');
  $(`.${tool}-tools`).find('.colorpicker-component > input').trigger('change');
}

$('#button-binding').on('change',function(e){
  var val = $("#button-binding").val();
  $("#button-slot-value").toggle((val =="save" || val == "load"));
  $("#button-other-value").toggle((val =="other"));
})

$('.audio-sfx-select').on('change',function(e){
  selected.config.sfx = $(this).val();
})

$('.show-more-when-off').on('change',function(e){
  if ($(this).hasClass('disabled')){
    $(this).prop('checked',!$(this).is(":checked"));
    return;
  } 
  var target = $(this).attr('target')
  $(`#${target}`).toggle(!($(this).is(':checked')))
});

$('.thumbnail-prop').on('input',function () {
  if (!selected) return;
  console.log('changing save slot thumbnail')
  var prop = $(this).attr('target');
  selected.config['thumbnail-'+prop] = parseInt($(this).val());
  if (prop == 'width' || prop == 'height'){
    selected.thumbnail.clear();
    selected.thumbnail.beginFill(selected.thumbnail.color);
    selected.thumbnail.drawRect(0, 0, selected.config['thumbnail-width'], selected.config['thumbnail-height'])
    selected.thumbnail.endFill();
  } else {
    selected.thumbnail[prop] = selected.config['thumbnail-'+prop];
  }
  // console.log($(this).val())
  
})

function showFrame(frame){
  if (!selected) return;
  selected.frame = frame;
}

function showThumbnail(show) {
  if (!selected) return;
  selected.thumbnail.visible = show;
}

function changeButtonFrames(frame){
  if (!selected) return;
  frame *= (selected.animations.frameTotal/2)
  if (selected.animations.frameTotal == 4){
    selected.setFrames(frame+1,frame,frame+1,frame)
  } else {
    selected.setFrames(frame+1,frame,frame+2,frame)
  }
}