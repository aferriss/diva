var w = window.innerWidth;
var h = window.innerHeight;
var container = document.getElementById("container");
var videoLoaded = false;
var video = document.createElement('video');
video.width = w;
video.height = h;
var time = 0;

var container, scene, camScene, diffScene, renderer, camera, orthoCamera, plane, skyBox, shader, diffShader, fbShader, blurShader, shader2, tex, prevFrame, videoTexture, videoImage, videoImageContext;
//var time = Date.now();
var sheets = [];
var mouseX, mouseY;

function init(){
  initWebcam();

  scene = new THREE.Scene();
  camScene = new THREE.Scene();
  diffScene = new THREE.Scene();

  orthoCamera = new THREE.OrthographicCamera( w/-2, w/2, h/2, h/-2, -10000, 10000);
  camera = new THREE.PerspectiveCamera(45, w/h, 0.1,40000);
  camera.position.set(0,0,10);
  scene.add(camera);
  camScene.add(orthoCamera);
  diffScene.add(orthoCamera);

  tex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  prevFrame = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });

  videoTexture = new THREE.Texture( video );
  videoTexture.minFilter = THREE.LinearFilter;

  shader = new THREE.ShaderMaterial({
    uniforms: {
      u_image: {type: 't', value: videoTexture },
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('baseShader').textContent,
    wireframe: false,
    transparent: true,
    side: THREE.DoubleSide
  });


  diffShader = new THREE.ShaderMaterial({
    uniforms: {
      prevFrame: {type: 't', value: prevFrame },
      videoTexture: {type: 't', value: videoTexture },
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('diffFs').textContent
  });

  fbShader = new THREE.ShaderMaterial({
    uniforms: {
      tex: {type: 't', value: tex }
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fbShader').textContent,
    transparent: true

  });


  var screenGeometry = new THREE.PlaneGeometry(w, h);
  var quad = new THREE.Mesh(screenGeometry, shader);
  camScene.add(quad);

  quad = new THREE.Mesh(screenGeometry, diffShader);
  diffScene.add(quad);

  quad = new THREE.Mesh(screenGeometry, fbShader);
  quad.position.set(0,0,-1000);
  scene.add(quad);

  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer:true, alpha: true, antialias:true});
  renderer.setSize(w, h);
  renderer.autoClear = false;
  container.appendChild(renderer.domElement);

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'resize', onWindowResize, false );

  render();
}


function render(){
  time += 0.005;
  
  if(video.readyState === video.HAVE_ENOUGH_DATA){
    if(videoTexture){
      videoTexture.needsUpdate = true;
    }
  }

  //render diff scene to tex
  renderer.render(diffScene, orthoCamera, tex, false);
  //capture previous frame
  renderer.render(camScene, orthoCamera, prevFrame, false);


  renderer.render(scene, orthoCamera);

  window.requestAnimationFrame(render);
}

function onDocumentMouseMove( event ) {

  mouseX = ( event.clientX  );
  mouseY = ( event.clientY  );

}

function onWindowResize() {

  w = window.innerWidth;
  h = window.innerHeight;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();


  renderer.setSize( window.innerWidth, window.innerHeight );

}

init();

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
        //video.src = window.URL.createObjectURL(stream);
        videoLoaded = true;
    }
 
    function videoError(e) {
      alert('Error' + error.code);
    }
  });
}

//container.appendChild(video);