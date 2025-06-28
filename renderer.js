const { ipcRenderer } = require('electron');

let allProjects = [];
let isLoading = false;
let currentProjectsDirectory = '';

// Proje listesini yükle
async function loadProjects() {
  if (isLoading) return;
  isLoading = true;
  
  try {
    const result = await ipcRenderer.invoke('get-projects');
    
    if (result.error) {
      // Hata varsa kullanıcıya göster ve klasör seçmesini iste
      document.getElementById('projectList').innerHTML = 
        `<div class="error-message">
          <h3>Hata: ${result.error}</h3>
          <p>Lütfen geçerli bir proje klasörü seçin.</p>
          <button onclick="selectProjectsDirectory()" class="btn change-path">Klasör Seç</button>
        </div>`;
      return;
    }
    
    allProjects = result.projects || [];
    currentProjectsDirectory = result.projectsDirectory || '';
    
    // Mevcut klasör yolunu güncelle
    updateCurrentPath();
    renderProjects();
    
  } catch (error) {
    console.error('Projeler yüklenemedi:', error);
    document.getElementById('projectList').innerHTML = 
      `<div class="error-message">Projeler yüklenirken hata: ${error.message}</div>`;
  } finally {
    isLoading = false;
  }
}

// Mevcut klasör yolunu güncelle
function updateCurrentPath() {
  const currentPathElement = document.getElementById('currentPath');
  if (currentPathElement) {
    if (currentProjectsDirectory) {
      currentPathElement.textContent = currentProjectsDirectory;
    } else {
      currentPathElement.textContent = 'Henüz klasör seçilmedi';
    }
  }
}

