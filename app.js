const tabs = document.querySelectorAll('.tab');
const panels = {
  upload: document.getElementById('panel-upload'),
  search: document.getElementById('panel-search')
};

const audioInput = document.getElementById('audioFile');
const dropZone = document.getElementById('dropZone');
const fileName = document.getElementById('fileName');
const songNameInput = document.getElementById('songName');
const artistNameInput = document.getElementById('artistName');
const picks = document.querySelectorAll('.pick');

const generateBtn = document.getElementById('generateBtn');
const progressCard = document.getElementById('progressCard');
const progressBar = document.getElementById('progressBar');
const statusText = document.getElementById('statusText');
const resultCard = document.getElementById('resultCard');
const leadSheetEl = document.getElementById('leadSheet');
const metaEl = document.getElementById('meta');
const copyBtn = document.getElementById('copyBtn');

let activeTab = 'upload';

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    activeTab = tab.dataset.tab;
    tabs.forEach((t) => {
      const isActive = t === tab;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', String(isActive));
    });

    Object.entries(panels).forEach(([key, panel]) => {
      panel.classList.toggle('active', key === activeTab);
    });
  });
});

function setFile(file) {
  if (!file) {
    fileName.textContent = '';
    return;
  }

  fileName.textContent = `Selected: ${file.name}`;
}

dropZone.addEventListener('click', () => audioInput.click());

audioInput.addEventListener('change', () => {
  const [file] = audioInput.files;
  setFile(file);
});

['dragenter', 'dragover'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
  });
});

dropZone.addEventListener('drop', (event) => {
  const [file] = event.dataTransfer.files;
  if (!file) {
    return;
  }

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  audioInput.files = dataTransfer.files;
  setFile(file);
});

picks.forEach((pick) => {
  pick.addEventListener('click', () => {
    activeTab = 'search';
    tabs.forEach((t) => {
      const isActive = t.dataset.tab === 'search';
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', String(isActive));
    });

    panels.upload.classList.remove('active');
    panels.search.classList.add('active');

    songNameInput.value = pick.dataset.song;
    artistNameInput.value = pick.dataset.artist;
    songNameInput.focus();
  });
});

function makeDemoLeadSheet(title, artist) {
  return `Title: ${title}\nArtist: ${artist}\nKey: G major\nTempo: 96 BPM\nMeter: 4/4\n\n[Verse]\n| G   | D/F# | Em7 | C   |\n| G   | D/F# | C   | D   |\n\n[Chorus]\n| G   | D   | Em7 | C   |\n| G   | D   | C   | D   |\n\nPiano: RH triads + syncopated comping, LH roots on beats 1 and 3\nGuitar: Open voicings, down-down-up-up-down-up\nDrums: Kick on 1/3, snare on 2/4, closed hats in 8ths`;
}

async function simulateProgress(title, artist) {
  const steps = [
    'Finding the cleanest audio signal...',
    'Detecting tempo, meter, and key...',
    'Mapping sections and chord movement...',
    'Building piano, guitar, and drum guidance...',
    'Polishing lead sheet format...'
  ];

  for (let i = 0; i < steps.length; i += 1) {
    statusText.textContent = steps[i];
    progressBar.style.width = `${((i + 1) / steps.length) * 100}%`;
    await new Promise((resolve) => setTimeout(resolve, 520));
  }

  metaEl.textContent = `${title} — ${artist} · confidence 0.84 (demo)`;
  leadSheetEl.textContent = makeDemoLeadSheet(title, artist);
}

generateBtn.addEventListener('click', async () => {
  let title = 'Uploaded Song';
  let artist = 'Unknown Artist';

  if (activeTab === 'search') {
    title = songNameInput.value.trim() || title;
    artist = artistNameInput.value.trim() || artist;
  } else {
    const [file] = audioInput.files;
    if (file) {
      title = file.name.replace(/\.[^.]+$/, '');
    }
  }

  progressCard.classList.remove('hidden');
  resultCard.classList.add('hidden');
  progressBar.style.width = '0%';

  await simulateProgress(title, artist);

  resultCard.classList.remove('hidden');
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

copyBtn.addEventListener('click', async () => {
  const text = leadSheetEl.textContent.trim();
  if (!text) {
    return;
  }

  await navigator.clipboard.writeText(text);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => {
    copyBtn.textContent = 'Copy lead sheet';
  }, 1100);
});
