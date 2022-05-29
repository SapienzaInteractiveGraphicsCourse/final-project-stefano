import * as THREE from '../build/three.module.js';
import {GLTFLoader} from '../loaders/GLTFLoader.js';

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45 , window.innerWidth/window.innerHeight, 0.25, 1000 );
camera.position.set(5,5,5);
camera.lookAt(new THREE.Vector3(0,2,0));

scene.background = new THREE.Color(0xe0e0e0);

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const Light = new THREE.DirectionalLight(0xffffff);
Light.position.set(0,20,10);
scene.add(Light);

const loader = new GLTFLoader();
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

var animate = function () {
	requestAnimationFrame( animate );

	renderer.render( scene, camera );
};

animate();