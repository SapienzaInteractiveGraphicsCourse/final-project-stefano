import * as THREE from 'https://cdn.skypack.dev/three@0.134.0/build/three.module.js';
import {GLTFLoader} from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/libs/tween.module.min';

// update scores
var score_div = document.getElementById("title_score");
var money_div = document.getElementById("money_score");
var finish_score_div = document.getElementById("finish_score");
var finish_money_div = document.getElementById("finish_money");
var final_score_div = document.getElementById("final_score");
var score;
var money;

// animation
var front;
var back;
var left;
var right;
var running = false;
var game_over = false;
var tween1;
var tween2;
var tween3;
var tween4;
var prova;
var isJumping;
var megaJump;
var spawn;
var spawnA = [-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0]
var interval;

// scene and camera
const loader = new GLTFLoader();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(30 , window.innerWidth/window.innerHeight, 0.25, 1000 );
var renderer = new THREE.WebGLRenderer();

//light
const Light = new THREE.DirectionalLight(0xffffff);

// texture
const texture_loader = new THREE.TextureLoader()
const vehicleColors = [0xa52523, 0xbdb638, 0x78b14b];
var red_texture;
var green_texture;
var yellow_texture; 
var trunk_texture;
var car_texture;
var money_texture;

const treeHeights = [0.5,1,1.5];
const speeds = [0.02,0.025,0.03];

// generate lanes
var previous_lane;
var previous_index;
var next_lane;
var next_indexes;
var back_counter;
var lanes_mesh;
var indexes;
var model;
var current_lane;
var next_index;
var next;
var next2;
var previous;
var position;
const laneTypes = ['car', 'truck', 'forest'];

// class to generate a specific lane
class Lane {
	constructor(index) {
		const type = Math.floor(Math.random() * laneTypes.length);
		this.type = index <= 0 ? 'grass' : laneTypes[type];
		var position = 7-(index+8);

		switch (this.type) {
			case 'grass': {
				this.mesh = Object.Grass();
				this.mesh.position.z = position;
				break;
			}
			case 'car': {
				this.mesh = Object.Road();
				this.speed = speeds[Math.floor(Math.random()*speeds.length)];

				var i = 2;
				var timestamp = [];
				this.number_object = 0;

				this.vehicles = [1,2,3].map(() => {
					const vehicle = Object.Car();
					vehicle.position.x = -17;
					vehicle.userData.timestamp = Math.floor((Date.now()/1000))+Math.floor(((Math.random()*20)));
					for(var j=0; j<timestamp.length;j++){
						if(timestamp[j]==vehicle.userData.timestamp){
							vehicle.userData.timestamp +=3;
						}
					}
					i+=1;
					timestamp.push(vehicle.userData.timestamp);

					return vehicle;
				})

				var flag = Math.random() >= 0.5? flag=[1]:flag = [];


				this.moneys = flag.map(() => {
					const money = Object.Money();
					var pos = Math.floor(Math.random()*12);
					money.position.x = -6+pos;
					this.mesh.add(money);
					return money;
				})

				this.mesh.position.z = position;
				break;
			}
			case 'truck': {
				this.mesh = Object.Road();
				this.speed = speeds[Math.floor(Math.random()*speeds.length)];

				var i = 1;
				this.timestamp = []

				this.vehicles = [1,2,3].map(() => {
					const vehicle = Object.Truck();
					vehicle.position.x = -17;
					vehicle.userData.timestamp = Math.floor((Date.now()/1000))+Math.floor(((Math.random()*20)));
					for(var j=0; j<this.timestamp.length;j++){
						if(this.timestamp[j]==vehicle.userData.timestamp){
							vehicle.userData.timestamp +=3;
						}
					}
					i+=1;
					this.timestamp.push(vehicle.userData.timestamp);

					return vehicle;
				})

				this.number_object = 0;

				var flag = Math.random() >= 0.5? flag=[1]:flag = [];


				this.moneys = flag.map(() => {
					const money = Object.Money();
					var pos = Math.floor(Math.random()*12);
					money.position.x = -6+pos;
					this.mesh.add(money);
					return money;
				})
				this.mesh.position.z = position;
				break;
			}
			case 'forest': {
				this.mesh = Object.Grass();
				this.occupied = new Set();
				this.trees = [1,2,3,4,5].map(() => {
					const tree = Object.Tree();
					var pos = Math.floor(Math.random()*20);
					while(this.occupied.has(pos)){
						pos = Math.floor(Math.random()*20);
					}
					this.occupied.add(pos);
					tree.position.x = -13+pos;
					this.mesh.add(tree);
					return tree;
				});
				var flag = Math.random() >= 0.5? flag=[1]:flag = [];


				this.moneys = flag.map(() => {
					const money = Object.Money();
					var pos = Math.floor(Math.random()*12);
					while(this.occupied.has(pos)){
						pos= Math.floor(Math.random()*12);
					}
					this.occupied.add(pos);
					money.position.x = -13+pos;
					this.mesh.add(money);
					return money;
				})
				this.mesh.position.z = position;
				break;
			}
		}

	}
}

