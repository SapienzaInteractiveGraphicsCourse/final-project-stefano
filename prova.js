import * as THREE from 'https://cdn.skypack.dev/three@0.134.0/build/three.module.js';
//Creates scene and camera

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

//Creates renderer and adds it to the DOM

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//The Cylinder!

var geometry = new THREE.CylinderGeometry( 5, 5, 1, 64 );
//Yellow
var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
var cylinder = new THREE.Mesh( geometry, material );

cylinder.castShadow = true;
cylinder.receiveShadow = true;
cylinder.rotation.x = 30;
scene.add( cylinder );

//Sets camera's distance away from cube (using this explanation only for simplicity's sake - in reality this actually sets the 'depth' of the camera's position)

camera.position.z = 30;

//Rendering

function render() {
  requestAnimationFrame( render );
  cylinder.rotation.x +=0.05;
  renderer.render( scene, camera );
}
render();