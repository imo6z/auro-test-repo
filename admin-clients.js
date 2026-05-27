// ── ADMIN CLIENTS JS ──
// Handles Client Management

const AdminClients = {
  collection: 'clients',

  init() {
    document.addEventListener('AdminDBReady', () => {
      this.loadClients();
    });
    
    document.addEventListener('TabChanged', (e) => {
      if(e.detail.tab === 'tab-clients') {
        this.loadClients();
      }
    });

    this.setupEventListeners();
  },

  setupEventListeners() {
    const btnNew = document.getElementById('btn-new-client');
    if (btnNew) {
      btnNew.addEventListener('click', () => this.openModal());
    }

    const form = document.getElementById('form-client');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveClient();
      });
    }
  },

  async loadClients() {
    const list = document.getElementById('clients-list');
    if(!list) return;

    // We can also extract unique clients from auro_bookings
    let clients = await AdminApp.getDocuments(this.collection);

    list.innerHTML = '';
    if(clients.length === 0) {
      list.innerHTML = '<div class="empty-state">لا يوجد عملاء حتى الآن.</div>';
      return;
    }

    let html = `<table class="data-table">
      <thead>
        <tr>
          <th>الاسم</th>
          <th>الجوال</th>
          <th>المدينة</th>
          <th>تاريخ الإضافة</th>
          <th>إجراءات</th>
        </tr>
      </thead>
      <tbody>`;

    clients.forEach(c => {
      html += `<tr>
        <td>${c.name}</td>
        <td><a href="https://wa.me/${c.phone}" target="_blank" style="color:var(--admin-gold);text-decoration:none;">${c.phone}</a></td>
        <td>${c.city || '—'}</td>
        <td>${new Date(c.createdAt).toLocaleDateString('ar-SA')}</td>
        <td>
          <div class="action-links">
            <button class="edit" title="تعديل" onclick="AdminClients.editClient('${c.id}')">✏️</button>
            <button class="delete" title="حذف" onclick="AdminClients.deleteClient('${c.id}')">🗑</button>
          </div>
        </td>
      </tr>`;
    });

    html += `</tbody></table>`;
    list.innerHTML = html;
  },

  openModal(data = null) {
    const modal = document.getElementById('modal-client');
    if(!modal) return;
    
    const formEl = document.getElementById('form-client');
    formEl.reset();
    document.getElementById('client-id').value = '';

    if (data) {
      document.getElementById('client-id').value = data.id;
      document.getElementById('client-name').value = data.name;
      document.getElementById('client-phone').value = data.phone;
      document.getElementById('client-city').value = data.city || '';
      document.getElementById('client-notes').value = data.notes || '';
    }

    modal.classList.add('active');
  },

  closeModal() {
    document.getElementById('modal-client').classList.remove('active');
  },

  async saveClient() {
    const id = document.getElementById('client-id').value;
    
    const data = {
      id: id || undefined,
      name: document.getElementById('client-name').value,
      phone: document.getElementById('client-phone').value,
      city: document.getElementById('client-city').value,
      notes: document.getElementById('client-notes').value,
      createdAt: id ? undefined : Date.now(),
      updatedAt: Date.now()
    };

    await AdminApp.saveDocument(this.collection, data);
    AdminApp.showToast('تم حفظ العميل بنجاح');
    this.closeModal();
    this.loadClients();
  },

  async editClient(id) {
    const docs = await AdminApp.getDocuments(this.collection);
    const doc = docs.find(d => d.id === id);
    if(doc) this.openModal(doc);
  },

  async deleteClient(id) {
    if(confirm('هل أنت متأكد من حذف هذا العميل؟ لا ينصح بذلك للحفاظ على السجلات.')) {
      await AdminApp.deleteDocument(this.collection, id);
      AdminApp.showToast('تم الحذف بنجاح');
      this.loadClients();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminClients.init();
});
