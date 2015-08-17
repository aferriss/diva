var w = window.innerWidth;
var h = window.innerHeight;

var container = document.getElementById("container");
var time = 0;


var scene, camScene, diffScene, fbScene;
var renderer;
var camera, orthoCamera;
var plane, skyBox;
var shader, diffShader, fbShader, blurShader, shader2;
var tex, fbTex, sceneTex, prevFrame; 
var videoTexture, videoImage, videoImageContext;
var sheets = [];
var mouseX, mouseY;
var box, quad;
var controls;
var updatePos = false;

var modelLoaded = false;
var semShader;
var randVals = [];
var textureArray = [];
var maxSize = 360;
var redIndex = 0;
var greenIndex = maxSize/3;
var blueIndex = (maxSize/3)*2;
var planeMaterial;
var combineShader, fs2;
var sepTex;
var inc = 0;
var pastFrame;
var reposShader;
var diffShader;
var colorShader;
var scene1, scene2, scene3, scene4, scene5;
var rtt, tex1, tex2, tex3, diffTex;

var video = document.createElement('video');
var petalCanvas, petalCanvasCtx;
var petals = [];

var numPetals = 6;
var numP = 300;

window.addEventListener( 'resize', onWindowResize, false );


function Petal(fileName, posX, posY){
  this.posX = posX;
  this.posY = posY;
  this.size = 10 + Math.random()*50;
  this.fileName = fileName;
  this.img = new Image();
  this.speed =  Math.random()*1;
  this.xSpeed = (Math.random()) - 0.5; 
}

Petal.prototype.loadImage = function(){
  this.img.onload  = onloadHandler;
  this.img.src = this.fileName;

};

Petal.prototype.update = function(){
  this.posY += this.speed;
  this.posX += this.xSpeed;
  if(this.posX > petalCanvas.width){
    this.posX = -60;
  }

  if(this.posX < 0 - 60){
    this.posX = petalCanvas.width;
  }

  if(this.posY > petalCanvas.height+60){
    this.posY = -60;
    this.posX = Math.random()*petalCanvas.width;
  }



  petalCanvasCtx.save();
    petalCanvasCtx.translate(this.posX, this.posY);
    petalCanvasCtx.rotate(this.posX * Math.PI/180);
    petalCanvasCtx.drawImage(this.img, 0,0, this.size, this.size);
  petalCanvasCtx.restore();
}


function loadPetals(){
  initWebcam();

  petalCanvas = document.getElementById("petalCanvas");
  petalCanvas.width = window.innerWidth;
  petalCanvas.height = window.innerHeight;
  petalCanvas.style.display = "none";
  petalCanvasCtx = petalCanvas.getContext("2d");
   
  video.width = petalCanvas.innerWidth;
  video.height = petalCanvas.innerHeight;

  var petalFiles = [];
  petalFiles[0] = "images/petals/1.png";
  petalFiles[1] = "images/petals/2.png";
  petalFiles[2] = "images/petals/3.png";
  petalFiles[3] = "images/petals/4.png";
  petalFiles[4] = "images/petals/5.png";
  petalFiles[5] = "images/petals/6.png";


  //petalCanvasCtx.drawImage(petals[0], 100, 100);
  for(var i = 0; i<numP; i++){

    var p = new Petal(petalFiles[Math.floor(Math.random()*6)], Math.random()*petalCanvas.width, Math.random()*petalCanvas.height);
    petals.push(p);
    petals[i].loadImage();

    //petalImg.onload = onloadHandler;
    //petalImg.src = petalFiles[i];
  }

   //drawPetals();
   init();
}


function drawPetals(){
  petalCanvasCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);   

  if(video.readyState === video.HAVE_ENOUGH_DATA){
    petalCanvasCtx.drawImage(video,0,0, petalCanvas.width, petalCanvas.height);
  }

  for(var i = 0; i<petals.length; i++){
    
    //console.log(petals[i].xPos);
    petals[i].update();
  }

  window.requestAnimationFrame(drawPetals);
}




loadPetals();





function onloadHandler(){
  numPetals --;
  if(numPetals === 0){
    drawPetals();
  }
}


