class Canvas {
    constructor(element, image) {
        this.canvas = element;
        this.image = image;
        this.ctx = this.canvas.getContext('2d');
        this.rect = {};
        this.drag = false;
    }

    init() {
        this.canvas.addEventListener('mousedown', this.start.bind(this), false);
        this.canvas.addEventListener('mouseup', this.stop.bind(this), false);
        this.canvas.addEventListener('mousemove', this.draw.bind(this), false);
    }

    start(e) {
        // Ajusta as coordenadas do mouse para levar em consideração a rolagem da página
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
    
    sendToServer(x, y, width, height) {
        // Obtém os dados da imagem apenas da área selecionada
        let imageData = this.ctx.getImageData(x, y, width, height);
        
        // Cria um novo canvas para o recorte
        let newCanvas = document.createElement('canvas');
        newCanvas.width = width;
        newCanvas.height = height;
        
        // Desenha o recorte no novo canvas
        let newCtx = newCanvas.getContext('2d');
        newCtx.putImageData(imageData, 0, 0);

        // Converte o novo canvas para data URL e envia para o servidor
        let dataUrl = newCanvas.toDataURL();
        socket.socket.send(JSON.stringify({
            type: 'tesseract',
            dataUrl: dataUrl
        }));
    }
}
