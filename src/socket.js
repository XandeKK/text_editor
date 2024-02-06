class Socket {
    constructor() {
        this.socket = new WebSocket('ws://localhost:8080');
        this.handler = {
            tesseract: this.tesseract.bind(this),
            translate: this.translate,
            images: this.images,
            error: this.get_error,
            message: this.get_message
        };
        this.translate_el = document.getElementById('translate');

        this.socket_event();
        this.event();
    }

    event() {
        document.getElementById('translate').addEventListener('change', evt=> {
            this.socket.send(JSON.stringify({
                type: 'translate',
                text: evt.target.value
            }));
        });

        document.getElementById('send').addEventListener('click', evt=> {
            window.folder_traducao = document.getElementById('folder_traducao').value;
            this.socket.send(JSON.stringify({
                type: 'send',
                folder_images: document.getElementById('folder_images').value,
                folder_traducao: window.folder_traducao
            }));
        });

        document.getElementById('save').addEventListener('click', evt=> {
            this.socket.send(JSON.stringify({
                type: 'save',
                folder_traducao: window.folder_traducao,
                text: document.getElementById('text').value
            }));
        });
    }

    socket_event() {
        this.socket.onopen = () => {
            Alert.alert('Connected to server!');
        };

        this.socket.onmessage = (event) => {
            const json = JSON.parse(event.data);
            this.handler[json.type](json);
        };

        this.socket.onclose = () => {
            Alert.alert('Disconnected from server');
        };
    }

    tesseract(data) {
        let msg = data.msg;
        msg = msg.toLowerCase();
        msg = msg.replaceAll('\n', ' ');
        msg = msg.replaceAll(/  +/g, ' ');
        msg = msg.trim();

        this.translate_el.value = msg;
        this.translate_el.dispatchEvent(new Event('change'));

        copyToClipboard(`Tradução de "${msg}"`);
    }

    images(msg) {
        const images = document.getElementById('images');
        images.innerHTML = '';

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const canvas = entry.target;
                    const ctx = canvas.getContext('2d');
                    const img_tag = new Image();
                    img_tag.src = canvas.dataset.src;
                    img_tag.onload = function() {
                        const _canvas = new Canvas(canvas, img_tag);
                        _canvas.init();

                        canvas.height = canvas.width * (img_tag.height / img_tag.width);
                        ctx.drawImage(img_tag, 0, 0, canvas.width, canvas.height);
                    }
                    observer.unobserve(canvas);
                }
            });
        });

        for (var i = 0; i < msg.images.length; i++) {
            const img = msg.images[i]

            const div = document.createElement('div');
            div.className = 'flex mb-2'

            const canvas = document.createElement('canvas');
            canvas.width = images.offsetWidth;
            canvas.height = 5000;
            canvas.dataset.src = msg.popped_images + '/' + img;

            observer.observe(canvas);

            const number = document.createElement('span');
            number.textContent = i + 1;
            number.className = 'p-2 text-3xl'

            div.appendChild(canvas);
            div.appendChild(number);

            images.appendChild(div);
        }

        if (msg.has_text) {
            document.getElementById('text').value = msg.text;
        }
    }

    translate(msg) {
        const result = document.getElementById('result');
        result.innerHTML = formatAnsiToTailwind(msg.text);
        result.scrollTo({
            top: 1000,
            behavior: "smooth",
        });
    }

    get_error(msg) {
        Alert.alert(JSON.stringify(msg.message), 'danger');
    }

    get_message(msg) {
        Alert.alert(JSON.stringify(msg.message), 'info');
    }
}

const socket = new Socket();

function formatAnsiToTailwind(text) {
    // Substitui códigos ANSI por classes Tailwind
    text = text.replace(/\u001b\[1m/g, '<span class="font-bold">');
    text = text.replace(/\u001b\[22m/g, '</span>');
    text = text.replace(/\u001b\[4m/g, '<span class="underline">');
    text = text.replace(/\u001b\[24m/g, '</span>');
    text = text.replace(/\n/g, '<br>');

    return text;
}

window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = '';
});

const copyToClipboard = (text) => {
    if (window.isSecureContext && navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            console.log('Texto copiado para a área de transferência');
        } catch (err) {
            console.error('Erro ao copiar texto para a área de transferência', err);
        }

        document.body.removeChild(textArea);
    }
};
