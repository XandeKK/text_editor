class Canvas {
    constructor(element, image) {
        this.canvas = element;
        this.image = image;
        this.ctx = this.canvas.getContext('2d');
        this.rect = {};
        this.drag = false;
    }

    init() {
        this.canvas.addEventListener('mousedown', this.handleClick.bind(this), false);
    }

    start(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.rect.startX = e.clientX - rect.left;
        this.rect.startY = e.clientY - rect.top;
        this.drag = true;
    }

    stop() {
        this.drag = false;
        this.sendToServer(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
    }

    draw(e) {
        if (this.drag) {
            const rect = this.canvas.getBoundingClientRect();
            this.rect.w = (e.clientX - rect.left) - this.rect.startX;
            this.rect.h = (e.clientY - rect.top) - this.rect.startY ;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.strokeRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
        }
    }

    handleClick(e) {
        if (!this.rect.startX) {
            const rect = this.canvas.getBoundingClientRect();
            this.rect.startX = e.clientX - rect.left;
            this.rect.startY = e.clientY - rect.top;
        } else {
            const rect = this.canvas.getBoundingClientRect();
            this.rect.w = (e.clientX - rect.left) - this.rect.startX;
            this.rect.h = (e.clientY - rect.top) - this.rect.startY ;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.strokeRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);

            this.sendToServer(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);

            this.rect.startX = null;
            this.rect.startY = null;
        }
    }
    
    sendToServer(x, y, width, height) {
        let imageData = this.ctx.getImageData(x, y, width, height);
        
        let newCanvas = document.createElement('canvas');
        newCanvas.width = width;
        newCanvas.height = height;
        
        let newCtx = newCanvas.getContext('2d');
        newCtx.putImageData(imageData, 0, 0);

        let dataUrl = newCanvas.toDataURL();
        socket.socket.send(JSON.stringify({
            type: 'tesseract',
            dataUrl: dataUrl
        }));
    }
}
