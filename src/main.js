import * as THREE from 'https://cdn.skypack.dev/three@0.134.0/build/three.module.js';
import {GLTFLoader} from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/geometries/RoundedBoxGeometry.js';

var score_div = document.getElementById("title_score");
var money_div = document.getElementById("money_score");
var finish_score_div = document.getElementById("finish_score");
var finish_money_div = document.getElementById("finish_money");

var score = 0;
var money = 0;

var front = true;
var back = true;
var left = true;
var right = true;
var running = false;
var game_over = false;

const loader = new GLTFLoader();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(30 , window.innerWidth/window.innerHeight, 0.25, 1000 );
var renderer = new THREE.WebGLRenderer();
const texture_loader = new THREE.TextureLoader()
const Light = new THREE.DirectionalLight(0xffffff);
const vehicleColors = [0xa52523, 0xbdb638, 0x78b14b];
const vehicleTextures = ['images/red_texture.jpg','images/yellow_texture.jpg', 'images/green_texture.jpg'];
const treeHeights = [0.5,1,1.5];
const speeds = [0.01,0.02,0.03];

var previous_lane = [];
var previous_index = [];
var next_lane = [];
var next_indexes = [];
var back_counter = 0;
var lanes_mesh = [];
var indexes = [];
var model;
var current_lane;
var next_index = 9;
var next;
var previous;

const laneTypes = ['car', 'truck', 'forest'];

