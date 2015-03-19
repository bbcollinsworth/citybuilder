var init = function() {

	var scene = new THREE.Scene();

	//setting up out camera...
	var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(7, 3, 7);
	camera.up = new THREE.Vector3(0, 1, 0);

	var cubes = [];

	var quake = false;
	var quakeStart;

	var camRotate = false;
	var timeChange = false;

	//setting up our scene renderer:
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMapEnabled = true;

	var skyColor = new THREE.Color(0.8, 0.9, 1);
	renderer.setClearColor(skyColor, 1);

	//can be attached to any HTML element
	document.body.appendChild(renderer.domElement);

	//----SCENE LIGHTS------

	var pointLight = new THREE.PointLight(0xffffff, 1, 50);
	pointLight.position.set(10, 10, 10);
	//scene.add(pointLight);

	var sunColor = new THREE.Color(1, 1, 0.9);
	var spotLight = new THREE.SpotLight(sunColor, 5, 100);
	spotLight.position.set(10, 10, 10);
	spotLight.target.position.set(0, 0, 0);
	spotLight.castShadow = true;

	spotLight.shadowCameraNear = 1;
	spotLight.shadowCameraFar = 50;
	spotLight.shadowCameraFov = 100;

	spotLight.shadowMapDarkness = 0.5;
	spotLight.shadowMapWidth = 2048;
	spotLight.shadowMapHeight = 2048;

	scene.add(spotLight);

	//-----SCENE OBJECTS-----

	//here we're creating a series of cubes that will be buildings

	//we'll use 2 for loops to make a grid of buildings from
	//-8 to 8 units wide, and same deep (change xBound for larger or smaller city)
	var xBound = 8;

	for (var x = xBound * -1; x <= xBound; x++) {
		for (var z = xBound * -1; z <= xBound; z++) {

			//every Three.js mesh object needs a geometry and material

			//==here's our geometry, with height randomized and connected to
			// how close a building is to city center:
			var height = ((xBound - Math.abs(1 * x)) + (xBound - Math.abs(1 * z)) + Math.random() * 5) * 0.32;

			var geometry = new THREE.BoxGeometry(0.5, height, 0.5);

			//here's our material, using a "shiny" Phong shader
			// we set the specular or "shine" color to equal that of the sun
			//(this must be updated every frame)
			var bldgColor = 0.2 + Math.random() * 0.4;
			var color = new THREE.Color(bldgColor, bldgColor, bldgColor - Math.random() * 0.2);

			var material = new THREE.MeshPhongMaterial({
				ambient: 0x999999,
				color: color,
				specular: sunColor,
				shininess: 50+Math.random()*20,
				shading: THREE.FlatShading
			});

			//now we create a mesh with the above geometry and material
			var cube = new THREE.Mesh(geometry, material);

			//...then we store it in an array, and set the position and shadow properties
			cubes.push(cube);
			cube.position.set(x, height * 0.5, z);
			cube.castShadow = true;
			cube.receiveShadow = true;
		}
	}

	//we run a second for loop to add our stored cube meshes to the scene
	//this allows us to change the properties of individual cubes later
	for (var i = 0; i < cubes.length; i++) {
		scene.add(cubes[i]);
	}

	//here we create a "ground" object with the same process:
	//create geometry, create material, create mesh, add to scene, set position and shadows
	var groundGeometry = new THREE.BoxGeometry(50, 0.5, 50);
	var groundMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0.8, 0.9, 0.5)});
	var ground = new THREE.Mesh(groundGeometry, groundMaterial);
	scene.add(ground);
	ground.position.set(0, 0, 0);
	ground.receiveShadow = true;

	//the below render loop runs 60 frames per second...so let's create
	//a 'frameCount' variable that increments once per render
	//We can use this to change the scene over time
	var frameCount = 0;

	//THIS IS YOUR UPDATE AND DRAW LOOP:
	var render = function() {

		//this creates an earthquake, called from our Button GUI below
		if (quake == true) {

			if (frameCount < quakeStart + 150) {
				var quakiness = Math.sin(frameCount) * 0.2;
				scene.position.set(quakiness, quakiness * 0.3, 0);
				scene.rotation.set(0, 0, quakiness * 0.1);

			} else {
				quake = false;
				scene.position.set(0, 0, 0);
				scene.rotation.set(0, 0, 0);
			}

		}

		//these are variables to make the camera orbit the scene...
		var camDistance = 10;
		var camPosX = Math.sin(frameCount * 0.001) * camDistance;
		var camPosY = 3;
		var camPosZ = Math.cos(frameCount * 0.001) * camDistance;

		if (camRotate == true) {
			camera.position.set(camPosX, camPosY, camPosZ);
		}

		camera.lookAt(new THREE.Vector3(0, camPosY, 0));

		//----LIGHT ORBIT and COLOR CHANGES:
		var sunDistance = 10;
		var sunX = Math.sin(frameCount * 0.01) * sunDistance;
		var sunY = Math.cos(frameCount * 0.01) * sunDistance;
		var sunZ = sunY;

		var timeMult = Math.abs(sunY) * 0.1;
		var sunR = 1;
		var sunG = 0.5 + timeMult * 0.5;
		var sunB = timeMult;


		skyR = 0.8;
		skyG = 0.2 + timeMult * 0.6;
		skyB = 1;


		//if (timeChange == true) {
			spotLight.position.set(sunX, Math.abs(sunY), sunZ);
			sunColor = new THREE.Color(sunR, sunG, sunB);
			skyColor = new THREE.Color(skyR, skyG, skyB);
		//}

		spotLight.color = sunColor;
		for (var i = 0; i < cubes.length; i++) {
			cubes[i].material.specular = sunColor;
		}

		renderer.setClearColor(skyColor, 1);

		//THIS CREATES distant haze in our scene
		scene.fog = new THREE.FogExp2(skyColor, 0.1);

		requestAnimationFrame(render);
		renderer.render(scene, camera);

		frameCount++;
	}

	//setting up our GUI interactions:
	var button = document.getElementById('quakeButton');
	button.addEventListener("click", function() {
		quake = true;
		quakeStart = frameCount;
	});

	// var todButton = document.getElementById('dayButton');
	// todButton.addEventListener("click", function() {
	// 	if (!timeChange) {
	// 		timeChange = true;
	// 	} else {
	// 		timeChange = false;
	// 	}
	// });

	var cameraButton = document.getElementById('camButton');
	cameraButton.addEventListener("click", function() {
		if (!camRotate) {
			camRotate = true;
		} else {
			camRotate = false;
		}
	});

	render();
}

init();