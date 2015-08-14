var w = window.innerWidth;
var h = window.innerHeight;
var container = document.getElementById("container");
var videoLoaded = false;
var video = document.createElement('video');
video.width = w;
video.height = h;
var time = 0;

var container, scene, camScene, diffScene, fbScene, renderer, camera, orthoCamera, plane, skyBox, shader, diffShader, fbShader, blurShader, shader2, tex, fbTex, sceneTex, prevFrame, videoTexture, videoImage, videoImageContext;
//var time = Date.now();
var sheets = [];
var mouseX, mouseY;
var box, quad;
var diffTex, adds, addsRtt;
var diffRttScene, afterDiffScene;

function init(){
  initWebcam();

  scene = new THREE.Scene();
  camScene = new THREE.Scene();
  diffScene = new THREE.Scene();
  fbScene = new THREE.Scene();
  diffRttScene = new THREE.Scene();
  afterDiffScene = new THREE.Scene();

  orthoCamera = new THREE.OrthographicCamera( w/-2, w/2, h/2, h/-2, -10000, 10000);
  camera = new THREE.PerspectiveCamera(45, w/h, 0.1,40000);

  camera.position.set(0,0,10);
  scene.add(camera);
  camScene.add(orthoCamera);
  diffScene.add(orthoCamera);
  fbScene.add(orthoCamera);
  diffRttScene.add(orthoCamera);
  afterDiffScene.add(orthoCamera);


  tex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  prevFrame = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  sceneTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  fbTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  diffTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  adds = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  addsRtt = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });


  videoTexture = new THREE.Texture( video );
  videoTexture.minFilter = THREE.LinearFilter;

  shader = new THREE.ShaderMaterial({
    uniforms: {
      tex: {type: 't', value: videoTexture },
      time: {type: 'f', value: time}
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('kaliShader').textContent,
    wireframe: false,
    transparent: false,
    side: THREE.DoubleSide
  });


  diffShader = new THREE.ShaderMaterial({
    uniforms: {
      prevFrame: {type: 't', value: prevFrame },
      videoTexture: {type: 't', value: diffTex },
      fbTex: {type: 't', value: addsRtt }
    },
    vertexShader: document.getElementById('vertZoom').textContent,
    fragmentShader: document.getElementById('diffFs').textContent
  });

  fbShader = new THREE.ShaderMaterial({
    uniforms: {
      tex: {type: 't', value: fbTex }
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fbShader').textContent,
    transparent: false
  });


  var screenGeometry = new THREE.PlaneGeometry(w, h);

  var planeMaterial = new THREE.MeshBasicMaterial({map:tex});

  //just the video tex
  quad = new THREE.Mesh(screenGeometry, shader);
  camScene.add(quad);

  //the differencing scene
  quad = new THREE.Mesh(screenGeometry, diffShader);
  diffScene.add(quad);

  var diffMat = new THREE.MeshBasicMaterial({map: diffTex});
  quad = new THREE.Mesh(screenGeometry, diffMat);
  diffRttScene.add(quad);

  var afterDiffMat = new THREE.MeshBasicMaterial({map: adds});
  quad = new THREE.Mesh(screenGeometry, afterDiffMat);
  afterDiffScene.add(quad);

  ////////////////////////////////////////////////////////////////

  var screenMaterial = new THREE.MeshBasicMaterial({map:sceneTex});
  quad = new THREE.Mesh(screenGeometry, screenMaterial);
  //quad.position.set(0,0,-1200);
  fbScene.add(quad);

  //throw it in the loop
  var planeMaterial2 = new THREE.MeshBasicMaterial({map:fbTex});
  quad = new THREE.Mesh(screenGeometry, fbShader);
  quad.position.set(0,0,-915);

  
  var boxGeo = new THREE.BoxGeometry(100,100,100);
  var colorMat = new THREE.MeshBasicMaterial({color: 0x888888});
  box = new THREE.Mesh(screenGeometry, planeMaterial);
  box.scale.set(3,3);
  box.position.set(0,0,-2100);
  box.rotation.set(0,0,0);
  scene.add(box);
  scene.add(quad);

  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer:false, alpha: true, antialias:true});
  renderer.setSize(w, h);
  renderer.autoClear = false;
  container.appendChild(renderer.domElement);

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'resize', onWindowResize, false );

  render();
}


function render(){
  time += 0.025;
  
  //quad.rotation.set(Math.sin(time)*Math.PI/180,0,Math.sin(time)*1.1*Math.PI/180);
  //quad.position.z += 0.01;
  //box.position.x = Math.sin(time*10)*300;
  //box.position.y = Math.sin(time*8)*300;

  if(video.readyState === video.HAVE_ENOUGH_DATA){
    if(videoTexture){
      videoTexture.needsUpdate = true;
    }
  }

  shader.uniforms.tex.value = videoTexture;
  shader.uniforms.time.value = time;
  //render diff scene to tex
  //renderer.render(diffScene, orthoCamera, tex, true);
  //capture previous frame
  //renderer.render(camScene, orthoCamera, prevFrame, true);
  ////////////////////////////////////////////////////////
  renderer.render(diffRttScene, orthoCamera, prevFrame);
  //renderer.render(scene, camera, sceneTex, true);
  //renderer.render(fbScene, orthoCamera, fbTex, true);
  renderer.render(camScene, orthoCamera, diffTex, true);
  //renderer.render(diffRttScene, orthoCamera);
  renderer.render(diffScene, orthoCamera, adds);
  renderer.render(afterDiffScene, orthoCamera, addsRtt);

  renderer.render(diffScene, orthoCamera);

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