class Object {
	constructor() {}

	static Wheel() {
		const wheel = new THREE.Mesh(
			new THREE.BoxBufferGeometry(0.275,0.275,0.275),
			new THREE.MeshPhongMaterial({ color: 0x333333, flatShading: true})
		);
		return wheel;
	}

	static Car() {
		const car = new THREE.Group();
		const color = vehicleColors[Math.floor(Math.random()*vehicleColors.length)];
		var texture;
		if(color==0xa52523){
			texture = red_texture;
		}else if(color==0xbdb638){
			texture = yellow_texture;
		}else{
			texture = green_texture;
		}
		const main = new THREE.Mesh(
			new THREE.BoxBufferGeometry(0.8,0.3,0.5),
			new THREE.MeshPhongMaterial({color: 0xb4c6fc, flatShading:true, map: car_texture})
		);
		main.position.y = 0.6;
		main.position.x = 0.05;
		main.position.z = -0.1;
		main.castShadow = true;
		main.receiveShadow = true;
		car.add(main)
		
		const cabin = new THREE.Mesh(
		  new THREE.BoxBufferGeometry( 1.5, 0.4, 0.7 ), 
		  [
			new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture } ),
			new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture } ),
			new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture } ),
			new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture } ),
			new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture } ), // top
			new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture } ) // bottom
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

		car.position.z = 0.3;
		car.position.y= 0.1;

		car.userData = {type: 'car', timestamp: 0, spawn: spawnA[Math.floor(Math.random()*spawnA.length)]};

		car.scale.x=car.scale.y=car.scale.z=0.8;

		return car; 

	}

	static Tree() {
		const tree = new THREE.Group();

		const trunk = new THREE.Mesh(
			new THREE.BoxBufferGeometry(0.4,0.6,0.4),
			new THREE.MeshPhongMaterial({
				color: 0x4d2926, 
				flatShading: true,
				map: trunk_texture})
		);
		trunk.castShadow = true;
		trunk.receiveShadow = true;
		tree.add(trunk);
		const height = treeHeights[Math.floor(Math.random()*treeHeights.length)];
		const crown = new THREE.Mesh(
			new THREE.BoxBufferGeometry(0.6,height,0.6),
			new THREE.MeshPhongMaterial({
				color: 0x7aa21d, 
				flatShading: true})
		);
		crown.position.y = 0.45+((height-0.5)/2);
		crown.castShadow = true;
		crown.receiveShadow = false;
		tree.add(crown);

		tree.position.y = 0.1;

		tree.scale.x=tree.scale.y=tree.scale.z=0.8;

		tree.userData={height: height}

		return tree;

	}

	static Money() {
		const geometry = new THREE.CylinderGeometry( 0.25, 0.25, 0.08, 64 );

		const money = new THREE.Mesh(
			new THREE.CylinderGeometry( 0.25, 0.25, 0.08, 64 ),
			new THREE.MeshBasicMaterial({
				color: 0xbdb638,
				map: money_texture
			})
		);
		money.castShadow = true;
		money.receiveShadow = true;

		money.position.y=0.4;
		money.position.z=0;

		money.rotation.x += 30;
		money.rotation.y += 1.55;

		money.scale.x=money.scale.y=money.scale.z=0.8;
		
		money.userData = {type:'money'};

		return money;
	}

	static Truck() {
		const truck = new THREE.Group();
		const color = vehicleColors[Math.floor(Math.random()*vehicleColors.length)];
		var texture;
		if(color==0xa52523){
			texture = red_texture;
		}else if(color==0xbdb638){
			texture = yellow_texture;
		}else{
			texture = green_texture;
		}

		const base = new THREE.Mesh(
			new THREE.BoxBufferGeometry(2.15,0.2,0.2),
			new THREE.MeshPhongMaterial({color: 0xb4c6fc, flatShading: true, map: car_texture})
		);
		base.position.x=-0.08;
		base.position.y=0.275;
		base.position.z=-0.2;
		truck.add(base);

		const cargo = new THREE.Mesh(
			new THREE.BoxBufferGeometry(2,0.9,0.9),
			new THREE.MeshPhongMaterial({color: 0xb4c6fc, flatShading: true, map: car_texture})
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
				new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture } ), // back
				new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture } ),
				new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture } ),
				new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture } ),
				new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture } ), // top
				new THREE.MeshPhongMaterial( { color, flatShading: true, map: texture } ) // bottom
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

		truck.position.y = 0.1;
		truck.position.z = 0.3;

		truck.userData = {type: 'truck', timestamp: 0, spawn: spawnA[Math.floor(Math.random()*spawnA.length)]};

		truck.scale.x=truck.scale.y=truck.scale.z=0.8;

		return truck;

	}

	static Road() {
		const geometry = new THREE.BoxBufferGeometry(75,0.1,1);
		const material = new THREE.MeshBasicMaterial({
			color: 0x444444
		});
		const road = new THREE.Mesh(geometry, material);
		road.position.y = -0.2;
		scene.add(road);
		return road;
	}

	static Grass() {
		const geometry = new THREE.BoxBufferGeometry(75,0.1,1);
		const material = new THREE.MeshBasicMaterial({
			color: 0x78b14b
		});
		const grass = new THREE.Mesh(geometry, material);
		grass.position.y = -0.2;
		return grass;
	}
}

