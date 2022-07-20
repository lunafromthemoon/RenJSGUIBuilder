
var lastUpload = null;

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
});

function openModal(modal){
  $(`#${modal}-modal`).modal('show');
  $(`#${modal}-modal`).find(".upload-asset").prop("disabled",true);
}

async function uploadFont(){
  var name = $("#font-name").val();
  fileName = await uploadAsset(lastUpload,name)
  // adds it to the html
  loadFont(name,fileName)
  // adds it to the phaser game
  gameLoader.addFont(name,fileName)
}

async function uploadAudio(){
  var name = $("#audio-name").val();
  var audioType = $('#audio-type input:checked').attr('opt');
  fileName = await uploadAsset(lastUpload,name)
  // adds it to the html audio list
  loadAudio(name,audioType,fileName)
  // preloads it in phaser
  gameLoader.addAudio(name,audioType,fileName)

}

async function uploadImage() {
  var name = $("#image-name").val();
  fileName = await uploadAsset(lastUpload,name)
  // adds it to the html
  var temp = $(".image-template").clone();
  temp.removeClass('image-template');
  temp.addClass(`image-${name}`);
  temp.find('.image-name').html(name);
  temp.find('.remove-image').click(()=> {
    if (!assetInUse(name, "images")) {      
      $(`.image-${name}`).remove();
      delete gui.assets.images[name];
    }
  });
  temp.find('.show-image').click(function() {
    showImagePreview(name, fileName)
  })
  $("#image-table").append(temp)
  temp.show();
  // add to all selects where this audio type can be used
  $(`.image-select`).append(`<option class="image-${name}" value="${name}">${name}</option>`);
  // adds it to the phaser game
  gameLoader.preloadImage(name,fileName)
}

async function uploadSpritesheet() {
  var name = $("#spritesheet-name").val();
  var w = $("#spritesheet-width").val();
  var h = $("#spritesheet-height").val();
  fileName = await uploadAsset(lastUpload,name)
  // adds it to the html
  var temp = $(".spritesheet-template").clone();
  temp.removeClass('spritesheet-template');
  temp.addClass(`spritesheet-${name}`);
  temp.find('.spritesheet-name').html(name);
  temp.find('.remove-spritesheet').click(()=> {
    if (!assetInUse(name, "spritesheets")) {      
      $(`.spritesheet-${name}`).remove();
      delete gui.assets.spritesheet[name];
    }
  });
  temp.find('.show-spritesheet').click(function() {
    showImagePreview(name, fileName)
  })
  $("#spritesheet-table").append(temp)
  temp.show();
  // add to all selects where this audio type can be used
  $(`.spritesheet-select`).append(`<option class="spritesheet-${name}" value="${name}">${name}</option>`);
  // adds it to the phaser game
  gameLoader.preloadSpritesheet(name,fileName,w,h)

}

function showImagePreview(name,fileName){
  $('#image-preview-img').attr('src', `assets/${gui.name}/${fileName}`);
  $("#image-preview-modal").find(".modal-title").html(name)
  $("#image-preview-modal").modal('show');
}

async function uploadAsset(file, asset){
  return new Promise(resolve=>{
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
            resolve(dataR.fileName)
          },
          error: function (xhr, status, error) {
              console.log('Error: ' + error.message);
          }
      });
  })
  
}


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
  const fontId = name.replace(/ /g,'')
  let row = $(`<tr class="font-${fontId}">
                <th class="align-middle" scope="row">${name}</th>
                <td class="align-middle text-sample" >${sampletText}</td>
                <td class="action-col"><button class="btn btn-icon btn-outline-light remove-font"><i class="fas fa-trash-alt"></i></button></td>
              </tr>`);
  
  row.find('.text-sample').css('font-family',name);
  row.find('.remove-font').click(function (argument) {
    if (!assetInUse(name, 'font')) {
      $(`.font-${fontId}`).remove();
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


function assetInUse(assetName, assetType){
  var asset = assetType == 'font' ? findFont(assetName) : findAsset(assetName);
  if (asset) {
    const error = `The ${assetType} ${assetName} can't be removed because it's still being used by a ${asset[1]} element (${asset[0]}), in the ${asset[2]} menu.`
    $("#error-modal").find(".modal-body").html(`<p>${error}</p>`);
    $("#error-modal").modal('show');
    return true
  }
  return false
}

function loadAudio(name,type,fileName) {
  var temp = $(".audio-template").clone();
  temp.removeClass('audio-template');
  temp.addClass(`audio-${name}`);
  temp.find('.card-header > .audio-name').html(name);
  temp.find('.card-header > .audio-type').html(type);

  temp.find('.remove-audio').click(()=> {
    if (!assetInUse(name, type)) {      
      $(`.audio-${name}`).remove();
      delete gui.assets.audio[name];
    }
  });
  temp.find('.play-audio').click(function() {
    playAudioSample(name,$(this))
  })
  $("#audio-table").append(temp)
  temp.show();
  // add to all selects where this audio type can be used
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

function findAsset(assetName) {
  // check hud assets
  for (const element of gui.config.hud){
    if (element.asset == assetName || (element.ctc && element.ctc.asset == assetName)){
      return [element.id, element.type, 'hud']
    }
  }
  // check each menu assets
  for (const menu in gui.config.menus){
    for (const element of gui.config.menus[menu]){
      if (element.asset == assetName){
        return [element.id, element.type, menu]
      }
    }
  }
  return null
}

function findFont(name) {

  function hasFont(element){
    return (
      (element.style && element.style.font == name)
      || (element.text && typeof element.text !== 'string' && element.text.style && element.text.style.font == name)
      || (element.label && element.label.style && element.label.style.font == name)
      )
  }
  // check hud assets
  for (const element of gui.config.hud){
    if (hasFont(element)) {
      return [element.id, element.type, 'hud']
    }
  }
  // check each menu assets
  for (const menu in gui.config.menus){
    for (const element of gui.config.menus[menu]){
      if (hasFont(element)) {
        return [element.id, element.type, menu]
      }
    }
  }
  return null
}


function checkUniqueName(inputElement, assetType){
  const value = inputElement.value
  const addButton = $(inputElement).closest(".modal-content").find(".upload-asset");
  if (value == "" || /\s/g.test(value) || gui.assets[assetType][value]) {
    $(inputElement).addClass("is-invalid")
    addButton.prop("disabled",true);
  } else {
    $(inputElement).removeClass("is-invalid")
    addButton.prop("disabled",false);
  }
}