// Klasör seçme
async function selectProjectsDirectory() {
  try {
    // Eğer zaten bir klasör seçilmişse uyarı ver
    if (currentProjectsDirectory) {
      const confirmChange = confirm(
        'Proje klasörünü değiştirmek üzeresiniz.\n\n' +
        'Bu işlem tüm çalışan IIS Express projelerini durduracaktır.\n\n' +
        'Devam etmek istiyor musunuz?'
      );
      
      if (!confirmChange) {
        return;
      }
      
      // Önce tüm projeleri durdur
      try {
        await ipcRenderer.invoke('stop-all-projects');
        console.log('Dizin değiştirme öncesi tüm projeler durduruldu');
      } catch (error) {
        console.log('Projeler durdurulamadı:', error);
      }
    }
    
    const result = await ipcRenderer.invoke('select-projects-directory');
    
    if (result.success) {
      currentProjectsDirectory = result.path;
      updateCurrentPath();
      await loadProjects(); // Yeni klasöre göre projeleri yenile
      
      // Başarı mesajı göster
      const notification = document.createElement('div');
      notification.className = 'notification success';
      notification.textContent = `Proje klasörü seçildi: ${result.path}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
      
    } else {
      if (result.error !== 'Klasör seçilmedi') {
        alert('Klasör seçme hatası: ' + result.error);
      }
    }
  } catch (error) {
    alert('Klasör seçme hatası: ' + error.message);
  }
}

// Projeleri render et
function renderProjects() {
  const filter = document.getElementById('filterInput').value.toLowerCase();
  const projectList = document.getElementById('projectList');
  
  let html = '';
  
  allProjects.forEach((proj, idx) => {
    // Filtre kontrolü
    if (filter && !proj.name.toLowerCase().includes(filter)) {
      return;
    }
    
    const id = `proj_${idx}`;
    const aspFlag = proj.asp ? " <span class='asp-flag'>(ASP)</span>" : '';
    const running = proj.running;
    const status = running ? 'Çalışıyor' : 'Durduruldu';
    const statusClass = running ? 'status-running' : 'status-stopped';
    
    html += `
      <div class='project' id='${id}' data-port='${proj.port}' data-path='${proj.path}'>
        <div class='project-name'>${proj.name}${aspFlag}</div>
        <div class='project-path'>${proj.path}</div>
        <div class='project-port'>Port: ${proj.port}</div>
        <div class='controls'>
          <div class='controls-row'>
            <button class='btn start-btn' ${running ? 'disabled' : ''} onclick='startProject("${id}")' title='Projeyi IIS Express ile başlat'>
              ${running ? 'Çalışıyor' : 'Başlat'}
            </button>
            <button class='btn stop-btn' ${!running ? 'disabled' : ''} onclick='stopProject("${id}")' title='Çalışan projeyi durdur'>
              Durdur
            </button>
          </div>
          <div class='controls-row'>
            <button class='btn open-btn' onclick='openProject("${id}")' title='Projeyi tarayıcıda aç'>
              Tarayıcıda Göster
            </button>
            <button class='btn dir-btn' onclick='openDirectory("${id}")' title='Proje klasörünü Windows Explorer\'da aç'>
              Dizini Aç
            </button>
          </div>
          <span class='status ${statusClass}' id='status_${id}'>${status}</span>
        </div>
      </div>
    `;
  });
  
  if (html) {
    projectList.innerHTML = html;
  } else {
    projectList.innerHTML = '<div class="no-projects">Proje bulunamadı</div>';
  }
}

// Proje başlat
async function startProject(id) {
  const projectDiv = document.getElementById(id);
  const port = projectDiv.dataset.port;
  const path = projectDiv.dataset.path;
  
  // UI'ı hemen güncelle
  updateProjectUI(id, 'starting');
  
  try {
    const result = await ipcRenderer.invoke('start-project', path, parseInt(port));
    
    if (result.success) {
      // Başarılı - UI'ı güncelle
      updateProjectUI(id, 'running');
      // allProjects'i de güncelle
      const index = allProjects.findIndex(p => p.port == port);
      if (index !== -1) {
        allProjects[index].running = true;
      }
    } else {
      // Hata - UI'ı geri al
      updateProjectUI(id, 'stopped');
      alert('Başlatma hatası: ' + result.error);
    }
  } catch (error) {
    updateProjectUI(id, 'stopped');
    alert('Başlatma hatası: ' + error.message);
  }
}

// Port çalışıyor mu kontrol et
async function checkIfPortRunning(port) {
  try {
    const projects = await ipcRenderer.invoke('get-projects');
    const project = projects.find(p => p.port == port);
    return project ? project.running : false;
  } catch (error) {
    return false;
  }
}

// Proje durdur
async function stopProject(id) {
  const projectDiv = document.getElementById(id);
  const port = projectDiv.dataset.port;
  
  // UI'ı hemen güncelle
  updateProjectUI(id, 'stopping');
  
  try {
    const result = await ipcRenderer.invoke('stop-project', parseInt(port));
    
    if (result.success) {
      // Başarılı - UI'ı hemen durduruldu olarak güncelle
      updateProjectUI(id, 'stopped');
      
      // allProjects'i de güncelle
      const index = allProjects.findIndex(p => p.port == port);
      if (index !== -1) {
        allProjects[index].running = false;
      }
    } else {
      // Hata - UI'ı geri al
      updateProjectUI(id, 'running');
      alert('Durdurma hatası: ' + result.error);
    }
  } catch (error) {
    updateProjectUI(id, 'running');
    alert('Durdurma hatası: ' + error.message);
  }
}

// Projeyi tarayıcıda aç
async function openProject(id) {
  const projectDiv = document.getElementById(id);
  const port = projectDiv.dataset.port;
  
  try {
    await ipcRenderer.invoke('open-browser', parseInt(port));
  } catch (error) {
    alert('Tarayıcı açma hatası: ' + error.message);
  }
}

// Dizini aç
async function openDirectory(id) {
  const projectDiv = document.getElementById(id);
  const projectPath = projectDiv.dataset.path;
  
  try {
    const result = await ipcRenderer.invoke('open-directory', projectPath);
    
    if (!result.success) {
      alert('Dizin açma hatası: ' + result.error);
    }
  } catch (error) {
    alert('Dizin açma hatası: ' + error.message);
  }
}

// Tüm projeleri durdur
async function stopAllProjects() {
  const stopAllBtn = document.getElementById('stopAllBtn');
  stopAllBtn.disabled = true;
  stopAllBtn.textContent = 'Durduruluyor...';
  
  try {
    await ipcRenderer.invoke('stop-all-projects');
    
    // Kısa süre sonra tüm proje durumlarını yenile
    setTimeout(async () => {
      await loadProjects();
    }, 2000);
    
  } catch (error) {
    alert('Tümünü durdurma hatası: ' + error.message);
  } finally {
    stopAllBtn.disabled = false;
    stopAllBtn.textContent = 'Tümünü Durdur';
  }
}

// Tek bir projenin durumunu kontrol et
async function refreshProjectStatus(id, port) {
  try {
    // Sadece bu projeyi yeniden kontrol et
    const projects = await ipcRenderer.invoke('get-projects');
    const project = projects.find(p => p.port == port);
    
    if (project) {
      const running = project.running;
      updateProjectUI(id, running ? 'running' : 'stopped');
      
      // allProjects'i de güncelle
      const index = allProjects.findIndex(p => p.port == port);
      if (index !== -1) {
        allProjects[index].running = running;
      }
    }
  } catch (error) {
    console.error('Durum kontrolü hatası:', error);
  }
}

// UI durumunu güncelle
function updateProjectUI(id, state) {
  const projectDiv = document.getElementById(id);
  if (!projectDiv) return;
  
  const startBtn = projectDiv.querySelector('.start-btn');
  const stopBtn = projectDiv.querySelector('.stop-btn');
  const statusSpan = projectDiv.querySelector('.status');
  
  switch (state) {
    case 'starting':
      startBtn.disabled = true;
      startBtn.textContent = 'Başlatılıyor...';
      stopBtn.disabled = true;
      statusSpan.textContent = 'Başlatılıyor...';
      statusSpan.className = 'status status-starting';
      break;
      
    case 'stopping':
      startBtn.disabled = true;
      stopBtn.disabled = true;
      stopBtn.textContent = 'Durduruluyor...';
      statusSpan.textContent = 'Durduruluyor...';
      statusSpan.className = 'status status-stopping';
      break;
      
    case 'running':
      startBtn.disabled = true;
      startBtn.textContent = 'Çalışıyor';
      stopBtn.disabled = false;
      stopBtn.textContent = 'Durdur';
      statusSpan.textContent = 'Çalışıyor';
      statusSpan.className = 'status status-running';
      break;
      
    case 'stopped':
      startBtn.disabled = false;
      startBtn.textContent = 'Başlat';
      stopBtn.disabled = true;
      stopBtn.textContent = 'Durdur';
      statusSpan.textContent = 'Durduruldu';
      statusSpan.className = 'status status-stopped';
      break;
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Filtreleme
  const filterInput = document.getElementById('filterInput');
  if (filterInput) {
    filterInput.addEventListener('input', renderProjects);
  }
  
  // Yenile butonu
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadProjects);
  }
  
  // Tümünü durdur butonu
  const stopAllBtn = document.getElementById('stopAllBtn');
  if (stopAllBtn) {
    stopAllBtn.addEventListener('click', stopAllProjects);
  }
  
  // Klasör değiştir butonu
  const changePathBtn = document.getElementById('changePathBtn');
  if (changePathBtn) {
    changePathBtn.addEventListener('click', selectProjectsDirectory);
  }
  
  // İlk yükleme
  loadProjects();
});

// Sayfa yüklendiğinde projeleri yükle
window.addEventListener('load', loadProjects);
