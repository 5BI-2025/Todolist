// Stati
const STATES = ['backlog', 'inprogress', 'review', 'done'];

// Priorità
const PRIORITIES = {
  low: { name: 'Bassa', color: 'priority-low' },
  medium: { name: 'Media', color: 'priority-medium' },
  high: { name: 'Alta', color: 'priority-high' },
  critical: { name: 'Critica', color: 'priority-critical' }
};

// Carica dati da localStorage o array vuoto
let issues = JSON.parse(localStorage.getItem('issues-kanban')) || [];

// Riferimenti DOM
const form = document.getElementById('new-issue-form');
const searchInput = document.getElementById('search');
const filterPriority = document.getElementById('filter-priority');
const columns = {
  backlog: document.getElementById('backlog'),
  inprogress: document.getElementById('inprogress'),
  review: document.getElementById('review'),
  done: document.getElementById('done')
};

// Salva su localStorage
function saveIssues() {
  localStorage.setItem('issues-kanban', JSON.stringify(issues));
}

// Ottieni il testo della priorità
function getPriorityText(priority) {
  return PRIORITIES[priority]?.name || 'Media';
}

// Ottieni la classe CSS per la priorità
function getPriorityClass(priority) {
  return PRIORITIES[priority]?.color || 'priority-medium';
}

// Crea DOM card issue
function createIssueCard(issue) {
  const card = document.createElement('div');
  
  // Base styling
  let borderColor;
  switch(issue.priority) {
    case 'low': borderColor = 'border-l-green-500'; break;
    case 'medium': borderColor = 'border-l-yellow-500'; break;
    case 'high': borderColor = 'border-l-red-500'; break;
    case 'critical': borderColor = 'border-l-purple-600'; break;
    default: borderColor = 'border-l-gray-400';
  }
  
  card.className = `issue-card bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 border-l-4 ${borderColor} transform hover:-translate-y-1 duration-200`;
  card.draggable = true;
  card.dataset.id = issue.id;

  // Titolo
  const title = document.createElement('h4');
  title.className = "font-semibold text-lg mb-2 text-gray-800";
  title.textContent = issue.title;
  card.appendChild(title);

  // Descrizione
  if (issue.description) {
    const desc = document.createElement('p');
    desc.className = "text-sm text-gray-600 mb-3 whitespace-pre-line";
    desc.textContent = issue.description;
    card.appendChild(desc);
  }

  // Priorità con icona migliorata
  const priority = document.createElement('div');
  
  // Scegli icona e colore in base alla priorità
  let priorityIcon, priorityColor, bgColor;
  switch(issue.priority) {
    case 'low':
      priorityIcon = 'fa-circle-check';
      priorityColor = 'text-green-600';
      bgColor = 'bg-green-50';
      break;
    case 'high':
      priorityIcon = 'fa-circle-exclamation';
      priorityColor = 'text-red-600';
      bgColor = 'bg-red-50';
      break;
    case 'critical':
      priorityIcon = 'fa-triangle-exclamation';
      priorityColor = 'text-purple-600';
      bgColor = 'bg-purple-50';
      break;
    default: // medium
      priorityIcon = 'fa-circle-half-stroke';
      priorityColor = 'text-yellow-600';
      bgColor = 'bg-yellow-50';
  }
  
  priority.className = `text-xs font-medium mb-3 flex items-center`;
  priority.innerHTML = `
    <span class="inline-flex items-center rounded-full ${bgColor} ${priorityColor} px-2 py-1">
      <i class="fas ${priorityIcon} mr-1"></i> ${getPriorityText(issue.priority)}
    </span>`;
  card.appendChild(priority);

  // Data di creazione
  const date = document.createElement('div');
  date.className = "text-xs text-gray-500 mb-3 flex items-center";
  const createdDate = new Date(parseInt(issue.id));
  date.innerHTML = `<i class="far fa-calendar-alt mr-1"></i> ${createdDate.toLocaleDateString('it-IT')}`;
  card.appendChild(date);

  // Controlli: spostamento e elimina
  const controls = document.createElement('div');
  controls.className = "flex justify-between items-center mt-3 pt-2 border-t border-gray-100";

  // Bottoni spostamento
  const btnGroup = document.createElement('div');
  btnGroup.className = "flex gap-1";

  const currentIndex = STATES.indexOf(issue.state);

  if (currentIndex > 0) {
    const leftBtn = document.createElement('button');
    leftBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
    leftBtn.title = 'Sposta a ' + STATES[currentIndex - 1];
    leftBtn.className = 'bg-indigo-500 text-white p-1.5 rounded hover:bg-indigo-600 transition-colors text-xs';
    leftBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      moveIssue(issue.id, STATES[currentIndex - 1]);
    });
    btnGroup.appendChild(leftBtn);
  }

  if (currentIndex < STATES.length - 1) {
    const rightBtn = document.createElement('button');
    rightBtn.innerHTML = '<i class="fas fa-arrow-right"></i>';
    rightBtn.title = 'Sposta a ' + STATES[currentIndex + 1];
    rightBtn.className = 'bg-indigo-500 text-white p-1.5 rounded hover:bg-indigo-600 transition-colors text-xs';
    rightBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      moveIssue(issue.id, STATES[currentIndex + 1]);
    });
    btnGroup.appendChild(rightBtn);
  }

  controls.appendChild(btnGroup);

  // Bottone elimina
  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.title = 'Elimina issue';
  deleteBtn.className = 'text-red-500 hover:bg-red-50 p-1.5 rounded hover:text-red-700 transition-colors';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('Sei sicuro di voler eliminare questa issue?')) {
      deleteIssue(issue.id);
    }
  });
  controls.appendChild(deleteBtn);

  card.appendChild(controls);

  // Aggiungi eventi per drag & drop
  card.addEventListener('dragstart', handleDragStart);
  card.addEventListener('dragend', handleDragEnd);

  return card;
}

