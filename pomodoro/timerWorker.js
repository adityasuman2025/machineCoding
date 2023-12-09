let interval;

self.addEventListener('message', (e) => {
    switch (e.data) {
        case 'start':
            interval = setInterval(() => {
                self.postMessage('tick');
            }, 1000);
            break;
        case 'stop':
            clearInterval(interval);
            break;
    }
}, false);