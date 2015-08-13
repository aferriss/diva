var w = window.innerWidth;
var h = window.innerHeight;

var container = document.getElementById("container");

var scene, screenScene, fbScene, camera, screenCamera, renderer, hollowModel, hollowModel2, shader, semShader, fbShader, oGeom, oVerts, baseTex, tex, tex2, tex3, tempVerts = [];
var portal, womanBust;
var objects = [];
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var time = 0;
var modelLoaded = false;
var clock = new THREE.Clock();
var mouseX = 0;
var mouseY = 0;
var texMat;
var plane2;

document.addEventListener('mousemove', onDocumentMouseMove, false);
document.addEventListener('mousedown', onDocumentMouseDown, false);

function init(){

  scene = new THREE.Scene();
  screenScene = new THREE.Scene();
  fbScene = new THREE.Scene();
  // init camera
  camera = new THREE.PerspectiveCamera(45, w/h, 0.1,40000);
  screenCamera = new THREE.OrthographicCamera( w/-2, w/2, h/2, h/-2, -10000, 10000);
  scene.add(camera);
  camera.position.z = 1;

  screenScene.add(screenCamera);
  fbScene.add(screenScene);

  // add lights
  var light = new THREE.PointLight(0xffffff);
  light.position.set(0,0,0);
  scene.add(light);

  // materials
  var whiteMat = new THREE.MeshPhongMaterial( { color: 0xffffff, wireframe: false, transparent: false, side:THREE.DoubleSide } );

  baseTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  tex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  tex2 = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  tex3 = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });

  var forestTex = THREE.ImageUtils.loadTexture('images/forest.jpg');
  var plantBg = new THREE.MeshBasicMaterial( { map: forestTex } );

  //console.log(plantBg);

  semShader = new THREE.ShaderMaterial({
    uniforms:{
      tex: {type: 't', value: THREE.ImageUtils.loadTexture('images/ramp.png')},
      tNormal: {type: 't', value: THREE.ImageUtils.loadTexture('images/2563-normalLight.jpg')},
      repeat: { type: 'v2', value: new THREE.Vector2(1,1) },
      useNormal: {type: 'f', value: 1 },
      useRim: {type: 'f', value: 1.0},
      rimPower: {type: 'f', value: 2.5},
      normalScale: {type: 'f', value: 0.5 },
      normalRepeat: {type: 'f', value: 40.5}
    },
    vertexShader: document.getElementById('semVert').textContent,
    fragmentShader: document.getElementById('semFrag').textContent,
    transparent: false,
    shading: THREE.SmoothShading,
    side: THREE.DoubleSide,
    wireframe: false
  });

  var plantShader = new THREE.ShaderMaterial({
    uniforms:{
      tex: {type: 't', value: THREE.ImageUtils.loadTexture('images/matCap.jpg')},
      tNormal: {type: 't', value: THREE.ImageUtils.loadTexture('images/2563-normal.jpg')},
      repeat: { type: 'v2', value: new THREE.Vector2(1,1) },
      useNormal: {type: 'f', value: 1 },
      useRim: {type: 'f', value: 0.0},
      rimPower: {type: 'f', value: 0.15},
      normalScale: {type: 'f', value: 10.5 },
      normalRepeat: {type: 'f', value: 1.5}
    },
    vertexShader: document.getElementById('semVert').textContent,
    fragmentShader: document.getElementById('semFrag').textContent,
    transparent: false,
    shading: THREE.SmoothShading,
    side: THREE.DoubleSide,
    wireframe: false
  });


  texMat = THREE.ImageUtils.loadTexture('images/2563-normal.jpg');

  passShader = new THREE.ShaderMaterial({
    uniforms:{
      tex: {type: 't', value: texMat }
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent
  });


  fbShader = new THREE.ShaderMaterial({
    uniforms:{
      u_image: {type: 't', value: tex },
      step_w: {type: 'f', value: 1/w },
      step_h: {type: 'f', value: 1/h}
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('sharpen').textContent
  });


  semShader.uniforms.tNormal.value.wrapS = semShader.uniforms.tNormal.value.wrapT = THREE.RepeatWrapping;
  
  

  var backDrop = loadModel("models/bg.js", plantBg,   0,-70,-40,   80,80,120,  0,90*Math.PI/180,0, false);
  womanBust = loadModel("models/womanBust.js", semShader,  0,-5,-20,   1,1,1   ,0,0,0,    false);
  //portal = loadModel("models/portalGate.json", whiteMat, 0,-8,-30,   2,2,2,   0,0,0, true);
  for(var i = 0; i < 10; i++){
    groundPalm = loadModel("models/groundPalm.js", plantShader, (Math.random()*60) - 30, -10 , -40 + (Math.random()*30)-15, 2,2,2,0,Math.random()*360*Math.PI/180, 0, false);
  }
  

  var planeGeo = new THREE.PlaneGeometry(10,19);
  var planeMaterial = new THREE.MeshBasicMaterial( {map: tex});
  var mirrorPlane = new THREE.Mesh(planeGeo, planeMaterial);
  mirrorPlane.position.set(0,1,-35);
  scene.add(mirrorPlane);

  var skyMat = new THREE.MeshBasicMaterial({map:tex2, side:THREE.FrontSide});

  var planeGeo = new THREE.PlaneGeometry(w, h);
  var plane = new THREE.Mesh(planeGeo, passShader);
  screenScene.add(plane);

  //skyMat = new THREE.MeshBasicMaterial({map:tex2});
  plane2 = new THREE.Mesh(planeGeo, fbShader);
  fbScene.add(plane2);

  // init renderer
  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer:true, alpha: false, antialias:true});
  renderer.autoClear = true;
  renderer.context.getProgramInfoLog = function () { return '' };
  renderer.setSize(w, h);

  container.appendChild(renderer.domElement);

  render();
}



