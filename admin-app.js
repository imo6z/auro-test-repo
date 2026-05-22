// ── ADMIN APP JS ──
// Handles general Admin dashboard logic, routing, and Firebase/LocalStorage Fallback.

const AdminApp = {
  db: null,
  storage: null,
  useFirebase: false,

  init() {
    this.checkFirebase();
    this.setupNavigation();
  },

  checkFirebase() {
    // Wait until firebase is loaded or fallback
    const interval = setInterval(() => {
      if (window.firebase && window.firebase.firestore) {
        this.db = window.firebase.firestore();
        this.storage = window.firebase.storage();
        this.useFirebase = true;
        clearInterval(interval);
        console.log("🔥 AdminApp: Firebase initialized successfully.");
        // Notify modules
        document.dispatchEvent(new Event('AdminDBReady'));
      }
    }, 500);

    // Fallback if not loaded after 5s
    setTimeout(() => {
      if (!this.useFirebase) {
        console.warn("⚠️ AdminApp: Firebase not loaded, falling back to localStorage.");
        document.dispatchEvent(new Event('AdminDBReady'));
      }
    }, 5000);
  },

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabs = document.querySelectorAll('.admin-tab-content');

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Hide all tabs
        tabs.forEach(t => t.classList.add('hidden'));
        navItems.forEach(n => n.classList.remove('active'));
        
        // Show selected tab
        const tabId = item.getAttribute('data-tab');
        const targetTab = document.getElementById(tabId);
        if (targetTab) {
          targetTab.classList.remove('hidden');
          item.classList.add('active');
          
          // Trigger tab specific load event
          document.dispatchEvent(new CustomEvent('TabChanged', { detail: { tab: tabId } }));
        }
      });
    });
  },

  // Generic DB wrapper
  async saveDocument(collection, data) {
    if (this.useFirebase) {
      try {
        if (data.id) {
          await this.db.collection(collection).doc(data.id).set(data, { merge: true });
          this.logAudit('UPDATE', collection, data.id);
        } else {
          const docRef = await this.db.collection(collection).add(data);
          data.id = docRef.id;
          await docRef.set(data, { merge: true }); // save ID inside doc
          this.logAudit('CREATE', collection, data.id);
        }
        return data;
      } catch (e) {
        console.error("Firebase save error:", e);
        return this.saveLocal(collection, data);
      }
    } else {
      return this.saveLocal(collection, data);
    }
  },

  saveLocal(collection, data) {
    const key = `auro_${collection}`;
    let items = JSON.parse(localStorage.getItem(key) || '[]');
    if (!data.id) {
      data.id = collection + '_' + Date.now();
      items.push(data);
    } else {
      const idx = items.findIndex(i => i.id === data.id);
      if (idx > -1) {
        items[idx] = data;
      } else {
        items.push(data);
      }
    }
    localStorage.setItem(key, JSON.stringify(items));
    return data;
  },

  async getDocuments(collection) {
    if (this.useFirebase) {
      try {
        const snap = await this.db.collection(collection).orderBy('createdAt', 'desc').get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.warn("Firebase get error, using local fallback", e);
        return this.getLocal(collection);
      }
    }
    return this.getLocal(collection);
  },

  getLocal(collection) {
    const key = `auro_${collection}`;
    return JSON.parse(localStorage.getItem(key) || '[]').sort((a,b) => b.createdAt - a.createdAt);
  },
  
  async deleteDocument(collection, id) {
    if (this.useFirebase) {
      try {
        await this.db.collection(collection).doc(id).delete();
        this.logAudit('DELETE', collection, id);
        return true;
      } catch (e) {
        return this.deleteLocal(collection, id);
      }
    }
    return this.deleteLocal(collection, id);
  },
  
  deleteLocal(collection, id) {
    const key = `auro_${collection}`;
    let items = JSON.parse(localStorage.getItem(key) || '[]');
    items = items.filter(i => i.id !== id);
    localStorage.setItem(key, JSON.stringify(items));
    return true;
  },
  
  showToast(msg, type='success') {
    // using existing toast logic or create new
    if(window.showToast) {
       window.showToast(msg);
    } else {
       alert(msg);
    }
  },

  async logAudit(action, collection, docId) {
    const log = {
       action,
       collection,
       docId,
       timestamp: Date.now(),
       adminUser: 'admin'
    };
    if (this.useFirebase) {
       try { await this.db.collection('audit_logs').add(log); } catch(e){}
    } else {
       let logs = JSON.parse(localStorage.getItem('auro_audit_logs') || '[]');
       logs.push(log);
       localStorage.setItem('auro_audit_logs', JSON.stringify(logs));
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});
