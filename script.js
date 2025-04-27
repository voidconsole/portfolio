// const titles = [
//     "Developer",
//     "Designer",
//     "Mathematician",
//     "Inventor",
//     "Philosopher",
// ]
// let currentIndex = 0

// const textElement = document.getElementById("text")
// const orbElement = document.querySelector(".orb")

// function changeTitle() {
//     currentIndex = (currentIndex + 1) % titles.length
//     textElement.textContent = `I am a ${titles[currentIndex]}`
//     orbElement.style.transform = `scale(${1 + Math.random() * 0.2}) rotate(${
//         Math.random() * 360
//     }deg)`
// }

// setInterval(changeTitle, 2000)


// DOM Elements
const clickerElement = document.getElementById("clicker");
const videoElement = document.querySelector("video");
const sceneContainer = document.querySelector("#scene-container");

// Global variables
let videoPauseTimeout;
let videoInterval;
let isVideoStopped = false; // Flag to track video state

// Function to clear unnecessary elements from the DOM
function removeElements() {
	document.body.removeChild(clickerElement);
	document.body.removeChild(videoElement);
}

// Function to handle video playback control
function initializeVideoControl() {
	videoInterval = setInterval(() => {
		if (isVideoStopped) return; // Exit if video is stopped

		if (videoElement.currentTime > 2.2 && videoElement.currentTime < 2.4) {
			videoElement.pause();
			videoPauseTimeout = setTimeout(() => {
				if (isVideoStopped) return; // Exit if video is stopped
				videoElement.play();
			}, 2500);
		}
	}, 200);
}

// Function to handle click event on the clicker element
function handleClickEvent() {
	if (videoElement.currentTime > 1.7 && videoElement.currentTime < 3.7) {
		isVideoStopped = true; // Set the flag to stop video control
		clearInterval(videoInterval);
		clearTimeout(videoPauseTimeout);
		videoElement.pause();

		// Apply transformations to the video element
		videoElement.style.transform = "scale(20)";
		videoElement.style.filter = "blur(20px)";
		videoElement.style.opacity = 0;

		// Initialize Three.js scene
		window.initThree();

		// Fade in the scene container
		setTimeout(() => {
			sceneContainer.style.opacity = 1;
			sceneContainer.style.filter = "blur(0px)";
		}, 2000);

		// Remove elements after a delay
		setTimeout(removeElements, 1100);
	}
}

// Set up the clicker element dimensions
clickerElement.style.width = videoElement.getBoundingClientRect().width * 0.15 + "px";
clickerElement.style.height = videoElement.getBoundingClientRect().height * 0.55 + "px";

// Add event listener to the clicker element
clickerElement.addEventListener("click", handleClickEvent);

// Initialize video playback control
initializeVideoControl();
