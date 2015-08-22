var w = 300;// window.innerWidth;
var h = 225;//window.innerHeight;
var container = document.getElementById("container");
var videoLoaded = false;
var video = document.createElement('video');
video.width =w;// window.innerWidth;
video.height =h;// window.innerHeight;
var time = 0;

var container, scene, camScene, diffScene, fbScene, renderer, camera, orthoCamera, plane, skyBox, shader, diffShader, fbShader, blurShader, shader2, tex, fbTex, sceneTex, prevFrame, videoTexture, videoImage, videoImageContext;
var sheets = [];
var mouseX, mouseY;
var box, quad;
var leftEyeTracked = [0,0];
var rightEyeTracked = [0,0];
var leftCheek = rightCheek = leftHighCheek = rightHighCheek = leftMidCheek = rightMidCheek = noseMiddle = noseTop = noseBottom = leftBrowInner = leftBrowInnerLeft = leftBrowOuterRight = leftBrowOuter = rightBrowInner = rightBrowInnerRight = rightBrowOuterLeft = rightBrowOuter = mouthBottom = chinBottom = [0,0];
var leftEyeLeftSide = rightEyeRightSide = [0,0];
var leCube;
var reCube;
var updatePos = false;
var crystals = [];
var crystal;
var diamond;
var diamonds = [];
var diamondLoaded = false;
var modelLoaded = false;
var semShader;
var randVals = [];
var scaleBy = 4;
var ctracker;
var randXSpeeds = [];
var randYSpeeds = [];

function startTracker(){
  //video.width = 400;//window.innerWidth/4;
  //video.width = 300;//window.innerHeight/4;

  ctracker = new clm.tracker({searchWindow: 50});

  ctracker.init(pModel);
  ctracker.start(video);

  var canvasInput = document.getElementsByTagName('canvas')[0];
  canvasInput.width = window.innerWidth;
  canvasInput.height = window.innerHeight;
  console.log(canvasInput);
  var cc = canvasInput.getContext('2d');

  function drawFrame(){
    cc.clearRect(0,0,canvasInput.width, canvasInput.height);
    ctracker.draw(canvasInput);
    
    if(updatePos){
    var positions = ctracker.getCurrentPosition();

      leftEyeTracked = positions[27];
      rightEyeTracked = positions[32];

      leftCheek = positions[4];
      rightCheek = positions[10];
      leftHighCheek = positions[1];
      rightHighCheek = positions[13];
      leftMidCheek = positions[2];
      rightMidCheek = positions[12];

      noseMiddle = positions[41];
      noseTop = positions[33];
      noseBottom = positions[62];
      
      leftBrowOuter = positions[19];
      leftBrowOuterRight = positions[20];
      leftBrowInnerLeft = positions[21];
      leftBrowInner = positions[22];

      rightBrowInner = positions[18];
      rightBrowInnerRight = positions[17];
      rightBrowOuterLeft = positions[16];
      rightBrowOuter = positions[15];

      mouthBottom = positions[53];
      chinBottom = positions[7];

      rightEyeRightSide = positions[28];
      leftEyeLeftSide = positions[23];

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


  semShader = new THREE.ShaderMaterial({
    uniforms:{
      tex: {type: 't', value: THREE.ImageUtils.loadTexture('images/quartz.jpg')},
      tNormal: {type: 't', value: THREE.ImageUtils.loadTexture('images/2563-normalLight.jpg')},
      repeat: { type: 'v2', value: new THREE.Vector2(1,1) },
      useNormal: {type: 'f', value: 1 },
      useRim: {type: 'f', value: 0.5},
      rimPower: {type: 'f', value: 10.5},
      normalScale: {type: 'f', value: 1.05 },
      normalRepeat: {type: 'f', value: 1.0}
    },
    vertexShader: document.getElementById('semVert').textContent,
    fragmentShader: document.getElementById('semFrag').textContent,
    transparent: true,
    shading: THREE.SmoothShading,
    side: THREE.DoubleSide,
    wireframe: false
  });

  semShader.uniforms.tNormal.value.wrapS = semShader.uniforms.tNormal.value.wrapT = 
  THREE.RepeatWrapping;


  var light = new THREE.PointLight({color: 0xffffff});
  camScene.add(light);
  light.position.set(0,10,15);

  quad = new THREE.Mesh(screenGeometry, planeMaterial);
  camScene.add(quad);

  /*
  var eyeGeo = new THREE.CubeGeometry(15,15,15);
  leCube = new THREE.Mesh(eyeGeo, basicMat);
  camScene.add(leCube);  

  reCube = new THREE.Mesh(eyeGeo, basicMat);
  camScene.add(reCube);
  */

  loadCrystal();
  loadDiamonds();

  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer:false, alpha: true, antialias:true, precision: "highp"});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;
  container.appendChild(renderer.domElement);
  //container.appendChild(video);
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'resize', onWindowResize, false );

  render();
}


