// avc_bookmark_loader.js
(async () => {
    // Check if user is on the allowed page
    if (location.href !== "https://hrms1.mydecibel.com/TMS/AVCD_BulkLeaves.aspx") {
        let p = document.createElement("div");
        p.textContent = "Not Allowed";
        p.style = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:red;color:#fff;padding:12px 25px;border-radius:8px;font-family:sans-serif;font-size:16px;z-index:999999;";
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 2000);
        return;
    }

    // Create script element for the main AVC uploader
    let s = document.createElement("script");
    s.src = "https://zonehomezonehome40-design.github.io/AVC-Leave-uploader-with-Decibel-/avc_leave_uploader.js";
    
    // Optional: Log success or handle errors
    s.onload = () => console.log("AVC Uploader script loaded successfully!");
    s.onerror = () => alert("Failed to load AVC Uploader script.");
    
    document.body.appendChild(s);
})();
