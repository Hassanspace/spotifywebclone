let songs;
let currentsong = new Audio();
let currentfolder;

// Event listener for Menu Open / Close
document.querySelector(".hamburger").addEventListener("click", () => {
  let menu = document.querySelector(".left");
  menu.style.left = "0%";
});
document.querySelector(".close").addEventListener("click", () => {
  let menu = document.querySelector(".left");
  menu.style.left = "-100%";
});

// Convert seconds to MM:SS format
function convertSecondsToMinuteSecond(seconds) {
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

// Get songs
async function getsongs(folder) {
  currentfolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currentfolder}/`)[1]);
    }
  }
  let songUL = document.querySelector(".songlist ul");
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <i class="ri-music-2-fill"></i>
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Hassan</div>
        </div>
        <div class="playnow">
          <i class="ri-play-circle-line"></i>
        </div>
      </li>`;
  }

  // Attach event to each song
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentsong.src = `/${currentfolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".card-container");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    let folder = e.href.split("/").slice(-1)[0];
    if (e.href.includes("/songs") && folder !== "songs") {
      console.log(folder);
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);
      cardcontainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <div class="play"><i class="ri-play-circle-fill"></i></div>
          <img src="/songs/${folder}/cover.jpg" alt="" >
          <h3>${response.title}</h3>
          <p>${response.description}</p>
        </div>`;
    }
  }
  
  // Show library of folders clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    console.log(e);
    e.addEventListener("click", async (item) => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
      Swal.fire("Library Loaded ! Click Menu");



    });
  });
}

// Display all songs
async function main() {
  await getsongs("songs/urdu");
  playMusic(songs[0], true);

  // Display All Albums on the Page
  displayAlbums();
  
  // Attach event to play, next, previous
  document.getElementById("play").addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      document.getElementById("play").src = "pause.svg";
    } else {
      currentsong.pause();
      document.getElementById("play").src = "play.svg";
    }
  });

  // Update time duration
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(
      ".songtime"
    ).innerHTML = `${convertSecondsToMinuteSecond(currentsong.currentTime)}
        /${convertSecondsToMinuteSecond(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  // Seek bar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  // Event listener for previous and forward buttons
  document.getElementById("previous").addEventListener("click", () => {
    let currentSongUrl = currentsong.src.split("/").slice(-1)[0];
    console.log("Current Song URL:", currentSongUrl);

    let index = songs.indexOf(currentSongUrl);
    console.log("Current Index:", index);

    if (index > 0) {
      // Ensure index is within bounds
      let prevSongUrl = songs[index - 1];
      console.log("Previous Song URL:", prevSongUrl);
      playMusic(prevSongUrl);
    } else {
      console.log("No previous song available");
    }
  });

  document.getElementById("next").addEventListener("click", () => {
    let currentSongUrl = currentsong.src.split("/").slice(-1)[0];
    console.log("Current Song URL:", currentSongUrl);

    let index = songs.indexOf(currentSongUrl);
    console.log("Current Index:", index);

    if (index < songs.length - 1) {
      // Ensure index is within bounds
      let nextSongUrl = songs[index + 1];
      console.log("Next Song URL:", nextSongUrl);
      playMusic(nextSongUrl);
    } else {
      console.log("No next song available");
    }
  });

  // Automatically play the next song when the current song ends
  currentsong.addEventListener("ended", () => {
    let currentSongUrl = currentsong.src.split("/").slice(-1)[0];
    let index = songs.indexOf(currentSongUrl);
    if (index < songs.length - 1) {
      let nextSongUrl = songs[index + 1];
      playMusic(nextSongUrl);
    }
  });

  // Event listener for volume
  document.querySelector(".range input").addEventListener("change", (e) => {
    currentsong.volume = parseInt(e.target.value) / 100;
  });
  
  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", e => { 
    if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentsong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        currentsong.volume = .50;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
    }
  });
}

main();

// Alert for signup/login
function showAlert() {
  let login = document.getElementById("login");
  let signup = document.getElementById("signup");

  login.addEventListener("click", function () {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "This is a fake button for front end!",
      footer: "Made by Hassan With LOve!!!",
    });
  });

  signup.addEventListener("click", function () {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "This is a fake button for front end!",
      footer: "Made By Hassan With Love !!!",
    });
  });
}

showAlert();
