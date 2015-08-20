var w = window.innerWidth;
var h = window.innerHeight;
var container = document.getElementById("container");
var videoLoaded = false;
var video = document.createElement('video');
video.width = w;
video.height = h;
var time = 0;

var container, scene, screenScene, thirdScene, renderer, camera, plane, shader, blurShader, shader2, tex, tex2, videoTexture, videoImage, videoImageContext;
//var time = Date.now();

function init(){
  scene = new THREE.Scene();
  screenScene = new THREE.Scene();
  thirdScene = new THREE.Scene();


  camera = new THREE.OrthographicCamera( w/-2, w/2, h/2, h/-2, -10000, 10000);
  scene.add(camera);
  screenScene.add(camera);
  thirdScene.add(camera);

  tex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
  tex2 = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });

  videoTexture = new THREE.Texture( video );
  videoTexture.minFilter = THREE.NearestFilter;

  shader = new THREE.ShaderMaterial({
    uniforms: {
      u_image: {type: 't', value: videoTexture },
      step_w: { type: 'f', value: 2.0/w },
      step_h: { type: 'f', value: 2.0/h },
      texelWidth: {type:'f', value: 0.001/w} 
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('embossFrag').textContent
  });


  shader2 = new THREE.ShaderMaterial({
    uniforms: {
      u_image: {type: 't', value: tex2 },
      step_w: { type: 'f', value: 10.78/w },
      step_h: { type: 'f', value: 10.78/h },
      texelWidth: {type:'f', value: 0.04/w},
      time: {type: 'f', value: time}
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('colorFrag').textContent,
    transparent: true
  });

  var screenGeometry = new THREE.PlaneBufferGeometry(w, h);

  var quad = new THREE.Mesh(screenGeometry, shader);
  scene.add(quad);

  quad = new THREE.Mesh(screenGeometry, shader);
  screenScene.add(quad);

  quad = new THREE.Mesh(screenGeometry, shader2);
  thirdScene.add(quad);

  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer:true, alpha: true});
  renderer.setSize(w, h);
  
  container.appendChild(renderer.domElement);

  render();
}


function render(){
  time += 0.005;
  shader2.uniforms.time.value = time;
  
  shader2.needsUpdate = true;
  if(video.readyState === video.HAVE_ENOUGH_DATA){
    if(videoTexture){
      videoTexture.needsUpdate = true;
    }
  }

  
  renderer.render(scene, camera, tex, false);

  shader.uniforms.u_image.value = tex;
  shader.needsUpdate = true;

  renderer.render(screenScene, camera, tex2, false);
  renderer.render(thirdScene, camera);


  shader.uniforms.u_image.value = videoTexture;

  window.requestAnimationFrame(render);
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
        sndSrc.src = "tracks/infiniteGradient.mp3";
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