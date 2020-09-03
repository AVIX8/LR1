window.onload = function () {
  let initialized = 0;
  let text = document.getElementById("text");
  let audio = document.getElementById("audio");
  let pb = document.getElementById("pb");
  let progress_bar = document.getElementById("progress_bar");
  let audioFile = document.getElementById("audioFile");
  let canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let ctx = canvas.getContext("2d");

  text.addEventListener("click", function() {
    if (!initialized) {
      AudioContextInit();
      initialized = 1;
    }
    audioFile.click();
  });

  window.onbeforeunload = () => {
    location.reload(true);
  };

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

  //скорее всего это не будет работать в хроме, но нужно проверить
  //в гугле AudioContext не доступен до первой активности пользователя
  // $(document).ready(() => {
  //   console.log("document.ready");

  //   if (!initialized) {
  //     AudioContextInit();
  //     initialized = 1;
  //     audio.play();
  //   }
  // });

  let pressed = false;
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
    let x = event.pageX;
    let y = event.pageY;
    let w = window.innerWidth;
    let h = window.innerHeight;
    audio.currentTime = (audio.duration * (x - w * 0.15)) / (w * 0.7);
  }

  function AudioContextInit() {
    let context = new AudioContext();
    let analyser = context.createAnalyser();

    context.createMediaElementSource(audio).connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = Math.pow(
      2,
      Math.ceil(Math.log2(canvas.width * 1.5)) + 1
    );

    let bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);

    let dataArray = new Uint8Array(bufferLength);

    let WIDTH = canvas.width;
    let HEIGHT = canvas.height;

    let barWidth = 1;
    let barHeightConst = HEIGHT / 255 / 4;
    let firstBar = Math.ceil(bufferLength / 256);
    let lastBar = WIDTH / barWidth + firstBar;
    console.log(firstBar);

    function getRGB(H) {
      let r = H * 1.5;
      let g = 0;
      let b = 255 - H / 1.5;
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
      for (let i = firstBar; i < lastBar; i++) {
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

  audioFile.onchange = function() {
    let file = document.getElementById('audioFile').files[0];
    audio.src = URL.createObjectURL(file);
    audio.play();
    text.innerText = file.name.split('.').slice(0, -1).join('.');
  };
};