class Lane {
	constructor(index) {
		this.index = index;
		const types = Math.floor(Math.random() * laneTypes.length);
		this.type = index <= 0 ? 'grass' : laneTypes[types];

		switch (this.type) {
			case 'grass': {
				this.type = 'grass';
				this.mesh = Object.Grass();
				this.mesh.position.z = 7- ((index+8)*1);
				break;
			}
			case 'car': {
				this.type = 'car';
				this.mesh = Object.Road();
				this.direction = Math.random() >= 0.5;

				this.vehicles = [1,2,3].map(() => {
					const vehicle = Object.Car();
					vehicle.position.x = -15;
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

				this.mesh.position.z = 7- ((index+8)*1);
				this.speed = speeds[Math.floor(Math.random()*speeds.length)];
				break;
			}
			case 'truck': {
				this.type = 'truck';
				this.mesh = Object.Road();

				this.vehicles = [1,2,3].map(() => {
					const vehicle = Object.Truck();
					vehicle.position.x = -15;
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
				this.mesh.position.z = 7- ((index+8)*1);
				this.speed = speeds[Math.floor(Math.random()*speeds.length)];
				break;
			}
			case 'forest': {
				this.type = 'forest';
				this.mesh = Object.Grass();
				this.occupied = new Set();
				this.trees = [1,2,3,4,5,6].map(() => {
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
				this.mesh.position.z = 7- ((index+8)*1);
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
		const random =Math.floor(Math.random()*vehicleColors.length);
		const color = vehicleColors[random];
		const texture = vehicleTextures[random];
		const main = new THREE.Mesh(
			new THREE.BoxBufferGeometry(0.8,0.3,0.5),
			new THREE.MeshPhongMaterial({color, flatShading:true})
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
			new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true } ),
			new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true } ),
			new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true } ),
			new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true } ),
			new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true } ), // top
			new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true } ) // bottom
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

		car.userData = {type: 'car', timestamp: Math.floor(Date.now() / 1000)+Math.floor((Math.random()*20)+7)};

		car.scale.x=car.scale.y=car.scale.z=0.8;

		return car; 

	}

	static Tree() {
		const tree = new THREE.Group();

		const trunk = new THREE.Mesh(
			new THREE.BoxBufferGeometry(0.4,0.6,0.4),
			new THREE.MeshPhongMaterial({
				color: 0x4d2926, 
				flatShading: true})
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
		crown.position.y = 0.35+((height-0.5)/2);
		crown.castShadow = true;
		crown.receiveShadow = false;
		tree.add(crown);

		tree.position.y = 0.1;

		tree.scale.x=tree.scale.y=tree.scale.z=0.8;

		return tree;

	}

	static Money() {
		const money = new THREE.Mesh(
			new RoundedBoxGeometry( 0.4, 0.4, 0.4, 10, 2 ),
			new THREE.MeshPhongMaterial({
				color: 0xbdb638,
				flatShading: true
			})
		);
		money.castShadow = true;
		money.receiveShadow = true;

		money.position.y=0.3;
		money.position.z=0.1

		money.scale.x=money.scale.y=money.scale.z=0.8;
		
		money.userData = {type:'money'};

		return money;
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
			new THREE.MeshPhongMaterial({color: 0xb4c6fc, flatShading: true})
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
				new THREE.MeshPhongMaterial( { color, flatShading: true } ), // back
				new THREE.MeshPhongMaterial( { color, flatShading: true } ),
				new THREE.MeshPhongMaterial( { color, flatShading: true } ),
				new THREE.MeshPhongMaterial( { color, flatShading: true } ),
				new THREE.MeshPhongMaterial( { color, flatShading: true } ), // top
				new THREE.MeshPhongMaterial( { color, flatShading: true } ) // bottom
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

		truck.userData = {type: 'truck', timestamp: Math.floor(Date.now() / 1000)+Math.floor((Math.random()*20)+7)};

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

for (var i=-8;i<28;i++){
	indexes.push(i);
}


const generateLanes = () => indexes.map((index) => {
	const lane = new Lane(index);
	lanes_mesh.push(lane);
	scene.add(lane.mesh);
});

buttons()

window.onload = Scene();

function SetUp(){
	generateLanes();
	current_lane = lanes_mesh[next_index-1];
	next = lanes_mesh[next_index];
	previous = lanes_mesh[next_index-2];
	loader.load('models/RobotExpressive.glb', function(gltf) {
		model = gltf.scene;
		model.position.x=-1;
		model.position.y=-0.1;
		model.position.z=-0.9;
		model.scale.x=model.scale.y=model.scale.z=0.2;
		model.rotation.y=3.3;
		document.addEventListener("keydown", onKeyDown, false);
		scene.add(model);
		running = true;
		
	}, undefined, function(e) {
		console.error(e);
	});

}

function Scene() {
	
	document.getElementById("home_page").style.display= 'grid';
	document.getElementById("score").style.display = 'none';
	document.getElementById("finish").style.display = 'none';
	document.getElementById("rules").style.display = 'none';

	camera.position.set(4,5,5);
	camera.lookAt(new THREE.Vector3(0,2,0));

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	texture_loader.load('images/background.jpg', function(texture){
		scene.background = texture;
	});

	Light.position.set(30,20,10);
	scene.add(Light);

	camera.position.z = 5;

	animate();
}


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
		SetUp();
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
	for(var j=0;j<lanes_mesh.length;j++){
		scene.remove(lanes_mesh[j].mesh);
	}
	generateLanes();
	model.position.set(-1,-0.1,-0.9);
	camera.position.set(4,5,5);
	running = true;
}

function collision() {
	if(current_lane.type!='grass'){
		for(var j=0;j<current_lane.mesh.children.length;j++){
			if(current_lane.mesh.children[j].userData.type=='money'){
				if(current_lane.mesh.children[j].position.x==model.position.x){
					current_lane.mesh.children.splice(j,1);
					money+=1;
				}
			}
		}
	}
	if(current_lane.type=='truck' || current_lane.type=='car'){
		for(var j=0;j<current_lane.mesh.children.length;j++){
			if(current_lane.mesh.children[j].userData.type=='car'){
				const car = (model.position.x - current_lane.speed)-0.6;
				console.log('car');
				console.log(current_lane.mesh.children[j].position.x);
				console.log('model');
				console.log(car);
				if(current_lane.mesh.children[j].position.x==car){
					game_over=true;
					running=false;
				}
			}
			if(current_lane.mesh.children[j].userData.type=='truck'){
				const truck = (model.position.x - current_lane.speed)-0.9;
				console.log('truck');
				console.log(current_lane.mesh.children[j].position.x);
				console.log('model');
				console.log(truck);
				if(current_lane.mesh.children[j].position.x==truck){
					game_over=true;
					running=false;
				}
			}
		}
	}
	if(next.type=='truck' || next.type=='car'){
		front = true;
		back= true;
	}
	if(current_lane.type=='truck' || current_lane.type=='car'){
		right=true;
		left=true;
	}
	if(next.type=='forest'){
		for(var i=0;i<next.trees.length;i++){
			if(next.trees[i].position.x==model.position.x){
				front = false;
				break;
			}
			front = true;
		}
	}else{
		front = true;
	}
	if(previous.type=='forest'){
		for(var i=0;i<previous.trees.length;i++){
			if(previous.trees[i].position.x==model.position.x){
				back= false;
				break;
			}
			back = true;
		}
	}else{
		back = true;
	}
	if(current_lane.type=='forest'){
		for(var i=0;i<current_lane.type.length;i++){
			if(current_lane.trees[i].position.x==(model.position.x-1)){
				left=false;
				break;
			}
			left=true;
		}
		for(var i=0;i<current_lane.type.length;i++){
			if(current_lane.trees[i].position.x==(model.position.x+1)){
				right=false;
				break;
			}
			right=true;
		}
	}
}

function finish(){
	finish_score_div.innerHTML = 'Final Score: ' + score;
	finish_money_div.innerHTML = 'Final Money: ' + money;
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
						lanes_mesh[i].mesh.add(lanes_mesh[i].vehicles[j]);
						scene.add(lanes_mesh[i].mesh);
						lanes_mesh[i].number_object+=1;
						lanes_mesh[i].vehicles.splice(j,1);
					}
				}
			}
		}
		const mesh = lanes_mesh[i].mesh;
		for(var j=0; j<mesh.children.length;j++){
			if(mesh.children[j].userData.type == 'car' || mesh.children[j].userData.type == 'truck'){
				if(mesh.children[j].userData.timestamp < Math.floor(Date.now() / 1000)){
					if(mesh.children[j].position.x < 4){
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
						lanes_mesh[i].mesh.add(vehicle);
					}
				}
			}
		}
	}
};

