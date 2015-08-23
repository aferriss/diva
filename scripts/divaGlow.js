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
var glowShader, blurHShader, blurVShader, bloomShader;
var blurHTex, blurVTex;
var blurHScene, blurVScene, bloomScene;
var glowTex;
var gates = [];
var planes = [];
var gate;
var gatesLoaded = false;
var camMouseX = 0;
var camMouseY = 0;
var bloomTex;
var semShader;
var threeDRtt;
var threeDRttScene;
var threeDRttTex;
var box;
var fbEqShader;

function init(){
  initWebcam();

  scene = new THREE.Scene();
  camScene = new THREE.Scene();
  diffScene = new THREE.Scene();
  fbScene = new THREE.Scene();
  diffRttScene = new THREE.Scene();
  afterDiffScene = new THREE.Scene();
  blurHScene = new THREE.Scene();
  blurVScene = new THREE.Scene();
  bloomScene = new THREE.Scene();
  threeDRttScene = new THREE.Scene();

  orthoCamera = new THREE.OrthographicCamera( w/-2, w/2, h/2, h/-2, -10000, 10000);
  camera = new THREE.PerspectiveCamera(120, w/h, 0.1,4000000);

  camera.position.set(0,150,0);
  scene.add(camera);

  camScene.add(orthoCamera);
  diffScene.add(orthoCamera);
  fbScene.add(orthoCamera);
  diffRttScene.add(orthoCamera);
  afterDiffScene.add(orthoCamera);
  blurHScene.add(orthoCamera);
  blurVScene.add(orthoCamera);
  bloomScene.add(orthoCamera);
  threeDRttScene.add(orthoCamera);


  tex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  prevFrame = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  sceneTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  fbTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  diffTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  adds = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  addsRtt = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  blurHTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  blurVTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  glowTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  bloomTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  threeDRtt = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  threeDRttTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });


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


  glowShader = new THREE.ShaderMaterial({
    uniforms:{
      srcTex: {type: 't', value: videoTexture},
      step: {type: 'v2', value: new THREE.Vector2(30.0/window.innerWidth, 30.0/window.innerHeight)},
      time: {type: 'f', value: time }
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('glowFrag').textContent
  });


  blurHShader = new THREE.ShaderMaterial({
    uniforms:{
      srcTex: {type: 't', value: glowTex},
      step: {type: 'v2', value: new THREE.Vector2(1.0/window.innerWidth, 1.0/window.innerHeight)}
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('blurH').textContent
  });


  blurVShader = new THREE.ShaderMaterial({
    uniforms:{
      srcTex: {type: 't', value: blurHTex},
      step: {type: 'v2', value: new THREE.Vector2(1.0/window.innerWidth, 1.0/window.innerHeight)}
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('blurV').textContent
  });


  bloomShader = new THREE.ShaderMaterial({
    uniforms:{
      srcTex: {type: 't', value: videoTexture},
      blurTex: {type: 't', value: blurVTex}
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('bloom').textContent
  });

  fbEqShader = new THREE.ShaderMaterial({
    uniforms:{
      u_image: {type: 't', value: threeDRttTex}
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fbEq').textContent,
    side: THREE.DoubleSide,
    transparent: true
  });

console.log(fbEqShader);
  semShader = new THREE.ShaderMaterial({
    uniforms:{
      tex: {type: 't', value: THREE.ImageUtils.loadTexture('images/1.png')},
      tNormal: {type: 't', value: THREE.ImageUtils.loadTexture('images/2563-normalLight.jpg')},
      repeat: { type: 'v2', value: new THREE.Vector2(1,1) },
      useNormal: {type: 'f', value: 1 },
      useRim: {type: 'f', value: 1.0},
      rimPower: {type: 'f', value: 2.5},
      normalScale: {type: 'f', value: 1.05 },
      normalRepeat: {type: 'f', value: 2.0}
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


  var screenGeometry = new THREE.PlaneGeometry(w, h);

  var planeMaterial = new THREE.MeshBasicMaterial({map:tex});

  //just the video tex
  quad = new THREE.Mesh(screenGeometry, glowShader);
  camScene.add(quad);

  quad = new THREE.Mesh(screenGeometry, blurHShader);
  blurHScene.add(quad);

  quad = new THREE.Mesh(screenGeometry, blurVShader);
  blurVScene.add(quad);

  quad = new THREE.Mesh(screenGeometry, bloomShader);
  bloomScene.add(quad);

  var rttMat = new THREE.MeshBasicMaterial({map: threeDRtt});
  quad = new THREE.Mesh(screenGeometry, rttMat);
  threeDRttScene.add(quad);


  var ambientLight = new THREE.AmbientLight( 0x000000 );
  scene.add( ambientLight );

  var lights = [];
  lights[0] = new THREE.PointLight( 0xffffff, 1, 0 );
  lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
  lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );
  
  lights[0].position.set( 0, 200, 0 );
  lights[1].position.set( 100, 200, 100 );
  lights[2].position.set( -100, -200, -100 );

  scene.add( lights[0] );
  scene.add( lights[1] );
  scene.add( lights[2] );

  //var boxMat = new THREE.MeshBasicMaterial({map:threeDRttTex, side:THREE.DoubleSide});
  var sg = new THREE.BoxGeometry( 10000, 10000, 10000 );
  box = new THREE.Mesh(sg, fbEqShader);
  box.scale.set(100,100,100);
  box.position.set(0,0,0);
  scene.add(box);
  loadGate();
  /*
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
  */


  /*
  var boxGeo = new THREE.BoxGeometry(100,100,100);
  var colorMat = new THREE.MeshBasicMaterial({color: 0x888888});
  box = new THREE.Mesh(screenGeometry, planeMaterial);
  box.scale.set(3,3);
  box.position.set(0,0,-2100);
  box.rotation.set(0,0,0);
  scene.add(box);
  scene.add(quad);
  */

  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer:false, alpha: true, antialias:true});
  renderer.setSize(w, h);
  renderer.autoClear = true;
  container.appendChild(renderer.domElement);

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'resize', onWindowResize, false );

  render();
}

function loadGate(){
  var loader = new THREE.JSONLoader();
  loader.load('models/portalGate.json', function (result){
    assignUVs(result);
    result.verticesNeedUpdate = true;
    result.normalsNeedUpdate = true;
    result.uvsNeedUpdate = true;
    result.computeFaceNormals();
    result.computeVertexNormals();
    result.computeMorphNormals();
    result.computeTangents();

    
    
    console.log(result);
    var baseMat = new THREE.MeshBasicMaterial({map:videoTexture});
    for(var i = 0; i< 4; i++){
      gate = new THREE.Mesh(result, semShader);
      gates.push(gate);
      gates[i].scale.set(30,30,30);
      gates[i].position.set(0,0,0);
      //gates[i].rotation.z = 90 * Math.PI/180;

      var plane = new THREE.PlaneGeometry(150,300);
      var planeMesh = new THREE.Mesh(plane, baseMat);
      planes.push(planeMesh);
      planes[i].position.set(0,105,0);
      //planes[i].scale.set(30,30,30);

      scene.add(planes[i]);
      scene.add(gates[i]);
    }




    gates[0].rotation.y = 0;
    gates[0].position.z -= 150;
    planes[0].position.z -= 170;

    gates[1].rotation.y = 90 * Math.PI/180;
    gates[1].position.x -=150;
    planes[1].rotation.y = 90 * Math.PI/180;
    planes[1].position.x -= 170;

    gates[2].rotation.y = 180 * Math.PI/180;
    gates[2].position.z += 150;
    planes[2].rotation.y = 180 * Math.PI/180;
    planes[2].position.z += 170;

    gates[3].rotation.y = 270 * Math.PI/180;
    gates[3].position.x += 150;
    planes[3].rotation.y = 270 * Math.PI/180;
    planes[3].position.x += 170;


    gatesLoaded = true;
  });
}


function render(){
  time += 0.025;

  box.rotation.x = time*0.0625;
  box.rotation.y = time*0.125;
  //camera.position.x += (camMouseX - camera.position.x) * .0005;
  camera.rotation.y -= (camMouseX - camera.position.x) * .00005;
  camera.rotation.x -= (-camMouseY - camera.position.y) * .00005;
  //camera.position.z += (- camMouseY - camera.position.y) * .0005;
  //camera.rotation.y += 0.005;
  //camera.lookAt(new THREE.Vector3(0,-50,0));

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

  glowShader.uniforms.srcTex.value = videoTexture;
  glowShader.uniforms.time.value = time;

  //render diff scene to tex
  //renderer.render(diffScene, orthoCamera, tex, true);
  //capture previous frame
  //renderer.render(camScene, orthoCamera, prevFrame, true);
  ////////////////////////////////////////////////////////
  /*
  renderer.render(diffRttScene, orthoCamera, prevFrame);
  //renderer.render(scene, camera, sceneTex, true);
  //renderer.render(fbScene, orthoCamera, fbTex, true);
  renderer.render(camScene, orthoCamera, diffTex, true);
  //renderer.render(diffRttScene, orthoCamera);
  renderer.render(diffScene, orthoCamera, adds);
  renderer.render(afterDiffScene, orthoCamera, addsRtt);

  renderer.render(diffScene, orthoCamera);
  */

/*
  blurHShader.uniforms.step.value = new THREE.Vector2(1.0/window.innerWidth, 1.0/window.innerHeight);
  blurVShader.uniforms.step.value = new THREE.Vector2(1.0/window.innerWidth, 1.0/window.innerHeight);

  renderer.render(camScene, orthoCamera, glowTex);

  blurHShader.uniforms.srcTex.value = glowTex;

  renderer.render(blurHScene, orthoCamera, blurHTex);
  renderer.render(blurVScene, orthoCamera, blurVTex);

  blurHShader.uniforms.srcTex.value = blurVTex;

  blurHShader.uniforms.step.value = new THREE.Vector2(3.0/window.innerWidth, 3.0/window.innerHeight);
  blurVShader.uniforms.step.value = new THREE.Vector2(3.0/window.innerWidth, 3.0/window.innerHeight);


  for(var i = 0; i<3; i++){
    renderer.render(blurHScene, orthoCamera, blurHTex);
    renderer.render(blurVScene, orthoCamera, blurVTex);
  }
  */
//renderer.render(blurVScene, orthoCamera);

  renderer.render(bloomScene, orthoCamera, bloomTex);

  renderer.render(scene, camera, threeDRtt);
  renderer.render(threeDRttScene, orthoCamera, threeDRttTex);
  renderer.render(scene, camera);


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

  camMouseX = (event.clientX - window.innerWidth/2) * 1;
  camMouseY = (event.clientY - window.innerHeight/2) * 1;

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