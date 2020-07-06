
var game = new Phaser.Game(800, 600, Phaser.AUTO, "preload-canvas");

var gameLoader = {

  preload: function(){
    // game.load.spritesheet("button","assets/Quickstart2/mainbutton0.png",163,83);
  },

  create: function () {
    if ('background' in assets[currentMenu]) this.loadBackground();
    if ('loading-bar' in assets[currentMenu]) this.loadLoadingBar();
    if ('images' in assets[currentMenu]) {
      for (var i = assets[currentMenu].images.length - 1; i >= 0; i--) {
        var img = assets[currentMenu].images[i];
        this.loadImage(img)
      }
    }
    if ('animations' in assets[currentMenu]) {
      for (var i = assets[currentMenu].animations.length - 1; i >= 0; i--) {
        var img = assets[currentMenu].animations[i];
        this.loadImage(img)
      }
    }

    if ('buttons' in assets[currentMenu]) {
      for (var i = assets[currentMenu].buttons.length - 1; i >= 0; i--) {
        var img = assets[currentMenu].buttons[i];
        this.loadButton(img.id,img.x,img.y,img.binding)
      }
    }

  },

  // preload assets

  preloadImage: function(id,fileName,callback){
    game.load.image(id, `assets/${guiName}/${fileName}`);
    game.load.onLoadComplete.addOnce(callback, this);
    game.load.start();
  },

  preloadSpritesheet: function(id,fileName,w,h,callback){
    game.load.spritesheet(id, `assets/${guiName}/${fileName}`,parseInt(w),parseInt(h));
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
    assets[currentMenu].background = {fileName:fileName,x:0,y:0};
   	this.preloadImage(currentMenu+'background',fileName,this.loadBackground);
  },

  addLoadingBar: function(x,y,w,h,fileName){
    var config = {fileName:fileName,x:x,y:y,w:w,h:h};
    assets[currentMenu]['loading-bar'] = config;
    this.preloadSpritesheet('loading-bar',fileName,w,h,function(){
      this.loadLoadingBar(config)
    })
  },

  addStaticImage: function(x,y,imgId,fileName){
    if (!('images' in assets[currentMenu])){
      assets[currentMenu].images = []
    }
    var config = {fileName:fileName,x:x,y:y,id:imgId};
    assets[currentMenu].images.push(config)
    this.preloadImage(imgId,fileName,function(){
      this.loadImage(config);
    })
  },

  addAnimation: function(x,y,w,h,imgId,fileName){
    if (!('animations' in assets[currentMenu])){
      assets[currentMenu].animations = []
    }
    var config = {fileName:fileName,x:x,y:y,w:w,h:h,id:imgId,isAnimation:true};
    assets[currentMenu].animations.push(config);
    this.preloadSpritesheet(imgId,fileName,w,h,function(){
      this.loadImage(config)
    })
  },

  addButton: function(x,y,w,h,binding,imgId,fileName){
    if ( !('buttons' in assets[currentMenu])){
      assets[currentMenu].buttons = []
    }
    var config = {fileName:fileName,x:x,y:y,w:w,h:h,id:imgId,binding:binding};
    assets[currentMenu].buttons.push(config);
    this.preloadSpritesheet(imgId,fileName,w,h,function(){
      this.loadButton(config)
    })
  },

  // addSpritesheet: function(x,y,w,h,sprId,fileName){
  //   assets[currentMenu][sprId] = {fileName:fileName,x:x,y:y,w:w,h:h,type:'spritesheet'};
  //   game.load.spritesheet(sprId, `assets/${guiName}/${fileName}`,parseInt(w),parseInt(h));
  //   game.load.onLoadComplete.addOnce(function(){
      
  //   }, this);
  //   game.load.start();
  // }
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
    currentMenu = menu;
    game.state.start('gameLoader');
    $(".asset-add").hide();
    $(".asset-all").show();
    $(`.asset-${menu}`).show();
  }
}

game.state.add('gameLoader', gameLoader);

game.state.start('gameLoader');

$('.modal').on('shown.bs.modal', function (e) {
  var thumbnail = $(this).find('.img-preview').attr('thumbnail');
  console.log(thumbnail)
	$(this).find('.img-preview').attr('src', thumbnail);
  $(this).find('.custom-file-label').html("Choose file");
  // if ($(this).attr('id') == "button-modal"){

  // }
});

var guiName = "Quickstart2"

var lastUpload = null;
var selected = null;
var assetCounter = 0;
var currentMenu = null;
var assets = {
  loader: {},
  main: {},
  settings: {},
  hud: {},
  saveload: {}
}

changeMenu('loader');

function uploadAsset(file, asset, callback){
  var data = new FormData();
  data.append('file', file);
  $.ajax({
        url: `/upload_asset/${guiName}/${currentMenu}${asset}` ,
        data: data,
        dataType: 'json',
        type: 'POST',
        processData: false,
        contentType: false,
        success: function (dataR) {
            console.log(dataR)
            
            callback(dataR.fileName)
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
        }
    });
}

$('.upload-bg').click(function(e){
  uploadAsset(lastUpload,'background',function(fileName){
    gameLoader.addBackground(fileName)
  });
})

$('.remove-selected').click(function(e){
  delete assets[currentMenu][selected.assetId]
  selected.destroy();
  $('.tools').hide()
})

$('.upload-image').click(function(e){
  var x = $("#image-start-x").val();
  var y = $("#image-start-y").val();
  var imgId = 'img'+assetCounter;
  assetCounter++;
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
  var imgId = 'animation'+assetCounter;
  assetCounter++;
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
  var imgId = 'button'+assetCounter;
  assetCounter++;
  uploadAsset(lastUpload,imgId,function(fileName){
    gameLoader.addButton(x,y,w,h,binding,imgId,fileName)
  });
})

v

$('#button-start-binding').on('change',function(e){
  var val = $("#button-start-binding").val();
  if (val =="save" || val == "load"){
    $("#slot-start-value").show();
  }
}

$('.custom-file-input').on('change',function(e){
    if (e.target.files && e.target.files[0]) {
    	var fileName = e.target.files[0].name;
      lastUpload = e.target.files[0];
    	$(this).next('.custom-file-label').html(fileName);
      var reader = new FileReader();
      reader.onload = function (e) {
        $('.img-preview').attr('src', e.target.result);
      }
      reader.readAsDataURL(lastUpload);
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

function showTools(tool){
  $('.tools').hide()
  $(`.${tool}-tools`).show()
}