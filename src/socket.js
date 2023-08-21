class Socket {
    constructor() {
        this.socket = new WebSocket('ws://localhost:8080');
        this.handler = {
            translate: this.translate,
            images: this.images,
            error: this.get_error,
            message: this.get_message
        };

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

    images(msg) {
        const images = document.getElementById('images');
        images.innerHTML = '';

        for (var i = 0; i < msg.images.length; i++) {
            const img = msg.images[i]

            const div = document.createElement('div');
            div.className = 'flex mb-2'

            const img_tag = document.createElement('img');
            img_tag.src = msg.popped_images + '/' + img;

            const number = document.createElement('span');
            number.textContent = i + 1;
            number.className = 'p-2 text-3xl'

            div.appendChild(img_tag);
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

    // Retorna o texto formatado
    return text;
}