function loadModel(file, shaderToUse, xPos, yPos, zPos, xScale, yScale, zScale, xRot, yRot, zRot, doUvs){
  var loader = new THREE.JSONLoader();

  var model;

  loader.load(file, function(result){
  if(doUvs){
  assignUVs(result);
  }
  result.verticesNeedUpdate = true;
  result.normalsNeedUpdate = true;
  result.uvsNeedUpdate = true;
  result.computeFaceNormals();
  result.computeVertexNormals();
  result.computeMorphNormals();
  result.computeTangents();

  model = new THREE.Mesh(result, shaderToUse);

  model.scale.set(xScale, yScale, zScale);
  model.position.set(xPos, yPos, zPos);
  model.rotation.set(xRot, yRot, zRot);

  scene.add(model);
  objects.push(model);
    
  modelLoaded = true;

  //console.log(model);
  });

  return model;
}

var inc= 0;
var update = true;
function render(){
  inc ++;
  
  plane2.rotation.z =0.001;

  var delta = 10* clock.getDelta();
   time += 0.005;


  if(modelLoaded && objects[1]){
    objects[1].rotation.y = time;
//    raycaster.setFromCamera(mouse, camera);
//    var intersects = raycaster.intersectObjects(scene.children);
  }




  
  passShader.uniforms.tex.value = texMat;
  fbShader.uniforms.u_image.value = tex;

  renderer.render(scene, camera, baseTex, true);  
  if(inc <= 10){
    update = false;
  } else {
    update = true;
  }
  if(update){
  //renderer.render(screenScene, screenCamera, tex, false);
  }

  //renderer.render(fbScene, screenCamera, tex2, false);
  renderer.render(scene, camera, tex, false);
  renderer.render(scene, camera);


  //fbShader.uniforms.u_image.value = tex3;
  //renderer.render(fbScene, screenCamera, tex3, false);

  

  var tt = tex2;
  tex2 = tex;
  tex = tt;

  //  var mX = map(mouseX, w/2, -0.15,0.15);
  //  var mY = map(mouseY, h/2, -0.15,0.15);
  
  //  camera.position.x += ( mX - camera.position.x ) * 0.005;
  
  //  camera.position.y += ( - mY - camera.position.y ) * 0.005;
  
  //camera.lookAt( scene.position );
  window.requestAnimationFrame(render);



}

function onDocumentMouseDown(event){
}


function onDocumentMouseMove(event){
  var mX = event.clientX ;
  var mY = event.clientY ;

  mouseX = event.clientX  - w/2;
  mouseY = event.clientY -h/2;

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function map(value,max,minrange,maxrange) {
    return ((max-value)/(max))*(maxrange-minrange)+minrange;
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


init();
