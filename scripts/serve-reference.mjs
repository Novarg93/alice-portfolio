import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';

const assets = new Map([
    ['/', ['../reference/index.html', 'text/html; charset=utf-8']],
    ['/index.html', ['../reference/index.html', 'text/html; charset=utf-8']],
    ['/about-video/yoga.mp4', ['../reference/about-video/yoga.mp4', 'video/mp4']],
    ...['yoga-2', 'cat', 'fortress', 'it-picnic'].map((name) => [
        '/about-video/' + name + '.mp4',
        ['../public/videos/' + name + '.mp4', 'video/mp4'],
    ]),
]);

const server = createServer(async (request, response) => {
    if (request.url === '/favicon.ico') {
        response.writeHead(204).end();
        return;
    }
    const asset = assets.get(request.url?.split('?')[0]);
    if (!asset || !['GET', 'HEAD'].includes(request.method)) {
        response.writeHead(404).end();
        return;
    }

    const [relativePath, type] = asset;
    const file = new URL(relativePath, import.meta.url);
    try {
        const { size } = await stat(file);
        const headers = { 'Content-Type': type, 'Content-Length': size };
        const range = type === 'video/mp4' && request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
        if (type === 'video/mp4') headers['Accept-Ranges'] = 'bytes';
        let start = 0;
        let end = size - 1;
        if (range) {
            start = Number(range[1]);
            if (range[2]) end = Math.min(end, Number(range[2]));
            if (start > end) {
                response.writeHead(416, { 'Content-Range': 'bytes */' + size }).end();
                return;
            }
            headers['Content-Length'] = end - start + 1;
            headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' + size;
        }
        response.writeHead(range ? 206 : 200, headers);
        if (request.method === 'HEAD') {
            response.end();
        } else {
            const stream = createReadStream(file, { start, end });
            stream.on('error', () => response.destroy());
            response.on('close', () => stream.destroy());
            stream.pipe(response);
        }
    } catch {
        response.writeHead(500).end();
    }
});

const port = Number(process.env.REFERENCE_PORT ?? 8765);
server.listen(port, '127.0.0.1', () => console.log('Original portfolio running at http://127.0.0.1:' + port));
