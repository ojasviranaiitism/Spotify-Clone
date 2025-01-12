console.log("Let's write Javascript!")

let currentSong = new Audio();
let songs;
let currFolder;

//Function to convert seconds to minutes:seconds format (i.e. 00:12)
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0){
        return("00:00")
    }

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
  
    // Format minutes and seconds to always show two digits
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  
    // Combine and return the result
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
                        <img class="invert" src="music.svg" alt="">
                        <div class="info">
                            <div class="songName">${song.replaceAll("%20", " ")}</div>
                            <div class="songArtist"></div>
                        </div>
                        <div class="playnow">
                            <span>Play Now</span>
                            <img class="invert" src="playnow.svg" alt="">
                        </div>
         </li>`
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            //Play Music function
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
    
}

const playMusic = (track, pause=false)=>{
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause){
        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlubms(){
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")){
            let folder = e.href.split("/").slice(-2)[0];
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json()
            // Adding cards inside the cardContainer
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <!-- Play button of card -->
                        <div class="play">
                            <svg fill="#000000" width="28px" height="28px" viewBox="-60 0 512 512" xmlns="http://www.w3.org/2000/svg" ><title>play</title><path d="M64 96L328 256 64 416 64 96Z" /></svg>
                        </div>
                        <!-- Image of card -->
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <!-- Title and details of card -->
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //Load songs when clicked on playlist
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            // console.log(item, item.currentTarget.dataset);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })
}

async function main(){

    //Get the list of all the songs
    await getSongs("songs/mySongs")
    playMusic(songs[0], true)

    ///Display all the albums on the page
    displayAlubms()

    //Attach an event listener to play, next and previous
    play.addEventListener("click", ()=>{
        if (currentSong.paused){
            currentSong.play()
            play.src = "pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    //Listen for time update function
    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime /currentSong.duration) * 100 + "%";
    })
    
    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e)=>{
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    })

    //Add an event listener for Hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0";
    })

    //Add an event listener for cross
    document.querySelector(".cross").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-150%";
    })

    //Add event listener to Previous
    previous.addEventListener("click", ()=>{
        console.log("Previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index-1) >= 0){
            playMusic(songs[index-1])
        }
        
    })

    //Add event listener to next
    next.addEventListener("click", ()=>{
        console.log("Next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index+1) < songs.length){
            playMusic(songs[index+1])
        }
    })

    //Add event listener to Volume range
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        console.log("Setting volume to ", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value)/100;
    })

    //Add event listener to volume svg to mute and unmute
    document.querySelector(".volume>img").addEventListener("click", (e)=>{
        console.log(e.target.src);
        if (e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.5
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50
        }
    })

} 

main()