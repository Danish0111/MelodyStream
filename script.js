console.log("Lets write JS");
let currentSong = new Audio();
let songs;
let currfolder;
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);

  // Adding leading zeros if necessary
  let minutesString = String(minutes).padStart(2, '0');
  let secondsString = String(remainingSeconds).padStart(2, '0');

  return `${minutesString}:${secondsString}`;
}


async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let as = div.getElementsByTagName("a")
  songs = []
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }
  }
  let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
  songUL.innerHTML = ""
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li>
        <img class="invert" src="music.svg" alt="">
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
        </div>
        <div class="playNow">
          <img class="invert" src="play2.svg" alt="">
        </div>
      </li>`;
  }
  // attach an event listener to each song
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    })
  })
  return songs

}
const playMusic = (track, pause = false) => {
  currentSong.src = `/${currfolder}/` + track
  if (!pause) {
    currentSong.play()
    play.src = "pause.svg"
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00 /00:00"
}
async function displayAlbums(folder) {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a")
  let cardContainer = document.querySelector(".card-container")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs")) {
      let folder = (e.href.split("/").slice(-2)[0])
      // fet the meta data of the folder
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
        <div class="play">
          <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150" fill="none">
            <!-- Green Circle (smaller size) -->
            <circle cx="71" cy="72" r="25" fill="#1fdf64" />
            <!-- SVG Path -->
            <g transform="translate(40, 40)">
              <!-- Add padding and align in center -->
              <g transform="translate(20, 20)">
                <!-- Increase the size and fill with black color -->
                <path d="M5 20V4L19 12L5 20Z" fill="#000000" stroke="#000000" stroke-width="1.5"
                  stroke-linejoin="round" />
              </g>
            </g>
          </svg>
        </div>
        <img src="/songs/${folder}/cover.jpg" alt="">                             
        <h2>${response.heading}</h2>
        <p>${response.description}</p>
      </div>`

    }
  }
  // add the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0])

    })
  })
}
  async function main() {
    await getSongs("songs/NCS")
    playMusic(songs[0], true)

    // display all the albums to the page
    displayAlbums()

    // attach an event listener to play, prev and next
    play.addEventListener("click", () => {
      if (currentSong.paused) {
        currentSong.play()
        play.src = "pause.svg"

      }
      else {
        currentSong.pause()
        play.src = "play.svg"
      }
    })

    // listen for time update event
    currentSong.addEventListener("timeupdate", () => {
      document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
      document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
      let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
      document.querySelector(".circle").style.left = percent + "%";
      currentSong.currentTime = (currentSong.duration * percent) / 100
    })

    // add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
      document.querySelector(".left").style.left = "-2%"
    })

    // add event listener to close
    document.querySelector(".close").addEventListener("click", () => {
      document.querySelector(".left").style.left = "-120%"
    })

    // add event listener for seekbar
    document.querySelector(".seekbar").addEventListener("mouseover", () => {
      document.querySelector(".circle").style.width = "15px"
      document.querySelector(".circle").style.height = "15px"
    })
    document.querySelector(".seekbar").addEventListener("mouseout", () => {
      document.querySelector(".circle").style.width = "13px"
      document.querySelector(".circle").style.height = "13px"
    })

    // add event listener to previous
    previous.addEventListener("click", () => {
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
      if ((index - 1) >= 0) {
        playMusic(songs[index - 1])
      }
    })

    // add event listener to next
    next.addEventListener("click", () => {
      currentSong.pause()
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
      if ((index + 1) < songs.length) {
        playMusic(songs[index + 1])
      }
    })


  }
  main() 