class Animator {
	constructor() {}

    static preprocessing(type, plus){
        var foot = 'Foot'+type;
        var xFoot = 0.0008*plus;
        var upperLeg = 'UpperLeg'+type;
        var lowerLeg = 'LowerLeg'+type;

        Animator.shoulder(type,plus);

        prova = model.getObjectByName(foot).position;

        tween4 = new TWEEN.Tween(prova)
		.to({x: prova.x, y:prova.y, z:prova.z}, 125)
		.easing(TWEEN.Easing.Quadratic.Out)

        tween3 = new TWEEN.Tween(prova)
		.to({x: prova.x+xFoot, y:prova.y+0.005, z:prova.z+0.005}, 125)
        .chain(tween4)
		.easing(TWEEN.Easing.Quadratic.Out)

        tween2 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},125)
        .chain(tween3)
		.easing(TWEEN.Easing.Quadratic.Out)

        tween1 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},125)
        .chain(tween2)
        .easing(TWEEN.Easing.Quadratic.Out)

        new TWEEN.Tween(prova)
		.to({x: prova.x+xFoot, y:prova.y+0.005, z:prova.z+0.005}, 125)
        .chain(tween1)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();

        prova = model.getObjectByName(upperLeg).rotation;

        tween4 = new TWEEN.Tween(prova)
		.to({x: prova.x, y:prova.y, z:prova.z}, 125)
        .easing(TWEEN.Easing.Quadratic.Out)

        tween3 = new TWEEN.Tween(prova)
		.to({x: prova.x-1, y:prova.y, z:prova.z}, 125)
        .chain(tween4)
        .easing(TWEEN.Easing.Quadratic.Out)

        tween2 = new TWEEN.Tween(prova)
		.to({x: prova.x, y:prova.y, z:prova.z}, 125)
        .chain(tween3)
        .easing(TWEEN.Easing.Quadratic.Out)

        tween1 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},125)
        .chain(tween2)
        .easing(TWEEN.Easing.Quadratic.Out)

		new TWEEN.Tween(prova)
		.to({x: prova.x-1, y:prova.y, z:prova.z}, 125)
        .chain(tween1)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();

        prova = model.getObjectByName(lowerLeg).rotation;

        tween4 = new TWEEN.Tween(prova)
		.to({x: prova.x, y:prova.y, z:prova.z}, 125)
        .easing(TWEEN.Easing.Quadratic.Out)

        tween3 = new TWEEN.Tween(prova)
		.to({x: prova.x+0.9, y:prova.y, z:prova.z}, 125)
        .chain(tween4)
        .easing(TWEEN.Easing.Quadratic.Out)

        tween2 = new TWEEN.Tween(prova)
		.to({x: prova.x, y:prova.y, z:prova.z}, 125)
        .chain(tween3)
        .easing(TWEEN.Easing.Quadratic.Out)

        tween1 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},125)
        .chain(tween2)
        .easing(TWEEN.Easing.Quadratic.Out)

		new TWEEN.Tween(prova)
		.to({x: prova.x+0.9, y:prova.y, z:prova.z}, 125)
        .chain(tween1)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();

    }

    static shoulder(type,plus){
        var shoulder = 'Shoulder'+type;
        var zShoulder = -1*plus;
        prova = model.getObjectByName(shoulder).rotation;

        tween3 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},125)
        .easing(TWEEN.Easing.Quadratic.Out)

        tween2 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z+zShoulder},250)
        .chain(tween3)
        .easing(TWEEN.Easing.Quadratic.Out)

        tween1 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},125)
        .chain(tween2)
        .easing(TWEEN.Easing.Quadratic.Out)

        new TWEEN.Tween(prova)
		.to({x: prova.x, y:prova.y, z:prova.z+zShoulder}, 125)
        .chain(tween1)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();
    }

	static jump(front, height,rotation){

        isJumping=true;

        Animator.preprocessing('L',-1);
        Animator.preprocessing('R',1);

		if(rotation != 0){
			prova = model.getObjectByName('RootNode').rotation;

			tween2 = new TWEEN.Tween(prova)
			.to({x: prova.x+rotation, y:prova.y, z:prova.z}, 375)
			.easing(TWEEN.Easing.Quadratic.Out)
		
			new TWEEN.Tween(prova)
			.to({x: prova.x, y:prova.y, z:prova.z}, 125)
			.chain(tween2)
			.easing(TWEEN.Easing.Quadratic.Out)
			.start();
		}

        prova =model.getObjectByName('RootNode').position;

        tween4 = new TWEEN.Tween(prova)
        .to({x: prova.x-0.3*(front/5), y: prova.y, z: prova.z+front}, 125)
        .onComplete(function() {
            isJumping = false;
			megaJump = false;
			document.getElementById("special_button").style.display = 'none';
        })
        .easing(TWEEN.Easing.Quadratic.Out)

        tween3 = new TWEEN.Tween(prova)
        .to({y: prova.y-0.5, z: prova.z+front}, 250)
        .chain(tween4)
        .easing(TWEEN.Easing.Quadratic.Out)

        tween2 = new TWEEN.Tween(prova)
        .to({y:prova.y+height,z:prova.z+front/2},125)
        .chain(tween3)
        .easing(TWEEN.Easing.Quadratic.Out)
        
        new TWEEN.Tween(prova)
        .to({y: prova.y-0.5, z: prova.z}, 125)
        .chain(tween2)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

		prova = camera.position;

		new TWEEN.Tween(prova)
		.to({z: prova.z-1*(front/5)}, 625)
		.easing(TWEEN.Easing.Quadratic.Out)
        .start();
	}

    static jumpSide(type){

        isJumping=true;

        Animator.preprocessing('L',-1);
        Animator.preprocessing('R',1);
        
        prova = model.getObjectByName('RootNode').rotation;

        tween2 = new TWEEN.Tween(prova)
        .to({x: prova.x, y:prova.y, z:prova.z+6.28*type}, 375)
        .easing(TWEEN.Easing.Quadratic.Out)

        new TWEEN.Tween(prova)
		.to({x: prova.x, y:prova.y, z:prova.z}, 125)
        .chain(tween2)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();

        prova = model.getObjectByName('RootNode').position;

        tween4 = new TWEEN.Tween(prova)
        .to({x: prova.x-5*type, y:prova.y, z:prova.z-0.3*type}, 125)
        .onComplete(function() {
			position +=1*type;
            isJumping = false;
        })
        .easing(TWEEN.Easing.Quadratic.Out)

        tween3 = new TWEEN.Tween(prova)
        .to({x: prova.x-5*type, y:prova.y-0.5, z:prova.z}, 250)
        .chain(tween4)
        .easing(TWEEN.Easing.Quadratic.Out)

        tween1 = new TWEEN.Tween(prova)
        .to({x: prova.x-2.5*type, y:prova.y+5, z:prova.z}, 125)
        .chain(tween3)
        .easing(TWEEN.Easing.Quadratic.Out)

        new TWEEN.Tween(prova)
		.to({x: prova.x, y:prova.y-0.5, z:prova.z}, 125)
        .chain(tween1)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();

		prova = camera.position;

		new TWEEN.Tween(prova)
		.to({x: prova.x+1*type}, 625)
		.easing(TWEEN.Easing.Quadratic.Out)
        .start();

    }

    static idle(){

		isJumping=true

        prova =model.getObjectByName('Neck').rotation;

        tween3 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},375)
        .easing(TWEEN.Easing.Quadratic.Out)

        tween2 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y+0.3,z:prova.z},375)
        .chain(tween3)
        .easing(TWEEN.Easing.Quadratic.Out)

        tween1 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},375)
        .chain(tween2)
        .easing(TWEEN.Easing.Quadratic.Out)

        new TWEEN.Tween(prova)
		.to({x: prova.x, y:prova.y-0.3, z:prova.z}, 375)
        .chain(tween1)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();


        prova = model.getObjectByName('UpperLegR').rotation;

        tween3 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},375)
        .easing(TWEEN.Easing.Quadratic.Out)

		tween2 = new TWEEN.Tween(prova)
		.to({x: prova.x-0.3, y:prova.y, z:prova.z}, 375)
        .chain(tween3)
		.easing(TWEEN.Easing.Quadratic.Out)

        tween1 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},375)
        .chain(tween2)
        .easing(TWEEN.Easing.Quadratic.Out)

		new TWEEN.Tween(prova)
		.to({x: prova.x-0.3, y:prova.y, z:prova.z}, 375)
        .chain(tween1)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();

        prova = model.getObjectByName('LowerLegR').rotation;

        tween3 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},375)
        .easing(TWEEN.Easing.Quadratic.Out)

		tween2 = new TWEEN.Tween(prova)
		.to({x: prova.x+0.3, y:prova.y, z:prova.z}, 375)
        .chain(tween3)
		.easing(TWEEN.Easing.Quadratic.Out)

        tween1 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},375)
        .chain(tween2)
        .easing(TWEEN.Easing.Quadratic.Out)

		new TWEEN.Tween(prova)
		.to({x: prova.x+0.3, y:prova.y, z:prova.z}, 375)
        .chain(tween1)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();

		prova = model.getObjectByName('UpperLegL').rotation;

        tween3 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},375)
        .easing(TWEEN.Easing.Quadratic.Out)

		tween2 = new TWEEN.Tween(prova)
		.to({x: prova.x-0.3, y:prova.y, z:prova.z}, 375)
        .chain(tween3)
		.easing(TWEEN.Easing.Quadratic.Out)

        tween1 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},375)
        .chain(tween2)
        .easing(TWEEN.Easing.Quadratic.Out)

		new TWEEN.Tween(prova)
		.to({x: prova.x-0.3, y:prova.y, z:prova.z}, 375)
        .chain(tween1)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();

        prova = model.getObjectByName('LowerLegL').rotation;

        tween3 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},375)
        .easing(TWEEN.Easing.Quadratic.Out)

		tween2 = new TWEEN.Tween(prova)
		.to({x: prova.x+0.3, y:prova.y, z:prova.z}, 375)
        .chain(tween3)
		.easing(TWEEN.Easing.Quadratic.Out)

        tween1 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},375)
        .chain(tween2)
        .easing(TWEEN.Easing.Quadratic.Out)

		new TWEEN.Tween(prova)
		.to({x: prova.x+0.3, y:prova.y, z:prova.z}, 375)
        .chain(tween1)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();

        prova = model.getObjectByName('Body').position;

        tween3 = new TWEEN.Tween(prova)
		.onComplete(function() {
			isJumping=false;
		})
        .to({x:prova.x,y:prova.y,z:prova.z},375)
        .easing(TWEEN.Easing.Quadratic.Out)

		tween2 = new TWEEN.Tween(prova)
		.to({x: prova.x, y:prova.y-0.001, z:prova.z}, 375)
        .chain(tween3)
		.easing(TWEEN.Easing.Quadratic.Out)

        tween1 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y,z:prova.z},375)
        .chain(tween2)
        .easing(TWEEN.Easing.Quadratic.Out)

		new TWEEN.Tween(prova)
		.to({x: prova.x, y:prova.y-0.001, z:prova.z}, 375)
        .chain(tween1)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();
    }

    static collect(){
        isJumping = true;

        Animator.preprocessing('L',-1);
        Animator.preprocessing('R',1);

        prova = model.getObjectByName('RootNode').rotation;
        tween2 = new TWEEN.Tween(prova)
        .to({x: prova.x, y:prova.y-6.3, z:prova.z}, 375)
        .easing(TWEEN.Easing.Quadratic.Out)
    
        new TWEEN.Tween(prova)
        .to({x: prova.x, y:prova.y, z:prova.z}, 125)
        .chain(tween2)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

        prova =model.getObjectByName('RootNode').position;

        tween4 = new TWEEN.Tween(prova)
        .to({x: prova.x, y: prova.y, z: prova.z}, 125)
        .onComplete(function() {
            isJumping = false;
        })
        .easing(TWEEN.Easing.Quadratic.Out)

        tween3 = new TWEEN.Tween(prova)
        .to({x: prova.x, y: prova.y-1, z: prova.z}, 250)
        .chain(tween4)
        .easing(TWEEN.Easing.Quadratic.Out)

        tween2 = new TWEEN.Tween(prova)
        .to({x:prova.x,y:prova.y+1,z:prova.z},125)
        .chain(tween3)
        .easing(TWEEN.Easing.Quadratic.Out)
        
        new TWEEN.Tween(prova)
        .to({x: prova.x, y: prova.y-1, z: prova.z}, 125)
        .chain(tween2)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    }

	static money(){

		for(var j=0;j<lanes_mesh.length;j++){
			for(var i=0;i<lanes_mesh[j].mesh.children.length;i++){
				if(lanes_mesh[j].mesh.children[i].userData.type=='money'){
					prova = lanes_mesh[j].mesh.children[i].position;

					tween2 = new TWEEN.Tween(prova)
					.to({x: prova.x, y:prova.y, z:prova.z}, 500)
					.easing(TWEEN.Easing.Quadratic.Out)
				
					new TWEEN.Tween(prova)
					.to({x: prova.x, y:prova.y-0.1, z:prova.z}, 500)
					.chain(tween2)
					.easing(TWEEN.Easing.Quadratic.Out)
					.start();
			
				}
			}
		}
	}
}


