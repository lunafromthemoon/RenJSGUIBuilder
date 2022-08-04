// -------------------------------------------------------------------------
// Init
// -------------------------------------------------------------------------

function init() {
  // add menus to menu selection list, hud is already added
  for (menuName in gui.config.menus){
    addMenuToSelectionList(menuName)
  }
  
  setupConfig()

  game = new Phaser.Game(gui.metadata.resolution.w, gui.metadata.resolution.h, Phaser.AUTO, "preload-canvas");
  game.preserveDrawingBuffer = true;
  game.state.add('gameLoader', gameLoader);
  game.state.add('preloader', preloader);
  // load assets to the html lists and where it can be selected
  for (var key in gui.assets.fonts) {
    addToFontsList(key,gui.assets.fonts[key].fileName);
  }
  for (var key in gui.assets.audio) {
    addToAudioList(key,gui.assets.audio[key].type);
  }
  for (var key in gui.assets.images) {
    addImageToList(key,gui.assets.images[key].fileName);
  }
  for (var key in gui.assets.spritesheets) {
    const w = gui.assets.spritesheets[key].w
    const h = gui.assets.spritesheets[key].h
    addSpritesheetToList(key,gui.assets.spritesheets[key].fileName,w,h);
  }
  // start loading all assets to phaser
  game.state.start('preloader')

  $('[data-toggle="tooltip"]').tooltip()
  changeMenu('general');
  
}

// -------------------------------------------------------------------------
// Config 
// -------------------------------------------------------------------------

function setupConfig(){
  if (!gui.config.general){
    gui.config.general = {
      transitions: {
        defaults: {
          characters: "FADE",
          backgrounds: "FADE",
          cgs: "FADE",
          music: "FADE",
        },
        say: "CUT",
        visualChoices: "FADE",
        textChoices: "CUT",
        menus: "FADE",
        skippable: false
      },
      fadetime : 750,
      logChoices: true,
      backgroundColor: "#000000"
    }
  }
  
  $('#canvas-color').val(gui.config.general.backgroundColor);
  $('.colorpicker-component').colorpicker();
  $('#canvas-color').on('change',function(e){
    gui.config.general.backgroundColor = $(this).val();
    game.stage.backgroundColor = $(this).val();
  });

  $('#logChoicesInput').prop('checked',gui.config.general.logChoices);
  $('#logChoicesInput').on('change',function() {
    gui.config.general.logChoices = $(this).is(':checked');
  });

  $(".transition-select[target='menus']").val(gui.config.general.transitions.menus);
  $(".transition-select[target='visualChoices']").val(gui.config.general.transitions.visualChoices);
  $(".transition-select[target='textChoices']").val(gui.config.general.transitions.textChoices);

  $('.transition-select').on('change',function(e){
    var target = $(this).attr('target')
    gui.config.general.transitions[target] = $(this).val();
  });
}

// -------------------------------------------------------------------------
// Menus 
// -------------------------------------------------------------------------

function addMenuToSelectionList(menuName){
  const selectMenuItem = `<a class="dropdown-item" id="${menuName}Selector" href="#" onclick="changeMenu('${menuName}');">${menuName}</a>`
  $("#menuSelectionList").append(selectMenuItem);
}

function addMenu(){
  //create random name
  const menuName = "menu"+Date.now()
  //add new menu to config
  gui.config.menus[menuName] = []
  addMenuToSelectionList(menuName)
  changeMenu(menuName)
}

function changeMenuName(){
  const newName = $("#new-menu-name").val()
  gui.config.menus[newName] = gui.config.menus[currentMenu] 
  delete gui.config.menus[currentMenu] 
  $(`#${currentMenu}Selector`).html(newName)
  $(`#${currentMenu}Selector`).attr("onclick",`changeMenu('${newName}')`);
  $(`#${currentMenu}Selector`).prop('id',`#${newName}Selector`)
  // TODO change menu title
  changeMenu(newName);
}

function checkUniqueMenuName(){
  const value = $("#new-menu-name").val()
  if (value == "" || value == "hud" || /\s/g.test(value) || gui.config.menus[value]) {
    $("#new-menu-name").addClass("is-invalid")
    $("#change-menu-name").prop("disabled",true);
  } else {
    $("#new-menu-name").removeClass("is-invalid")
    $("#change-menu-name").prop("disabled",false);
  }
}

