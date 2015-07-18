var w = window.innerWidth;
var h = window.innerHeight;

var container = document.getElementById("container");
var video = document.createElement('video');

video.width = w;
video.height = h;

var scene, camera, renderer;
var videoTexture;
var shader;
var quad;
var controls;
var time = 0;
var sheets = []; 
var shaders = [];
init();

function init(){
	initWebcam();

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 400000);
	camera.position.set(2000);
	scene.add(camera);

	videoTexture = new THREE.Texture(video);
	videoTexture.minFilter = THREE.LinearFilter;
	var screenGeometry = new THREE.PlaneGeometry(w, h);

	


	for( var i = 0; i<500; i++){
		shader = new THREE.ShaderMaterial({
	    uniforms:{
	      alpha: {type: 'f', value: 1.0/(1.0*i) },
	      u_image: {type: 't', value: videoTexture}
	      
	    },
	    vertexShader: document.getElementById('vertexShader').textContent,
	    fragmentShader: document.getElementById('passThrough').textContent
	  	});

		shader.transparent = true;
		shader.side = THREE.DoubleSide;

		shaders.push(shader);

		

		quad = new THREE.Mesh(screenGeometry, shaders[i]);
		shaders[i].uniforms.alpha.value = 0.2;
		var quadSet2 = new THREE.Mesh(screenGeometry, shaders[i]);

		quadSet2.position.set(-10,-10,i*25 - 200);
		quad.position.set(Math.random()*1000 - 500,Math.random()*1000 - 500,i*25 - 200);


		//quad.rotation.y = 45;
		//sheets.push(quad);
		sheets.push(quadSet2);
		
		
		scene.add(sheets[i]);
	}	

	renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer:false, alpha: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);
	controls = new THREE.OrbitControls( camera, renderer.domElement );

	render();

}


function render(){
	time += 0.01;
	if(video.readyState === video.HAVE_ENOUGH_DATA){
		if(videoTexture){
			videoTexture.needsUpdate = true;
		}
	}
	
	controls.update();
	renderer.render(scene, camera);

	window.requestAnimationFrame(render);
}





function initWebcam(){
  window.addEventListener('DOMContentLoaded', function(){
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
 
    if (navigator.getUserMedia) {       
        navigator.getUserMedia({video: true, audio: false}, handleVideo, videoError);
    }
 
    function handleVideo(stream) {
      var url = window.URL || window.webkitURL;
       video.src = url ? url.createObjectURL(stream) : stream;
        video.play();
        videoLoaded = true;
        
    }
 
    function videoError(e) {
      alert('Error' + error.code);
    }
  });
}