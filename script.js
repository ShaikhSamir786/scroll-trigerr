gsap.registerPlugin(ScrollTrigger);

// total frames you have
const FRAME_COUNT = 382;          // change if different
const frames = {
    currentIndex: 0,
    maxIndex: FRAME_COUNT - 1
};

const images = [];
let imagesLoaded = 0;

// path generator: ./frames/compressed_0001.png etc.
// adjust folder + name pattern here
const currentFrame = (index) =>
    `./frames/frame_${String(index + 1).toString().padStart(4, "0")}.jpeg`;

// canvas setup
const canvas = document.getElementById("sequence");
const context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// preload all frames
function preloadImages() {
    for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = currentFrame(i);

        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === FRAME_COUNT) {
                // when all loaded, draw the first frame and start animation
                updateDimensions();
                drawFrame(frames.currentIndex);
                startAnimation();
            }
        };

        img.onerror = () => {
            console.error(`Failed to load frame: ${i}`);
            imagesLoaded++;
            if (imagesLoaded === FRAME_COUNT) {
                updateDimensions();
                drawFrame(frames.currentIndex);
                startAnimation();
            }
        };

        images.push(img);
    }
}

// draw frame on canvas with proper scaling + centering
function drawFrame(index) {
    if (index < 0 || index > frames.maxIndex) return;

    const image = images[index];
    if (!image || image.width === 0) return;

    // resize canvas (for first draw + on resize)
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // calculate scale to cover canvas while preserving aspect ratio
    const scaleX = canvasWidth / image.width;
    const scaleY = canvasHeight / image.height;
    const scale = Math.max(scaleX, scaleY);

    const newWidth = image.width * scale;
    const newHeight = image.height * scale;

    const offsetX = (canvasWidth - newWidth) / 2;
    const offsetY = (canvasHeight - newHeight) / 2;

    context.clearRect(0, 0, canvasWidth, canvasHeight);

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(image, offsetX, offsetY, newWidth, newHeight);

    frames.currentIndex = index;
}

// gsap + ScrollTrigger to tie scroll to frames
function startAnimation() {
    const parent = document.getElementById("parent");

    gsap.to(frames, {
        currentIndex: frames.maxIndex,
        ease: "none",
        scrollTrigger: {
            trigger: parent,
            start: "top top",
            end: "bottom bottom",
            scrub: 1
            // markers: true, // enable for debugging
        },
        onUpdate: () => {
            const frameIndex = Math.floor(frames.currentIndex);
            drawFrame(frameIndex);
        }
    });
}

function updateDimensions() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// keep canvas responsive
window.addEventListener("resize", () => {
    updateDimensions();
    drawFrame(Math.floor(frames.currentIndex));
});

// kick things off
preloadImages();