const generateLanes = () => indexes.map((index) => {
	const lane = new Lane(index);
	scene.add(lane.mesh);
	lanes_mesh.push(lane);
});

buttons()

window.onload = Scene();

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    animate()
}

function SetUp(){

	score = 0;
	money = 0;
	lanes_mesh=[];
	indexes = [];
	for (var i=-8;i<30;i++){
		indexes.push(i);
	}
	next_index = 9;
	generateLanes();
	interval = setInterval(Animator.money,1000);
	current_lane = lanes_mesh[next_index-1];
	next = lanes_mesh[next_index];
	previous = lanes_mesh[next_index-2];
	next2 = lanes_mesh[next_index+2];
	camera.position.set(4,5,5);
	loader.load('models/RobotExpressive.glb', function(gltf) {
		model = gltf.scene;
		model.position.x=-1;
		model.position.y=-0.1;
		model.position.z=-0.85;
		model.scale.x=model.scale.y=model.scale.z=0.2;
		model.rotation.y=3.2;
		document.addEventListener("keydown", onKeyDown, false);
		scene.add(model);
		position = model.position.x;
		running = true;
		previous_lane = [];
		previous_index = [];
		next_lane = [];
		next_indexes = [];
		front = true;
		back = true;
		left = true;
		right = true;
		spawn = true;
		megaJump = false;
		isJumping = false;
		back_counter = 0;
		document.getElementById("buttons").style.display = 'grid';
	}, undefined, function(e) {
		console.error(e);
	});
}

