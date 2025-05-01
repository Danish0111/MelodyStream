console.log("Let's write JS");
let currentSong = new Audio();
let songs = [];
let currfolder = "";

document.addEventListener("DOMContentLoaded", () => {
  main();
});

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
  try {
    currfolder = folder;
    let response = await fetch(`/${folder}/`);
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let links = div.getElementsByTagName("a");
    songs = Array.from(links)
      .filter(link => link.href.endsWith(".mp3"))
      .map(link => decodeURIComponent(link.href.split(`/${folder}/`)[1]));

    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = songs.map(song => `
      <li>
        <img class="invert" src="/images/music.svg" alt="">
        <div class="info"><div>${song}</div></div>
        <div class="playNow">
          <img class="invert" src="/images/play2.svg" alt="">
        </div>
      </li>`).join("");

    document.querySelectorAll(".songlist li").forEach(e => {
      e.addEventListener("click", () => playMusic(e.querySelector(".info").textContent.trim()));
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
}

function playMusic(track, pause = false) {
  if (!track) return;
  currentSong.src = `/${currfolder}/${track}`;
  if (!pause) {
    currentSong.play().catch(console.error);
    document.getElementById("play").src = "/images/pause.svg"; 
  } else {
    document.getElementById("play").src = "/images/play.svg";
  }
  document.querySelector(".songinfo").textContent = track;
  document.querySelector(".songtime").textContent = "00:00 / 00:00";
}

async function displayAlbums() {
  try {
    let response = await fetch("/songs/");
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let cardContainer = document.querySelector(".card-container");
    
    let albums = Array.from(div.getElementsByTagName("a"))
      .map(e => e.href.split("/").slice(-2)[0])
      .filter(folder => folder);

    for (let folder of albums) {
      try {
        let metaResponse = await fetch(`/songs/${folder}/info.json`);
        let meta = await metaResponse.json();
        cardContainer.innerHTML += `
          <div data-folder="${folder}" class="card">
            <div class="play">
              <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="none">
                <circle cx="71" cy="72" r="25" fill="#1fdf64" />
                <g transform="translate(40, 40)">
                  <g transform="translate(20, 20)">
                    <path d="M5 20V4L19 12L5 20Z" fill="#000" stroke="#000" stroke-width="1.5" stroke-linejoin="round" />
                  </g>
                </g>
              </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${meta.heading}</h2>
            <p>${meta.description}</p>
          </div>`;
      } catch (metaError) {
        console.warn(`Metadata missing for ${folder}:`, metaError);
      }
    }
    document.querySelectorAll(".card").forEach(e => {
      e.addEventListener("click", async item => {
        await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        playMusic(songs[0]);
      });
    });
  } catch (error) {
    console.error("Error fetching albums:", error);
  }
}

async function main() {
  await getSongs("songs/NCS");
  playMusic(songs[0], true);
  displayAlbums();

  document.getElementById("play").addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play().catch(console.error);
      play.src = "/images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/images/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").textContent = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
  });

  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = `${percent}%`;
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-2%";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  document.getElementById("previous").addEventListener("click", () => {
    let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
    if (index > 0) playMusic(songs[index - 1]);
  });

  document.getElementById("next").addEventListener("click", () => {
    let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
    if (index + 1 < songs.length) playMusic(songs[index + 1]);
  });
}
