
    (function (win) { // IIFE starts, encapsulates all the code except the added Math functions because I live on the edge
      const CONFIG = {
        "PLAYER": {
          "GUNS": {
            "DEFAULT": {
              "BARRELLENGTH": 50,
              "BARRELWIDTH": 10,
              "FIRERATE": 30,
              "BPS": 1,
              "DAMAGE": 10,
              "OFFSET": 0
            },
            "SNIPER": {
              "BARRELLENGTH": 70,
              "BARRELWIDTH": 9,
              "FIRERATE": 60,
              "BPS": 1,
              "DAMAGE": 20,
              "OFFSET": 0
            },
            "MACHINE": {
              "BARRELLENGTH": 40,
              "BARRELWIDTH": 10,
              "FIRERATE": 5,
              "BPS": 1,
              "DAMAGE": 5,
              "OFFSET": 2
            },
            "SHOTGUN": {
              "BARRELLENGTH": 50,
              "BARRELWIDTH": 15,
              "FIRERATE": 40,
              "BPS": 5,
              "DAMAGE": 10,
              "OFFSET": 4
            }
          },
          "IMAGE": new Image(),
          "IMAGE_SRC": "https://docs.google.com/drawings/d/e/2PACX-1vT7cQMsHInChznrHU232ZreXfMx2mrKLzxd_mw8tVpGJJ2rSu46zqMJwkb1B-6GVqPvNOZSRLzMsGp-/pub?w=501&h=501",
        },
        "LARRY": {
          "IMAGE": new Image(),
          "IMAGE_SRC": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Roter-punkt.svg/1024px-Roter-punkt.svg.png"
        },
        "BULLET": {
          "IMAGE": new Image(),
          "IMAGE_SRC": "http://www.clker.com/cliparts/y/K/J/U/l/Z/black-dot-hi.png"
        },
        "HEALTHPACK": {
          "IMAGE": new Image(),
          "IMAGE_SRC": "https://www.shareicon.net/download/2015/09/20/104121_doctor_512x512.png"
        },
        "SCORE": {
          "IMAGE": new Image(),
          "IMAGE_SRC": "https://cdn0.iconfinder.com/data/icons/halloween-avatars/1024/Skull-01.png"
        },
        "HEALTH": {
          "IMAGE": new Image(),
          "IMAGE_SRC": "https://vignette.wikia.nocookie.net/mlp/images/6/65/FANMADE_The_heart-shaped_Fire_Ruby.png/revision/latest?cb=20130323125911"
        },
        "INIT": function () {
          this.LARRY.IMAGE.src = this.LARRY.IMAGE_SRC;
          this.BULLET.IMAGE.src = this.BULLET.IMAGE_SRC;
          this.HEALTHPACK.IMAGE.src = this.HEALTHPACK.IMAGE_SRC;
          this.SCORE.IMAGE.src = this.SCORE.IMAGE_SRC;
          this.HEALTH.IMAGE.src = this.HEALTH.IMAGE_SRC;
          this.PLAYER.IMAGE.src = this.PLAYER.IMAGE_SRC;
        }
      };
      CONFIG.INIT(); // I tried so much to call this within the object :(
      let player;
      let mouseX = 0;
      let mouseY = 0;
      let score = 0;
      let round = 0;
      let larrySpawnRate;

      const arena = {
        width: 3840,
        height: 3840,
        src: "http://salesreporttemplate.org/wp-content/uploads/2016/10/coordinate-grid-paper-grey-grid40x40.png"
      };

      let background;
      let mouseDown = false;
      let gameIsOver = false;

      const canv = document.getElementById("gc");
      const ctx = canv.getContext("2d");

      const mini = document.getElementById("mini");
      const miniCtx = mini.getContext("2d");
      let mapint;

      const bullets = [];
      const larries = [];
      const healthPacks = [];

      const keys = {
        a: false,
        s: false,
        d: false,
        w: false,
        e: false,
        space: false
      };

      win.onload = function () {
        player = new Player();
        background = new Image();
        player.changeGun("MACHINE");

        canv.width = win.innerWidth;
        canv.height = win.innerHeight;

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mousedown", () => {
          mouseDown = true;
        });
        document.addEventListener("mouseup", () => {
          mouseDown = false;
        });

        background.onload = function () {
          updateMap();
          mapint = win.setInterval(updateMap, 500);
          draw();
        };

        ctx.font = "25px Trebuchet MS";
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.textAlign = "left";

        background.src = arena.src;
      };

      function draw() {
        ctx.clearRect(0, 0, canv.width, canv.height);

        player.handlePresses();

        ctx.translate(-player.x + canv.width / 2, -player.y + canv.height / 2);
        ctx.drawImage(background, 0, 0, arena.width, arena.height);


        for (let i = healthPacks.length - 1; i >= 0; i--) {
          healthPacks[i].show();
          if (player.collidesWith(healthPacks[i])) {
            player.health += 10;
            healthPacks[i].used = true;
          }
          if (healthPacks[i].used) healthPacks.splice(i, 1);
        }

        for (let i = bullets.length - 1, len = larries.length - 1; i >= 0; i--) {
          bullets[i].move();
          bullets[i].show();

          if (bullets[i].x > arena.width || bullets[i].x < 0 || bullets[i].y > arena.height || bullets[i].y < 0) bullets[i].isDead = true;

          for (let j = len; j >= 0; j--) {
            if (bullets[i].collidesWith(larries[j]) && !bullets[i].isDead && !larries[j].isDead) {
              larries[j].isDead = true;
              bullets[i].isDead = true;
              score++;
            }
          }
          if (bullets[i].isDead)
            bullets.splice(i, 1);
        }

        for (let i = larries.length - 1; i >= 0; i--) {
          larries[i].move();
          larries[i].show();

          if (player.collidesWith(larries[i])) {
            larries[i].isDead = true;
            player.health -= 10;
          }

          if (larries[i].isDead)
            larries.splice(i, 1);
        }

        player.show()
        player.wait++;

        ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (larries.length == 0 && larrySpawnRate == undefined) {
          newRound();
        }

        ctx.lineWidth = 2;
        ctx.drawImage(CONFIG.SCORE.IMAGE, 2, 33, 25, 25)
        ctx.strokeText(score, 35, 55);
        ctx.fillText(score, 35, 55);

        ctx.strokeText("Round: " + round, 2, 85);
        ctx.fillText("Round: " + round, 2, 85);

        ctx.drawImage(CONFIG.HEALTH.IMAGE, 2, 3, 25, 25);
        ctx.strokeText(player.health, 35, 25);
        ctx.fillText(player.health, 35, 25);

        if (player.health <= 0) // This should be after everything has been drawn
          endGame(score);

        if (!gameIsOver)
          window.requestAnimationFrame(draw);
      }

      function newRound() {
        round++;
        larrySpawnRate = win.setInterval(() => {
          larries.push(new Larry)
        }, 1000 / (round * 2));
        if (round % 2 == 0 && round !== 0) {
          healthPacks.push(new HealthPack());
        }
        win.setTimeout(() => {
          win.clearInterval(larrySpawnRate);
          larrySpawnRate = undefined;
        }, 5000);
      }

      function updateMap() {
        miniCtx.clearRect(0, 0, mini.width, mini.height);

        miniCtx.fillStyle = "red";

        let realX = Math.floor(Math.map(player.x, 0, arena.width, 0, mini.width)) - 2;
        let realY = Math.floor(Math.map(player.y, 0, arena.height, 0, mini.height)) - 2;
        miniCtx.fillRect(realX, realY, 4, 4);

        miniCtx.fillStyle = "green";
        for (let i = 0; i < healthPacks.length; i++) {
          let realX = Math.floor(Math.map(healthPacks[i].x, 0, arena.width, 0, mini.width)) - 1;
          let realY = Math.floor(Math.map(healthPacks[i].y, 0, arena.height, 0, mini.height)) - 1;
          miniCtx.fillRect(realX, realY, 3, 3);
        }
      }

      function endGame(endScore) {
        clearInterval(mapint);

        ctx.clearRect(0, 0, canv.width, canv.height);
        gameIsOver = true;

        ctx.textAlign = "center";
        ctx.fillText("You've died!", canv.width / 2, canv.height / 2 - 50);
        ctx.fillText("Final Score: " + endScore, canv.width / 2, 50);
      }

      function drawImage(image, x, y, width, height, rotation) {
        ctx.setTransform(1, 0, 0, 1, x, y); // sets scale and origin
        ctx.rotate(rotation);
        ctx.drawImage(image, -width / 2, -height / 2, width, height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }

      function handleKeyDown(e) {
        switch (e.code) {
          case "KeyA":
            keys.a = true;
            break;
          case "KeyD":
            keys.d = true;
            break;
          case "KeyW":
            keys.w = true;
            break;
          case "KeyS":
            keys.s = true;
            break;
          case "KeyE":
            keys.e = true;
            break;
          case "Space":
            keys.space = true;
            break;
        }
      }

      function handleKeyUp(e) {
        switch (e.code) {
          case "KeyA":
            keys.a = false;
            break;
          case "KeyD":
            keys.d = false;
            break;
          case "KeyW":
            keys.w = false;
            break;
          case "KeyS":
            keys.s = false;
            break;
          case "KeyE":
            keys.e = false;
            break;
          case "Space":
            keys.space = false;
            break;
        }
      }

      function handleMouseMove(e) {
        const root = document.documentElement;
        const rect = canv.getBoundingClientRect();

        mouseX = e.clientX - rect.left - root.scrollLeft - (-player.x + canv.width / 2);
        mouseY = e.clientY - rect.top - root.scrollTop - (-player.y + canv.height / 2);

        player.handleMouseMovement();
        return;
      }

      class Player {
        constructor() {
          this.x = arena.width / 2;
          this.y = arena.height / 2;
          this.config = CONFIG.PLAYER;
          this.gun = this.config.GUNS.DEFAULT;
          this.speed = 5;
          this.rad = 25;
          this.dir = [0, 0];
          this.auto = false;
          this.health = 100;
          this.wait = 0;
          this.autoState = 0;
          this.angle = 0;
        }

        show() {
          ctx.strokeStyle = "black";
          ctx.fillStyle = "white";
          ctx.lineWidth = this.gun.BARRELWIDTH;

          // Draw the line
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + (Math.cos(this.angle) * this.gun.BARRELLENGTH), this.y + (Math.sin(this.angle) * this.gun.BARRELLENGTH));
          ctx.stroke();

          // Draw the body/circle
          ctx.drawImage(CONFIG.PLAYER.IMAGE, this.x - this.rad, this.y - this.rad, this.rad * 2, this.rad * 2);
        }

        move(x, y) {
          //this.y += dir * Math.sin(this.angle);
          //this.x += dir * Math.cos(this.angle);
          this.x += x;
          this.y += y;

          if (this.x + this.rad >= arena.width) {
            this.x = arena.width - this.rad;
          } else if (this.x <= this.rad) {
            this.x = this.rad;
          }
          if (this.y + this.rad >= arena.height) {
            this.y = arena.height - this.rad;
          } else if (this.y <= this.rad) {
            this.y = this.rad;
          }

          this.dir = [0, 0];
        }

        shoot() {
          bullets.push(new Bullet(this.angle, this.x, this.y, this.gun.OFFSET));
          this.wait = 0;
        }

        handleMouseMovement() {
          this.angle = Math.atan2(mouseY - this.y, mouseX - this.x);
        }

        handlePresses() {
          if (keys.a)
            this.dir[0] -= this.speed;
          if (keys.d)
            this.dir[0] += this.speed;
          if (keys.w)
            this.dir[1] -= this.speed;
          if (keys.s)
            this.dir[1] += this.speed;

          if (this.dir[0] !== 0 && this.dir[1] !== 0) {
            this.move(this.dir[0] * 0.7075, this.dir[1] * 0.7075)
          } else {
            this.move(this.dir[0], this.dir[1]);
          }

          if (keys.e && this.autoState === 0) {
            this.auto = !this.auto;
            this.autoState = 1;
          } else if (!keys.e) {
            this.autoState = 0;
          }
          if ((keys.space || mouseDown || this.auto) && this.gun.FIRERATE <= this.wait) {
            for (let i = 0; i < this.gun.BPS; i++) {
              this.shoot();
            }
          }
        }

        changeGun(newGun) {
          this.gun = CONFIG.PLAYER.GUNS[newGun];
          return true;
        }

        collidesWith(other) {
          return Math.sqrt(Math.sq(other.x - this.x) + Math.sq(other.y - this.y)) <= this.rad + other.rad;
        }
      }

      class Larry {
        constructor() {
          this.angle;

          let possibleSpawnPoints = [{
            x: -50,
            y: -50
          }, {
            x: arena.width + 50,
            y: arena.height + 50
          }, {
            x: arena.width + 50,
            y: -50
          }, {
            x: -50,
            y: arena.height + 50
          }];

          this.x = possibleSpawnPoints[Math.floor(Math.random() * possibleSpawnPoints.length)].x;
          this.y = possibleSpawnPoints[Math.floor(Math.random() * possibleSpawnPoints.length)].y;
          this.rad = 10;

          this.isDead = false;
          this.speed = 4.5;
        }

        move() {
          this.angle = Math.atan2(player.y - this.y, player.x - this.x);

          this.x += this.speed * Math.cos(this.angle);
          this.y += this.speed * Math.sin(this.angle);
        }

        show() {
          ctx.drawImage(CONFIG.LARRY.IMAGE, this.x - this.rad, this.y - this.rad, this.rad * 2, this.rad * 2);
        }
      }

      class Bullet {
        constructor(angle, x, y, offset) {
          this.x = x;
          this.y = y;
          this.angle = angle;
          this.offset = offset * (Math.random() * 2 - 1) + this.angle;
          this.rad = 5;

          this.isDead = false;
          this.speed = 7;
        }

        show() {
          ctx.drawImage(CONFIG.BULLET.IMAGE, this.x - this.rad, this.y - this.rad, this.rad * 2, this.rad * 2);
        }

        move() {
          this.x += Math.cos(this.angle) * this.speed + Math.cos(this.offset);
          this.y += Math.sin(this.angle) * this.speed + Math.sin(this.offset);
        }

        collidesWith(other) {
          return Math.hypot(other.x - this.x, other.y - this.y) <= this.rad + other.rad;
          // Formula for distance
        }
      }

      class HealthPack {
        constructor() {
          this.rad = 25;
          this.x = Math.random() * (arena.width - this.rad * 2);
          this.y = Math.random() * (arena.height - this.rad * 2);
        }

        show() {
          ctx.drawImage(CONFIG.HEALTHPACK.IMAGE, this.x - this.rad, this.y - this.rad, this.rad * 2 - 6, this.rad * 2 - 6);
        }
      }
    })(window); // End of IIFE, because global variables are bad

    Math.sq = function (num) {
      return num * num;
      // I was already using this thinking it was a built in function, so I had to make it myself
    }

    Math.map = function (input, input_start, input_end, output_start, output_end) {
      return output_start + ((output_end - output_start) / (input_end - input_start)) * (input - input_start);
    }
