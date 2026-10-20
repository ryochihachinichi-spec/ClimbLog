self.addEventListener("install", function (event) {
    console.log("ClimbLog Service Worker installed.");
});

self.addEventListener("activate", function (event) {
    console.log("ClimbLog Service Worker activated.");
});