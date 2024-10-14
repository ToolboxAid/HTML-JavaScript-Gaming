function drawShape() {
    var canvas = document.getElementById('gameArea');
    
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "#767eff";
        ctx.fillRect(0, 0, gameAreaWidth, gameAreaHeight);
        ctx.save();
        
        for (let gx = 0; gx <= gameAreaHeight; gx += 100) {
            ctx.beginPath();
            ctx.moveTo(0, gx);
            ctx.lineTo(gameAreaWidth, gx);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#3600af';
            ctx.stroke();
        }
        for (let gy = 0; gy <= gameAreaWidth; gy += 100) {
            ctx.beginPath();
            ctx.moveTo(gy, 0);
            ctx.lineTo(gy, gameAreaHeight);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#ed9700';
            ctx.stroke();
        }

        ctx.fillStyle = 'yellow';
        ctx.fillRect(15, 15, 120, 120); 
        ctx.save();
        ctx.fillStyle = 'red';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(30, 30, 90, 90);
        ctx.restore();
        ctx.fillRect(45, 45, 60, 60);   
        ctx.restore();
        ctx.fillStyle = '#00808080';
        ctx.fillRect(60, 60, 70, 70);  
    } else {
        alert('You need a modern browser to see this demo.');
    }
    console.log("---------------------");
}

function setDivs() {			
    document.getElementById('canW').textContent = "can: " + document.getElementById('gameArea').clientWidth + " x " + document.getElementById('gameArea').clientHeight;	
    document.getElementById('divW').textContent = "div: " + document.getElementById('gameAreaContainer').getBoundingClientRect().width + " x " + 
        document.getElementById('gameAreaContainer').getBoundingClientRect().height;	
    document.getElementById('docW').textContent = "document: " + document.documentElement.clientWidth + " x " + document.documentElement.clientHeight;	
    document.getElementById('wdowW').textContent = "window: " + window.innerWidth + " X " + window.innerHeight;			
    document.getElementById('scrnW').textContent = "screen: " + screen.width + " X " + screen.height;	

    console.log(document.getElementById('canW').textContent);
    console.log(document.getElementById('divW').textContent);
    console.log(document.getElementById('docW').textContent);
    console.log(document.getElementById('scrnW').textContent);
}