function animate(){
	requestAnimationFrame(animate);
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
}

function onKeyDown(event){
	if(running == false) return;
	var code = event.keyCode;
	const x = camera.position.x;
	const y = camera.position.y;
	const z = camera.position.z;
	switch(code){
		case 38:
				if(front == false) break;
				if(back_counter == 0) {
					next_indexes.push(indexes[indexes.length-1]+1);
					next_lane.push(new Lane(next_indexes[next_indexes.length-1]));
					score+=1;
				}
				scene.add(next_lane[next_lane.length-1].mesh);
				indexes.push(next_indexes[next_indexes.length-1]);
				lanes_mesh.push(next_lane[next_lane.length-1]);
				model.position.z-=1;
				previous = current_lane;
				current_lane = next;
				next = lanes_mesh[next_index];
				if(current_lane == next){
					next = lanes_mesh[next_index+1];
				}
				camera.position.set(x,y,z-1);
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
			if(back == false) break;
			if(z==5) break;
			back_counter+=1;
			scene.add(previous_lane[previous_lane.length-1].mesh);
			var index_previous = [previous_index[previous_index.length-1]];
			indexes = index_previous.concat(indexes);
			var lane_previous = [previous_lane[previous_lane.length-1]];
			lanes_mesh = lane_previous.concat(lanes_mesh);
			model.position.z+=1;
			next = current_lane;
			current_lane = previous;
			previous = lanes_mesh[next_index-1];
			if(current_lane == previous){
				previous = lanes_mesh[next_index-2];
			}
			camera.position.set(x,y,z+1);
			previous_index.pop();
			previous_lane.pop();


			next_lane.push(lanes_mesh[lanes_mesh.length-1]);
			next_indexes.push(indexes[indexes.length-1]);
			scene.remove(lanes_mesh[lanes_mesh.length-1].mesh);
			lanes_mesh.splice(lanes_mesh.length-1,1);
			indexes.splice(indexes.length-1,1);
			break;
		case 37:
			if(left==false) break;
			if(x== -5) break;
			model.position.x = model.position.x -1;
			model.position.x = Math.round((model.position.x+Number.EPSILON)*100)/100;
			camera.position.set(x-1,y,z);
			break;
		case 39:
			if(right==false) break;
			if(x==10) break;
			model.position.x = model.position.x +1;
			model.position.x = Math.round((model.position.x+Number.EPSILON)*100)/100;
			camera.position.set(x+1,y,z);
			break;
	}
}