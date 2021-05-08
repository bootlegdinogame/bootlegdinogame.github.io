const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Variables
let bgcolor;
let score;
let scoreText;
let highscore;
let highscoreText;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};
let pause = false;
let prevscore = 0;

// Event Listeners
document.addEventListener('keydown', function (evt) {
  keys[evt.code] = true;
});
document.addEventListener('keyup', function (evt) {
  keys[evt.code] = false;
});

class Player {
  constructor(x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = c;

    this.dy = 0;
    this.jumpForce = 10;
    this.originalHeight = h;
    this.grounded = false;
    this.jumpTimer = 0;
  }

  Animate() {
    // Jump
    if (keys['Space'] || keys['KeyW']) {
      this.Jump();
    } else {
      this.jumpTimer = 0;
    }

    if (keys['ShiftLeft'] || keys['KeyS']) {
      this.h = this.originalHeight / 2;
    } else {
      this.h = this.originalHeight;
    }

    this.y += this.dy;

    // Gravity
    if (this.y + this.h < canvas.height) {
      this.dy += gravity;
      this.grounded = false;
    } else {
      this.dy = 0;
      this.grounded = true;
      this.y = canvas.height - this.h;
    }

    this.Draw();
  }

  Jump() {
    if (this.grounded && this.jumpTimer == 0) {
      this.jumpTimer = 1;
      this.dy = -this.jumpForce;
    } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
      this.jumpTimer++;
      this.dy = -this.jumpForce - (this.jumpTimer / 50);
    }
  }

  Draw() {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.closePath();
  }
}

class Obstacle {
  constructor(x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = c;

    this.dx = -gameSpeed;
  }

  Update() {
    this.x += this.dx;
    this.Draw();
    this.dx = -gameSpeed;
  }

  Draw() {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.closePath();
  }
}

class Text {
  constructor(t, x, y, a, c, s) {
    this.t = t;
    this.x = x;
    this.y = y;
    this.a = a;
    this.c = c;
    this.s = s;
  }

  Draw() {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.font = this.s + "px sans-serif";
    ctx.textAlign = this.a;
    ctx.fillText(this.t, this.x, this.y);
    ctx.closePath();
  }
}

// Game Functions
function SpawnObstacle() {
  let size = RandomIntInRange(20, 70);
  let type = RandomIntInRange(0, 1);
  let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, '#2484E4');

  if (type == 1) {
    obstacle.y -= player.originalHeight - 10;
  }
  obstacles.push(obstacle);
}


function RandomIntInRange(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function Start() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.font = "20px sans-serif";

  gameSpeed = 3;
  gravity = 1;

  score = 0;
  highscore = 0;
  if (localStorage.getItem('highscore')) {
    highscore = localStorage.getItem('highscore');
  }

  player = new Player(25, 0, 50, 50, '#FF5858');

  scoreText = new Text("Score: " + score, 25, 25, "left", "#212121", "20");
  highscoreText = new Text("Highscore: " + highscore, canvas.width - 25, 25, "right", "#212121", "20");

  requestAnimationFrame(Update);
}

let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;

function Update() {
  if (!pause) {
    requestAnimationFrame(Update);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    spawnTimer--;
    if (spawnTimer <= 0) {
      SpawnObstacle();
      console.log(obstacles);
      spawnTimer = initialSpawnTimer - gameSpeed * 8;

      if (spawnTimer < 60) {
        spawnTimer = 60;
      }
    }

    // Spawn Enemies
    for (let i = 0; i < obstacles.length; i++) {
      let o = obstacles[i];

      if (o.x + o.w < 0) {
        obstacles.splice(i, 1);
      }

      if (
        player.x < o.x + o.w &&
        player.x + player.w > o.x &&
        player.y < o.y + o.h &&
        player.y + player.h > o.y
      ) {
        //you lost
        pause = true;
        $('#hidden').css("display", "block");
        // obstacles = [];
        // score = 0;
        // spawnTimer = initialSpawnTimer;
        // gameSpeed = 3;
        window.localStorage.setItem('highscore', highscore);
      }

      o.Update();
    }

    player.Animate();

    score++;
    scoreText.t = "Score: " + score;
    scoreText.Draw();

    if (score > highscore) {
      highscore = score;
      highscoreText.t = "Highscore: " + highscore;
    }

    highscoreText.Draw();

    gameSpeed += 0.003;
  }

}

Start();
//pause = true;

let getWeather = async () => {
  const result = await axios({
    method: 'get',
    url: 'http://www.7timer.info/bin/api.pl?lon=79.0469&lat=35.9049&product=astro&output=json'
  });
  return result;
};