function dist(x1, y1, x2, y2){
  var d = Math.sqrt( (x2-=x1)*x2 + (y2-=y1)*y2 );
  return d;
}

function render(){
  time += 0.05;

  if(leftEyeTracked != undefined ){
    /*
    leCube.position.set(leftEyeTracked[0] - w/2, -leftEyeTracked[1] + h/2, 0);
    reCube.position.set(rightEyeTracked[0] - w/2, -rightEyeTracked[1] + h/2, 0);

    leCube.rotation.y = time*0.5;
    leCube.rotation.z = time*0.25;

    reCube.rotation.y = time*0.5;
    reCube.rotation.z = time*0.25;
    */
    if(modelLoaded){
      for(var i =0; i<crystals.length; i++){
        crystals[i].rotation.y = time*0.5+randVals[i];
      }

      crystals[0].position.set(leftCheek[0]  -w/2, -leftCheek[1] +h/2, 0);
      crystals[6].position.set(leftCheek[0] - w/2, -leftCheek[1] + h/2 - 25, 0);
      crystals[7].position.set(leftCheek[0] - w/2, -leftCheek[1] + h/2 - 45, 0);
      crystals[8].position.set(leftCheek[0] - w/2, -leftCheek[1] + h/2 - 55, 0);

      crystals[2].position.set(leftHighCheek[0] - w/2, -leftHighCheek[1] + h/2, 0);
      crystals[12].position.set(leftHighCheek[0] - w/2, -leftHighCheek[1] + h/2 - 10, 0);
      crystals[13].position.set(leftHighCheek[0] - w/2, -leftHighCheek[1] + h/2 -20, 0);
      crystals[14].position.set(leftHighCheek[0] - w/2, -leftHighCheek[1] + h/2 -30, 0);

      crystals[4].position.set(leftMidCheek[0] - w/2, -leftMidCheek[1] + h/2 , 0);
      crystals[15].position.set(leftMidCheek[0] - w/2, -leftMidCheek[1] + h/2 -10, 0);
      crystals[16].position.set(leftMidCheek[0] - w/2, -leftMidCheek[1] + h/2 - 20, 0);
      crystals[17].position.set(leftMidCheek[0] - w/2, -leftMidCheek[1] + h/2 - 30, 0);


      crystals[1].position.set(rightCheek[0] - w/2, -rightCheek[1] + h/2, 0);
      crystals[9].position.set(rightCheek[0] - w/2, -rightCheek[1] + h/2 -25, 0);
      crystals[10].position.set(rightCheek[0] - w/2, -rightCheek[1] + h/2 -45, 0);
      crystals[11].position.set(rightCheek[0] - w/2, -rightCheek[1] + h/2 -55, 0);


      crystals[3].position.set(rightHighCheek[0] - w/2, -rightHighCheek[1] + h/2, 0);
      crystals[18].position.set(rightHighCheek[0] - w/2, -rightHighCheek[1] + h/2 -10, 0);
      crystals[19].position.set(rightHighCheek[0] - w/2, -rightHighCheek[1] + h/2 -20, 0);
      crystals[20].position.set(rightHighCheek[0] - w/2, -rightHighCheek[1] + h/2 -30, 0);

      crystals[5].position.set(rightMidCheek[0] - w/2, -rightMidCheek[1] + h/2, 0);
      crystals[21].position.set(rightMidCheek[0] - w/2, -rightMidCheek[1] + h/2 -10, 0);
      crystals[22].position.set(rightMidCheek[0] - w/2, -rightMidCheek[1] + h/2 -20, 0);
      crystals[23].position.set(rightMidCheek[0] - w/2, -rightMidCheek[1] + h/2 -30, 0);

      //forehead
      crystals[24].position.set(noseTop[0] - w/2, -noseTop[1] + h/2 + 45, 0);

      var count = -200;
      for(var i = 25; i<35; i++ ){
        count+=40;
        crystals[i].position.set((noseTop[0] - w/2 )+count, (-noseTop[1] + h/2 + 75) - (Math.sin(4.7 + count/50)/2 + 0.5)*100, 0);
        crystals[i].rotation.z = 180 * Math.PI/180;

        if(i < 28 || i > 30){
          crystals[i+10].position.set((noseTop[0] - w/2 )+count, (-noseTop[1] + h/2 + 55) - (Math.sin(4.7 + count/50)/2 + 0.5)*100, 0);
          //crystals[i+10].rotation.z = 180 * Math.PI/180;
        }
        
        //crystals[i+10].rotation.z = 180 * Math.PI/180;

      }
    }

    if(diamondLoaded){
      for (var i = 0 ; i<diamonds.length; i++){
        //diamonds[i].rotation.z = -90 * Math.PI / 180;
        diamonds[i].rotation.y = time*0.5;
      }

      
      
      //nose diamonds
      diamonds[1].position.set(noseMiddle[0] - w/2, -noseMiddle[1] + h/2 + 0, 0); 
      diamonds[2].position.set(noseMiddle[0] - w/2, (-noseMiddle[1] + -noseBottom[1])/2 + h/2, 0); 
      diamonds[3].position.set(noseTop[0] - w/2, (-noseMiddle[1] + -noseTop[1])/2 + h/2, 0); 
      diamonds[4].position.set(noseTop[0] - w/2, -noseTop[1] + h/2 , 0); 
      diamonds[0].position.set(noseTop[0] - w/2, -noseTop[1] + h/2 + 30 , 0); 

      //brows
      diamonds[5].position.set(leftBrowInner[0] - w/2, -leftBrowInner[1] + h/2 , 0); 
      diamonds[6].position.set(rightBrowInner[0] - w/2 , -rightBrowInner[1] + h/2, 0); 
      diamonds[7].position.set( (noseTop[0]+leftBrowInner[0])/2 - w/2 ,(-noseTop[1]+ -leftBrowInner[1])/2 + h/2 , 0); 
      diamonds[8].position.set( (noseTop[0]+rightBrowInner[0])/2 - w/2 ,(-noseTop[1]+ -rightBrowInner[1])/2 + h/2 , 0); 
      diamonds[9].position.set(leftBrowInnerLeft[0] - w/2 , -leftBrowInnerLeft[1] + h/2 , 0); 
      diamonds[10].position.set(rightBrowInnerRight[0] - w/2, -rightBrowInnerRight[1] + h/2 , 0); 
      diamonds[11].position.set( (leftBrowInnerLeft[0] +leftBrowOuterRight[0])/2 - w/2, (-leftBrowInnerLeft[1]-leftBrowOuterRight[1])/2 + h/2 , 0); 
      diamonds[12].position.set( (rightBrowInnerRight[0] +rightBrowOuterLeft[0])/2 - w/2 , (-rightBrowInnerRight[1]+ -rightBrowOuterLeft[1])/2 + h/2 , 0);
      diamonds[13].position.set( leftBrowOuterRight[0] - w/2, -leftBrowOuterRight[1] + h/2 , 0); 
      diamonds[14].position.set( rightBrowOuterLeft[0] - w/2 , -rightBrowOuterLeft[1] + h/2 , 0); 

      //above nose
      diamonds[15].position.set(noseTop[0] - w/2, -noseTop[1] + h/2 + 9, 0); 
      diamonds[16].position.set(noseTop[0] - w/2, -noseTop[1] + h/2 + 15, 0);
      diamonds[26].position.set(noseTop[0] - w/2, -noseTop[1] + h/2 + 20, 0); 

      
      //under mouth
      diamonds[17].position.set(mouthBottom[0] - w/2, -mouthBottom[1] + h/2 , 0); 
      diamonds[18].position.set(mouthBottom[0] - w/2, (-chinBottom[1]+-mouthBottom[1])/2 + h/2 +5, 0); 
      diamonds[19].position.set(mouthBottom[0] - w/2, (-chinBottom[1]+-mouthBottom[1])/2 + h/2 - 2, 0); 

      //under left eye
      diamonds[20].position.set(leftEyeLeftSide[0] - w/2, -leftEyeLeftSide[1] + h/2+1 , 0); 
      diamonds[21].position.set(leftEyeLeftSide[0] - w/2 - 1, -leftEyeLeftSide[1] + h/2 -4, 0); 
      diamonds[22].position.set(leftEyeLeftSide[0] - w/2 - 2, -leftEyeLeftSide[1] + h/2 - 9, 0); 

      //under right eye
      diamonds[23].position.set(rightEyeRightSide[0] - w/2, -rightEyeRightSide[1] + h/2 +1 , 0); 
      diamonds[24].position.set(rightEyeRightSide[0] - w/2 + 1, -rightEyeRightSide[1] + h/2 -4, 0); 
      diamonds[25].position.set(rightEyeRightSide[0] - w/2 + 2, -rightEyeRightSide[1] + h/2 - 9, 0); 

      var diamondCount = -200;
      for(var i = 26; i<36; i++){
      diamondCount += 40;
      diamonds[i].position.set((noseTop[0] - w/2 )+diamondCount, (-noseTop[1] + h/2 + 90) - (Math.sin(4.7 + diamondCount/50)/2 + 0.5)*100, 0);

      if(i <29 || i > 31 ){
        diamonds[i+10].position.set((noseTop[0] - w/2 )+diamondCount, (-noseTop[1] + h/2 + 35) - (Math.sin(4.7 + diamondCount/50)/2 + 0.5)*100, 0);
      }

      if(i <29 || i > 31 ){
        diamonds[i+20].position.set((noseTop[0] - w/2 )+diamondCount, (-noseTop[1] + h/2 + 15) - (Math.sin(4.7 + diamondCount/50)/2 + 0.5)*100, 0);
      }
      }
    }
  } 

/*
if(ctracker.getScore() < 0.9){  
  if(diamondLoaded){
    for (var i =0; i < diamonds.length; i++) {
      //diamonds[i].position.set(Math.random()*window.innerWidth - w/2, Math.random()*window.innerHeight - h/2, 0 );
      diamonds[i].position.set(diamonds[i].position.x + randXSpeeds[i], diamonds[i].position.y + randYSpeeds[i], 0);
    }
  }
  if(modelLoaded){
    for(var i = 0; i<crystals.length; i++){
      //crystals[i].position.set(Math.random()*window.innerWidth - w/2, Math.random()*window.innerHeight - h/2, 0 );
      crystals[i].position.set(crystals[i].position.x + randXSpeeds[i], crystals[i].position.y + randYSpeeds[i], 0);
    }
  }
}
*/


  if(video.readyState === video.HAVE_ENOUGH_DATA){
    if(videoTexture){
      videoTexture.needsUpdate = true;
      updatePos = true;
    }
  }

  renderer.render(camScene, orthoCamera);


  window.requestAnimationFrame(render);
}