window.clearMenu = function(){
  $('#confirm-button').unbind('click');
  $('#confirm-button').click(function(){
      // console.log("Removing contents of "+menu);
      if (currentMenu!='hud'){
        gui.config.menus[currentMenu] = []  
      } else {
        gui.config.hud = []
      }
      
      // reload menu
      changeMenu(currentMenu);
  });
  $("#confirm-contents").html(`This action will remove all contents in the ${currentMenu} menu, but will not delete the menu itself.`);
  $("#confirm-modal").modal('show');
}

window.deleteMenu = function(){
  $('#confirm-button').unbind('click');
  $('#confirm-button').click(function(){
      // remove from config
    delete gui.config.menus[currentMenu]
    // remove from selection list
    $(`#${currentMenu}Selector`).remove()
    changeMenu('general');
  });
  $("#confirm-contents").html(`This action will delete the ${currentMenu} menu and all its contents.`);
  $("#confirm-modal").modal('show');
}

function changeMenu(menu){
  if (menu!=currentMenu){
    $(`.general-help`).hide();
    $(".asset-add").hide();
    $(`.asset-${menu}`).show();
    $('.tools').hide()
    $(`.background-music`).hide();
    // $("#fonts-container").hide();
    $(".canvas-container").hide();
    // $('#selectMenu').html("")
    // $("#audio-container").hide();
    currentMenu = menu;

    selected = null;
    if(menu=="general"){
      $(`.menu-creation-toolbox`).hide();
      $(`.general-help`).show();
      $(`#general-container`).show();
      currentMenuConfig = null;
    } else {
      currentMenuConfig = currentMenu == "hud" ? gui.config.hud : gui.config.menus[currentMenu]
      $(`.menu-creation-toolbox`).show();
      if (menu!="loader") $(".asset-all").show();     

      // if (gui.config[menu].backgroundMusic){
      //   $(`#background-music`).val(gui.config[menu].backgroundMusic);
      // } else {
      //   $(`#background-music`).val('none');
      // }
      
      // $(`.background-music-${menu}`).show();
      $("#canvas-container").show();
      game.state.start('gameLoader');
    }
  }
}


// -------------------------------------------------------------------------
// GUI generation
// -------------------------------------------------------------------------

async function saveGUI(){
  return new Promise(resolve => {
    $('#btn-save-gui').html('Saving...');
    try {
      var preview = getThumbnail();
      // var preview = game.canvas.toDataURL();
    } catch(e) {
      console.log(e)
    }
    $.ajax({
          url: `/save_gui/${gui.name}` ,
          data: {gui:JSON.stringify(gui),preview:preview},
          dataType: 'json',
          type: 'POST',
          // processData: false,
          // contentType: false,
          success: function (dataR) {
            $('#btn-save-gui').html('Saved!');
            setTimeout(function() {
              $('#btn-save-gui').html('<i class="fas fa-save"></i> Save');
            }, 2000);
            resolve()
          },
          error: function (xhr, status, error) {
              console.log('Error: ' + error.message);
          }
      });
  })
}

function getThumbnail() {
  var canvas = document.createElement("canvas");
  let maxSize = 350;
  canvas.width = maxSize;
  canvas.height = (game.canvas.height * maxSize)/game.canvas.width;
  canvas.getContext("2d").drawImage(game.canvas, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg");
}

$('#btn-save-gui').on('click',function(e){
  saveGUI();
});

$('#btn-generate-gui').click(function(){
    $('#generating-modal').find('.fa-cog').show();
    $('#generating-modal').find('p').hide();
    $('#open-dir').hide()
    $('#generating-modal').modal('show');
    $.ajax({
      url: `/generate_gui/${gui.name}` ,
      type: 'GET',
      success: function (dataR) {
        $('#generating-modal').find('.fa-cog').hide();
        $('#generating-modal').find('p').show();
        $('#open-dir').attr('target',name)
        $('#open-dir').show()
      },
      error: function (xhr, status, error) {
          console.log('Error: ' + error.message);
      }
  });
  });

  $('#open-dir').click(function (argument) {
    $.ajax({
      url: `/open_dir/${gui.name}` ,
      type: 'GET',
      success: function (dataR) {
        console.log(dataR)
      },
      error: function (xhr, status, error) {
          console.log('Error: ' + error.message);
      }
    });
  })

// -------------------------------------------------------------------------
// State tracking
// -------------------------------------------------------------------------
var selected = null;
var currentMenu = null;
var currentMenuConfig = null;
var audioSample = null;
// phaser game object
var game = null;
init();