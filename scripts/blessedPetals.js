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
var leftEye, rightEye;

var video = document.createElement('video');
video.width = w;
video.height = h;
var petalCanvas, petalCanvasCtx;
var petals = [];

var soundFile = document.createElement("audio");
soundFile.preload = "auto";
var sndSrc = document.createElement("source");
sndSrc.src = "tracks/blessed.mp3";
soundFile.appendChild(sndSrc);

soundFile.load();

var numPetals = 12;
var numP = 500;

var particleGroup, particleAttributes;

window.addEventListener( 'resize', onWindowResize, false );

function startTracker(){
  //smaller makes er faster!
  video.width = window.innerWidth /4;
  video.height = window.innerHeight /4;
  var cTracker = new clm.tracker({});
  cTracker.init(pModel);
  cTracker.start(video);

  function drawFrame(){
    if(updatePos){
      var positions = cTracker.getCurrentPosition();

      leftEye = positions[27];
      rightEye = positions[32];

    }

    requestAnimationFrame(drawFrame);
  }

  drawFrame();
}

var scaleBy = 4;

function Petal(fileName, posX, posY){
  this.posX = posX;
  this.posY = posY;
  this.size = 10 + Math.random()*30;
  this.fileName = fileName;
  this.img = new Image();
  this.speed =  Math.random()*5 - 2.5;
  this.xSpeed = (Math.random()*5) - 2.5; 
}

Petal.prototype.loadImage = function(){
  this.img.onload  = onloadHandler;
  this.img.src = this.fileName;

};

Petal.prototype.update = function(){
  this.posY += this.speed;
  this.posX += this.xSpeed;

  var pickOne = Math.random();
  
  var eyeDist = 1;
  if(leftEye != undefined){
    eyeDist = dist(leftEye[0], leftEye[1], rightEye[0], rightEye[1]);
  }
  if(this.posX > petalCanvas.width+60){
    if(leftEye != undefined && updatePos && dist(leftEye[0], leftEye[1], w/2, h/2) < w/2 && eyeDist > 10){
      if(pickOne <0.5){
        this.posX = leftEye[0]*scaleBy ;
        this.posY = leftEye[1]*scaleBy ;
      } else if(pickOne >=0.5){
        this.posX = rightEye[0]*scaleBy ;
        this.posY = rightEye[1]*scaleBy ;
      }
    } else{
      this.posX = -60;
    }
  }

  if(this.posX < -60){
     if(leftEye != undefined && updatePos && dist(leftEye[0], leftEye[1], w/2, h/2) < w/2  && eyeDist > 10){
      if(pickOne <0.5){
        this.posX = leftEye[0]*scaleBy ;
        this.posY = leftEye[1]*scaleBy ;
      } else if(pickOne >=0.5){
        this.posX = rightEye[0]*scaleBy ;
        this.posY = rightEye[1]*scaleBy ;
      }
    } else{
      this.posX = petalCanvas.width +59;
    }
  }

  if(this.posY > petalCanvas.height+60){
    if(leftEye != undefined && updatePos && dist(leftEye[0], leftEye[1], w/2, h/2) < w/2  && eyeDist > 10){
      if(pickOne <0.5){
        this.posX = leftEye[0]*scaleBy ;
        this.posY = leftEye[1]*scaleBy ;
      } else if(pickOne >=0.5){
        this.posX = rightEye[0]*scaleBy ;
        this.posY = rightEye[1] *scaleBy;
      }
      
    } else{
    this.posY = -60;
    this.posX = Math.random()*petalCanvas.width;
    }
    
  }

  if(this.posY < -60){
    if(leftEye != undefined && updatePos && dist(leftEye[0], leftEye[1], w/2, h/2) < w/2  && eyeDist > 10){
      if(pickOne <0.5){
        this.posX = leftEye[0]*scaleBy ;
        this.posY = leftEye[1]*scaleBy ;
      } else if(pickOne >=0.5){
        this.posX = rightEye[0]*scaleBy ;
        this.posY = rightEye[1]*scaleBy ;
      }
      
    } else{
    this.posY = petalCanvas.height + 60;
    this.posX = Math.random()*petalCanvas.width;
    }
    
  }




  petalCanvasCtx.save();
    petalCanvasCtx.translate(this.posX, this.posY);
    petalCanvasCtx.rotate(this.posX * Math.PI/180);
    petalCanvasCtx.drawImage(this.img, 0,0, this.size, this.size);
  petalCanvasCtx.restore();
}

