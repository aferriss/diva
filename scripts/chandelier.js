var w = 400;
var h = 300;
var container = document.getElementById("container");
var videoLoaded = false;
var video = document.createElement('video');
video.width = w;
video.height = h;
var time = 0;

var container, scene, camScene, diffScene, fbScene, renderer, camera, orthoCamera, plane, skyBox, shader, diffShader, fbShader, blurShader, shader2, tex, fbTex, sceneTex, prevFrame, videoTexture, videoImage, videoImageContext;
var sheets = [];
var mouseX, mouseY;
var box, quad;
var leftEyeTracked = [0,0];
var rightEyeTracked = [0,0];
var leCube;
var reCube;
var updatePos = false;

function startTracker(){
  var ctracker = new clm.tracker({});
  ctracker.init(pModel);
  ctracker.start(video);

  var canvasInput = document.getElementsByTagName('canvas')[0];
  console.log(canvasInput);
  var cc = canvasInput.getContext('2d');

  function drawFrame(){
    cc.clearRect(0,0,canvasInput.width, canvasInput.height);
    //ctracker.draw(canvasInput);
    
    if(updatePos){
    var positions = ctracker.getCurrentPosition();
      leftEyeTracked = positions[27];
      //console.log(leftEyeTracked);
      rightEyeTracked = positions[32];
    }

    requestAnimationFrame(drawFrame);
  }

  drawFrame();
}


function init(){
  initWebcam();
  startTracker();
  camScene = new THREE.Scene();

  orthoCamera = new THREE.OrthographicCamera( w/-2, w/2, h/2, h/-2, -10000, 10000);
  camera = new THREE.PerspectiveCamera(45, w/h, 0.1,40000);

  camScene.add(orthoCamera);

  videoTexture = new THREE.Texture( video );
  videoTexture.minFilter = THREE.LinearFilter;

  var screenGeometry = new THREE.PlaneGeometry(w, h);
  var planeMaterial = new THREE.MeshBasicMaterial({map:videoTexture});
  var basicMat = new THREE.MeshPhongMaterial({color:0xffffff});

  var light = new THREE.PointLight({color: 0xffffff});
  camScene.add(light);
  light.position.set(0,10,15);

  quad = new THREE.Mesh(screenGeometry, planeMaterial);
  camScene.add(quad);

  var eyeGeo = new THREE.CubeGeometry(15,15,15);
  leCube = new THREE.Mesh(eyeGeo, basicMat);
  camScene.add(leCube);  

  reCube = new THREE.Mesh(eyeGeo, basicMat);
  camScene.add(reCube);

  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer:false, alpha: true, antialias:true});
  renderer.setSize(w,h);
  renderer.autoClear = false;
  container.appendChild(renderer.domElement);
  //container.appendChild(video);
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'resize', onWindowResize, false );

  render();
}


function render(){
  time += 0.05;

  if(leftEyeTracked != undefined){
  leCube.position.set(leftEyeTracked[0] - w/2, -leftEyeTracked[1] + h/2, 0);
  reCube.position.set(rightEyeTracked[0] - w/2, -rightEyeTracked[1] + h/2, 0);

  leCube.rotation.y = time*0.5;
  leCube.rotation.z = time*0.25;

  reCube.rotation.y = time*0.5;
  reCube.rotation.z = time*0.25;
  }
  if(video.readyState === video.HAVE_ENOUGH_DATA){
    if(videoTexture){
      videoTexture.needsUpdate = true;
      updatePos = true;
    }
  }

  renderer.render(camScene, orthoCamera);


  window.requestAnimationFrame(render);
}

function onDocumentMouseMove( event ) {

  mouseX = ( event.clientX  );
  mouseY = ( event.clientY  );

}

function onWindowResize() {

  //w = window.innerWidth;
  //h = window.innerHeight;

  //camera.aspect = window.innerWidth / window.innerHeight;
  //camera.updateProjectionMatrix();


  //renderer.setSize( window.innerWidth, window.innerHeight );

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
        videoLoaded = true;
        
    }
 
    function videoError(e) {
      alert('Error' + error.code);
    }
  });
}

//container.appendChild(video);