// Renderizza tutta la board
function renderBoard() {
  // Pulisci colonne
  STATES.forEach(state => {
    columns[state].innerHTML = '';
  });

  // Filtra issues in base alla ricerca e alla priorità
  const searchTerm = searchInput.value.toLowerCase();
  const priorityFilter = filterPriority.value;
  
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm) || 
                         (issue.description && issue.description.toLowerCase().includes(searchTerm));
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  // Aggiungi issue nelle rispettive colonne
  filteredIssues.forEach(issue => {
    const card = createIssueCard(issue);
    columns[issue.state].appendChild(card);
  });

  // Aggiorna contatori
  updateCounters();
}

// Aggiorna i contatori delle colonne
function updateCounters() {
  STATES.forEach(state => {
    const count = issues.filter(issue => issue.state === state).length;
    document.getElementById(`${state}-count`).textContent = count;
  });
}

// Aggiungi nuova issue
form.addEventListener('submit', e => {
  e.preventDefault();

  const title = form.title.value.trim();
  const description = form.description.value.trim();
  const priority = form.priority.value;

  if (!title) return alert('Il titolo è obbligatorio!');

  const newIssue = {
    id: Date.now().toString(),
    title,
    description,
    priority,
    state: 'backlog',
  };

  issues.push(newIssue);
  saveIssues();
  renderBoard();

  form.reset();
  form.title.focus();
});

// Sposta issue a nuovo stato
function moveIssue(id, newState) {
  const issue = issues.find(i => i.id === id);
  if (!issue) return;
  issue.state = newState;
  saveIssues();
  renderBoard();
}

// Elimina issue
function deleteIssue(id) {
  issues = issues.filter(i => i.id !== id);
  saveIssues();
  renderBoard();
}

// Gestione Drag & Drop
let draggedIssue = null;

function handleDragStart(e) {
  draggedIssue = this;
  
  // Add visual feedback with Tailwind classes
  this.classList.add('opacity-50', 'rotate-1', 'shadow-md', 'scale-105', 'z-10');
  
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragEnd() {
  // Remove drag styling
  this.classList.remove('opacity-50', 'rotate-1', 'shadow-md', 'scale-105', 'z-10');
  
  // Remove highlight from columns
  document.querySelectorAll('.kanban-column').forEach(col => {
    col.classList.remove('bg-blue-50', 'border-2', 'border-dashed', 'border-blue-300');
  });
}

// Aggiungi eventi per le colonne
document.querySelectorAll('.kanban-column').forEach(column => {
  column.addEventListener('dragover', function(e) {
    e.preventDefault();
    // Highlight potential drop target
    this.classList.add('bg-blue-50', 'border-2', 'border-dashed', 'border-blue-300');
  });

  column.addEventListener('dragleave', function() {
    // Remove highlight when leaving
    this.classList.remove('bg-blue-50', 'border-2', 'border-dashed', 'border-blue-300');
  });

  column.addEventListener('drop', function(e) {
    e.preventDefault();
    // Remove highlight on drop
    this.classList.remove('bg-blue-50', 'border-2', 'border-dashed', 'border-blue-300');
    
    const issueId = e.dataTransfer.getData('text/plain');
    const newState = this.dataset.state;
    
    moveIssue(issueId, newState);
  });
});

// Filtri e ricerca
searchInput.addEventListener('input', renderBoard);
filterPriority.addEventListener('change', renderBoard);

// Modal controls for New Issue
const toggleBtn = document.getElementById('toggle-new-issue');
const modal = document.getElementById('modal-new-issue');
const modalContent = document.getElementById('modal-content');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');
const newIssueForm = document.getElementById('new-issue-form');

function openModal() {
  // Make modal visible
  modal.classList.remove('pointer-events-none');
  
  // Trigger animations after a tiny delay
  setTimeout(() => {
    modal.classList.add('opacity-100');
    modalContent.classList.add('opacity-100', 'scale-100');
    modalContent.classList.remove('scale-95');
    newIssueForm.querySelector('#title').focus();
  }, 10);
}

function closeModal() {
  // Start hiding animation
  modal.classList.remove('opacity-100');
  modalContent.classList.remove('opacity-100', 'scale-100');
  modalContent.classList.add('scale-95');
  
  // Hide modal after animation completes
  setTimeout(() => {
    modal.classList.add('pointer-events-none');
    newIssueForm.reset();
  }, 300);
}

toggleBtn.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('pointer-events-none')) closeModal();
});

// Ensure submit closes modal after adding
newIssueForm.addEventListener('submit', (e) => {
  // let the existing logic handle issue creation, then close the modal
  setTimeout(() => closeModal(), 100);
});

// Caricamento iniziale
renderBoard();