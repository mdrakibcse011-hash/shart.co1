const PRICE = 600, OLD_PRICE = 1000;
const $ = id => document.getElementById(id);
let qty = 1, lastOrder = null;

// Scroll to / reveal order form
$('orderBtn').onclick = () => $('order').scrollIntoView({ behavior: 'smooth' });
new IntersectionObserver((e, o) => e.forEach(x => { if (x.isIntersecting) { x.target.classList.add('show'); o.unobserve(x.target); } }), { threshold: 0.12 })
  .observe($('order'));

// Price summary
const delivery = () => +document.querySelector('input[name=area]:checked').value;
function update() {
  $('qty').textContent = qty;
  $('sPrice').textContent = PRICE * qty + ' Taka';
  $('sDel').textContent = delivery() + ' Taka';
  $('sTotal').textContent = PRICE * qty + delivery() + ' Taka';
}
$('plus').onclick = () => { if (qty < 10) qty++; update(); };
$('minus').onclick = () => { if (qty > 1) qty--; update(); };
document.querySelectorAll('input[name=area]').forEach(r => r.onchange = update);
$('phone').oninput = e => e.target.value = e.target.value.replace(/\D/g, '');

// Submit
$('orderForm').onsubmit = e => {
  e.preventDefault();
  const name = $('name').value.trim(), phone = $('phone').value.trim(), address = $('address').value.trim();
  if (name.length < 3) return fail('Please enter your full name.');
  if (!/^01[3-9]\d{8}$/.test(phone)) return fail('Enter a valid 11-digit phone number (01XXXXXXXXX).');
  if (address.length < 8) return fail('Please enter your full address.');
  fail('');

  const d = delivery(), now = new Date();
  lastOrder = {
    id: 'SC' + now.getTime().toString().slice(-7),
    date: now.toLocaleString('en-GB'),
    name, phone, address,
    area: d === 80 ? 'Inside Dhaka' : 'Outside Dhaka',
    size: document.querySelector('input[name=size]:checked').value,
    qty, price: PRICE * qty, delivery: d, total: PRICE * qty + d
  };
  fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lastOrder) }).catch(() => {});
  drawPoster(lastOrder);
  $('modal').classList.add('open');
};
const fail = m => $('err').textContent = m;

// Poster (drawn on canvas so it can be downloaded as PNG)
function drawPoster(o) {
  const c = $('poster'), x = c.getContext('2d'), W = 800;
  x.fillStyle = '#fff'; x.fillRect(0, 0, W, 1100);
  const g = x.createLinearGradient(0, 0, W, 260);
  g.addColorStop(0, '#146b3a'); g.addColorStop(1, '#0d4d29');
  x.fillStyle = g; x.fillRect(0, 0, W, 260);

  x.fillStyle = '#fff'; x.textAlign = 'center';
  x.font = 'bold 66px Arial'; x.fillText('SHIRT', 330, 110);
  x.font = 'bold 34px Arial'; x.fillText('.co', 505, 110);
  x.font = '600 28px Arial'; x.fillText('✔ ORDER CONFIRMED', W / 2, 180);
  x.font = '20px Arial'; x.fillText('Order #' + o.id + '  •  ' + o.date, W / 2, 222);

  const rows = [['Customer', o.name], ['Phone', o.phone], ['Address', o.address], ['Product', 'Premium Cotton Shirt'],
    ['Size', o.size], ['Quantity', String(o.qty)], ['Delivery Area', o.area]];
  let y = 330;
  rows.forEach(([k, v], i) => {
    x.fillStyle = i % 2 ? '#fff' : '#f3f8f5'; x.fillRect(50, y - 40, 700, 76);
    x.textAlign = 'left'; x.fillStyle = '#667'; x.font = '600 20px Arial'; x.fillText(k, 70, y);
    x.fillStyle = '#14191d'; x.font = 'bold 24px Arial';
    wrap(x, v, 280, y, 450, 28);
    y += 76;
  });

  y += 10;
  x.textAlign = 'left'; x.font = '24px Arial';
  [['Price (' + o.qty + ' × 600)', o.price], ['Delivery charge', o.delivery]].forEach(([k, v]) => {
    x.fillStyle = '#444'; x.textAlign = 'left'; x.fillText(k, 70, y);
    x.textAlign = 'right'; x.fillText(v + ' Taka', 730, y); y += 42;
  });
  x.fillStyle = '#146b3a'; rr(x, 50, y, 700, 90, 16);
  x.fillStyle = '#fff'; x.textAlign = 'left'; x.font = 'bold 30px Arial'; x.fillText('TOTAL (Cash on Delivery)', 75, y + 56);
  x.textAlign = 'right'; x.font = 'bold 38px Arial'; x.fillText(o.total + ' Taka', 725, y + 58);

  x.textAlign = 'center'; x.fillStyle = '#667'; x.font = '20px Arial';
  x.fillText('Thank you for shopping with SHIRT.co!', W / 2, 1040);
  x.fillText('Help: WhatsApp 01639291886', W / 2, 1070);
}
function rr(x, a, b, w, h, r) { x.beginPath(); x.roundRect(a, b, w, h, r); x.fill(); }
function wrap(x, text, px, py, max, lh) {
  let line = '', lines = [];
  text.split(' ').forEach(w => { const t = line + w + ' '; if (x.measureText(t).width > max && line) { lines.push(line); line = w + ' '; } else line = t; });
  lines.push(line);
  lines.slice(0, 2).forEach((l, i) => x.fillText(l.trim(), px, py + i * lh - (lines.length > 1 ? 12 : 0)));
}

// Buttons
$('dlBtn').onclick = () => {
  const a = document.createElement('a');
  a.download = 'SHIRT.co-order-' + lastOrder.id + '.png';
  a.href = $('poster').toDataURL('image/png');
  a.click();
};
$('okBtn').onclick = () => {
  $('modal').classList.remove('open');
  $('orderForm').reset(); qty = 1; update();
  // Go back to where the customer came from; if unknown, return to top of page
  if (document.referrer) location.href = document.referrer;
  else window.scrollTo({ top: 0, behavior: 'smooth' });
};
update();
