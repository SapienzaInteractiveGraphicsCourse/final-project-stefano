import * as THREE from '../build/three.module.js';
import {GLTFLoader} from '../loaders/GLTFLoader.js';

var score_div = document.getElementById("title_score");
var money_div = document.getElementById("money_score");

var score = 0;
var money = 0;

const loader = new GLTFLoader();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(50 , window.innerWidth/window.innerHeight, 0.25, 1000 );
var renderer = new THREE.WebGLRenderer();
const background_loader = new THREE.TextureLoader()
const Light = new THREE.DirectionalLight(0xffffff);

buttons()

window.onload = Scene();

function Scene() {
	camera.position.set(5,5,5);
	camera.lookAt(new THREE.Vector3(0,2,0));

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	background_loader.load('images/background.jpg', function(texture){
		scene.background = texture;
	});

	Light.position.set(0,20,10);
	scene.add(Light);

	document.getElementById("score").style.display = 'none';
	document.getElementById("finish").style.display = 'none';
	document.getElementById("rules").style.display = 'none';

	camera.position.z = 5;
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
	}
}

var animate = function () {
	requestAnimationFrame( animate );

	renderer.render( scene, camera );
};

animate();