$('.custom-file-input').on('change',function(e){
    if (e.target.files && e.target.files[0]) {
      var fileName = e.target.files[0].name;
      lastUpload = e.target.files[0];
      $(this).next('.custom-file-label').html(fileName);
      if ($(this).attr('id')=='font-input'){
        var fontName = fileName.split(".")[0];
        $('#font-name').val(fontName);
        return
      } 
      var modal = $(this).closest('.modal-body');
      var reader = new FileReader();

      reader.onload = function (file) {
        console.log("file read")
        if (modal.find('.img-preview').length){
          var image = new Image();
          image.src = file.target.result;
          modal.find('.img-preview').attr('src', image.src);
          image.onload = function() {
            if (modal.find('.asset-width').length){
              modal.find('.asset-width').val(this.width)
              modal.find('.asset-height').val(this.height)
            }
          };
        } 
        if (modal.find('.audio-preview').length){
          modal.find('.audio-preview').attr('src',file.target.result);
          modal.find('.audio-preview').show();
          $("#audio-name").val(fileName.split(".")[0])
        }
      }
      console.log("reading ")
      console.log(lastUpload)
      reader.readAsDataURL(lastUpload);
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
          font-weight: normal;\
          font-style: normal;\
      }`)
    .appendTo("head");
  let sampletText = $('.font-text').val();
  let row = $(`<tr class="font-${name}">
                <th class="align-middle" scope="row">${name}</th>
                <td class="align-middle text-sample" >${sampletText}</td>
                <td class="action-col"><button class="btn btn-icon btn-outline-light remove-font"><i class="fas fa-trash-alt"></i></button></td>
              </tr>`);
  
  row.find('.text-sample').css('font-family',name);
  row.find('.remove-font').click(function (argument) {
    var usedIn = findFont(name);
    if (usedIn) {
      var p = usedIn == 'label' ? "a" : "the";
      $("#error-modal").find(".modal-body").html(`<p>The font can't be removed because it's still being used by ${p} ${usedIn} component.</p>`);
      $("#error-modal").modal('show');
    } else {
      $(`.font-${name}`).remove();
      delete gui.assets.fonts[name]
    }
  });
  $("#fonts-table").append(row);
  row.find('.font-text').on('input',function(e){
    var val = $(this).val();
    $(this).siblings('h4').html(val);
  })
  $(".font-select").append(`<option class="font-${name}">${name}</option>`);
}



function loadAudio(name,type,fileName) {
  let row = $(`<tr class="audio-${name}">
                <th class="align-middle" scope="row">${name}</th>
                <td class="align-middle" >${type}</td>
                <td class="action-col">
                  <button class="btn btn-icon btn-outline-light play-audio"><i class="fas fa-play"></i></button>
                  <button class="btn btn-icon btn-outline-light remove-audio"><i class="fas fa-trash-alt"></i></button>
                </td>
              </tr>`);

  // var temp = $(".audio-template").clone();
  // temp.removeClass('audio-template');
  // temp.find('.card-header > .audio-name').html(name);
  // temp.find('.card-header > .badge').html(type);
  // temp.find('.audio-sample').attr('src',`/assets/${gui.name}/${fileName}`);
  $("#audio-table").append(row)
  row.find('.remove-audio').click(function (argument) {
    var usedIn = findAudio(name);
    if (usedIn) {
      var p = usedIn == 'button' ? "a" : "the";
      $("#error-modal").find(".modal-body").html(`<p>The audio can't be removed because it's still being used by ${p} ${usedIn} component.</p>`);
      $("#error-modal").modal('show');
    } else {
      $(`.audio-${name}`).remove();
      delete gui.assets.audio[name];
    }
  });
  row.find('.play-audio').click(function (argument) {
    playAudioSample(name,$(this))
  })
  // temp.show();
  $(`.audio-${type}-select`).append(`<option class="audio-${name}" value="${name}">${name}</option>`);
}

function playAudioSample(name,btn){
  if (btn.find("i").hasClass("fa-play")){
    // play audio
    stopAudioSample();
    audioSample = game.add.audio(name);
    audioSample.name = name;
    audioSample.onStop.addOnce = ()=>{
      stopAudioSample();
    }
    audioSample.play();
  } else {
    stopAudioSample();
  }
  btn.find("i").toggleClass("fa-play");
  btn.find("i").toggleClass("fa-stop");
}

function stopAudioSample(){
  if (audioSample){
    $(`.audio-${audioSample.name}`).find(".play-audio i").removeClass("fa-play");
    $(`.audio-${audioSample.name}`).find(".play-audio i").addClass("fa-stop");
    audioSample.destroy();
    audioSample = null;
  }
}

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
  addComponent("choice",['x','y','sfx','width','height','separation','size','font','color','chosen-color','align','offset-x','offset-y'],{isTextCentered:isTextCentered,isBoxCentered:isBoxCentered})
})

$('.upload-interrupt-component').click(function(e){
  var inlineWithChoice = $('#interrupt-start-box-inline').is(':checked');
  var textStyleAsChoice = $('#interrupt-start-text-style-same-as-choices').is(':checked');
  var textPositionAsChoice = $('#interrupt-start-text-position-same-as-choices').is(':checked');
  var isBoxCentered = $('#interrupt-start-box-centered').is(':checked');
  var isTextCentered = $('#interrupt-start-text-centered').is(':checked');
  addComponent("interrupt",['x','y','sfx','width','height','separation','size','font','color','align','offset-x','offset-y'],{isTextCentered:isTextCentered,isBoxCentered:isBoxCentered,textStyleAsChoice:textStyleAsChoice,textPositionAsChoice:textPositionAsChoice,inlineWithChoice:inlineWithChoice})
})

$('.upload-ctc-component').click(function(e){
  var ctcStyle = $('#ctc-start-style input:checked').attr('opt');
  addComponent('ctc',['x','y','width','height'],{animationStyle:ctcStyle})
})

$('.upload-name-box-component').click(function(e){
  var isTextCentered = $('#name-box-start-text-centered').is(':checked');
  addComponent('name-box',['x','y','size','font','color','align','offset-x','offset-y'],{isTextCentered:isTextCentered})
})

$('.upload-message-box-component').click(function(e){
  addComponent('message-box',['x','y','sfx','size','font','color','align','offset-x','offset-y','text-width'])
})

$('.upload-font').click(function(e){
  var name = $("#font-name").val();
  uploadAsset(lastUpload,name,function(fileName){
    loadFont(name,fileName)
    gameLoader.addFont(name,fileName)
  });
})

$('.upload-audio').click(function(e){
  var name = $("#audio-name").val();
  var audioType = $('#audio-type input:checked').attr('opt');
  uploadAsset(lastUpload,name,function(fileName){
    loadAudio(name,audioType,fileName)
    gameLoader.addAudio(name,audioType,fileName)
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
  console.log(font)
  var color = $("#label-start-color").val();
  gameLoader.addLabel(x,y,size,text,font,color)
})

$('.modal').on('shown.bs.modal', function (e) {
  $('.tools').hide()
  $('.audio-preview').hide();
  selected = null;
  var thumbnail = $(this).find('.img-preview').attr('thumbnail');
  $(this).find('.img-preview').attr('src', thumbnail);
  $('.custom-file-input').val('')
  $(this).find('.custom-file-label').html("Choose file");
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



function addComponent(name,propNames,extra) {
  var props = { id: genAssetId('asset') }
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
  // console.log("adding component ")
  // console.log(name)
  // console.log(props)
  uploadAsset(lastUpload,props.id,function(fileName){
    // props.fileName = fileName;
    gameLoader.addComponent(name,props,fileName)
  });
}