function Scene() {
	
	document.getElementById("home_page").style.display= 'grid';
	document.getElementById("score").style.display = 'none';
	document.getElementById("finish").style.display = 'none';
	document.getElementById("rules").style.display = 'none';
	document.getElementById("buttons").style.display = 'none';
	document.getElementById("special_button").style.display = 'none';

	camera.position.set(4,5,5);
	camera.lookAt(new THREE.Vector3(0,2,0));

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	texture_loader.load('images/background.jpg', function(texture){
		scene.background = texture;
	});

	texture_loader.load('images/trunk_texture.jpg', function(texture){
		trunk_texture = texture;
	});

	texture_loader.load('images/red_texture.jpg', function(texture){
		red_texture = texture;
	});

	texture_loader.load('images/green_texture.jpg', function(texture){
		green_texture = texture;
	});

	texture_loader.load('images/yellow_texture.jpg', function(texture){
		yellow_texture = texture;
	});

	texture_loader.load('images/car_texture.jpg', function(texture){
		car_texture = texture;
	});

	texture_loader.load('images/money_texture.jpg', function(texture){
		money_texture = texture;
	});

	Light.position.set(30,20,10);
	scene.add(Light);

	camera.position.z = 5;

	animate();
}

function buttons() {
	document.getElementById("button_up").onclick = (button) => {
		onKeyDown({keyCode: 38});
	}

	document.getElementById("button_down").onclick = (button) => {
		onKeyDown({keyCode: 40});
	}

	document.getElementById("button_left").onclick = (button) => {
		onKeyDown({keyCode: 37});
	}

	document.getElementById("button_right").onclick = (button) => {
		onKeyDown({keyCode: 39});
	}

	document.getElementById("space_button").onclick = (button) => {
		onKeyDown({keyCode: 32});
	}

	document.getElementById("home_page_rules").onclick = () => {
		document.getElementById("home_page").style.display = 'none';
		document.getElementById("rules").style.display = 'grid';
	}

	document.getElementById("rules_home_page").onclick = () => {
		document.getElementById("home_page").style.display = 'grid';
		document.getElementById("rules").style.display = 'none';
	}

	document.getElementById("home_page_start").onclick = () => {
		SetUp();
		document.getElementById("home_page").style.display = 'none';
		document.getElementById("score").style.display = 'grid';
		document.getElementById("buttons").style.display = 'grid';
		score_div.innerText = 'SCORE: ' + score;
		money_div.innerText = 'MONEY: ' + money;
	}

	document.getElementById("finish_home_page").onclick = () => {
		document.getElementById("finish").style.display = 'none';
		document.getElementById("home_page").style.display = 'grid';
	}

	document.getElementById("finish_replay").onclick = () => {
		Replay();
		document.getElementById("finish").style.display = 'none';
		document.getElementById("score").style.display = 'grid';
	}
}