function init(){
  //video = document.createElement( 'video');
  //video.src = "images/allOne.mp4";
  //video.load();
  //video.play();
  //video.volume = 0.0;

  videoImage = document.createElement('canvas');
  videoImage.width = 1280;
  videoImage.height = 720;

  videoImageContext = videoImage.getContext('2d');
  
  camScene = new THREE.Scene();
  sepScene = new THREE.Scene();
  scene1 = new THREE.Scene();
  scene2 = new THREE.Scene();
  scene3 = new THREE.Scene();
  scene4 = new THREE.Scene();
  scene5 = new THREE.Scene();

  orthoCamera = new THREE.OrthographicCamera( w/-2, w/2, h/2, h/-2, -10000, 10000);
  camera = new THREE.PerspectiveCamera(45, w/h, 0.1,40000);

  camScene.add(orthoCamera);
  sepScene.add(camera);

  scene1.add(orthoCamera);
  scene2.add(orthoCamera);
  scene3.add(orthoCamera);
  scene4.add(orthoCamera);
  scene5.add(orthoCamera);

  videoTexture = new THREE.Texture( petalCanvas );
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;

  sepTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  pastFrame = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  tex1 = new THREE.WebGLRenderTarget( w,h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  tex2 = new THREE.WebGLRenderTarget( w,h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  tex3 = new THREE.WebGLRenderTarget( w,h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });

  rtt = new THREE.WebGLRenderTarget( w,h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  diffTex = new THREE.WebGLRenderTarget( w,h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  

  
  diffShader = new THREE.ShaderMaterial({
    uniforms:{
      u_image: {type: 't', value: videoTexture},
      pastFrame: {type: 't', value: pastFrame },
      fbTex: {type: 't', value: tex1 }
    },
    vertexShader: document.getElementById('vertZoom').textContent,
    fragmentShader: document.getElementById('diff').textContent
  });

  reposShader = new THREE.ShaderMaterial({
    uniforms:{
      tex: {type: 't', value: tex1},
      tex2: {type: 't', value: tex3 },
      amt: {type: 'v2', value: new THREE.Vector2( 2.8/w, 2.8/h) },
        time: {type: 'f', value: inc}
      },
      vertexShader: document.getElementById('vertexShader').textContent,
      fragmentShader:document.getElementById('repos').textContent
  });

  colorShader = new THREE.ShaderMaterial({
    uniforms:{
      u_image: { type: 't', value: rtt},
      srcCanvas: {type: 't', value: videoTexture}
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader:document.getElementById('colorMap').textContent
  });



  diffShader.side = THREE.DoubleSide;
  diffShader.overdraw = true;


  var screenGeometry = new THREE.PlaneGeometry(w, h);



  quad = new THREE.Mesh(screenGeometry, diffShader);
  sepScene.add(quad);
  
  planeMaterial = new THREE.MeshBasicMaterial({map:videoTexture});
  quad = new THREE.Mesh(screenGeometry, planeMaterial);
  camScene.add(quad);

  quad = new THREE.Mesh(screenGeometry, reposShader);
  scene1.add(quad);

  planeMaterial = new THREE.MeshBasicMaterial( {map: rtt});
  quad = new THREE.Mesh(screenGeometry, planeMaterial);
  scene2.add(quad);

  var pplaneMaterial = new THREE.MeshBasicMaterial({map: diffTex});
  var pquad = new THREE.Mesh(screenGeometry, pplaneMaterial);
  scene4.add(pquad);

  var cQuad = new THREE.Mesh(screenGeometry, colorShader);
  scene5.add(cQuad);



  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer:false, alpha: true, antialias:false, precision: "highp"});
  renderer.setSize(window.innerWidth, window.innerHeight);
  //renderer.autoClear = false;


  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  //container.appendChild(video);
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'resize', onWindowResize, false );

  render();
}




function render(){
  time += 0.01;
  inc ++;

  reposShader.uniforms.time.value = inc;


  if(video.readyState === video.HAVE_ENOUGH_DATA){
    videoImageContext.drawImage(video,0,0);
    if(videoTexture){
      videoTexture.needsUpdate = true;
      updatePos = true;
    }
  }

  
  controls.update();

  if(inc > 100){
  //  reposShader.uniforms.tex2.value = tex1;
  }
  
  renderer.render(sepScene, orthoCamera, diffTex, true);
  renderer.render(camScene, orthoCamera, pastFrame, true);
  renderer.render(scene4, orthoCamera, tex3, true);

  //renderer.render(scene4, orthoCamera);

  renderer.render(scene1, orthoCamera, rtt, true);
  renderer.render(scene2, orthoCamera, tex1, true);
  //renderer.render(scene2, orthoCamera);

  renderer.render(scene5, orthoCamera);
  
  window.requestAnimationFrame(render);
}




function onWindowResize() {

  petalCanvas.width = window.innerWidth;
  petalCanvas.height = window.innerHeight;

  //camera.aspect = window.innerWidth / window.innerHeight;
  //camera.updateProjectionMatrix();


  //renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

  mouseX = ( event.clientX  );
  mouseY = ( event.clientY  );

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


