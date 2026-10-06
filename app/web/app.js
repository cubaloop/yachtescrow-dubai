/**
 * YachtEscrow Dubai — Front-End Application Controller
 */

const DEFAULT_VESSELS = [
  { id: "ves-1", name: "Majesty 120 Superyacht (37m)", category: "Superyachts", price: 35000, fuelDeposit: 15000, image: "assets/yacht_hero.jpg" },
  { id: "ves-2", name: "Benetti Oasis 40M Tri-Deck", category: "Mega Yachts", price: 85000, fuelDeposit: 30000, image: "assets/interior.jpg" },
  { id: "ves-3", name: "Sunseeker Manhattan 68 Flybridge", category: "Flybridges", price: 18000, fuelDeposit: 8000, image: "assets/yacht_hero.jpg" }
];

const DEFAULT_CATEGORIES = ["All", "Mega Yachts", "Superyachts", "Flybridges"];

let vessels = JSON.parse(localStorage.getItem('ye_vessels') || JSON.stringify(DEFAULT_VESSELS));
let categories = JSON.parse(localStorage.getItem('ye_categories') || JSON.stringify(DEFAULT_CATEGORIES));
let currentCategory = 'All';

function renderVessels() {
  const grid = document.getElementById('vessels-grid');
  const custVesselSelect = document.getElementById('cust-vessel');
  const filtered = currentCategory === 'All' ? vessels : vessels.filter(v => v.category === currentCategory);

  if (grid) {
    grid.innerHTML = filtered.map(v => `
      <div class="bento-card" style="grid-column: span 6; padding: 0; overflow: hidden; display: flex; flex-direction: column;">
        <div style="height: 250px; position: relative;">
          <img src="${v.image || 'assets/yacht_hero.jpg'}" alt="${v.name}" style="width: 100%; height: 100%; object-fit: cover;">
          <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(9, 16, 13, 0.85); color: #FFFDF8; padding: 0.35rem 0.8rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">
            ${Number(v.price).toLocaleString()} AED / 4 Hours
          </span>
        </div>
        <div style="padding: 1.5rem; display: flex; flex-direction: column; flex: 1; justify-content: space-between;">
          <div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--accent-gold); font-weight: 700; margin-bottom: 0.35rem;">${v.category}</div>
            <h3 class="font-display" style="font-size: 1.5rem; color: var(--text-main); margin-bottom: 0.5rem;">${v.name}</h3>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">Fuel Deposit Escrow: <strong>${v.fuelDeposit.toLocaleString()} AED</strong> (Automated Telemetry Refund)</div>
          </div>
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <button class="btn-gold" onclick="openBookingModalForVessel('${v.name}')" style="flex: 1; font-size: 0.85rem;">Reserve Vessel</button>
            <a href="https://wa.me/971508379080" target="_blank" rel="noopener" class="whatsapp-icon-btn" aria-label="WhatsApp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.579 1.831.848 2.791.848 3.18 0 5.767-2.587 5.768-5.768zm7.391 5.765c-.002 4.08-3.315 7.394-7.391 7.394-1.246 0-2.433-.323-3.486-.927l-4.145 1.087 1.107-4.043c-.682-1.096-1.047-2.364-1.048-3.511.002-4.08 3.316-7.394 7.392-7.394 4.076 0 7.39 3.315 7.392 7.394z"/></svg>
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  if (custVesselSelect) {
    custVesselSelect.innerHTML = vessels.map(v => `<option value="${v.name}">${v.name}</option>`).join('');
  }
}

function renderCategories() {
  const container = document.getElementById('category-filters');
  if (container) {
    container.innerHTML = categories.map(cat => `
      <button class="btn-outline" style="padding: 0.4rem 1rem; font-size: 0.85rem; ${cat === currentCategory ? 'background: var(--accent-gold-soft); border-color: var(--accent-gold); color: var(--accent-gold); font-weight: 700;' : ''}" onclick="selectCategory('${cat}')">
        ${cat}
      </button>
    `).join('');
  }
}

function selectCategory(cat) {
  currentCategory = cat;
  renderCategories();
  renderVessels();
}

async function runTelemetryDemo() {
  const res = await fetch('/api/charter/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vesselId: 'MAJESTY-120-DXB',
      charterId: 'CH-9921',
      durationHours: 4,
      fuelConsumedLitres: 480
    })
  });
  const data = await res.json();
  const box = document.getElementById('telemetry-demo-result');
  box.style.display = 'block';
  box.innerText = `Nautical Telemetry Anchor Verified!\nSHA-256 Marine Hash: ${data.telemetryHash}\nActual Fuel Draw: 2,880 AED / 15,000 AED Escrow\nInstant Automated Refund to Charterer: 12,120 AED\nStatus: ZERO-DISPUTE VERIFIED SETTLEMENT`;
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const nxt = cur === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', nxt);
  document.getElementById('theme-icon').innerText = nxt === 'light' ? '🌙' : '☀️';
}

function toggleLanguage() {
  const cur = document.documentElement.getAttribute('dir') || 'ltr';
  const nxt = cur === 'ltr' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', nxt);
  document.getElementById('lang-toggle-btn').innerText = nxt === 'rtl' ? 'English' : 'العربية';
}

function openAdminModal() { document.getElementById('admin-modal').classList.add('active'); }
function closeAdminModal() { document.getElementById('admin-modal').classList.remove('active'); }
function handleBackdropClick(e) { if (e.target.id === 'admin-modal') closeAdminModal(); }

function switchAdminTab(id) {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(id).style.display = 'block';
  document.querySelector(`[data-tab="${id}"]`).classList.add('active');
}

function openBookingModal() { document.getElementById('booking-modal').classList.add('active'); }
function openBookingModalForVessel(name) { openBookingModal(); document.getElementById('cust-vessel').value = name; }
function closeBookingModal() { document.getElementById('booking-modal').classList.remove('active'); }
function handleBookingBackdrop(e) { if (e.target.id === 'booking-modal') closeBookingModal(); }

function handleCustomerCharter(e) {
  e.preventDefault();
  const name = document.getElementById('cust-name').value;
  const vessel = document.getElementById('cust-vessel').value;
  closeBookingModal();
  alert(`Superyacht charter reservation confirmed for ${name} aboard ${vessel}. Telemetry escrow deposit link sent via WhatsApp.`);
}

function exportBackupJSON() {
  const blob = new Blob([JSON.stringify({ vessels, categories }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `yachtescrow_backup_${Date.now()}.json`; a.click();
}

window.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderVessels();
});
