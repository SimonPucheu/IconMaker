var lightContainer = document.querySelector('main #lightContainer');
var darkContainer = document.querySelector('main #darkContainer');
var form = document.querySelector('form#form');
var download = document.querySelector('button#download');

const JSZip = window.JSZip;
var zip = new JSZip();

form.onsubmit = function () {
    var formData = new FormData(form);
    var lightIcon = formData.get('lightIcon');
    var lightIconPresent = lightIcon.size > 0;
    var darkIcon = formData.get('darkIcon');
    var darkIconPresent = darkIcon.size > 0;
    for (const key of formData.keys()) {
        if (key[0] == 's') {
            if (lightIconPresent)
                generate(lightIcon, parseInt(key.substring(1).split('_')[0]), parseInt(key.substring(1).split('_')[1]), lightContainer);
            if (darkIconPresent)
                generate(darkIcon, parseInt(key.substring(1).split('_')[0]), parseInt(key.substring(1).split('_')[1]), darkContainer, true);
        }
    }
}

download.onclick = function () {
    downloadZIP(zip);
}

function generate(icon, w, h, container, dark = false) {
    container.innerHTML = '';
    const reader = new FileReader();
    reader.readAsDataURL(icon);
    reader.onload = (e) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = () => {
            var canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.onclick = function () {
                alert(`Size: ${this.width}x${this.height}`);
            }
            container.appendChild(canvas);
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = dark ? 'black' : 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (w == h)
                ctx.drawImage(image, 0, 0, w, h);
            if (w < h)
                ctx.drawImage(image, 0, h / 2 - (image.height * (w / image.width)) / 2, w, image.height * (w / image.width));
            if (w > h)
                ctx.drawImage(image, w / 2 - (image.width * (h / image.height)) / 2, 0, image.width * (h / image.height), h);
            console.log((dark ? 'Dark' : 'Light') + '/' + w + '.' + h + '.png');
            addDataURLToZIP(zip.folder('Icons'), (dark ? 'Dark' : 'Light') + '/' + w + '.' + h + '.png', canvas.toDataURL('image/png'));
            download.classList.remove('hide');
        };
    };
    reader.onerror = (e) => {
        console.error(e);
    };
}

function dataURLToBlob(dataURL) {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (var i = 0; i < rawLength; i++) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
}

function addDataURLToZIP(zip, name, dataURL) {
    zip.file(name, dataURLToBlob(dataURL), { binary: true });
}

function downloadZIP(zip) {
    zip.generateAsync({ type: 'blob' }).then(function (blob) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = function () {
            const dataURL = reader.result;
            const link = document.createElement('a');
            link.download = 'Icons.zip';
            link.href = dataURL;
            link.click();
        };
    });
}