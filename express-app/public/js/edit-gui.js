
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
        game.load.spritesheet('loading-bar', `assets/${gui.name}/${asset.fileName}`,asset.w,asset.h);
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
            game.load.spritesheet(asset.id,`assets/${gui.name}/${asset.fileName}`,asset.w,asset.h)
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
    if ('loading-bar' in gui.assets[currentMenu]) this.loadLoadingBar(gui.assets[menu]['loading-bar']);
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
    
    // if ('animations' in gui.assets[currentMenu]) {
    //   for (var i = gui.assets[currentMenu].animations.length - 1; i >= 0; i--) {
    //     var config = gui.assets[currentMenu].animations[i];
    //     this.loadImage(config)
    //   }
    // }

    // if ('buttons' in gui.assets[currentMenu]) {
    //   for (var i = gui.assets[currentMenu].buttons.length - 1; i >= 0; i--) {
    //     var config = gui.assets[currentMenu].buttons[i];
    //     this.loadButton(config)
    //   }
    // }

    // if ('labels' in gui.assets[currentMenu]) {
    //   for (var i = gui.assets[currentMenu].labels.length - 1; i >= 0; i--) {
    //     var config = gui.assets[currentMenu].labels[i];
    //     this.loadLabel(config)
    //   }
    // }

  },

  loadComponent: function(component,config) {
    switch (component) {
      case 'images' : this.loadImage(config); break;
      case 'animations' : this.loadImage(config); break;
      case 'buttons' : this.loadButton(config); break;
      case 'labels' : this.loadLabel(config); break;
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
    bg.assetId = currentMenu+'background';
    bg.events.onInputDown.add(function(){
      showTools('background');
      selected = bg;
    }, this);
  },

  loadLoadingBar: function(config){
    var sprite = game.add.sprite(config.x,config.y,'loading-bar');
    sprite.config = config;
    sprite.assetId = 'loading-bar';
    this.makeDraggable(sprite,'loading-bar')
  },

  loadImage: function(config){
    var image = game.add.sprite(config.x,config.y,config.id);
    image.assetId = config.id;
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
    this.makeDraggable(image,'button',['button-binding'])
  },

  loadLabel: function(config) {
    var text = game.add.text(config.x, config.y, config.text, {font: config.size+'px '+config.font, fill: "#ffffff"});
    text.config = config;
    this.makeDraggable(text,'label')
  },

  makeDraggable: function(sprite,name,otherProps){
    sprite.inputEnabled = true;
    sprite.input.dragDistanceThreshold = 3;
    function selectImage(){
      selected = sprite;
      $(`.asset-x`).val(selected.x);
      $(`.asset-y`).val(selected.y);
      if (otherProps) {
        for (var i = 0; i < otherProps.length; i++) {
          var prop = otherProps[i];
          $(`#${prop}`).val(selected.config[prop]);
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

  // Add new asset to GUI

  addBackground: function(fileName){
    gui.assets[currentMenu].background = {fileName:fileName,x:0,y:0};
   	this.preloadImage(currentMenu+'background',fileName,this.loadBackground);
  },

  addLoadingBar: function(x,y,w,h,fileName){
    var config = {fileName:fileName,x:x,y:y,w:w,h:h};
    gui.assets[currentMenu]['loading-bar'] = config;
    this.preloadSpritesheet('loading-bar',fileName,w,h,function(){
      this.loadLoadingBar(config)
    })
  },

  addStaticImage: function(x,y,imgId,fileName){
    if (!('images' in gui.assets[currentMenu])){
      gui.assets[currentMenu].images = []
    }
    var config = {fileName:fileName,x:x,y:y,id:imgId};
    gui.assets[currentMenu].images.push(config)
    this.preloadImage(imgId,fileName,function(){
      this.loadImage(config);
    })
  },

  addAnimation: function(x,y,w,h,imgId,fileName){
    if (!('animations' in gui.assets[currentMenu])){
      gui.assets[currentMenu].animations = []
    }
    var config = {fileName:fileName,x:x,y:y,w:w,h:h,id:imgId,isAnimation:true};
    gui.assets[currentMenu].animations.push(config);
    this.preloadSpritesheet(imgId,fileName,w,h,function(){
      this.loadImage(config)
    })
  },

  addButton: function(x,y,w,h,binding,imgId,fileName){
    if ( !('buttons' in gui.assets[currentMenu])){
      gui.assets[currentMenu].buttons = []
    }
    var config = {fileName:fileName,x:x,y:y,w:w,h:h,id:imgId,binding:binding};
    gui.assets[currentMenu].buttons.push(config);
    this.preloadSpritesheet(imgId,fileName,w,h,function(){
      this.loadButton(config)
    })
  },

  // addSpritesheet: function(x,y,w,h,sprId,fileName){
  //   gui.assets[currentMenu][sprId] = {fileName:fileName,x:x,y:y,w:w,h:h,type:'spritesheet'};
  //   game.load.spritesheet(sprId, `assets/${gui.name}/${fileName}`,parseInt(w),parseInt(h));
  //   game.load.onLoadComplete.addOnce(function(){
      
  //   }, this);
  //   game.load.start();
  // }
  addFont: function (name, fileName) {
    gui.assets[currentMenu].push({fileName:fileName,name:name});
    game.add.text(gui.resolution[0], gui.resolution[1], name, {font: '42px '+name, fill: "#ffffff"});
  },

  addLabel: function(x,y,size,text,font) {
    if ( !('labels' in gui.assets[currentMenu])){
      gui.assets[currentMenu].labels = []
    }
    var config = {x:x,y:y,size:size,text:text,font:font};
    gui.assets[currentMenu].labels.push(config);
    this.loadLabel(config)
  }
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
  // if ($(this).attr('id') == "button-modal"){

  // }
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

$('.upload-bg').click(function(e){
  console.log("uploading bg")
  uploadAsset(lastUpload,'background',function(fileName){
    console.log("adding bg")
    gameLoader.addBackground(fileName)
  });
})

$('.add-label').click(function(e){
  var text = $("#label-start-text").val();
  var size = $("#label-start-size").val();
  var x = $("#label-start-x").val();
  var y = $("#label-start-y").val();
  var font = $("#label-start-font").val();
  gameLoader.addLabel(x,y,size,text,font)
})

$('.remove-selected').click(function(e){
  delete gui.assets[currentMenu][selected.assetId]
  selected.destroy();
  $('.tools').hide()
})

$('.upload-image').click(function(e){
  var x = $("#image-start-x").val();
  var y = $("#image-start-y").val();
  var imgId = genAssetId('img');
  uploadAsset(lastUpload,imgId,function(fileName){
    gameLoader.addStaticImage(x,y,imgId,fileName)
  });
})

$('.upload-loading-bar').click(function(e){
  var x = $("#loading-bar-start-x").val();
  var y = $("#loading-bar-start-y").val();
  var w = $("#loading-bar-width").val();
  var h = $("#loading-bar-height").val();
  uploadAsset(lastUpload,'loading-bar',function(fileName){
    gameLoader.addLoadingBar(x,y,w,h,fileName)
  });
  
})

$('.upload-animation').click(function(e){
  var x = $("#animation-start-x").val();
  var y = $("#animation-start-y").val();
  var w = $("#animation-width").val();
  var h = $("#animation-height").val();
  var imgId = genAssetId('animation');
  uploadAsset(lastUpload,imgId,function(fileName){
    gameLoader.addAnimation(x,y,w,h,imgId,fileName)
  });
})

$('.upload-button').click(function(e){
  var x = $("#button-start-x").val();
  var y = $("#button-start-y").val();
  var w = $("#button-width").val();
  var h = $("#button-height").val();
  var binding = $("#button-start-binding").val();
  var imgId = genAssetId('button');
  uploadAsset(lastUpload,imgId,function(fileName){
    gameLoader.addButton(x,y,w,h,binding,imgId,fileName)
  });
})

$('.upload-font').click(function(e){
  var name = $("#font-name").val();
  uploadAsset(lastUpload,name,function(fileName){
    loadFont(name,fileName)
    gameLoader.addFont(name,fileName)
  });
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


$('#button-start-binding').on('change',function(e){
  var val = $("#button-start-binding").val();
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



$('.button-slot').on('change',function(e){
  var val = $(".button-slot").val();
  selected.config.slot = val;
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
        var reader = new FileReader();
        reader.onload = function (e) {
          $('.img-preview').attr('src', e.target.result);
        }
        reader.readAsDataURL(lastUpload);
      }
    }
})

$('.asset-x').on('change',function(e){
  var x = $("#asset-x").val();
  selected.x = x;
  selected.config.x = x;
})

$('.asset-y').on('change',function(e){
  var y = $("#asset-y").val();
  selected.y = y;
  selected.config.y = y;
})

$('#button-binding').on('change',function(e){
  var binding = $("#button-binding").val();
  selected.config.binding = binding;
})

$('#btn-save-gui').on('click',function(e){
  var str = JSON.stringify(gui);
  window.localStorage.setItem(gui.name,str)
  var guiList = JSON.parse(window.localStorage.getItem('RenJSGuiList'));
  if (!guiList.includes(gui.name)){
    guiList.push(gui.name);
    window.localStorage.setItem('RenJSGuiList',JSON.stringify(guiList))
  }
})

function showTools(tool){
  $('.tools').hide()
  $(`.${tool}-tools`).show()
}

function genAssetId(asset) {
    gui.assetCounter++;
    return asset+gui.assetCounter;
  }

function init(guiName,resolution) {
  gui = window.localStorage.getItem(guiName)
  var loaded = false;
  if (!gui){
    gui = {
      resolution : resolution.split(",");
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
  

  // add fonts
  

  
  
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