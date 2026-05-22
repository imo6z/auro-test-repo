// ── ADMIN CONTRACTS JS ──
// Handles Electronic Contracts Logic

const AdminContracts = {
  collection: 'contracts',

  init() {
    document.addEventListener('AdminDBReady', () => {
      this.loadContracts();
    });
    
    document.addEventListener('TabChanged', (e) => {
      if(e.detail.tab === 'tab-contracts') {
        this.loadContracts();
      }
    });

    this.setupEventListeners();
  },

  setupEventListeners() {
    const btnNew = document.getElementById('btn-new-contract');
    if (btnNew) {
      btnNew.addEventListener('click', () => this.openModal());
    }

    const form = document.getElementById('form-contract');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveContract();
      });
    }
  },

  async loadContracts() {
    const list = document.getElementById('contracts-list');
    if(!list) return;

    const contracts = await AdminApp.getDocuments(this.collection);
    
    list.innerHTML = '';
    if(contracts.length === 0) {
      list.innerHTML = '<div class="empty-state">لا توجد عقود حتى الآن.</div>';
      return;
    }

    let html = `<table class="data-table">
      <thead>
        <tr>
          <th>رقم العقد</th>
          <th>العميل</th>
          <th>تاريخ الإنشاء</th>
          <th>القيمة</th>
          <th>الحالة</th>
          <th>إجراءات</th>
        </tr>
      </thead>
      <tbody>`;

    contracts.forEach(c => {
      const badgeCls = c.status === 'signed' ? 'badge-signed' : (c.status === 'sent' ? 'badge-sent' : 'badge-draft');
      const badgeTxt = c.status === 'signed' ? 'موقّع' : (c.status === 'sent' ? 'مُرسل' : 'مسودة');
      
      html += `<tr>
        <td>#${c.contractNumber}</td>
        <td>${c.clientName}</td>
        <td>${new Date(c.createdAt).toLocaleDateString('ar-SA')}</td>
        <td>${c.totalValue} ريال</td>
        <td><span class="badge ${badgeCls}">${badgeTxt}</span></td>
        <td>
          <div class="action-links">
            <button class="view" title="عرض" onclick="AdminContracts.viewContract('${c.id}')">👁️</button>
            <button class="download" title="تحميل / طباعة" onclick="AdminContracts.printContract('${c.id}')">📥</button>
            <button class="copy" title="نسخ الرابط" onclick="AdminContracts.copyLink('${c.id}')">🔗</button>
            <button class="edit" title="تعديل" onclick="AdminContracts.editContract('${c.id}')">✏️</button>
            <button class="delete" title="حذف" onclick="AdminContracts.deleteContract('${c.id}')">🗑</button>
          </div>
        </td>
      </tr>`;
    });

    html += `</tbody></table>`;
    list.innerHTML = html;
  },

  openModal(data = null) {
    const modal = document.getElementById('modal-contract');
    if(!modal) return;
    
    const form = document.getElementById('form-contract');
    form.reset();
    document.getElementById('contract-id').value = '';

    if (data) {
      document.getElementById('contract-id').value = data.id;
      document.getElementById('contract-client').value = data.clientName || '';
      document.getElementById('contract-phone').value = data.phone || '';
      document.getElementById('contract-city').value = data.city || '';
      document.getElementById('contract-status').value = data.status || 'draft';
      document.getElementById('contract-event-type').value = data.eventType || '';
      document.getElementById('contract-event-date').value = data.eventDate || '';
      document.getElementById('contract-event-time').value = data.eventTime || '';
      document.getElementById('contract-event-loc').value = data.eventLoc || '';
      document.getElementById('contract-corner').value = data.cornerType || '';
      document.getElementById('contract-guests').value = data.guests || '';
      document.getElementById('contract-duration').value = data.duration || '';
      document.getElementById('contract-additions').value = data.additions || '';
      document.getElementById('contract-service-val').value = data.serviceVal || 0;
      document.getElementById('contract-deposit-val').value = data.depositVal || 500;
    } else {
      document.getElementById('contract-status').value = 'draft';
      document.getElementById('contract-service-val').value = 0;
      document.getElementById('contract-deposit-val').value = 500;
    }

    modal.classList.add('active');
    this.calculateTotal();
  },

  closeModal() {
    document.getElementById('modal-contract').classList.remove('active');
  },

  calculateTotal() {
    const serviceVal = parseFloat(document.getElementById('contract-service-val').value) || 0;
    const depositVal = parseFloat(document.getElementById('contract-deposit-val').value) || 0;
    const total = serviceVal + depositVal;
    
    const display = document.getElementById('contract-total-display');
    if(display) display.textContent = total.toFixed(2) + ' ريال';
    return total;
  },

  async saveContract() {
    const id = document.getElementById('contract-id').value;
    const serviceVal = parseFloat(document.getElementById('contract-service-val').value) || 0;
    const depositVal = parseFloat(document.getElementById('contract-deposit-val').value) || 0;
    const totalValue = serviceVal + depositVal;
    
    const data = {
      id: id || undefined,
      clientName: document.getElementById('contract-client').value,
      phone: document.getElementById('contract-phone').value,
      city: document.getElementById('contract-city').value,
      status: document.getElementById('contract-status').value,
      eventType: document.getElementById('contract-event-type').value,
      eventDate: document.getElementById('contract-event-date').value,
      eventTime: document.getElementById('contract-event-time').value,
      eventLoc: document.getElementById('contract-event-loc').value,
      cornerType: document.getElementById('contract-corner').value,
      guests: document.getElementById('contract-guests').value,
      duration: document.getElementById('contract-duration').value,
      additions: document.getElementById('contract-additions').value,
      serviceVal,
      depositVal,
      totalValue,
      contractNumber: id ? undefined : Math.floor(100000 + Math.random() * 900000).toString(),
      createdAt: id ? undefined : Date.now(),
      updatedAt: Date.now()
    };

    await AdminApp.saveDocument(this.collection, data);
    AdminApp.showToast('تم حفظ العقد بنجاح');
    this.closeModal();
    this.loadContracts();
  },

  async editContract(id) {
    const docs = await AdminApp.getDocuments(this.collection);
    const doc = docs.find(d => d.id === id);
    if(doc) this.openModal(doc);
  },

  async deleteContract(id) {
    if(confirm('هل أنت متأكد من حذف هذا العقد؟')) {
      await AdminApp.deleteDocument(this.collection, id);
      AdminApp.showToast('تم الحذف بنجاح');
      this.loadContracts();
    }
  },

  viewContract(id) {
    const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
    const link = baseUrl + '/contract.html?id=' + id + '&admin=1';
    window.open(link, '_blank');
  },

  printContract(id) {
    const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
    const link = baseUrl + '/contract.html?id=' + id + '&print=1&admin=1';
    window.open(link, '_blank');
  },

  copyLink(id) {
    const baseUrl = window.location.href.split('?')[0].split('#')[0].replace('/admin.html', '');
    const link = baseUrl + '/contract.html?id=' + id;
    navigator.clipboard.writeText(link).then(() => {
      AdminApp.showToast('تم نسخ رابط العقد: ' + link);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminContracts.init();
});
