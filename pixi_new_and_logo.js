// 創一個 Render 自動判斷是否有 webGL
var renderer = PIXI.autoDetectRenderer(256, 256);
renderer.resize(512, 512);
renderer.backgroundColor = 0x061639;
renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;
renderer.resize(window.innerWidth, window.innerHeight);
var texture = PIXI.utils.TextureCache["bear.png"];
var logo = new PIXI.Sprite(texture);

PIXI.loader
    .add("bear.png")
    .load(init);

function init() {
        	var sprite = new PIXI.Sprite(
        			PIXI.loader.resources["bear.png"].texture // get Texture Cache
        		);
		console.log("123");
              	renderer.render(sprite);
  		}
