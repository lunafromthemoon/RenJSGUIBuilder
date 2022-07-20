class GUIElement{
	defaultConfig = {}
	config = null
	game = null
	phaserObj = null;
	constructor(game, config){
		this.game = game
		this.config = {...defaultConfig, ...config}
	}

	playSFX(game,audioKey){
		sfx = game.add.audio(audioKey);
		sfx.play();
	}

	destroy(){
		if (this.phaserObj){
			this.phaserObj.destroy();	
		}
	}
}

class Image extends GUIElement {
	animated = false

	defaultConfig = {
		x: 0,
		y: 0,
	}

	create(){
		this.phaserObj = this.game.add(this.config.x,this.config.y,this.config.asset)
	}

	
}

class BaseButton extends GUIElement {

	totalFrames = 0;

	defaultConfig = {
		x: 0,
		y: 0,
		sfx: 'none',
		binding: 'none',
	}

	// constructor(game,config){
	// 	super(game,config)
	// }

	create(){
		this.phaserObj = this.game.add.button(this.config.x,this.config.y,this.config.asset, ()=>{
			if (this.config.sfx != 'none'){
				this.playSFX(this.config.sfx)
			}
			this.onclick();
		})
		this.totalFrames = this.phaserObj.animations.frameTotal
		this.phaserObj.setFrames(...this.getButtonFrames())
	}

	getButtonFrames(pushed=false){
      // button frames -> over|out|down|up
      const buttonFrames = {
          1: {normal: [0,0,0,0],pushed:[1,1,1,1]},
          2: {normal: [1,0,1,0],pushed:[3,2,3,2]},
          3: {normal: [1,0,2,0],pushed:[4,3,5,3]},
          4: {normal: [1,0,2,3],pushed:[5,4,6,7]},
      }
      return buttonFrames[this.totalFrames][pushed ? 'pushed' : 'normal']
    }

    onclick(){

    }

}

class PushButton extends BaseButton {

	pushed = false;

	create(){
		super.create()
		this.phaserObj.setFrames(...this.getButtonFrames(this.pushed))
	}

	onclick(){
		this.pushed = !pushed;
		this.phaserObj.setFrames(...this.getButtonFrames(this.pushed))
	}
}

class LabelButton extends BaseButton {
	create(){
		super.create()

	}
}