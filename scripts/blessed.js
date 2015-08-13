var w = window.innerWidth;
var h = window.innerHeight;

var container = document.getElementById("container");
var time = 0;

var container, scene, screenScene, thirdScene, renderer, camera, plane, shader, blurShader, shader2, tex, tex2, videoTexture, videoImage, videoImageContext;
var cube, rose, roseGeom;
var roses = [];
var roseAdded = false;

function init(){
  scene = new THREE.Scene();
  screenScene = new THREE.Scene();
  thirdScene = new THREE.Scene();


  //camera = new THREE.OrthographicCamera( w/-2, w/2, h/2, h/-2, -10000, 10000);
  camera = new THREE.PerspectiveCamera(45, w/h, 0.1,40000);
  //camera.position.set(0,0,100);
  //camera.lookAt(scene.position);
  

  scene.add(camera);


  //tex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  //tex2 = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });

  shader2 = new THREE.ShaderMaterial({
    uniforms: {
      u_image: {type: 't', value: THREE.ImageUtils.loadTexture('images/matCap.jpg') },
      step_w: { type: 'f', value: 10.78/w },
      step_h: { type: 'f', value: 10.78/h },
      texelWidth: {type:'f', value: 0.04/w},
      time: {type: 'f', value: time}
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('baseShader').textContent,
    transparent: true
  });

  var ambient = new THREE.AmbientLight(0xaaaaaa);
  scene.add(ambient);

  var light = new THREE.PointLight(0xFF0040);
  light.position.set(0,0,0);
  scene.add(light);


 var wireMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, wireframe: false, transparent: false, side:THREE.DoubleSide } );

/*
  var cubeGeo = new THREE.BoxGeometry(5,5,5);
  cube = new THREE.Mesh(cubeGeo, wireMaterial);
  cube.position.set(0,0,-20);
  scene.add(cube);
*/

  var loader = new THREE.JSONLoader();

  loader.load('models/rose.js', function(result){
    roseGeom = result;
    //for(var j = 0; j< 5; j++){
    for( var i = 0; i<300; i++){
      result.applyMatrix( new THREE.Matrix4().makeTranslation( 0, -0.04, -0.05 ) );
      rose = new THREE.Mesh(result, shader2);
      rose.scale.set(15,-15,15);
      rose.position.set(0,0,-300);
      //rose.position.set(0,0,-300);
      
      scene.add(rose);
      roses.push(rose);
    }
  //}
    
    roseAdded = true;
    console.log(result);

  });
  
  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer:false, alpha: true, antialias:true});
  renderer.setSize(w, h);
  
  container.appendChild(renderer.domElement);

  render();
}


function render(){
  time += 0.005;
  camera.position.z = -time*500;
 // console.log((time % 2));
  if(roseAdded){
    /*
    if( (time*100000) % 2 == 0){
      console.log("adding new");
      for( var i = 0; i<25; i++){
        roseGeom.applyMatrix( new THREE.Matrix4().makeTranslation( 0, -0.45, -0.5 ) );
      
        var newRose = new THREE.Mesh(roseGeom, shader2);
        newRose.scale.set(15,15,15);
        newRose.position.set(0,0,camera.position.z - 300);
        newRose.rotation.set(0,0,mapRot*Math.PI/180);

        scene.add(newRose);
      }
    } 
    */
    for(var i = 0; i<roses.length; i++){
      var mapRot = map(i, 25,0,360);
      roses[i].rotation.set(0,0,mapRot*Math.PI/180 + time);
      roses[i].position.z = -550 + i*-10;
    }
    //rose.position.y = (Math.sin(time)*10);
    //rose.rotation.set(0,time,0);
    //rose.rotation.z = (90 * Math.PI/180) + time;
    //rose.rotation.x = (-80 * Math.PI/180);
  }

  renderer.render(scene, camera);

  window.requestAnimationFrame(render);
}


function map(value,max,minrange,maxrange) {
    return ((max-value)/(max))*(maxrange-minrange)+minrange;
}

init();