function loadCrystal(){
  var loader = new THREE.JSONLoader();

  loader.load('models/crystal.json', function(result){
    //assignUVs(result);
    result.verticesNeedUpdate = true;
    result.normalsNeedUpdate = true;
    result.uvsNeedUpdate = true;
    result.computeFaceNormals();
    result.computeVertexNormals();
    result.computeMorphNormals();
    result.computeTangents();
    
    for( var i = 0; i<65; i++){
      crystal = new THREE.Mesh(result, semShader);
      crystal.scale.set(30,30,30);
      crystal.position.set(-10000,0,0);
      camScene.add(crystal);
      crystals.push(crystal);

      randVals[i] = Math.random()*10;
    }
    crystals[0].scale.set(15,15,15);
    crystals[1].scale.set(15,15,15);
    crystals[2].scale.set(10,10,10);
    crystals[3].scale.set(10,10,10);
    crystals[4].scale.set(10,10,10);
    crystals[5].scale.set(10,10,10);
    crystals[6].scale.set(10,10,10);
    crystals[7].scale.set(10,10,10);
    crystals[8].scale.set(5,5,5);
    crystals[9].scale.set(10,10,10);
    crystals[10].scale.set(10,10,10);
    crystals[11].scale.set(5,5,5);

    crystals[12].scale.set(5,5,5);
    crystals[13].scale.set(5,5,5);
    crystals[14].scale.set(5,5,5);
    crystals[15].scale.set(5,5,5);
    crystals[16].scale.set(5,5,5);
    crystals[17].scale.set(5,5,5);
    crystals[18].scale.set(5,5,5);
    crystals[19].scale.set(5,5,5);
    crystals[20].scale.set(5,5,5);
    crystals[21].scale.set(5,5,5);
    crystals[22].scale.set(5,5,5);
    crystals[23].scale.set(5,5,5);
    crystals[24].rotation.z = -180 * Math.PI/180;
    modelLoaded = true;

    for(var i = 25; i<35; i++){
      crystals[i].scale.set(10,10,10);
      crystals[i+10].scale.set(10,10,10);
    }

  });
}