function Clear() {
	for(var j=0;j<lanes_mesh.length;j++){
		scene.remove(lanes_mesh[j].mesh);
	}
	scene.remove(model);
	clearInterval(interval);
	game_over = false;
	running = false;
}

function Replay() {
	for(var j=0;j<lanes_mesh.length;j++){
		scene.remove(lanes_mesh[j].mesh);
	}
	model.position.set(-1,-0.1,-0.9);
	clearInterval(interval);
	SetUp();
	game_over = false;
}

function collision() {
	if(current_lane.type!='grass'){
		for(var j=0;j<current_lane.mesh.children.length;j++){
			if(current_lane.mesh.children[j].userData.type=='money'){
				if(current_lane.mesh.children[j].position.x==position){
					if(isJumping ==false) {
						current_lane.mesh.children.splice(j,1);
						money+=1;
						Animator.collect();
					}
				}
			}
		}
	}
	if(current_lane.type=='truck' || current_lane.type=='car'){
		var interval1;
		var interval2;
		for(var j=0;j<current_lane.mesh.children.length;j++){
			if(current_lane.mesh.children[j].userData.type=='car'){
				interval1 = (position - current_lane.speed)+0.95;
				interval2 = (position - current_lane.speed)-0.85;
			}
			if(current_lane.mesh.children[j].userData.type=='truck'){
				interval1 = (position - current_lane.speed)+2;
				interval2 = (position - current_lane.speed)-1;
			}
			if(current_lane.mesh.children[j].position.x>interval2 && current_lane.mesh.children[j].position.x<interval1){
				if(isJumping==false){
					game_over=true;
					running=false;
					document.getElementById("special_button").style.display = 'none';
					return;
				}
			}
		}
	}
	if(next.type=='truck' || next.type=='car'){
		front = true;
	}
	if(previous.type=='truck' || previous.type=='car'){
		back = true;
	}
	if(current_lane.type=='truck' || current_lane.type=='car'){
		right=true;
		left=true;
	}
	if(next.type=='forest'){
		for(var i=0;i<next.trees.length;i++){
			if(next.trees[i].position.x==position){
				if(next.trees[i].userData.height == treeHeights[2]){
					if(next2.type=='forest'){
						for(var j=0;j<next2.trees.length;j++){
							if(next2.trees[j].position.x == position){
								megaJump = false;
								front = false;
								document.getElementById("special_button").style.display = 'none';
								break;
							}
							megaJump=true;
							front=false;
							document.getElementById("special_button").style.display = 'grid';
						}
					}else{
						megaJump=true;
						front=false;
						document.getElementById("special_button").style.display = 'grid';
					}
					break;
				}else{
					megaJump= false;
					front = true;
					document.getElementById("special_button").style.display = 'none';
					break;
				}
			}
			front = true;
			megaJump = false;
			document.getElementById("special_button").style.display = 'none';
		}
	}
	if(previous.type=='forest'){
		for(var i=0;i<previous.trees.length;i++){
			if(previous.trees[i].position.x==position){
				back= false;
				break;
			}
			back = true;
		}
	}
	if(current_lane.type=='forest'){
		for(var i=0;i<current_lane.trees.length;i++){
			if(current_lane.trees[i].position.x==(position-1)){
				left=false;
				break;
			}
			left=true;
		}
		for(var i=0;i<current_lane.trees.length;i++){
			if(current_lane.trees[i].position.x==(position+1)){
				right=false;
				break;
			}
			right=true;
		}
	}
}

