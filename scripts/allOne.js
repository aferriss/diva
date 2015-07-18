var w = window.innerWidth;
var h = window.innerHeight;
var container = document.getElementById("container");
var videoLoaded = false;
var video = document.createElement('video');
video.width = w;
video.height = h;
var time = 0;

var scene, camScene, diffScene, fbScene, renderer, camera, orthoCamera, plane, skyBox, shader, diffShader, fbShader, blurShader, shader2, tex, fbTex, sceneTex, prevFrame, videoTexture, videoImage, videoImageContext;
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

function init(){
  
  initWebcam();
  camScene = new THREE.Scene();
  sepScene = new THREE.Scene();

  orthoCamera = new THREE.OrthographicCamera( w/-2, w/2, h/2, h/-2, -10000, 10000);
  camera = new THREE.PerspectiveCamera(45, w/h, 0.1,40000);

  camScene.add(orthoCamera);
  sepScene.add(camera);


  videoTexture = new THREE.Texture( video );
  videoTexture.minFilter = THREE.LinearFilter;

  sepTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });

  var screenGeometry = new THREE.PlaneGeometry(w, h);
  planeMaterial = new THREE.MeshBasicMaterial({map:videoTexture});
  var basicMat = new THREE.MeshPhongMaterial({color:0xffff00});

  
  shader = new THREE.ShaderMaterial({
    uniforms:{
      u_image: {type: 't', value: videoTexture}
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('passThrough').textContent
  });

  shader.side = THREE.DoubleSide;

  planeMaterial = new THREE.MeshBasicMaterial({map:sepTex});

  var light = new THREE.PointLight({color: 0xffffff});
  //camScene.add(light);
  light.position.set(0,10,15);


  
  
  /*
  quad.position.set(0,0,-1000);
  sepScene.add(quad);
  quad.position.set(0,0,-1050);
  sepScene.add(quad);
  quad.position.set(0,0,-1100);
  sepScene.add(quad);
  quad.position.set(0,0,-1150);
  sepScene.add(quad);
  quad.position.set(0,0,-1200);
  sepScene.add(quad);
  */

  for(var i = 0; i<5; i++){
    quad = new THREE.Mesh(screenGeometry, shader);
    sheets.push(quad);
    sheets[i].position.set(0,0,-2000 - (i*50));
    sepScene.add(sheets[i]);
  }

  console.log(sheets);
  


  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer:false, alpha: true, antialias:true, precision: "highp"});
  renderer.setSize(window.innerWidth, window.innerHeight);
  //renderer.autoClear = false;

  

  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  //container.appendChild(video);
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'resize', onWindowResize, false );

  render();
}

var indexOfTextureToPutDataInto = 0;


function render(){
  time += 0.01;

  for(var i = 1; i<sheets.length; i++){
    sheets[i].rotation.y = time*i;
    sheets[i].position.z *= -10;
  }


  if(video.readyState === video.HAVE_ENOUGH_DATA){
    if(videoTexture){
      videoTexture.needsUpdate = true;
      updatePos = true;
    }
  }

  //renderer.render(camScene, orthoCamera, sepTex, true);
  controls.update();

  renderer.render(sepScene, camera);

  
  window.requestAnimationFrame(render);
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