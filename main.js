const announcementData = {
    "1": "탑승 BGM", "2": "하기 BGM", "001": "Director ver.",
    "002": "Mother ver.",
    "100": "보조배터리 규정",
    "110": "군집방지안내",
    "120": "중국 군사공항 창문 차폐",
    "130": "기내 에티켓",
    "140": "Doctor Paging",
    "150": "Safety DEMO_국내선",
    "160": "Safety DEMO_국제선",
    "170": "Safety DEMO_국제선",
    "180": "Safety DEMO_국제선",
    "200": "Fasten Seatbelt Sign Off",
    "201": "Fasten Seatbelt Sign On",
    "210": "PUS-FUK",
    "220": "Light Off",
    "230": "판매종료예정+O/B CIQ",
    "231": "판매종료예정+I/B CIQ",
    "250": "Approaching",
    "251": "Approaching",
    "252": "Approaching",
    "260": "Approaching_B737-8",
    "261": "Approaching_B737-8",
    "262": "Approaching_B737-8",
    "270": "Approaching_창문 차폐",
    "271": "Approaching_창문 차폐",
    "272": "Approaching_창문 차폐",
    "300": "하기 안내_Gate",
    "301": "하기 안내_Steps",
    "400": "Slide Expansion_이륙 전",
    "401": "Slide Expansion_착륙 후",
    "420": "Disturbance_지상",
    "421": "Disturbance_순항",
    "440": "In-flight Fire",
    "441": "Fire Suppression_지상",
    "442": "Fire Suppression_순항",
    "460": "After Decompression"
};

const flightData = {
    "1": "TAKE-OFF PHASE", "2": "LANDING INFO", "3": "TURBULENCE ALERT"
};

let mode = ''; let input = ''; let selectedTitle = '';
const lcdText = document.getElementById('lcd-text');
const volDisplay = document.getElementById('vol-display');

// 오디오 객체 및 Web Audio API 설정
const audio = new Audio();
audio.crossOrigin = "anonymous";
let audioContext, gainNode, source;

// 볼륨을 0~10 정수로 관리
let currentVolumeLevel = 5; 

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();
        source = audioContext.createMediaElementSource(audio);
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        updateVolume();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function updateVolume() {
    if (gainNode) {
        // gain.value를 0.0 ~ 1.0 사이로 조절
        gainNode.gain.value = currentVolumeLevel / 10;
    }
    // 하위 호환성을 위해 직접 볼륨도 조절 (지원되는 기기용)
    audio.volume = currentVolumeLevel / 10;
    
    if (volDisplay) {
        volDisplay.innerText = `[VOL: ${currentVolumeLevel * 10}%]`;
    }
}

function changeVolume(direction) {
    initAudioContext(); // 버튼 클릭 시 오디오 컨텍스트 활성화
    
    if (direction > 0) {
        if (currentVolumeLevel < 10) currentVolumeLevel++;
    } else {
        if (currentVolumeLevel > 0) currentVolumeLevel--;
    }
    
    updateVolume();
    
    const volLed = document.getElementById('led-vol');
    if (volLed) {
        volLed.classList.add('led-yellow');
        setTimeout(() => volLed.classList.remove('led-yellow'), 200);
    }
}

function setMode(m) {
    initAudioContext();
    mode = m; input = ''; selectedTitle = '';
    document.querySelectorAll('.led-dot').forEach(l => {
        if(l.id !== 'led-ready') l.classList.remove('led-yellow', 'led-red');
    });
    const modeLed = document.getElementById('led-' + m.toLowerCase());
    if (modeLed) modeLed.classList.add('led-yellow');
    
    if(m === 'ANNC') lcdText.innerText = "SINGLE ANNC\n# _ _ _\nCANCEL:STOP";
    else if(m === 'MUSIC') lcdText.innerText = "BOARDING MUSIC\n# _\nCANCEL:STOP";
    else if(m === 'FLIGHT') lcdText.innerText = "FLIGHT PHASE\n# _\nCANCEL:STOP";
}

function pressNum(n) {
    initAudioContext();
    if (!mode) return;
    input += n;
    let limit = mode === 'ANNC' ? 3 : 1;
    if (input.length > limit) input = n;
    
    let dataSource = (mode === 'FLIGHT') ? flightData : announcementData;
    let title = dataSource[input] || "INVALID NUMBER";
    
    let label = mode === 'ANNC' ? 'SINGLE ANNC' : (mode === 'MUSIC' ? 'BOARDING MUSIC' : 'FLIGHT PHASE');
    lcdText.innerText = `${label}\n# ${input}\n${input.length === limit ? title : ''}`;
    if (input.length === limit) selectedTitle = title;
}

function pressEnt() {
    initAudioContext();
    if (selectedTitle && selectedTitle !== "INVALID NUMBER") {
        lcdText.innerText = `[${input}]\n${selectedTitle}\nPLAY:START NEXT:ENT`;
        const entLed = document.getElementById('led-ent');
        if (entLed) {
            entLed.classList.add('led-yellow');
            setTimeout(() => entLed.classList.remove('led-yellow'), 200);
        }
    }
}

function startPlay() {
    initAudioContext();
    if (!selectedTitle || selectedTitle === "INVALID NUMBER") return;
    
    audio.src = `audio/${input}.mp3`;
    
    audio.play().then(() => {
        const startLed = document.getElementById('led-start');
        if (startLed) startLed.classList.add('led-red');
        lcdText.innerHTML = `[${input}] ${selectedTitle}\n\n<span class="playing-blink">● PLAYING</span>`;
    }).catch(() => {
        lcdText.innerText = "FILE NOT FOUND\nCheck audio folder";
    });
}

function stopAll() {
    initAudioContext();
    audio.pause(); audio.currentTime = 0;
    mode = ''; input = ''; selectedTitle = '';
    document.querySelectorAll('.led-dot').forEach(l => {
        if(l.id !== 'led-ready') l.classList.remove('led-yellow', 'led-red');
    });
    lcdText.innerText = "AIRLINE JJA\nCARD ID 002";
}

window.onload = () => {
    const readyLed = document.getElementById('led-ready');
    if (readyLed) readyLed.classList.add('led-yellow');
    if (volDisplay) {
        volDisplay.innerText = `[VOL: ${currentVolumeLevel * 10}%]`;
    }
};
