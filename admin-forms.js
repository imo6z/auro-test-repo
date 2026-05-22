// ── ADMIN FORMS JS ──
// Handles Delivery and Receipt Forms (Projects, Devices, Files)

const AdminForms = {
  collection: 'forms',

  init() {
    document.addEventListener('AdminDBReady', () => {
      this.loadForms();
    });
    
    document.addEventListener('TabChanged', (e) => {
      if(e.detail.tab === 'tab-forms') {
        this.loadForms();
      }
    });

    this.setupEventListeners();
  },

  setupEventListeners() {
    const btnNew = document.getElementById('btn-new-form');
    if (btnNew) {
      btnNew.addEventListener('click', () => this.openModal());
    }

    const btnAddItem = document.getElementById('btn-form-add-item');
    if (btnAddItem) {
      btnAddItem.addEventListener('click', () => this.addFormItemRow());
    }

    const form = document.getElementById('form-receipt');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveForm();
      });
    }
  },

  async loadForms() {
    const list = document.getElementById('forms-list');
    if(!list) return;

    const forms = await AdminApp.getDocuments(this.collection);
    
    list.innerHTML = '';
    if(forms.length === 0) {
      list.innerHTML = '<div class="empty-state">لا توجد استمارات حتى الآن.</div>';
      return;
    }

    let html = `<table class="data-table">
      <thead>
        <tr>
          <th>الرقم</th>
          <th>النوع</th>
          <th>العميل</th>
          <th>التاريخ</th>
          <th>الحالة</th>
          <th>إجراءات</th>
        </tr>
      </thead>
      <tbody>`;

    forms.forEach(f => {
      const typeLabel = f.type === 'delivery' ? 'تسليم' : 'استلام';
      const badgeCls = f.status === 'signed' ? 'badge-signed' : 'badge-draft';
      const badgeTxt = f.status === 'signed' ? 'موقّع' : 'بانتظار التوقيع';
      
      html += `<tr>
        <td>#${f.formNumber}</td>
        <td>${typeLabel}</td>
        <td>${f.clientName}</td>
        <td>${new Date(f.createdAt).toLocaleDateString('ar-SA')}</td>
        <td><span class="badge ${badgeCls}">${badgeTxt}</span></td>
        <td>
          <div class="action-links">
            <button class="view" title="عرض" onclick="AdminForms.viewForm('${f.id}')">👁️</button>
            <button class="download" title="تحميل / طباعة" onclick="AdminForms.printForm('${f.id}')">📥</button>
            <button class="copy" title="نسخ الرابط" onclick="AdminForms.copyLink('${f.id}')">🔗</button>
            <button class="edit" title="تعديل" onclick="AdminForms.editForm('${f.id}')">✏️</button>
            <button class="delete" title="حذف" onclick="AdminForms.deleteForm('${f.id}')">🗑</button>
          </div>
        </td>
      </tr>`;
    });

    html += `</tbody></table>`;
    list.innerHTML = html;
  },

  openModal(data = null) {
    const modal = document.getElementById('modal-form');
    if(!modal) return;
    
    const formEl = document.getElementById('form-receipt');
    formEl.reset();
    document.getElementById('form-items-container').innerHTML = ''; // clear items
    document.getElementById('form-id').value = '';

    if (data) {
      document.getElementById('form-id').value = data.id;
      document.getElementById('form-type').value = data.type || 'delivery';
      document.getElementById('form-status').value = data.status || 'pending';
      document.getElementById('form-order-id').value = data.orderId || '';
      document.getElementById('form-client').value = data.clientName || '';
      document.getElementById('form-phone').value = data.phone || '';
      document.getElementById('form-event-date').value = data.eventDate || '';
      document.getElementById('form-event-loc').value = data.eventLoc || '';
      document.getElementById('form-corner').value = data.cornerType || '';
      
      document.getElementById('form-damage-type').value = data.damageType || '';
      document.getElementById('form-damage-desc').value = data.damageDesc || '';
      document.getElementById('form-damage-val').value = data.damageVal || 0;
      document.getElementById('form-damage-deduct').value = data.damageDeduct || 0;
      document.getElementById('form-damage-extra').value = data.damageExtra || 0;
      document.getElementById('form-notes').value = data.notes || '';

      if(data.items && data.items.length) {
         data.items.forEach(item => this.addFormItemRow(item));
      } else {
         this.addFormItemRow();
      }
    } else {
      document.getElementById('form-type').value = 'delivery';
      document.getElementById('form-status').value = 'pending';
      document.getElementById('form-damage-val').value = 0;
      document.getElementById('form-damage-deduct').value = 0;
      document.getElementById('form-damage-extra').value = 0;
      this.addFormItemRow();
    }

    modal.classList.add('active');
  },

  closeModal() {
    document.getElementById('modal-form').classList.remove('active');
  },

  addFormItemRow(data = { name: '', state: 'موجود', qty: 1, notes: '' }) {
    const container = document.getElementById('form-items-container');
    const row = document.createElement('div');
    row.className = 'form-row';
    row.style.marginBottom = '10px';
    row.innerHTML = `
      <input type="text" class="form-control item-name" placeholder="اسم الغرض" value="${data.name}" required style="flex:2">
      <select class="form-control item-state" style="flex:1">
        <option value="موجود" ${data.state === 'موجود' ? 'selected' : ''}>✅ موجود</option>
        <option value="غير موجود" ${data.state === 'غير موجود' ? 'selected' : ''}>❌ غير موجود</option>
        <option value="متضرر" ${data.state === 'متضرر' ? 'selected' : ''}>⚠️ متضرر</option>
      </select>
      <input type="number" class="form-control item-qty" placeholder="الكمية" value="${data.qty}" min="1" style="width:70px">
      <input type="text" class="form-control item-notes" placeholder="ملاحظات" value="${data.notes}" style="flex:1">
      <button type="button" class="btn-danger" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(row);
  },

  async saveForm() {
    const id = document.getElementById('form-id').value;
    
    const items = [];
    document.querySelectorAll('#form-items-container .form-row').forEach(row => {
      items.push({
        name: row.querySelector('.item-name').value,
        state: row.querySelector('.item-state').value,
        qty: parseInt(row.querySelector('.item-qty').value) || 1,
        notes: row.querySelector('.item-notes').value
      });
    });

    const data = {
      id: id || undefined,
      type: document.getElementById('form-type').value,
      status: document.getElementById('form-status').value,
      orderId: document.getElementById('form-order-id').value,
      clientName: document.getElementById('form-client').value,
      phone: document.getElementById('form-phone').value,
      eventDate: document.getElementById('form-event-date').value,
      eventLoc: document.getElementById('form-event-loc').value,
      cornerType: document.getElementById('form-corner').value,
      damageType: document.getElementById('form-damage-type').value,
      damageDesc: document.getElementById('form-damage-desc').value,
      damageVal: parseFloat(document.getElementById('form-damage-val').value) || 0,
      damageDeduct: parseFloat(document.getElementById('form-damage-deduct').value) || 0,
      damageExtra: parseFloat(document.getElementById('form-damage-extra').value) || 0,
      notes: document.getElementById('form-notes').value,
      items,
      formNumber: id ? undefined : Math.floor(100000 + Math.random() * 900000).toString(),
      createdAt: id ? undefined : Date.now(),
      updatedAt: Date.now()
    };

    await AdminApp.saveDocument(this.collection, data);
    AdminApp.showToast('تم حفظ الاستمارة بنجاح');
    this.closeModal();
    this.loadForms();
  },

  async editForm(id) {
    const docs = await AdminApp.getDocuments(this.collection);
    const doc = docs.find(d => d.id === id);
    if(doc) this.openModal(doc);
  },

  async deleteForm(id) {
    if(confirm('هل أنت متأكد من حذف هذه الاستمارة؟')) {
      await AdminApp.deleteDocument(this.collection, id);
      AdminApp.showToast('تم الحذف بنجاح');
      this.loadForms();
    }
  },

  viewForm(id) {
    const baseUrl = window.location.href.split('?')[0].split('#')[0].replace('/admin.html', '');
    const link = baseUrl + '/form.html?id=' + id + '&admin=1';
    window.open(link, '_blank');
  },

  printForm(id) {
    const baseUrl = window.location.href.split('?')[0].split('#')[0].replace('/admin.html', '');
    const link = baseUrl + '/form.html?id=' + id + '&print=1&admin=1';
    window.open(link, '_blank');
  },

  copyLink(id) {
    const baseUrl = window.location.href.split('?')[0].split('#')[0].replace('/admin.html', '');
    const link = baseUrl + '/form.html?id=' + id;
    navigator.clipboard.writeText(link).then(() => {
      AdminApp.showToast('تم نسخ رابط الاستمارة: ' + link);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminForms.init();
});
