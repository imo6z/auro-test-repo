// ── ADMIN INVOICES JS ──
// Handles Invoice & Quotation Logic

const AdminInvoices = {
  collection: 'invoices',
  
  init() {
    document.addEventListener('AdminDBReady', () => {
      this.loadInvoices();
    });
    
    document.addEventListener('TabChanged', (e) => {
      if(e.detail.tab === 'tab-invoices') {
        this.loadInvoices();
      }
    });

    this.setupEventListeners();
  },

  setupEventListeners() {
    const btnNewInvoice = document.getElementById('btn-new-invoice');
    if (btnNewInvoice) {
      btnNewInvoice.addEventListener('click', () => this.openInvoiceModal());
    }
    
    // Add item button
    const btnAddItem = document.getElementById('btn-inv-add-item');
    if (btnAddItem) {
      btnAddItem.addEventListener('click', () => this.addInvoiceItemRow());
    }

    const form = document.getElementById('form-invoice');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveInvoice();
      });
    }
  },

  async loadInvoices() {
    const list = document.getElementById('invoices-list');
    if(!list) return;
    
    const invoices = await AdminApp.getDocuments(this.collection);
    
    list.innerHTML = '';
    if(invoices.length === 0) {
      list.innerHTML = '<div class="empty-state">لا توجد فواتير أو عروض أسعار.</div>';
      return;
    }

    let html = `<table class="data-table">
      <thead>
        <tr>
          <th>الرقم</th>
          <th>النوع</th>
          <th>العميل</th>
          <th>التاريخ</th>
          <th>الإجمالي</th>
          <th>الحالة</th>
          <th>إجراءات</th>
        </tr>
      </thead>
      <tbody>`;

    invoices.forEach(inv => {
      const isQuote = inv.type === 'quote';
      const badgeCls = isQuote ? 'badge-draft' : (inv.status === 'paid' ? 'badge-signed' : 'badge-sent');
      const badgeTxt = isQuote ? 'عرض سعر' : (inv.status === 'paid' ? 'مدفوعة' : 'بانتظار الدفع');
      
      html += `<tr>
        <td>#${inv.invoiceNumber}</td>
        <td>${isQuote ? 'عرض سعر' : 'فاتورة'}</td>
        <td>${inv.clientName}</td>
        <td>${new Date(inv.createdAt).toLocaleDateString('ar-SA')}</td>
        <td>${inv.total} ريال</td>
        <td><span class="badge ${badgeCls}">${badgeTxt}</span></td>
        <td>
          <div class="action-links">
            <button class="view" title="عرض" onclick="AdminInvoices.viewInvoice('${inv.id}')">👁️</button>
            <button class="download" title="تحميل / طباعة" onclick="AdminInvoices.printInvoice('${inv.id}')">📥</button>
            <button class="copy" title="نسخ الرابط" onclick="AdminInvoices.copyLink('${inv.id}')">🔗</button>
            <button class="edit" title="تعديل" onclick="AdminInvoices.editInvoice('${inv.id}')">✏️</button>
            <button class="delete" title="حذف" onclick="AdminInvoices.deleteInvoice('${inv.id}')">🗑</button>
          </div>
        </td>
      </tr>`;
    });

    html += `</tbody></table>`;
    list.innerHTML = html;
  },

  openInvoiceModal(data = null) {
    const modal = document.getElementById('modal-invoice');
    if(!modal) return;
    
    const form = document.getElementById('form-invoice');
    form.reset();
    document.getElementById('inv-id').value = '';

    if (data) {
      document.getElementById('inv-id').value = data.id;
      document.getElementById('inv-type').value = data.type || 'quote';
      document.getElementById('inv-status').value = data.status || 'pending';
      document.getElementById('inv-client').value = data.clientName || '';
      document.getElementById('inv-phone').value = data.phone || '';
      document.getElementById('inv-city').value = data.city || '';
      document.getElementById('inv-pay-method').value = data.payMethod || '';
      document.getElementById('inv-event-date').value = data.eventDate || '';
      document.getElementById('inv-event-loc').value = data.eventLoc || '';
      document.getElementById('inv-corner').value = data.cornerType || '';
      document.getElementById('inv-event-type').value = data.eventType || '';
      document.getElementById('inv-guests').value = data.guests || '';
      document.getElementById('inv-duration').value = data.duration || '';
      document.getElementById('inv-additions').value = data.additions || '';
      document.getElementById('inv-service-val').value = data.serviceVal || 0;
      document.getElementById('inv-deposit-val').value = data.depositVal || 500;
      document.getElementById('inv-deposit-status').value = data.depositStatus || 'held';
      document.getElementById('inv-notes').value = data.notes || '';
    } else {
      document.getElementById('inv-type').value = 'quote';
      document.getElementById('inv-status').value = 'pending';
      document.getElementById('inv-service-val').value = 0;
      document.getElementById('inv-deposit-val').value = 500;
      document.getElementById('inv-deposit-status').value = 'held';
    }

    modal.classList.add('active');
    this.calculateTotal();
  },

  closeInvoiceModal() {
    document.getElementById('modal-invoice').classList.remove('active');
  },

  calculateTotal() {
    const serviceVal = parseFloat(document.getElementById('inv-service-val').value) || 0;
    const depositVal = parseFloat(document.getElementById('inv-deposit-val').value) || 0;
    const total = serviceVal + depositVal;
    
    const display = document.getElementById('inv-total-display');
    if(display) display.textContent = total.toFixed(2) + ' ريال';
    return total;
  },

  async saveInvoice() {
    const id = document.getElementById('inv-id').value;
    
    const serviceVal = parseFloat(document.getElementById('inv-service-val').value) || 0;
    const depositVal = parseFloat(document.getElementById('inv-deposit-val').value) || 0;
    const total = serviceVal + depositVal;

    const data = {
      id: id || undefined,
      type: document.getElementById('inv-type').value,
      status: document.getElementById('inv-status').value,
      clientName: document.getElementById('inv-client').value,
      phone: document.getElementById('inv-phone').value,
      city: document.getElementById('inv-city').value,
      payMethod: document.getElementById('inv-pay-method').value,
      eventDate: document.getElementById('inv-event-date').value,
      eventLoc: document.getElementById('inv-event-loc').value,
      cornerType: document.getElementById('inv-corner').value,
      eventType: document.getElementById('inv-event-type').value,
      guests: document.getElementById('inv-guests').value,
      duration: document.getElementById('inv-duration').value,
      additions: document.getElementById('inv-additions').value,
      serviceVal,
      depositVal,
      depositStatus: document.getElementById('inv-deposit-status').value,
      notes: document.getElementById('inv-notes').value,
      total,
      invoiceNumber: id ? undefined : Math.floor(100000 + Math.random() * 900000).toString(),
      createdAt: id ? undefined : Date.now(),
      updatedAt: Date.now()
    };

    await AdminApp.saveDocument(this.collection, data);
    AdminApp.showToast('تم حفظ الفاتورة بنجاح');
    this.closeInvoiceModal();
    this.loadInvoices();
  },

  async editInvoice(id) {
    const docs = await AdminApp.getDocuments(this.collection);
    const doc = docs.find(d => d.id === id);
    if(doc) {
      this.openInvoiceModal(doc);
    }
  },

  async deleteInvoice(id) {
    if(confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      await AdminApp.deleteDocument(this.collection, id);
      AdminApp.showToast('تم الحذف بنجاح');
      this.loadInvoices();
    }
  },

  viewInvoice(id) {
    const baseUrl = window.location.href.split('?')[0].split('#')[0].replace('/admin.html', '');
    const link = baseUrl + '/invoice.html?id=' + id;
    window.open(link, '_blank');
  },

  printInvoice(id) {
    const baseUrl = window.location.href.split('?')[0].split('#')[0].replace('/admin.html', '');
    const link = baseUrl + '/invoice.html?id=' + id + '&print=1';
    window.open(link, '_blank');
  },

  copyLink(id) {
    const baseUrl = window.location.href.split('?')[0].split('#')[0].replace('/admin.html', '');
    const link = baseUrl + '/invoice.html?id=' + id;
    navigator.clipboard.writeText(link).then(() => {
      AdminApp.showToast('تم نسخ رابط الفاتورة: ' + link);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminInvoices.init();
});
