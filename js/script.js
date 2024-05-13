let currentsong = new Audio();
let songs;
let currentfolder;

function secondsToMinuteSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0){
        return "00:00";
    }

    const minutes = Math.floor(seconds/60);
    const remainingSeconds = Math.floor(seconds%60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}





async function getSongs(folder){
    currentfolder = folder;

    let a = await fetch(`${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for ( let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`${folder}/`)[1])
        }
    }



    //All the Songs in the Playlist    
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
                  <img class="invert" src="icons/music.svg" alt="">
                  <div class="info">
                    <div class="mar">${song.replaceAll("%20", " ")}</div>
                    <div>${song.split("-")[1].replaceAll("%20", " ").replaceAll(".mp3", " ")}</div>
                  </div>
                  <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="icons/playnow.svg" alt="">
                  </div>
        </li>` ;
    }

    //Attach Event Listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e =>{
        e.addEventListener("click", element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            document.querySelector(".left").style.left = "-120%"
            play.src = "icons/play.svg"
        })
    })

    return songs

}

const playMusic =  (track, pause=false)=>{
    // let audio = new Audio("/songs/" + track)
    currentsong.src = `/${currentfolder}/` + track

    if(!currentsong){
        currentsong.play()
        play.src = "icons/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}

async function displayAlbums(){
    try{
        let a = await fetch(`/songs/`)
        let response = await a.text();
        let div = document.createElement("div")
        let cardContainer = document.querySelector(".cardcontainer")
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a")
        
        let array = Array.from(anchors)


            for (let index = 0; index < array.length; index++) {
                const e = array[index];
            
                if(e.href.includes("/songs/")){
                    let folder = e.href.split("/").slice(-1)[0]

                    //Get metadata of folder
                    let a = await fetch(`songs/${folder}/info.json`)
                    let response = await a.json();

                    cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                    <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" color="#ffffff" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
                        <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="currentColor" />
                    </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt=""> 
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`
                }
        }

        //Load libraries Automatically
        Array.from(document.getElementsByClassName("card")).forEach(e=>{
            e.addEventListener("click", async item=>{
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                playMusic(songs[0])
            })
        })
    }

    catch (error) {
        console.log("Error:", error);
    }

}



async function main(){

    await getSongs("songs/One_Direction")
    playMusic(songs[0], true)

    //Display all the albums on the Page
    displayAlbums()


    //Attach event listener to buttons
    play.addEventListener("click", ()=>{
        if(currentsong.paused){
            currentsong.play()
            play.src = "icons/pause.svg"

        }
        else{
            currentsong.pause()
            play.src = "icons/play.svg"
        }
    })

    //Time Update
    currentsong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML = `${secondsToMinuteSeconds(currentsong.currentTime)}/${secondsToMinuteSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime/currentsong.duration) * 100 + "%";
    })

    //Event Listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent)/100
    })


    //Event listener to Hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    //Previous
    previous.addEventListener("click", ()=>{
        currentsong.pause()

        let index = songs.indexOf(currentsong.src.split("/").slice(-1) [0])
        if((index-1) >= 0){
            playMusic(songs[index-1])
            play.src = "icons/play.svg"
        }
    })

    //Next
    next.addEventListener("click", ()=>{
        currentsong.pause()

        let index = songs.indexOf(currentsong.src.split("/").slice(-1) [0])
        if((index+1) < songs.length){
            playMusic(songs[index+1])
            play.src = "icons/play.svg"
        }
    })

    //Volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        currentsong.volume = parseInt(e.target.value)/100
        if(currentsong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("icons/volumemute.svg", "icons/volumefull.svg")
        }
    })

    //Mute
    document.querySelector(".volume>img").addEventListener("click", e=>{
        if(e.target.src.includes("icons/volumefull.svg")){
            e.target.src = e.target.src.replace("icons/volumefull.svg", "icons/volumemute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }

        else{
            e.target.src = e.target.src.replace("icons/volumemute.svg", "icons/volumefull.svg")
            currentsong.volume = 0.50;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
        }
    })


}

main()
