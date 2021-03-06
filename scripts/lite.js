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
var soundFile;

function init(){
  soundFile = document.createElement("audio");
  soundFile.preload = "auto";
  var sndSrc = document.createElement("source");
  sndSrc.src = "tracks/lite.mp3";
  soundFile.appendChild(sndSrc);

  soundFile.load();
  
  initWebcam();
  camScene = new THREE.Scene();
  sepScene = new THREE.Scene();

  orthoCamera = new THREE.OrthographicCamera( w/-2, w/2, h/2, h/-2, -10000, 10000);
  camera = new THREE.PerspectiveCamera(45, w/h, 0.1,40000);

  camScene.add(orthoCamera);
  sepScene.add(orthoCamera);

  videoTexture = new THREE.Texture( video );
  videoTexture.minFilter = THREE.LinearFilter;

  sepTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });

  var screenGeometry = new THREE.PlaneGeometry(w, h);
  planeMaterial = new THREE.MeshBasicMaterial({map:videoTexture});
  var basicMat = new THREE.MeshPhongMaterial({color:0xffffff});

  combineShader = new THREE.ShaderMaterial({
    uniforms:{
      u_image: { type: 't', value: videoTexture},
      u_image2: { type: 't', value: videoTexture},
      u_image3: { type: 't', value: videoTexture},
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('combineFs').textContent
  });

  


  fs2 = new THREE.ShaderMaterial({
    uniforms:{
      u_image: { type: 't', value: sepTex},
      inc: {type: 'f', value: 0}
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fs2').textContent
  });

  planeMaterial = new THREE.MeshBasicMaterial({map:sepTex});

  var light = new THREE.PointLight({color: 0xffffff});
  camScene.add(light);
  light.position.set(0,10,15);

  quad = new THREE.Mesh(screenGeometry, combineShader);
  camScene.add(quad);


  quad = new THREE.Mesh(screenGeometry, fs2);
  sepScene.add(quad);
  /*
  var eyeGeo = new THREE.CubeGeometry(15,15,15);
  leCube = new THREE.Mesh(eyeGeo, basicMat);
  camScene.add(leCube);  

  reCube = new THREE.Mesh(eyeGeo, basicMat);
  camScene.add(reCube);
  */


  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer:false, alpha: true, antialias:true, precision: "highp"});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;
  container.appendChild(renderer.domElement);
  //container.appendChild(video);
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'resize', onWindowResize, false );

  render();
}

var indexOfTextureToPutDataInto = 0;


var getTextureToPutDataInto = function(){
  if(textureArray.length == maxSize){
    var tex = textureArray[indexOfTextureToPutDataInto];
    indexOfTextureToPutDataInto = (indexOfTextureToPutDataInto + 1) % maxSize;
    return tex;
  }

  //var tex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  var tex = new THREE.Texture();
  textureArray.push(tex);
  return tex;
}

var fillTexWithData = function(tex, webcamFeed){
  tex.needsUpdate = true;
  tex.image = webcamFeed;
}

function render(){
  time += 0.01;


  if(video.readyState === video.HAVE_ENOUGH_DATA){
    if(videoTexture){
      videoTexture.needsUpdate = true;
      updatePos = true;


      var tex = getTextureToPutDataInto();
      fillTexWithData(tex, video);

      var red = textureArray[redIndex];
      redIndex = (redIndex+1) % maxSize;

      var green = textureArray[greenIndex];
      greenIndex = (greenIndex+1)%maxSize;

      var blue = textureArray[blueIndex];
      blueIndex = (blueIndex + 1) % maxSize;

      combineShader.uniforms.u_image.value = red;
      combineShader.uniforms.u_image2.value = green;
      combineShader.uniforms.u_image3.value = blue;

      inc = time % 1;
      console.log(inc);
      fs2.uniforms.inc.value = inc;
      //planeMaterial.map = blue;
    }
  }

  renderer.render(camScene, orthoCamera, sepTex, true);

  renderer.render(sepScene, orthoCamera);


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

var available = webglAvailable();
if(!available){
init();
} else{
  alert("You need webgl to view this site! Try http://get.webgl.org/")
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

//container.appendChild(video);