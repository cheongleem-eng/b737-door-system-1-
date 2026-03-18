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
const audio = new Audio();
audio.volume = 0.5; // 기본 셋팅값 50%

function changeVolume(amount) {
    // 0.1(10%) 단위로 정교하게 계산 (부동 소수점 오차 방지)
    let currentVol = Math.round(audio.volume * 10);
    let step = amount > 0 ? 1 : -1;
    let newVolValue = Math.min(10, Math.max(0, currentVol + step)) / 10;
    
    audio.volume = newVolValue; // 실제 음향 조절
    volDisplay.innerText = `[VOL: ${Math.round(newVolValue * 100)}%]`;
    
    const volLed = document.getElementById('led-vol');
    volLed.classList.add('led-yellow');
    setTimeout(() => volLed.classList.remove('led-yellow'), 200);
}

function setMode(m) {
    mode = m; input = ''; selectedTitle = '';
    document.querySelectorAll('.led-dot').forEach(l => {
        if(l.id !== 'led-ready') l.classList.remove('led-yellow', 'led-red');
    });
    document.getElementById('led-' + m.toLowerCase()).classList.add('led-yellow');
    
    if(m === 'ANNC') lcdText.innerText = "SINGLE ANNC\n# _ _ _\nCANCEL:STOP";
    else if(m === 'MUSIC') lcdText.innerText = "BOARDING MUSIC\n# _\nCANCEL:STOP";
    else if(m === 'FLIGHT') lcdText.innerText = "FLIGHT PHASE\n# _\nCANCEL:STOP";
}

function pressNum(n) {
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
    if (selectedTitle && selectedTitle !== "INVALID NUMBER") {
        lcdText.innerText = `[${input}]\n${selectedTitle}\nPLAY:START NEXT:ENT`;
        document.getElementById('led-ent').classList.add('led-yellow');
        setTimeout(() => document.getElementById('led-ent').classList.remove('led-yellow'), 200);
    }
}

function startPlay() {
    if (!selectedTitle || selectedTitle === "INVALID NUMBER") return;
    
    // 로컬 오디오 폴더의 파일을 호출합니다.
    audio.src = `audio/${input}.mp3`;
    
    audio.play().then(() => {
        document.getElementById('led-start').classList.add('led-red');
        lcdText.innerHTML = `[${input}] ${selectedTitle}\n\n<span class="playing-blink">● PLAYING</span>`;
    }).catch(() => {
        // 파일이 없을 경우 출력되는 에러 메시지
        lcdText.innerText = "FILE NOT FOUND\nCheck audio folder";
    });
}

function stopAll() {
    audio.pause(); audio.currentTime = 0;
    mode = ''; input = ''; selectedTitle = '';
    document.querySelectorAll('.led-dot').forEach(l => {
        if(l.id !== 'led-ready') l.classList.remove('led-yellow', 'led-red');
    });
    lcdText.innerText = "AIRLINE JJA\nCARD ID 002";
}

// 초기 로드 시 Ready LED 및 볼륨 표시 설정
window.onload = () => {
    document.getElementById('led-ready').classList.add('led-yellow');
    if (volDisplay) {
        volDisplay.innerText = `[VOL: ${Math.round(audio.volume * 100)}%]`;
    }
};