function finish(){
	Clear();
	finish_score_div.innerHTML = 'Score: ' + score;
	finish_money_div.innerHTML = 'Money: ' + money;
	final_score_div.innerHTML = 'Final Score: ' + (score+10*money);
	document.getElementById("buttons").style.display = 'none';
	document.getElementById("score").style.display = 'none';
	document.getElementById("finish").style.display = 'grid';
}

function update_score(){
	score_div.innerHTML = 'SCORE: ' + score;
	money_div.innerHTML = 'MONEY: ' + money;
}

function animation() {
	for(var i=0;i<lanes_mesh.length;i++){
		if(lanes_mesh[i].type == 'car' || lanes_mesh[i].type == 'truck'){
			if(lanes_mesh[i].number_object < 3){
				for(var j =0;j<lanes_mesh[i].vehicles.length;j++){
					if(lanes_mesh[i].vehicles[j].userData.timestamp < Math.floor(Date.now()/1000)){
						for(var t=0;t<lanes_mesh[i].mesh.children.length;t++){
							if(lanes_mesh[i].mesh.children[t].userData.type=='car' || lanes_mesh[i].mesh.children[t].userData.type=='truck'){
								if(lanes_mesh[i].mesh.children[t].position.x <lanes_mesh[i].vehicles[j].userData.spawn){
									spawn = false;
									break;
								}
								spawn = true;
							}
						}
						if(spawn == true){
							lanes_mesh[i].mesh.add(lanes_mesh[i].vehicles[j]);
							lanes_mesh[i].number_object+=1;
							lanes_mesh[i].vehicles.splice(j,1);
						}
					}
				}
			}
		}
		const mesh = lanes_mesh[i].mesh;
		for(var j=0; j<mesh.children.length;j++){
			if(mesh.children[j].userData.type == 'car' || mesh.children[j].userData.type == 'truck'){
				if(mesh.children[j].userData.timestamp < Math.floor(Date.now() / 1000)){
					if(mesh.children[j].position.x < 9){
						const add = mesh.children[j].position.x + lanes_mesh[i].speed;
						mesh.children[j].position.x = Math.round((add+Number.EPSILON)*100)/100;
					} else{
						var vehicle;
						if(mesh.children[j].userData.type == 'car'){
							vehicle = Object.Car();
						}else{
							vehicle = Object.Truck();
						}
						lanes_mesh[i].mesh.children.splice(j,1);
						vehicle.position.x = -15;
						lanes_mesh[i].vehicles.push(vehicle);
						lanes_mesh[i].number_object -=1;
					}
				}
			}
		}
	}
};

