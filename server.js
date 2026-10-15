// Run: node server.js  → open http://localhost:3000
// Serves the landing page and saves every order into orders.json
const http = require('http'), fs = require('fs'), path = require('path');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png' };

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/order') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const file = path.join(__dirname, 'orders.json');
        const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
        list.push(JSON.parse(body));
        fs.writeFileSync(file, JSON.stringify(list, null, 2));
        res.writeHead(200).end('{"ok":true}');
      } catch { res.writeHead(400).end('{"ok":false}'); }
    });
    return;
  }
  const name = req.url === '/' ? '1.html' : decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
  const file = path.join(__dirname, path.normalize(name));
  if (!file.startsWith(__dirname) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end('Not found');
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(3000, () => console.log('SHIRT.co running at http://localhost:3000'));
