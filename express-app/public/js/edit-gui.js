
var preloader = {
  preload: function() {
    for (var menu in gui.assets ) {
      if (menu=='fonts') continue;
      if ('background' in gui.assets[menu]) {
        var bg = gui.assets[menu].background;
        game.load.image(menu+'background', `assets/${gui.name}/${bg.fileName}`);
      }
      if ('loading-bar' in gui.assets[menu]) {
        var asset = gui.assets[menu]['loading-bar'];
        game.load.spritesheet('loading-bar', `assets/${gui.name}/${asset.fileName}`,asset.width,asset.height);
      }
      if ('images' in gui.assets[menu]) {
        for (var i = gui.assets[menu].images.length - 1; i >= 0; i--) {
          var asset = gui.assets[menu].images[i];
          game.load.image(asset.id,`assets/${gui.name}/${asset.fileName}`)
        }
      }
      var spritesheets = ['animations','buttons','sliders']
      for (var j = spritesheets.length - 1; j >= 0; j--) {
        if (spritesheets[j] in gui.assets[menu]){
          for (var i = gui.assets[menu][spritesheets[j]].length - 1; i >= 0; i--) {
            var asset = gui.assets[menu][spritesheets[j]][i];
            var w = parseInt(asset.width)
            var h = parseInt(asset.height)
            game.load.spritesheet(asset.id,`assets/${gui.name}/${asset.fileName}`,w,h)
          }
        }
      }
    }
  },

  create: function(argument) {
    changeMenu('loader');
  }
}

var gameLoader = {

  create: function () {
    if ('background' in gui.assets[currentMenu]) this.loadBackground();
    if ('loading-bar' in gui.assets[currentMenu]) this.loadLoadingBar(gui.assets[currentMenu]['loading-bar']);
    var components = ['images','animations','buttons','labels']
    for (var j = components.length - 1; j >= 0; j--) {
      components[j]
      if (components[j] in gui.assets[currentMenu]) {
        for (var i = gui.assets[currentMenu][components[j]].length - 1; i >= 0; i--) {
          var config = gui.assets[currentMenu][components[j]][i];
          this.loadComponent(components[j],config)
        }
      }
    }

  },

  loadComponent: function(component,config) {
    switch (component) {
      case 'background' : this.loadBackground(); break;
      case 'loading-bar' : this.loadLoadingBar(config); break;
      case 'images' : this.loadImage(config); break;
      case 'animations' : this.loadImage(config); break;
      case 'buttons' : this.loadButton(config); break;
      case 'labels' : this.loadLabel(config); break;
      case 'sliders' : this.loadSlider(config); break;
      case 'choice' : this.loadChoice(config); break;
      case 'interrupt' : this.loadChoice(config); break;
    }
  },

  addComponent: function(component,config) {
    var listComponent = ['slider','image','button','animations'];
    var componentName = component;
    if (listComponent.includes(component)){
      componentName+='s';
      if (!(componentName in gui.assets[currentMenu])){
        gui.assets[currentMenu][componentName] = []
      }
      gui.assets[currentMenu][componentName].push(config)
    } else {
      if (gui.assets[currentMenu][component]){
        // remove previous
      }
      gui.assets[currentMenu][component] = config;
    }
    var preloadImage = ['image','background'];
    if (preloadImage.includes(component)){
      this.preloadImage(config.id,config.fileName,function(){
        this.loadComponent(componentName,config);
      })
    } else {
      this.preloadSpritesheet(config.id,config.fileName,config.width,config.height,function(){
        this.loadComponent(componentName,config);
      })
    }
  },

  // preload assets

  preloadImage: function(id,fileName,callback){
    game.load.image(id, `assets/${gui.name}/${fileName}`);
    game.load.onLoadComplete.addOnce(callback, this);
    game.load.start();
  },

  preloadSpritesheet: function(id,fileName,w,h,callback){
    game.load.spritesheet(id, `assets/${gui.name}/${fileName}`,parseInt(w),parseInt(h));
    game.load.onLoadComplete.addOnce(callback, this);
    game.load.start();
  },

  // show assets

  loadBackground: function(){
    var bg = game.add.sprite(0,0,currentMenu+'background');
    bg.inputEnabled = true;
    bg.config = {id: 'background'};
    bg.events.onInputDown.add(function(){
      showTools('background');
      selected = bg;
    }, this);
  },

  loadLoadingBar: function(config){
    var sprite = game.add.sprite(config.x,config.y,'loading-bar');
    sprite.config = config;
    sprite.config.id = 'loading-bar'
    this.makeDraggable(sprite,'loading-bar')
  },

  loadSlider: function(config){
    var sprite = game.add.sprite(config.x,config.y,config.id);
    sprite.config = config;
    this.makeDraggable(sprite,'slider',['binding'])
  },

  loadImage: function(config){
    var image = game.add.sprite(config.x,config.y,config.id);
    image.config = config;
    this.makeDraggable(image,'image')
    if (config.isAnimation){
      image.animations.add('do').play(true)
    }
  },

  loadButton: function(config){
    var image = game.add.button(config.x,config.y,config.id,function(){
      console.log('click on button')
    },0,1,2,0);
    image.config = config;
    this.makeDraggable(image,'button',['binding','slot'])
  },

  loadLabel: function(config) {
    var color = config.color ? config.color : "#ffffff"
    var text = game.add.text(config.x, config.y, config.text, {font: config.size+'px '+config.font, fill: color});
    text.config = config;
    this.makeDraggable(text,'label',['text','color'])
  },

  loadChoice: function(config) {
    var image = game.add.sprite(config.x,config.y,'choice');
    image.config = config;
    // add text
    this.makeDraggable(image,'choice')
  },

  makeDraggable: function(sprite,name,otherProps){
    sprite.inputEnabled = true;
    sprite.input.dragDistanceThreshold = 3;
    sprite.listComponent = name+'s';
    function selectImage(){
      selected = sprite;
      $(`.asset-x`).val(selected.x);
      $(`.asset-y`).val(selected.y);
      if (otherProps) {
        for (var i = 0; i < otherProps.length; i++) {
          var prop = otherProps[i];
          $(`#${name}-${prop}`).val(selected.config[prop]);
        }
      }
      showTools(name);
    }

    sprite.events.onInputDown.add(selectImage, this);
    sprite.events.onDragStart.add(selectImage, this);
    sprite.events.onDragStop.add(function(){
      $(`.asset-x`).val(selected.x);
      $(`.asset-y`).val(selected.y);
      selected.config.x = selected.x;
      selected.config.y = selected.y;
    }, this);
    sprite.input.enableDrag(true);
  },

  addFont: function (name, fileName) {
    gui.assets[currentMenu].push({fileName:fileName,name:name});
    game.add.text(gui.resolution[0], gui.resolution[1], name, {font: '42px '+name, fill: "#ffffff"});
  },

  addLabel: function(x,y,size,text,font,color) {
    if ( !('labels' in gui.assets[currentMenu])){
      gui.assets[currentMenu].labels = []
    }
    var config = {x:x,y:y,size:size,text:text,font:font,color:color};
    gui.assets[currentMenu].labels.push(config);
    this.loadLabel(config)
  },


}