const darkMode = function (event) {
  $('#main').css("background-color", "#2e2e2e");
  $('#game').css("background-color", "#404040");
  $('#dark').css("background-color", "#2e2e2e");
  $('#light').css("background-color", "#2e2e2e");
  $('#weather').css("background-color", "#2e2e2e");
  $('#hidden').css("background-color", "#404040");
  $('#dark').css("color", "white");
  $('#light').css("color", "white");
  $('#weather').css("color", "white");
  window.localStorage.setItem('bgcolor', "dark");
  //console.log(leaderboards());
};

const lightMode = function (event) {
  $('#main').css("background-color", "");
  $('#game').css("background-color", "");
  $('#dark').css("background-color", "");
  $('#light').css("background-color", "");
  $('#weather').css("background-color", "");
  $('#hidden').css("background-color", "");
  $('#dark').css("color", "");
  $('#light').css("color", "");
  $('#weather').css("color", "");
  window.localStorage.setItem('bgcolor', "light");
};

const weatherMode = async function (event) {
  let result = await getWeather();
  // console.log(result.data.dataseries[0].cloudcover);
  result = result.data.dataseries[0].cloudcover;
  let color = result > 5 ? "slategray" : "skyblue";
  $('#main').css("background-color", color);
  $('#game').css("background-color", color);
  $('#dark').css("background-color", color);
  $('#light').css("background-color", color);
  $('#weather').css("background-color", color);
  $('#hidden').css("background-color", color);
  $('#dark').css("color", "white");
  $('#light').css("color", "white");
  $('#weather').css("color", "white");
  window.localStorage.setItem('bgcolor', color);
};

const startupMode = function (color) {
  $('#main').css("background-color", color);
  $('#game').css("background-color", color);
  $('#dark').css("background-color", color);
  $('#light').css("background-color", color);
  $('#weather').css("background-color", color);
  $('#hidden').css("background-color", color);
  $('#dark').css("color", "white");
  $('#light').css("color", "white");
  $('#weather').css("color", "white");
};

const leaderboards = async function (event) {
  try {
    let result = await axios({
      method: 'get',
      url: 'https://fa7f4d6da8f2.ngrok.io/routines'
    });
    return result;
  } catch (err) {
    console.log(err);
  }
};

const quote = async function (event) {
  try {
    let result = await axios({
      method: 'get',
      url: 'https://www.boredapi.com/api/activity'
    });
    return result;
  } catch (err) {
    console.log(err);
  }
};

const dog = async function (event) {
  try {
    let result = await axios({
      method: 'get',
      url: 'https://dog.ceo/api/breeds/image/random'
    });
    return result;
  } catch (err) {
    console.log(err);
  }
};





const updateScore = async function (event) {
  event.preventDefault();
  //console.log();
  if ($("#username")[0].value.length > 0 && $("#password")[0].value.length > 0) {
    try {
      const result = await axios({
        method: 'post',
        url: 'http://fa7f4d6da8f2.ngrok.io/routines',
        data: {
          username: $("#username")[0].value,
          password: $("#password")[0].value,
          score: score
        },
      });
      location.reload();
    } catch (error) {
      $('#hiddentext').text("Username and password do not match.")
      $('#hiddentext').css("display", "block");
    }
  } else {
    $('#hiddentext').css("display", "block");
  }




};

$(async function () {
  if (localStorage.getItem('bgcolor')) {
    bgcolor = localStorage.getItem('bgcolor');
  }
  if (bgcolor) {
    if (bgcolor == "dark") darkMode();
    else if (bgcolor == "white") lightMode();
    else startupMode(bgcolor);
  }
  $("#dark").click(darkMode);
  $("#light").click(lightMode);
  $("#weather").click(weatherMode);
  $("#submit").click(updateScore);
  const $root = $('#root');
  let output = await wait();
  $root.append(output);
  document.getElementsByTagName("html")[0].style.visibility = "visible";
  let ranq = await quote();
  $("#randomquoteapi").text("Random activity you can do if you're bored: " + ranq.data.activity);
  let dogurl = await dog();
  //console.log(dogurl);
  $("#dogpic").attr("src", dogurl.data.message)

});

let wait = async () => {
  const data = await leaderboards();
  let output = renderLeaderboard(data.data);
  return output;
}

// async function run() {
//   const data = await asyncFunc();
//   console.log(data); // will print your data
// }

let renderLeaderboard = (input) => {
  let output = `<div class="container">
  <div class="leaderboard">
    <div class="head">
      <i class="fas fa-crown"></i>
    </div>
    <div class="body">
      <h2>Leaderboard</h2>
      <ol>
        `;
  for (let i = 0; i < input.length; i++) {
    output += `<li>
    <mark>${input[i].username}</mark>
    <small>${input[i].score}</small>
  </li>`
  }
  output += `
  </ol>
  </div>
  </div>
  </div>`;
  return output;

}