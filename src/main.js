import * as THREE from '../build/three.module.js';
import {GLTFLoader} from '../loaders/GLTFLoader.js';

var score_div = document.getElementById("title_score");
var money_div = document.getElementById("money_score");
var finish_score_div = document.getElementById("finish_score");
var finish_money_div = document.getElementById("finish_money");

var score = 0;
var money = 0;

var running = false;

const loader = new GLTFLoader();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(50 , window.innerWidth/window.innerHeight, 0.25, 1000 );
var renderer = new THREE.WebGLRenderer();
const texture_loader = new THREE.TextureLoader()
const Light = new THREE.DirectionalLight(0xffffff);
const vehicleColors = [0xa52523, 0xbdb638, 0x78b14b];
const vehicleTextures = ['images/red_texture.jpg','images/yellow_texture.jpg', 'images/green_texture.jpg'];
const treeHeights = [0.5,1,1.5];

buttons()

function Scene() {
	camera.position.set(5,5,5);
	camera.lookAt(new THREE.Vector3(0,2,0));

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	texture_loader.load('images/background.jpg', function(texture){
		scene.background = texture;
	});

	Light.position.set(30,20,10);
	scene.add(Light);

	document.getElementById("home_page").style.display= 'none';
	document.getElementById("score").style.display = 'grid';
	document.getElementById("finish").style.display = 'none';
	document.getElementById("rules").style.display = 'none';

	scene.add(Object.Truck());
	scene.add(Object.Car());
	scene.add(Object.Tree());
		loader.load('models/RobotExpressive.glb', function(gltf) {
			var model = gltf.scene;
			model.position.x=-1;
			model.position.y=-1;
			model.position.z=1;
			model.scale.x=model.scale.y=model.scale.z=0.3;
			model.rotation.y=3.5;
			scene.add(model);
		
		}, undefined, function(e) {
			console.error(e);
		});

	camera.position.z = 5;
}

class Object {
	constructor() {}

	static Wheel() {
		const wheel = new THREE.Mesh(
			new THREE.BoxBufferGeometry(0.275,0.275,0.275),
			new THREE.MeshPhongMaterial({ color: 0x333333, flatShading: true, map: texture_loader.load('images/wheel_texture.jpeg')})
		);
		return wheel;
	}

