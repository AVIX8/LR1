window.onload = function () {
  var initialized = 0;
  var text = document.getElementById("text");
  var audio = document.getElementById("audio");
  var pb = document.getElementById("pb");
  var progress_bar = document.getElementById("progress_bar");
  
  var canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext("2d");

  window.onbeforeunload = () => {
    location.reload(true);
  };

  $(document).ready(() => {
    console.log("document.ready");

    if (!initialized) {
      AudioContextInit();
      document.getElementById("prev").style.opacity = 0;
      text.style.opacity = 1;
      initialized = 1;
      audio.play();
    }
  });

  document.onkeypress = () => {
    if (initialized) {
      if (audio.paused) {
        audio.play();
        console.log("play");
      } else {
        audio.pause();
        console.log("pause");
      }
    }
  };

  var pressed = false;
  progress_bar.onmousedown = () => {
    pressed = true;
  };
  document.onmouseup = () => {
    pressed = false;
  };
  document.onmousemove = (event) => {
    if (pressed) {
      setTime(event);
    }
  };
  progress_bar.onclick = setTime;
  function setTime(event) {
    var x = event.pageX;
    var y = event.pageY;
    var w = window.innerWidth;
    var h = window.innerHeight;
    audio.currentTime = (audio.duration * (x - w * 0.15)) / (w * 0.7);
  }

  function AudioContextInit() {
    var context = new AudioContext();
    var analyser = context.createAnalyser();

    context.createMediaElementSource(audio).connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = Math.pow(
      2,
      Math.ceil(Math.log2(canvas.width * 1.5)) + 1
    );

    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);

    var dataArray = new Uint8Array(bufferLength);

    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;

    var barWidth = 1;
    var barHeightConst = HEIGHT / 255 / 4;
    var firstBar = Math.ceil(bufferLength / 256);
    var lastBar = WIDTH / barWidth + firstBar;
    console.log(firstBar);

    function getRGB(H) {
      var r = H * 1.5;
      var g = 0;
      var b = 255 - H / 1.5;
      return "rgb(" + r + "," + g + "," + b + ")";
    }

    renderFrame();
    var k = lastBar - firstBar;
    function renderFrame() {
      requestAnimationFrame(renderFrame);

      x = 0;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#222";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      s = 0;
      for (var i = firstBar; i < lastBar; i++) {
        H = dataArray[i];

        barHeight = H * barHeightConst;

        ctx.fillStyle = getRGB(H);
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
        ctx.fillRect(WIDTH - x - barWidth, 0, barWidth, barHeight);
        s += H;

        x += barWidth;
      }

      text.style.color = getRGB(s / k);
      pb.style.backgroundColor = getRGB(s / k);
      pb.style.width = (audio.currentTime / audio.duration) * 100 + "%";
    }
  }
};