function showFrame(frame){
  if (selected){
    selected.frame = frame;
  }
}

function changeMenu(menu){
  if (menu!=currentMenu){
    $(".menu-section").removeClass('active');
    $(".menu-title").html($(`.menu-${menu} > a`).html());
    $(`.menu-${menu}`).addClass('active');
    $(".asset-add").hide();
    $(`.asset-${menu}`).show();
    $('.tools').hide()
    currentMenu = menu;
    if(menu == "fonts"){
      $("#canvas-container").hide();
      $("#fonts-container").show();
    } else{
      $(".asset-all").show();
      $("#fonts-container").hide();
      $("#canvas-container").show();
      game.state.start('gameLoader');
    }
  }
}

$('.modal').on('shown.bs.modal', function (e) {
  var thumbnail = $(this).find('.img-preview').attr('thumbnail');
	$(this).find('.img-preview').attr('src', thumbnail);
  $(this).find('.custom-file-label').html("Choose file");
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

$('.add-label').click(function(e){
  var text = $("#label-start-text").val();
  var size = $("#label-start-size").val();
  var x = $("#label-start-x").val();
  var y = $("#label-start-y").val();
  var font = $("#label-start-font").val();
  var color = $("#label-start-color").val();
  gameLoader.addLabel(x,y,size,text,font,color)
})

$('.remove-single-selected').click(function(e){
  console.log(selected.config.id)
  delete gui.assets[currentMenu][selected.config.id]
  selected.destroy();
  $('.tools').hide()
})

$('.remove-selected').click(function(e){
  console.log(selected.listComponent)
  var list = gui.assets[currentMenu][selected.listComponent];
  list.splice(list.findIndex(item => item.id === selected.config.id), 1)
  selected.destroy();
  $('.tools').hide()
})

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

$('.upload-bg').click(function(e){
  addComponent(currentMenu+'background','background',[])
})

$('.upload-loading-bar').click(function(e){
  addComponent('loading-bar','loading-bar',['x','y','width','height'])
})

$('.upload-choice').click(function(e){
  var choiceType = $('#choice-start-type input:checked').val();
  var isCentered = $('#choice-start-centered').is(':checked');
  var isTextCentered = $('#choice-text-start-centered').is(':checked');
  addComponent(choiceType,choiceType,[],{isCentered:isCentered,isTextCentered:isTextCentered})
})

$('.upload-font').click(function(e){
  var name = $("#font-name").val();
  uploadAsset(lastUpload,name,function(fileName){
    loadFont(name,fileName)
    gameLoader.addFont(name,fileName)
  });
})

$('.colorpicker-component').colorpicker();

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

$("#label-text").on('input',function (argument) {
  selected.text = $("#label-text").val();
  selected.config.text = $("#label-text").val();
})

$('#button-start-binding').on('change',function(e){
  var val = $("#button-start-binding").val();
  console.log(val)
  if (val =="save" || val == "load"){
    $("#slot-start-value").show();
  } else {
    $("#slot-start-value").hide();
  }
})

$('#button-binding').on('change',function(e){
  var val = $("#button-binding").val();
  if (val =="save" || val == "load"){
    $("#slot-value").show();
  } else {
    $("#slot-value").hide();
  }
})

$('.binding').on('change',function(e){
  selected.config.binding = $(this).val();
})

$('.slot').on('change',function(e){
  selected.config.slot = $(this).val();
})

$('.custom-file-input').on('change',function(e){
    if (e.target.files && e.target.files[0]) {
      var fileName = e.target.files[0].name;
      lastUpload = e.target.files[0];
      $(this).next('.custom-file-label').html(fileName);
      if ($(this).attr('id')=='font-input'){
        var fontName = fileName.split(".")[0];
        $('#font-name').val(fontName)
      } else {
        var widthComponent = $(this).closest('fieldset').find('.asset-width');
        var heightComponent = $(this).closest('fieldset').find('.asset-height');
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

$('.asset-x').on('change',function(e){
  var x = parseInt($(this).val());
  selected.x = x;
  selected.config.x = x;
})

$('.asset-y').on('change',function(e){
  var y = parseInt($(this).val());
  selected.y = y;
  selected.config.y = y;
})

$('#label-color').on('change',function(e){
  var color = $('#label-color').val();
  selected.fill = color;
  selected.config.color = color;
});

$('.show-more-when-off').on('change',function(e){
  var target = $(this).attr('target')
  $(`#${target}`).toggle(!($(this).is(':checked')))
});

$('#ctc-start-style input:radio').on('click',function(e){
  $("#ctc-spritesheet-options").toggle($(this).attr('opt') == 'spritesheet')
});

$('#btn-save-gui').on('click',function(e){
  var str = JSON.stringify(gui);
  window.localStorage.setItem(gui.name,str)
  var guiList = JSON.parse(window.localStorage.getItem('RenJSGuiList'));
  if (!guiList.includes(gui.name)){
    guiList.push(gui.name);
    window.localStorage.setItem('RenJSGuiList',JSON.stringify(guiList))
  }
  $('#btn-save-gui').html('Saved!');
  setTimeout(function() {
    $('#btn-save-gui').html('Save');
  }, 2000);
})

function showTools(tool){
  $('.tools').hide()
  $(`.${tool}-tools`).show()
  if (tool == 'button'){
    $(`#slot-value`).toggle((selected.config.binding == 'save' || selected.config.binding == 'load'))
  }
}

function genAssetId(asset) {
    gui.assetCounter++;
    return asset+gui.assetCounter;
  }

// -------------------------------------------------------------------------
// Init
// -------------------------------------------------------------------------

function init(guiName,resolution) {
  gui = window.localStorage.getItem(guiName)
  var loaded = false;
  if (!gui){
    var res = resolution.split(",")
    gui = {
      resolution : [parseInt(res[0]),parseInt(res[1])],
      name: guiName,
      assetCounter: 0
    };
    gui.assets = {
      loader: {},
      main: {},
      settings: {},
      hud: {},
      saveload: {},
      fonts: []
    }
  } else {
    gui = JSON.parse(gui)
    loaded = true;
  }
  game = new Phaser.Game(gui.resolution[0], gui.resolution[1], Phaser.AUTO, "preload-canvas");
  game.state.add('gameLoader', gameLoader);
  
  if (loaded){
    game.state.add('preloader', preloader);
    for (var i = gui.assets.fonts.length - 1; i >= 0; i--) {
      loadFont(gui.assets.fonts[i].name,gui.assets.fonts[i].fileName);
    }
    game.state.start('preloader')
  } else {
    changeMenu('loader');
  }
  
}

// current state
var lastUpload = null;
var selected = null;
var currentMenu = null;
// gui info
var gui = {};
// phaser game object
var game = null;
console.log(guiName)
console.log(resolution)
init(guiName,resolution);