	static Car() {
		const car = new THREE.Group();
		const random =Math.floor(Math.random()*vehicleColors.length);
		const color = vehicleColors[random];
		const texture = vehicleTextures[random];
		const main = new THREE.Mesh(
			new THREE.BoxBufferGeometry(0.8,0.3,0.5),
			new THREE.MeshPhongMaterial({color, flatShading:true, map: texture_loader.load(texture)})
		);
		main.position.y = 1;
		main.position.x = 0.3;
		main.position.z = 0.3;
		main.castShadow = true;
		main.receiveShadow = true;
		car.add(main)
		
		const cabin = new THREE.Mesh(
		  new THREE.BoxBufferGeometry( 1.5, 0.4, 0.7 ), 
		  [
			new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true, map: texture_loader.load('images/car_texture.jpg') } ),
			new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true, map: texture_loader.load('images/car_texture.jpg') } ),
			new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true, map: texture_loader.load('images/car_texture.jpg') } ),
			new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true, map: texture_loader.load('images/car_texture.jpg') } ),
			new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true, map: texture_loader.load('images/car_texture.jpg') } ), // top
			new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true, map: texture_loader.load('images/car_texture.jpg') } ) // bottom
		  ]
		);
		cabin.position.y = 0.2;
		cabin.position.x = 0;
		cabin.position.z = -0.22;
		cabin.castShadow = true;
		cabin.receiveShadow = true;
		car.add( cabin );
		
		const frontWheel = Object.Wheel();
		frontWheel.position.x = -0.5;
		car.add( frontWheel );
	  
		const backWheel = Object.Wheel();
		backWheel.position.x = 0.5;
		car.add( backWheel );
	  
		car.castShadow = true;
		car.receiveShadow = false;

		car.position.z = -1;
		
		return car; 

	}

	static Tree() {
		const tree = new THREE.Group();

		const trunk = new THREE.Mesh(
			new THREE.BoxBufferGeometry(0.4,0.6,0.4),
			new THREE.MeshPhongMaterial({
				color: 0x4d2926, 
				flatShading: true,
				map: texture_loader.load('images/trunk_texture.jpg')})
		);
		trunk.castShadow = true;
		trunk.receiveShadow = true;
		tree.add(trunk);
		const height = treeHeights[Math.floor(Math.random()*treeHeights.length)];
		const crown = new THREE.Mesh(
			new THREE.BoxBufferGeometry(0.6,height,0.6),
			new THREE.MeshPhongMaterial({
				color: 0x7aa21d, 
				flatShading: true, 
				map: texture_loader.load('images/crown_texture.jpg')})
		);
		crown.position.y = 0.35+((height-0.5)/2);
		crown.castShadow = true;
		crown.receiveShadow = false;
		tree.add(crown);

		return tree;

	}

	static Truck() {
		const truck = new THREE.Group();
		const random =Math.floor(Math.random()*vehicleColors.length);
		const color = vehicleColors[random];
		const texture = vehicleTextures[random];

		const base = new THREE.Mesh(
			new THREE.BoxBufferGeometry(2.15,0.2,0.2),
			new THREE.MeshPhongMaterial({color: 0xb4c6fc, flatShading: true})
		);
		base.position.x=-0.08;
		base.position.y=0.275;
		base.position.z=-0.2;
		truck.add(base);

		const cargo = new THREE.Mesh(
			new THREE.BoxBufferGeometry(2,0.9,0.9),
			new THREE.MeshPhongMaterial({color: 0xb4c6fc, flatShading: true, map: texture_loader.load('images/car_texture.jpg')})
		);
		cargo.position.x=-0.6;
		cargo.position.y=0.5;
		cargo.position.z=-0.3;
		cargo.castShadow = true;
		cargo.receiveShadow = true;
		truck.add(cargo);

		const cabin = new THREE.Mesh(
			new THREE.BoxBufferGeometry(0.5,0.7,0.7),
			[
				new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture_loader.load(texture) } ), // back
				new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture_loader.load(texture) } ),
				new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture_loader.load(texture) } ),
				new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture_loader.load(texture) } ),
				new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture_loader.load(texture) } ), // top
				new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture_loader.load(texture) } ) // bottom
			  ]
		);
		cabin.position.x=0.85;
		cabin.position.y=0.35;
		cabin.position.z=-0.23;
		cabin.castShadow = true;
		cabin.receiveShadow = true;
		truck.add(cabin);

		const frontWheel = Object.Wheel();
		frontWheel.position.x = -1.05;
		truck.add(frontWheel);

		const middleWheel = Object.Wheel();
		middleWheel.position.x = 0.18;
		truck.add(middleWheel);

		const backWheel = Object.Wheel();
		backWheel.position.x = 0.83;
		truck.add(backWheel);

		truck.position.z=-3;

		return truck;

	}
}

window.onload = Scene();


function buttons() {
	document.getElementById("home_page_rules").onclick = () => {
		document.getElementById("home_page").style.display = 'none';
		document.getElementById("rules").style.display = 'grid';
	}

	document.getElementById("rules_home_page").onclick = () => {
		document.getElementById("home_page").style.display = 'grid';
		document.getElementById("rules").style.display = 'none';
	}

	document.getElementById("home_page_start").onclick = () => {
		document.getElementById("home_page").style.display = 'none';
		document.getElementById("score").style.display = 'grid';
		score_div.innerText = 'SCORE: ' + score;
		money_div.innerText = 'MONEY: ' + money;
		running = true;
		/*setTimeout(()=> {
			collision()
			document.getElementById("score").style.display = 'none';
			document.getElementById("finish").style.display = 'grid';
		},1000);*/
	}

	document.getElementById("finish_home_page").onclick = () => {
		document.getElementById("finish").style.display = 'none';
		document.getElementById("home_page").style.display = 'grid';
	}

	document.getElementById("finish_replay").onclick = () => {
		document.getElementById("finish").style.display = 'none';
		replay();
		document.getElementById("score").style.display = 'grid';
	}
}

function replay() {
	score = 0;
	money = 0;
}

function collision() {
	/* se prende una macchina termina tutto*/
	finish()
}

function finish(){
	finish_score_div.innerHTML = 'Final Score: ' + score;
	finish_money_div.innerHTML = 'Final Money: ' + money;
	document.getElementById("finish").style.display = 'grid';
}

function update_score(){
	score += 1;
	score_div.innerHTML = 'SCORE: ' + score;

}

var animate = function() {
	requestAnimationFrame(animate);
	render();
};

function render() {
	renderer.render(scene,camera);
}

animate();