function animate(){
	requestAnimationFrame(animate);
	TWEEN.update();
	if(running){
		render();
	}
	renderer.render(scene,camera);
}

function render() {
	animation();
	collision();
	update_score();
	if(game_over==true){
		finish();
	}
	/*if(isJumping==false){
		Animator.idle();
	}*/
}

function onKeyDown(event){
	if(running == false || isJumping==true) return;
	var code = event.keyCode;
	const x = camera.position.x;
	const z = camera.position.z;
	switch(code){
		case 38:
			if(front == false || isJumping==true) break;
			if(back_counter == 0) {
				next_indexes.push(indexes[indexes.length-1]+1);
				next_lane.push(new Lane(next_indexes[next_indexes.length-1]));
				score+=1;
			}
			scene.add(next_lane[next_lane.length-1].mesh);
			indexes.push(next_indexes[next_indexes.length-1]);
			lanes_mesh.push(next_lane[next_lane.length-1]);
			previous = current_lane;
			current_lane = next;
			next = lanes_mesh[next_index];
			next2=lanes_mesh[next_index+2];
			if(current_lane == next){
				next = lanes_mesh[next_index+1];
				next2 = lanes_mesh[next_index+3];
			}
			Animator.jump(5,2,0);
			next_indexes.pop();
			next_lane.pop();
			back_counter = back_counter==0?0: back_counter-=1;

			previous_lane.push(lanes_mesh[0]);
			previous_index.push(indexes[0]);
			scene.remove(lanes_mesh[0].mesh);
			lanes_mesh.splice(0,1);
			indexes.splice(0,1);
			break;
		case 40:
			if(back == false || z==5) break;
			scene.add(previous_lane[previous_lane.length-1].mesh);
			var index_previous = [previous_index[previous_index.length-1]];
			indexes = index_previous.concat(indexes);
			var lane_previous = [previous_lane[previous_lane.length-1]];
			lanes_mesh = lane_previous.concat(lanes_mesh);
			next2 = lanes_mesh[next_index+1];
			next = current_lane;
			current_lane = previous;
			previous = lanes_mesh[next_index-1];
			if(current_lane == previous){
				previous = lanes_mesh[next_index-2];
			}
			Animator.jump(-5,5,-6.3);
			camera.position.z+=1;
			previous_index.pop();
			previous_lane.pop();
			back_counter+=1;

			next_lane.push(lanes_mesh[lanes_mesh.length-1]);
			next_indexes.push(indexes[indexes.length-1]);
			scene.remove(lanes_mesh[lanes_mesh.length-1].mesh);
			lanes_mesh.splice(lanes_mesh.length-1,1);
			indexes.splice(indexes.length-1,1);
			break;
		case 37:
			if(left==false || x==-8) break;
			Animator.jumpSide(-1);
			break;
		case 39:
			if(right==false || x==12) break;
			Animator.jumpSide(1);
			break;
		case 32:
			if(megaJump == false || isJumping==true) break;
			if(back_counter < 3){
				for(var i =0;i<3-back_counter;i++){
					next_indexes.push(indexes[indexes.length-1]+1);
					next_lane.push(new Lane(next_indexes[next_indexes.length-1]));
				}
				score+=3
			}
			scene.add(next_lane[next_lane.length-2].mesh);
			scene.add(next_lane[next_lane.length-1].mesh);
			indexes.push(next_indexes[next_indexes.length-2]);
			indexes.push(next_indexes[next_indexes.length-1]);
			lanes_mesh.push(next_lane[next_lane.length-2]);
			lanes_mesh.push(next_lane[next_lane.length-1]);
			previous = lanes_mesh[next_index+1];
			current_lane = lanes_mesh[next_index+2];
			next = lanes_mesh[next_index+3];
			next2 = lanes_mesh[next_index+4]
			if(current_lane == next){
				next = lanes_mesh[next_index+4];
				next2 = lanes_mesh[next_index+5]
			}
			Animator.jump(15,15,6.3);
			for(var i=0;i<3;i++){
				next_indexes.pop();
				next_lane.pop();
				previous_lane.push(lanes_mesh[0]);
				previous_index.push(indexes[0]);
				scene.remove(lanes_mesh[0].mesh);
				lanes_mesh.splice(0,1);
				indexes.splice(0,1);
			}
			back_counter = back_counter==0?0: back_counter-=3;
			break;
	}
}