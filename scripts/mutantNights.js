var w = window.innerWidth;
var h = window.innerHeight;
var container = document.getElementById("container");
var videoLoaded = false;
var video = document.createElement('video');
video.width = w;
video.height = h;
var time = 0;

var container, scene, screenScene, thirdScene, renderer, camera, screenCamera, plane, skyBox, shader, blurShader, shader2, tex, tex2, videoTexture, videoImage, videoImageContext;
//var time = Date.now();
var sheets = [];
var mouseX, mouseY;

function init(){
  scene = new THREE.Scene();
  screenScene = new THREE.Scene();
  thirdScene = new THREE.Scene();

  screenCamera = new THREE.OrthographicCamera( w/-2, w/2, h/2, h/-2, -10000, 10000);
  camera = new THREE.PerspectiveCamera(45, w/h, 0.1,40000);
  camera.position.set(0,0,10);
  scene.add(camera);
  screenScene.add(screenCamera);
  //thirdScene.add(camera);

  tex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  tex2 = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });

  videoTexture = new THREE.Texture( video );
  videoTexture.minFilter = THREE.LinearFilter;

  shader = new THREE.ShaderMaterial({
    uniforms: {
      u_image: {type: 't', value: videoTexture },
    },
    vertexShader: document.getElementById('dispVertexShader').textContent,
    fragmentShader: document.getElementById('baseShader').textContent,
    wireframe: false,
    transparent: true,
    side: THREE.DoubleSide
  });


  shader2 = new THREE.ShaderMaterial({
    uniforms: {
      tex: {type:'t', value: tex2 }
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fbShader').textContent,
    wireframe: false,
    transparent: true,
    side: THREE.DoubleSide
    });

  var skyGeom = new THREE.PlaneGeometry((w + 150), h +80);
  var prefix = "images/";
  var cubeFiles = ["greenGrad.jpg", "greenGrad.jpg", "greenGradBottom.png", "greenGradTop.jpg", "greenGrad.jpg", "greenGrad.jpg"];
  var materialArray = [];
  for(var i = 0; i<6; i++){
    materialArray.push(new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture(prefix+cubeFiles[i]),
      side: THREE.BackSide
    }));
  }
  //var skyMat = new THREE.MeshFaceMaterial(materialArray);
  var skyMat = new THREE.MeshBasicMaterial({map:tex, side:THREE.FrontSide});
  var rtt = new THREE.MeshBasicMaterial({map:tex2, side:THREE.FrontSide});
  skyBox = new THREE.Mesh(skyGeom, shader2);
  skyBox.position.z = -1525;
  scene.add(skyBox);

  var planeGeo = new THREE.PlaneGeometry(w, h);
  var plane = new THREE.Mesh(planeGeo, skyMat);
  screenScene.add(plane);

  var screenGeometry = new THREE.PlaneGeometry(w/5, h/10);
  screenGeometry.dynamic = true;
  screenGeometry.verticesNeedUpdate = true;
  screenGeometry.normalsNeedUpdate = true;
  screenGeometry.uvsNeedUpdate = true;
  screenGeometry.computeFaceNormals();
  screenGeometry.computeVertexNormals();
  screenGeometry.computeTangents();

  var tessellateModifier = new THREE.TessellateModifier( 1 );
  for( var i = 0; i<15; i++){
    tessellateModifier.modify(screenGeometry);
  }

 // for(var i = 0; i<3; i++){
    var quad = new THREE.Mesh(screenGeometry, shader);
    quad.position.set(0,0,-350);
    scene.add(quad);
  //  sheets.push(quad);
  //}

  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer:false, alpha: true, antialias:true});
  renderer.setSize(w, h);
  
  container.appendChild(renderer.domElement);

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'resize', onWindowResize, false );

  render();
}


function render(){
  time += 0.005;
  
  //shader2.uniforms.time.value = time;
  /*
  if(skyBox.position.z <= -90){
    skyBox.position.z += 0.5;
  } else if( skyBox.position.z >= -95){
    skyBox.position.z = -200; 
  }
  */
  skyBox.position.z = -500;

 // shader2.needsUpdate = true;
  if(video.readyState === video.HAVE_ENOUGH_DATA){
    if(videoTexture){
      videoTexture.needsUpdate = true;
    }
  }

  for(var i = 0; i<sheets.length; i++){
    //sheets[i].rotation.y = time;
    //sheets[i].position.z += (Math.random()*0.25);
  }

  shader.needsUpdate = true;

  renderer.render(scene, camera, tex, true);
  renderer.render(screenScene, screenCamera, tex2, true);
  renderer.render(scene, camera);
  shader.uniforms.u_image.value = videoTexture;

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

        var soundFile = document.createElement("audio");
        soundFile.preload = "auto";
        var sndSrc = document.createElement("source");
        sndSrc.src = "tracks/mutantNights.mp3";
        soundFile.appendChild(sndSrc);

        soundFile.load();
        soundFile.play();

        var webcamMsg = document.getElementById("enableWebcam");
        webcamMsg.style.display = "none";
    }
 
    function videoError(e) {
      alert('Error' + error.code);
    }
  })

//container.appendChild(video);