function loadDiamonds(){
  var loader = new THREE.JSONLoader();

  loader.load('models/diamond.json', function (result){
    result.verticesNeedUpdate = true;
    result.normalsNeedUpdate = true;
    result.uvsNeedUpdate = true;
    result.computeFaceNormals();
    result.computeVertexNormals();
    result.computeMorphNormals();
    result.computeTangents();
    for( var i = 0; i< 60; i++){
      diamond = new THREE.Mesh( result, semShader);
      diamond.rotation.x = -90 * Math.PI/180;
      diamond.position.set(-10000,0,0);
      diamond.scale.set(1.35,1.35,1.35);

      camScene.add(diamond);
      diamonds.push(diamond);

      randXSpeeds[i] = Math.random()*3 - 1.5;
      randYSpeeds[i] = Math.random()*3 - 1.5;
    }

    //brow stuff
    diamonds[11].scale.set(2,2,2);
    diamonds[12].scale.set(2,2,2);
    diamonds[13].scale.set(2.25,2.25,2.25);
    diamonds[14].scale.set(2.25,2.25,2.25);
    diamonds[15].scale.set(1.5,1.5,1.5);
    diamonds[16].scale.set(3,3,3);

    //under mouth
    diamonds[18].scale.set(2,2,2);
    diamonds[19].scale.set(3,10,3);

    //eye far edges
    diamonds[21].scale.set(2,2,2);
    diamonds[22].scale.set(3,3,3);
    diamonds[24].scale.set(2,2,2);
    diamonds[25].scale.set(3,3,3);

    diamondLoaded = true;

    for(var i = 26; i< 36; i++){
      diamonds[i+20].scale.set(3,20,3);
      diamonds[i+20].rotation.x = 00 * Math.PI/180;
    }
  });
}


function assignUVs(geometry) {


    geometry.computeBoundingBox();

    var max     = geometry.boundingBox.max;
    var min     = geometry.boundingBox.min;

    var offset  = new THREE.Vector2(0 - min.x, 0 - min.y);
    var range   = new THREE.Vector2(max.x - min.x, max.y - min.y);

    geometry.faceVertexUvs[0] = [];
    var faces = geometry.faces;

    for (i = 0; i < geometry.faces.length ; i++) {

      var v1 = geometry.vertices[faces[i].a];
      var v2 = geometry.vertices[faces[i].b];
      var v3 = geometry.vertices[faces[i].c];

      geometry.faceVertexUvs[0].push([
        new THREE.Vector2( ( v1.x + offset.x ) / range.x , ( v1.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v2.x + offset.x ) / range.x , ( v2.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v3.x + offset.x ) / range.x , ( v3.y + offset.y ) / range.y )
      ]);

    }

    geometry.uvsNeedUpdate = true;
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

  //canvasInput.width = w;
  //canvasInput.height = h;

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
        videoLoaded = true;
        
    }
 
    function videoError(e) {
      alert('Error' + error.code);
    }
  });
}

//container.appendChild(video);