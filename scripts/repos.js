var w = window.innerWidth;
var h = window.innerHeight;
var container = document.getElementById("container");
var videoLoaded = false;
var video = document.createElement('video');
video.width = w;
video.height = h;
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


function init(){
  video = document.createElement( 'video');
  video.src = "images/allOne.mp4";
  video.load();
  video.play();
  video.volume = 0.0;

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

  videoTexture = new THREE.Texture( videoImage );
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
      amt: {type: 'v2', value: new THREE.Vector2( 3.8/w, 3.8/h) },
        time: {type: 'f', value: inc}
      },
      vertexShader: document.getElementById('vertexShader').textContent,
      fragmentShader:document.getElementById('repos').textContent
  });

  colorShader = new THREE.ShaderMaterial({
    uniforms:{
      u_image: { type: 't', value: rtt}
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

