function showFrame(frame){
  if (!selected) return;
  selected.frame = frame;
}

$('.remove-single-selected').click(function(e){
  if (!selected) return;
  delete gui.assets[currentMenu][selected.config.id]
  selected.destroy();
  $('.tools').hide()
})

$('.remove-list-selected').click(function(e){
  if (!selected) return;
  var list = gui.assets[currentMenu][selected.listComponent];
  list.splice(list.findIndex(item => item.id === selected.config.id), 1)
  selected.destroy();
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
})

$('.text-color').on('change',function(e){
  if (!selected) return;
  var targetName = $(this).attr('target');
  var target = (targetName) ? selected[targetName] : selected;
  target.fill = $(this).val();
  selected.config.color = $(this).val();
  if (selected.nextChoices){
    for (var i = 0; i < selected.nextChoices.length-1; i++) {
      selected.nextChoices[i].text.fill = target.fill;
    }
  }
});

$('#choice-chosen-color').on('change',function(e){
  if (!selected) return;
  selected.config['chosen-color'] = $(this).val();
  if (selected.nextChoices.length>0){
    selected.nextChoices[selected.nextChoices.length-1].text.fill = $(this).val();
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
  changeTextPosition(selected,selected.text,selected.config)
  if (selected.nextChoices){
    console.log("Has next choices "+selected.nextChoices.length)
    console.log("Has next choices")
    for (var i = 0; i < selected.nextChoices.length; i++) {
      console.log("Next choice "+i)
      changeTextPosition(selected.nextChoices[i],selected.nextChoices[i].text,selected.config)
    }
  }
})

$('#choice-align').on('change',function () {
  if (!selected) return;
  selected.config.align = $(this).val();
  changeTextPosition(selected,selected.text,selected.config)
  if (selected.nextChoices){
    for (var i = 0; i < selected.nextChoices.length; i++) {
      changeTextPosition(selected.nextChoices[i],selected.nextChoices[i].text,selected.config)
    }
  }
})

$('#choice-offset-x').on('input',function () {
  if (!selected) return;
  selected.config['offset-x'] = $(this).val();
  changeTextPosition(selected,selected.text,selected.config)
  if (selected.nextChoices){
    for (var i = 0; i < selected.nextChoices.length; i++) {
      changeTextPosition(selected.nextChoices[i],selected.nextChoices[i].text,selected.config)
    }
  }
})

$('#choice-offset-y').on('input',function () {
  if (!selected) return;
  selected.config['offset-y'] = $(this).val();
  changeTextPosition(selected,selected.text,selected.config)
  if (selected.nextChoices){
    for (var i = 0; i < selected.nextChoices.length; i++) {
      changeTextPosition(selected.nextChoices[i],selected.nextChoices[i].text,selected.config)
    }
  }
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
  selected.message.text = $(this).val();
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
      selected.nextChoices[selected.nextChoices.length-1].text.fill = selected.config['color']
    }
    for (var i = 0; i < (samples-oldSamples); i++) {
      var nextChoice = createChoiceBox(0,0,oldSamples+i,selected.config);
      selected.addChild(nextChoice);
      selected.nextChoices.push(nextChoice);
    }
  }
  selected.config.sample = samples;
  if (selected.nextChoices.length>0){
    selected.nextChoices[selected.nextChoices.length-1].text.fill = selected.config['chosen-color']
  }
  arrangeChoices();
})

$('#choice-separation').on('input',function () {
  if (!selected) return;
  selected.config.separation = $(this).val();
  arrangeChoices();
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
    arrangeChoices();
    selected.input.enableDrag(false);
  }
  
})

function arrangeChoices() {
  var config = selected.config;
  if (config.isBoxCentered){
    selected.x = gui.resolution[0]/2 - config.width/2;
    selected.y = gui.resolution[1]/2 - (config.height*config.sample + parseInt(config.separation)*(config.sample-1))/2;
  } else {
    selected.x = selected.config.x;
    selected.y = selected.config.y;
  }
  for (var i = 0; i < selected.nextChoices.length; i++) {
    selected.nextChoices[i].y = (i+1)*(parseInt(config.height)+parseInt(config.separation));
  }
}


function showTools(tool){
  $('.tools').hide()
  $(`.${tool}-tools`).show()
  if (tool == 'button'){
    $(`#button-slot-value`).toggle((selected.config.binding == 'save' || selected.config.binding == 'load'))
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
  }
  if (tool == 'message-box'){
    $('#message-box-sample').val(selected.message.text)
  }
  // if (tool == 'name-box' ||)
  // $('#choice-color').trigger('change');
  $(`.${tool}-tools`).find('.colorpicker-component > input').trigger('change');
}

$('#button-binding').on('change',function(e){
  var val = $("#button-binding").val();
  $("#button-slot-value").toggle((val =="save" || val == "load"));
})

$('.show-more-when-off').on('change',function(e){
  if ($(this).hasClass('disabled')){
    $(this).prop('checked',!$(this).is(":checked"));
    return;
  } 
  var target = $(this).attr('target')
  $(`#${target}`).toggle(!($(this).is(':checked')))
});