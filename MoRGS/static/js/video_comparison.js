function playVids(videoId) {
    var videoMerge = document.getElementById(videoId + "Merge");
    var vid = document.getElementById(videoId);

    var pos1 = 0.33;
    var pos2 = 0.66;

    var vidWidth = vid.videoWidth / 3;
    var vidHeight = vid.videoHeight;

    var ctx = videoMerge.getContext("2d");

    let dragging = null;

    if (vid.readyState > 3) {
        vid.play();

        function getX(e) {
            var bcr = videoMerge.getBoundingClientRect();
            return ((e.touches ? e.touches[0].pageX : e.pageX) - bcr.x) / bcr.width;
        }

        // =========================
        // 드래그
        // =========================
        videoMerge.addEventListener("mousedown", (e) => {
            let x = getX(e);
            if (Math.abs(x - pos1) < 0.05) dragging = "p1";
            else if (Math.abs(x - pos2) < 0.05) dragging = "p2";
        });

        videoMerge.addEventListener("mousemove", (e) => {
            if (!dragging) return;

            let x = getX(e);

            if (dragging === "p1") {
                pos1 = Math.min(Math.max(x, 0), pos2 - 0.02);
            } else {
                pos2 = Math.max(Math.min(x, 1), pos1 + 0.02);
            }
        });

        videoMerge.addEventListener("mouseup", () => dragging = null);
        videoMerge.addEventListener("mouseleave", () => dragging = null);

        // =========================
        // 렌더링
        // =========================
        function drawLoop() {

            // clear
            ctx.clearRect(0, 0, videoMerge.width, videoMerge.height);

            let w = videoMerge.width;
            let h = videoMerge.height;

            let x1 = w * pos1;
            let x2 = w * pos2;

            function drawRegion(dstX0, dstX1, srcOffset) {
                let dstW = dstX1 - dstX0;
                if (dstW <= 0) return;

                let srcX = (dstX0 / w) * vidWidth;

                ctx.drawImage(
                    vid,
                    srcOffset + srcX, 0, (dstW / w) * vidWidth, vidHeight,
                    dstX0, 0, dstW, h
                );
            }

            // 🔥 3개 영역
            drawRegion(0, x1, 0);                // A
            drawRegion(x1, x2, vidWidth);        // B
            drawRegion(x2, w, vidWidth * 2);     // C

            drawDivider(x1, h);
            drawDivider(x2, h);

            requestAnimationFrame(drawLoop);
        }

        function drawDivider(x, h) {

            var arrowLength = 0.09 * h;
            var arrowheadWidth = 0.025 * h;
            var arrowheadLength = 0.04 * h;
            var arrowPosY = h / 2;
            var arrowWidth = 0.007 * h;

            // =========================
            // 원 (살짝 투명)
            // =========================
            ctx.beginPath();
            ctx.arc(x, arrowPosY, arrowLength * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,0,0,0.25)";  // 🔥 검은 반투명
            ctx.fill();

            // =========================
            // 세로 divider 라인
            // =========================
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#000000";  // 🔥 검은색
            ctx.stroke();

            // =========================
            // 양방향 화살표
            // =========================
            ctx.beginPath();
            ctx.moveTo(x, arrowPosY - arrowWidth/2);

            // 오른쪽
            ctx.lineTo(x + arrowLength/2 - arrowheadLength/2, arrowPosY - arrowWidth/2);
            ctx.lineTo(x + arrowLength/2 - arrowheadLength/2, arrowPosY - arrowheadWidth/2);
            ctx.lineTo(x + arrowLength/2, arrowPosY);
            ctx.lineTo(x + arrowLength/2 - arrowheadLength/2, arrowPosY + arrowheadWidth/2);
            ctx.lineTo(x + arrowLength/2 - arrowheadLength/2, arrowPosY + arrowWidth/2);

            // 왼쪽
            ctx.lineTo(x - arrowLength/2 + arrowheadLength/2, arrowPosY + arrowWidth/2);
            ctx.lineTo(x - arrowLength/2 + arrowheadLength/2, arrowPosY + arrowheadWidth/2);
            ctx.lineTo(x - arrowLength/2, arrowPosY);
            ctx.lineTo(x - arrowLength/2 + arrowheadLength/2, arrowPosY - arrowheadWidth/2);
            ctx.lineTo(x - arrowLength/2 + arrowheadLength/2, arrowPosY - arrowWidth/2);

            ctx.closePath();
            ctx.fillStyle = "#000000";  // 🔥 검은색
            ctx.fill();
        }

        requestAnimationFrame(drawLoop);
    }
}


// =========================
// resize
// =========================
// function resizeAndPlay(element) {
//     var cv = document.getElementById(element.id + "Merge");

//     cv.width = element.videoWidth / 3;
//     cv.height = element.videoHeight;

//     element.play();
//     element.style.height = "0px";

//     playVids(element.id);
// }

function resizeAndPlay(element) {
    var cv = document.getElementById(element.id + "Merge");

    // 🔥 중복 방지
    if (cv.dataset.init) return;
    cv.dataset.init = true;

    cv.width = element.videoWidth / 3;
    cv.height = element.videoHeight;

    element.style.display = "none";  // 🔥 필수

    playVids(element.id);
}