function dist(x1, y1, x2, y2){
  var d = Math.sqrt( (x2-=x1)*x2 + (y2-=y1)*y2 );
  return d;
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
  petalFiles[6] = "images/petals/7.png";
  petalFiles[7] = "images/petals/8.png";
  petalFiles[8] = "images/petals/9.png";
  petalFiles[9] = "images/petals/10.png";
  petalFiles[10] = "images/petals/11.png";
  petalFiles[11] = "images/petals/12.png";


  //petalCanvasCtx.drawImage(petals[0], 100, 100);
  for(var i = 0; i<numP; i++){

    var p = new Petal(petalFiles[Math.floor(Math.random()*numPetals)], Math.random()*petalCanvas.width, Math.random()*petalCanvas.height);
    petals.push(p);
    petals[i].loadImage();

    //petalImg.onload = onloadHandler;
    //petalImg.src = petalFiles[i];
  }

   //drawPetals();
   var available = webglAvailable();
  if(!available){
  init();
  } else{
    alert("You need webgl to view this site! Try http://get.webgl.org/")
  }
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




//loadPetals();
init();




function onloadHandler(){
  numPetals --;
  if(numPetals === 0){
    drawPetals();
  }
}


function init(){
  initWebcam();
  //video = document.createElement( 'video');
  //video.src = "images/allOne.mp4";
  //video.load();
  //video.play();
  //video.volume = 0.0;

  videoImage = document.createElement('canvas');
  videoImage.width = 1280;
  videoImage.height = 720;

  videoImageContext = videoImage.getContext('2d');
  startTracker();

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

  videoTexture = new THREE.Texture( video );
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


/*
  quad = new THREE.Mesh(screenGeometry, diffShader);
  sepScene.add(quad);
  */
  planeMaterial = new THREE.MeshBasicMaterial({map:videoTexture});
  quad = new THREE.Mesh(screenGeometry, planeMaterial);
  //camScene.add(quad);


  sepScene.add(quad);

/*
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
*/
  var petal0 = new THREE.ImageUtils.loadTexture( 'images/petals/1.png');
  var petal1 = new THREE.ImageUtils.loadTexture( 'images/petals/2.png');
  var petal2 = new THREE.ImageUtils.loadTexture( 'images/petals/3.png');
  var petal3 = new THREE.ImageUtils.loadTexture( 'images/petals/4.png');
  var petal4 = new THREE.ImageUtils.loadTexture( 'images/petals/5.png');
  var petal5 = new THREE.ImageUtils.loadTexture( 'images/petals/6.png');
  var petal6 = new THREE.ImageUtils.loadTexture( 'images/petals/7.png');
  var petal7 = new THREE.ImageUtils.loadTexture( 'images/petals/8.png');
  var petal8 = new THREE.ImageUtils.loadTexture( 'images/petals/9.png');
  var petal9 = new THREE.ImageUtils.loadTexture( 'images/petals/10.png');
  var petal10 = new THREE.ImageUtils.loadTexture( 'images/petals/11.png');
  var petal11 = new THREE.ImageUtils.loadTexture( 'images/petals/12.png');

  var petalImages = [];
  petalImages[0] = petal0;
  petalImages[1] = petal1;
  petalImages[2] = petal2;
  petalImages[3] = petal3;
  petalImages[4] = petal4;
  petalImages[5] = petal5;
  petalImages[6] = petal6;
  petalImages[7] = petal7;
  petalImages[8] = petal8;
  petalImages[9] = petal9;
  petalImages[10] = petal10;
  petalImages[11] = petal11;

  particleGroup = new THREE.Object3D();
  particleAttributes = { startSize: [], startPosition:[], randomness:[], speedX:[], speedY:[], rotation:[] };

  var totalParticles = 2000;
  var radiusRange = 50;

  for(var i = 0; i<totalParticles; i++){
    var spriteMaterial = new THREE.SpriteMaterial( {map: petalImages[Math.floor(Math.random()*12)], useScreenCoordinates: true });
    var sprite = new THREE.Sprite(spriteMaterial);
    var pSize = Math.random()*30 + 5;
    sprite.scale.set(pSize,pSize,1);
    sprite.position.set(Math.random() * 100, Math.random() * 10);

    sprite.rotationAutoUpdate = false;
    sprite.material.rotation = Math.random() - 0.5;
    particleGroup.add(sprite);
    particleAttributes.startSize.push(pSize);
    particleAttributes.startPosition.push(sprite.position.clone());
    particleAttributes.randomness.push(Math.random() );
    particleAttributes.speedX.push(Math.random()*5 - 2.5 );
    particleAttributes.speedY.push(Math.random()*5 - 2.5 );
    particleAttributes.rotation.push(Math.random() - 0.5);
  }

  particleGroup.position.y = 50;
  sepScene.add(particleGroup);

  camera.position.set(0,150,400);
  camera.lookAt(sepScene.position);  

  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer:false, alpha: true, antialias:false, precision: "highp"});
  renderer.setSize(window.innerWidth, window.innerHeight);
  //renderer.autoClear = false;
  console.log(particleGroup.children[0]);

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
  var pickOne = Math.random();

  if(video.readyState === video.HAVE_ENOUGH_DATA){
    videoImageContext.drawImage(video,0,0);
    if(videoTexture){
      videoTexture.needsUpdate = true;
      updatePos = true;
    }
  }


  for ( var c = 0; c < particleGroup.children.length; c ++ ) {
    var sprite = particleGroup.children[ c ];

    /*
    var a = particleAttributes.randomness[c] + 1;
    var pulseFactor = Math.sin(a * time) * 2.1 + 0.9;
    sprite.position.x = particleAttributes.startPosition[c].x * pulseFactor;
    sprite.position.y = particleAttributes.startPosition[c].y * pulseFactor;
    sprite.position.z = particleAttributes.startPosition[c].z * pulseFactor;  
    */

    sprite.position.x += particleAttributes.speedX[c];
    sprite.position.y += particleAttributes.speedY[c];
    sprite.position.z = particleAttributes.startPosition[c].z; 
    sprite.material.rotation +=  particleAttributes.rotation[c] * 0.05; 




    if(sprite.position.x > window.innerWidth/2 + particleAttributes.startSize[c]){
      if(leftEye != undefined && updatePos){
        if(pickOne <0.5){
          sprite.position.x = leftEye[0]*scaleBy - window.innerWidth/2 ;
          sprite.position.y = window.innerHeight/2 - leftEye[1]*scaleBy -50 ;
          //console.log(leftEye[0]);
        } else if(pickOne >=0.5){
          sprite.position.x = rightEye[0]*scaleBy - window.innerWidth/2 ;
          sprite.position.y =window.innerHeight/2 - rightEye[1]*scaleBy -50;
        }
      } else{
        sprite.position.x = -window.innerWidth/2 - particleAttributes.startSize[c];
        sprite.position.y = Math.random()*window.innerHeight - window.innerHeight/2;
      }
    }

    if(sprite.position.x < -window.innerWidth/2 - particleAttributes.startSize[c]){
      if(leftEye != undefined && updatePos){
        if(pickOne <0.5){
          sprite.position.x = leftEye[0]*scaleBy - window.innerWidth/2 ;
          sprite.position.y = window.innerHeight/2 - leftEye[1]*scaleBy -50 ;
          //console.log(leftEye[0]);
        } else if(pickOne >=0.5){
          sprite.position.x = rightEye[0]*scaleBy - window.innerWidth/2 ;
          sprite.position.y =window.innerHeight/2 - rightEye[1]*scaleBy -50;
        }
      } else{
      sprite.position.x = window.innerWidth/2 + particleAttributes.startSize[c];
      sprite.position.y = Math.random()*window.innerHeight - window.innerHeight/2;
      }
    }

    if(sprite.position.y  > window.innerHeight/2 + particleAttributes.startSize[c]){

      if(leftEye != undefined && updatePos){
        if(pickOne <0.5){
          sprite.position.x = leftEye[0]*scaleBy - window.innerWidth/2 ;
          sprite.position.y = window.innerHeight/2 - leftEye[1]*scaleBy -50 ;
          //console.log(leftEye[0]);
        } else if(pickOne >=0.5){
          sprite.position.x = rightEye[0]*scaleBy - window.innerWidth/2 ;
          sprite.position.y =window.innerHeight/2 - rightEye[1]*scaleBy -50;
        }
      } else{
      sprite.position.y = -window.innerHeight/2 - 100;// particleAttributes.startSize[c];
      sprite.position.x = Math.random()*window.innerWidth - window.innerWidth/2;
      }
    }

    if(sprite.position.y < -window.innerHeight/2 - 100){// particleAttributes.startSize[c]){
     if(leftEye != undefined && updatePos){
        if(pickOne <0.5){
          sprite.position.x = leftEye[0]*scaleBy - window.innerWidth/2 ;
          sprite.position.y = window.innerHeight/2 - leftEye[1]*scaleBy  -50;
          //console.log(leftEye[0]);
        } else if(pickOne >=0.5){
          sprite.position.x = rightEye[0]*scaleBy - window.innerWidth/2 ;
          sprite.position.y =window.innerHeight/2 - rightEye[1]*scaleBy -50;
        }
      } else{
      sprite.position.y = window.innerHeight/2 + particleAttributes.startSize[c];
      sprite.position.x = Math.random()*window.innerWidth - window.innerWidth/2;
      }
    }
  }

  
  controls.update();

  if(inc > 100){
  //  reposShader.uniforms.tex2.value = tex1;
  }
  

  /*
  renderer.render(sepScene, orthoCamera, diffTex, true);
  renderer.render(camScene, orthoCamera, pastFrame, true);
  renderer.render(scene4, orthoCamera, tex3, true);

  //renderer.render(scene4, orthoCamera);

  renderer.render(scene1, orthoCamera, rtt, true);
  renderer.render(scene2, orthoCamera, tex1, true);
  //renderer.render(scene2, orthoCamera);

  renderer.render(scene5, orthoCamera);
  */
//renderer.render(camScene, orthoCamera);
renderer.render(sepScene, orthoCamera);


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


        soundFile.play();

        var webcamMsg = document.getElementById("enableWebcam");
        webcamMsg.style.display = "none";
        
    }
 
    function videoError(e) {
      alert("Something seems to be wrong with your webcam...");
    }
  });
}

function webglAvailable() {
    try {
        var canvas = document.createElement("testcanvas");
        return !!
            window.WebGLRenderingContext && 
            (canvas.getContext("webgl") || 
                canvas.getContext("experimental-webgl"));
    } catch(e) { 
        return false;
    } 
}


