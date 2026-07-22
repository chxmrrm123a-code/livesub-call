(() => {
if (globalThis.__livesubCallLoaded) {
  return;
}
globalThis.__livesubCallLoaded = true;

const languageMeta = {
  ko: { label: "한국어", short: "한" },
  en: { label: "English", short: "EN" },
  vi: { label: "Tiếng Việt", short: "VI" },
};

const copy = {
  ko: {
    appTitle: "실시간 번역 자막 통화",
    nameLabel: "이름",
    namePlaceholder: "내 이름",
    roomLabel: "방 코드",
    newRoom: "새 방",
    startCall: "통화 시작",
    shareLink: "초대 링크 공유",
    mySpeech: "내 말",
    transcriptTitle: "대화 기록",
    clear: "지우기",
    endCall: "끊기",
    toggleMic: "마이크 켜기/끄기",
    toggleCaptions: "자막 켜기/끄기",
    summary: "{language}로 말하고 {language} 메뉴를 봅니다",
    waiting: "대기 중",
    roomReady: "새 방 준비됨",
    requestingMic: "마이크 요청",
    connecting: "연결 중",
    callReady: "통화 가능",
    callActive: "통화 중",
    reconnecting: "재연결 중",
    micBlocked: "마이크 차단",
    peerWaiting: "상대방 대기 중",
    peerConnecting: "상대방 연결 중",
    peerJoined: "상대방 입장",
    peerLeft: "상대방 퇴장",
    connected: "연결됨",
    disconnected: "연결 끊김",
    remoteUser: "상대방",
    remoteInitial: "?",
    remoteCaptionReady: "상대방 말이 여기에 표시됩니다",
    captionWaiting: "번역 자막 대기 중",
    localCaptionReady: "AI 번역 자막 준비됨",
    waitingPeerLanguage: "상대방이 들어오면 번역 자막을 시작할 수 있습니다",
    captionReady: "말하면 번역 자막이 시작됩니다",
    captionListening: "듣는 중…",
    captionProcessing: "자막 만드는 중…",
    captionFailed: "자막 오류: {message}",
    captionUnsupported: "이 브라우저에서는 AI 자막 녹음을 사용할 수 없습니다",
    captionSlow: "연결이 느려 일부 자막을 건너뛰었습니다",
    captionLimit: "오늘의 자막 사용 한도에 도달했습니다",
    captionsOff: "자막 꺼짐",
    captionsOn: "자막 켜짐",
    micOn: "마이크",
    micOff: "음소거",
    captionsOnLabel: "자막",
    captionsOffLabel: "자막 꺼짐",
    linkShared: "링크 공유됨",
    linkCopied: "링크 복사됨",
    inviteText: "번역 통화방에 들어와 주세요.",
    unsupportedMic: "이 브라우저는 마이크 통화를 지원하지 않습니다. Chrome이나 Samsung Internet으로 열어주세요.",
    unsupportedCall: "이 브라우저는 음성 통화를 지원하지 않습니다. Chrome이나 Samsung Internet으로 열어주세요.",
    checkMic: "마이크 권한을 확인해주세요",
    listening: "듣는 중",
    translating: "번역 중",
    noCaption: "자막 없음",
  },
  en: {
    appTitle: "Live translated caption call",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    roomLabel: "Room code",
    newRoom: "New room",
    startCall: "Start call",
    shareLink: "Share invite",
    mySpeech: "Me",
    transcriptTitle: "Transcript",
    clear: "Clear",
    endCall: "End",
    toggleMic: "Toggle microphone",
    toggleCaptions: "Toggle captions",
    summary: "Speak in {language} and see the app in {language}",
    waiting: "Waiting",
    roomReady: "Room ready",
    requestingMic: "Mic request",
    connecting: "Connecting",
    callReady: "Ready",
    callActive: "On call",
    reconnecting: "Reconnecting",
    micBlocked: "Mic blocked",
    peerWaiting: "Waiting for guest",
    peerConnecting: "Connecting guest",
    peerJoined: "Guest joined",
    peerLeft: "Guest left",
    connected: "Connected",
    disconnected: "Disconnected",
    remoteUser: "Guest",
    remoteInitial: "?",
    remoteCaptionReady: "The other person will appear here",
    captionWaiting: "Waiting for translated captions",
    localCaptionReady: "AI translated captions ready",
    waitingPeerLanguage: "Translated captions can start when the other person joins",
    captionReady: "Speak to start translated captions",
    captionListening: "Listening…",
    captionProcessing: "Creating captions…",
    captionFailed: "Caption error: {message}",
    captionUnsupported: "AI caption recording is not supported in this browser",
    captionSlow: "The connection is slow, so some captions were skipped",
    captionLimit: "Today's caption limit has been reached",
    captionsOff: "Captions off",
    captionsOn: "Captions on",
    micOn: "Mic",
    micOff: "Muted",
    captionsOnLabel: "Captions",
    captionsOffLabel: "No captions",
    linkShared: "Invite shared",
    linkCopied: "Invite copied",
    inviteText: "Join my translated call.",
    unsupportedMic: "This browser does not support microphone calls. Open it in Chrome or Samsung Internet.",
    unsupportedCall: "This browser does not support voice calls. Open it in Chrome or Samsung Internet.",
    checkMic: "Please check microphone permission",
    listening: "Listening",
    translating: "Translating",
    noCaption: "No caption",
  },
  vi: {
    appTitle: "Cuộc gọi phụ đề dịch trực tiếp",
    nameLabel: "Tên",
    namePlaceholder: "Tên của bạn",
    roomLabel: "Mã phòng",
    newRoom: "Phòng mới",
    startCall: "Bắt đầu gọi",
    shareLink: "Chia sẻ lời mời",
    mySpeech: "Tôi",
    transcriptTitle: "Nội dung trò chuyện",
    clear: "Xóa",
    endCall: "Kết thúc",
    toggleMic: "Bật/tắt mic",
    toggleCaptions: "Bật/tắt phụ đề",
    summary: "Nói bằng {language} và xem ứng dụng bằng {language}",
    waiting: "Đang chờ",
    roomReady: "Phòng đã sẵn sàng",
    requestingMic: "Yêu cầu mic",
    connecting: "Đang kết nối",
    callReady: "Sẵn sàng",
    callActive: "Đang gọi",
    reconnecting: "Đang kết nối lại",
    micBlocked: "Mic bị chặn",
    peerWaiting: "Đang chờ người kia",
    peerConnecting: "Đang kết nối người kia",
    peerJoined: "Người kia đã vào",
    peerLeft: "Người kia đã rời",
    connected: "Đã kết nối",
    disconnected: "Mất kết nối",
    remoteUser: "Người kia",
    remoteInitial: "?",
    remoteCaptionReady: "Lời nói của người kia sẽ hiện ở đây",
    captionWaiting: "Đang chờ phụ đề dịch",
    localCaptionReady: "Phụ đề dịch AI đã sẵn sàng",
    waitingPeerLanguage: "Có thể bắt đầu phụ đề dịch khi người kia vào",
    captionReady: "Hãy nói để bắt đầu phụ đề dịch",
    captionListening: "Đang nghe…",
    captionProcessing: "Đang tạo phụ đề…",
    captionFailed: "Lỗi phụ đề: {message}",
    captionUnsupported: "Trình duyệt này không hỗ trợ ghi âm phụ đề AI",
    captionSlow: "Kết nối chậm nên một số phụ đề đã bị bỏ qua",
    captionLimit: "Đã đạt giới hạn phụ đề hôm nay",
    captionsOff: "Đã tắt phụ đề",
    captionsOn: "Đã bật phụ đề",
    micOn: "Mic",
    micOff: "Tắt mic",
    captionsOnLabel: "Phụ đề",
    captionsOffLabel: "Không phụ đề",
    linkShared: "Đã chia sẻ lời mời",
    linkCopied: "Đã sao chép lời mời",
    inviteText: "Hãy vào phòng gọi dịch của tôi.",
    unsupportedMic: "Trình duyệt này không hỗ trợ gọi bằng mic. Hãy mở bằng Chrome hoặc Samsung Internet.",
    unsupportedCall: "Trình duyệt này không hỗ trợ gọi thoại. Hãy mở bằng Chrome hoặc Samsung Internet.",
    checkMic: "Vui lòng kiểm tra quyền mic",
    listening: "Đang nghe",
    translating: "Đang dịch",
    noCaption: "Không có phụ đề",
  },
};

const els = {
  connectionStatus: document.querySelector("#connectionStatus"),
  joinPanel: document.querySelector("#joinPanel"),
  stage: document.querySelector("#stage"),
  controls: document.querySelector("#controls"),
  displayName: document.querySelector("#displayName"),
  roomCode: document.querySelector("#roomCode"),
  randomRoom: document.querySelector("#randomRoom"),
  languageButton: document.querySelector("#languageButton"),
  languageButtonText: document.querySelector("#languageButtonText"),
  languageMenu: document.querySelector("#languageMenu"),
  joinCall: document.querySelector("#joinCall"),
  copyInviteBeforeJoin: document.querySelector("#copyInviteBeforeJoin"),
  remoteInitial: document.querySelector("#remoteInitial"),
  remoteName: document.querySelector("#remoteName"),
  callState: document.querySelector("#callState"),
  voiceRing: document.querySelector("#voiceRing"),
  captionSource: document.querySelector("#captionSource"),
  captionMain: document.querySelector("#captionMain"),
  localSpeech: document.querySelector("#localSpeech"),
  muteToggle: document.querySelector("#muteToggle"),
  captionToggle: document.querySelector("#captionToggle"),
  leaveCall: document.querySelector("#leaveCall"),
  clearTranscript: document.querySelector("#clearTranscript"),
  languageSummary: document.querySelector("#languageSummary"),
  transcriptList: document.querySelector("#transcriptList"),
  remoteAudio: document.querySelector("#remoteAudio"),
};

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
const captionConfig = {
  sampleIntervalMs: 50,
  silenceMs: 550,
  minimumSegmentMs: 650,
  maximumSegmentMs: 4200,
  maximumQueueSize: 2,
  maximumSessionAudioMs: 60 * 60 * 1000,
};

const state = {
  clientId: createClientId(),
  room: "",
  name: "",
  language: "ko",
  localStream: null,
  remoteStream: createEmptyStream(),
  eventSource: null,
  peers: new Map(),
  peerProfiles: new Map(),
  remotePeerId: null,
  remoteDisplayName: "",
  remoteLanguage: null,
  captionCapture: null,
  captionQueue: [],
  captionProcessing: false,
  captionAbortController: null,
  captionSessionAudioMs: 0,
  remoteCaptionDrafts: new Map(),
  captionsEnabled: false,
  muted: false,
  joined: false,
  statusKey: "waiting",
  callStateKey: "peerWaiting",
  localSpeechKey: "captionsOff",
};

function createClientId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(2);
    globalThis.crypto.getRandomValues(values);
    return `client-${values[0].toString(36)}-${values[1].toString(36)}`;
  }
  return `client-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createEmptyStream() {
  return typeof globalThis.MediaStream === "function" ? new MediaStream() : null;
}

function validLanguage(language) {
  return languageMeta[language] ? language : "ko";
}

function isSupportedLanguage(language) {
  return Boolean(languageMeta[language]);
}

function t(key, params = {}) {
  const value = copy[state.language]?.[key] || copy.ko[key] || key;
  return value.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? "");
}

function init() {
  const params = new URLSearchParams(location.search);
  const urlLanguage = params.get("language");
  const storedLanguage = localStorage.getItem("livesub-language");
  state.language = validLanguage(isSupportedLanguage(urlLanguage) ? urlLanguage : storedLanguage || "ko");
  localStorage.setItem("livesub-language", state.language);
  els.roomCode.value = params.get("room") || randomRoomCode();
  els.displayName.value = localStorage.getItem("livesub-name") || "";

  applyLocale();
  updateUrlRoom(els.roomCode.value);

  els.randomRoom.addEventListener("click", () => {
    els.roomCode.value = randomRoomCode();
    updateUrlRoom(els.roomCode.value);
    setStatusKey("roomReady");
  });
  els.roomCode.addEventListener("input", () => updateUrlRoom(els.roomCode.value));
  els.languageButton.addEventListener("click", toggleLanguageMenu);
  els.languageMenu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-language]");
    if (!button) return;
    setLanguage(button.dataset.language);
    closeLanguageMenu();
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".language-picker")) closeLanguageMenu();
  });
  els.joinCall.addEventListener("click", joinCall);
  els.copyInviteBeforeJoin.addEventListener("click", copyInviteLink);
  els.muteToggle.addEventListener("click", toggleMute);
  els.captionToggle.addEventListener("click", toggleCaptions);
  els.leaveCall.addEventListener("click", leaveCall);
  els.clearTranscript.addEventListener("click", () => {
    els.transcriptList.innerHTML = "";
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && state.captionCapture?.audioContext?.state === "suspended") {
      state.captionCapture.audioContext.resume().catch(() => {});
    }
  });
}

function applyLocale() {
  document.documentElement.lang = state.language;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.title = t(node.dataset.i18nTitle);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
  });

  els.languageButtonText.textContent = languageMeta[state.language].label;
  els.languageMenu.querySelectorAll("[data-language]").forEach((button) => {
    button.classList.toggle("active", button.dataset.language === state.language);
  });
  els.languageSummary.textContent = t("summary", { language: languageMeta[state.language].label });
  setStatusKey(state.statusKey, els.connectionStatus.classList.contains("live"));
  setCallStateKey(state.callStateKey);
  if (state.localSpeechKey) setLocalSpeechKey(state.localSpeechKey);
  if (!els.captionSource.dataset.custom) els.captionSource.textContent = t("remoteCaptionReady");
  if (!els.captionMain.dataset.custom) els.captionMain.textContent = t("captionWaiting");
  renderRemoteIdentity();
  updateControls();
}

function setLanguage(language) {
  const nextLanguage = validLanguage(language);
  if (state.language === nextLanguage) return;
  state.language = nextLanguage;
  localStorage.setItem("livesub-language", state.language);
  applyLocale();
  updateUrlRoom(els.roomCode.value);
  if (state.joined) {
    sendSignal("profile", {
      name: state.name,
      language: state.language,
    }).catch(() => {});
    if (state.captionsEnabled) restartCaptionCapture();
  }
}

function toggleLanguageMenu() {
  const nextOpen = els.languageMenu.hidden;
  els.languageMenu.hidden = !nextOpen;
  els.languageButton.setAttribute("aria-expanded", String(nextOpen));
}

function closeLanguageMenu() {
  els.languageMenu.hidden = true;
  els.languageButton.setAttribute("aria-expanded", "false");
}

function randomRoomCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function normalizeRoom(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24);
}

function updateUrlRoom(value) {
  const room = normalizeRoom(value);
  if (!room) return;
  const url = new URL(location.href);
  url.searchParams.set("room", room);
  url.searchParams.set("language", state.language);
  history.replaceState(null, "", url);
}

function setStatusKey(key, live = false) {
  state.statusKey = key;
  els.connectionStatus.textContent = t(key);
  els.connectionStatus.classList.toggle("live", live);
}

function setCallStateKey(key) {
  state.callStateKey = key;
  els.callState.textContent = t(key);
}

function setLocalSpeechKey(key) {
  state.localSpeechKey = key;
  els.localSpeech.textContent = t(key);
}

function setLocalSpeechText(text) {
  state.localSpeechKey = "";
  els.localSpeech.textContent = text;
}

function setCaptionText(source, translated) {
  els.captionSource.dataset.custom = source ? "true" : "";
  els.captionMain.dataset.custom = translated ? "true" : "";
  els.captionSource.textContent = source || t("remoteCaptionReady");
  els.captionMain.textContent = translated || t("captionWaiting");
}

async function joinCall() {
  state.room = normalizeRoom(els.roomCode.value || randomRoomCode());
  state.name = (els.displayName.value || "Guest").trim().slice(0, 32);
  localStorage.setItem("livesub-name", state.name);
  updateUrlRoom(state.room);

  try {
    if (!globalThis.navigator?.mediaDevices?.getUserMedia) {
      throw new Error(t("unsupportedMic"));
    }
    if (typeof (globalThis.RTCPeerConnection || globalThis.webkitRTCPeerConnection) !== "function") {
      throw new Error(t("unsupportedCall"));
    }

    setStatusKey("requestingMic");
    state.localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });

    state.joined = true;
    els.joinPanel.hidden = true;
    els.stage.hidden = false;
    els.controls.hidden = false;
    if (!state.remoteStream) state.remoteStream = createEmptyStream();
    setRemoteAudioStream();
    setStatusKey("connecting");
    setCallStateKey("peerWaiting");
    setLocalSpeechKey(state.captionsEnabled ? "waitingPeerLanguage" : "captionsOff");
    updateControls();
    startEvents();
  } catch (error) {
    setStatusKey("micBlocked");
    els.callState.textContent = error.message || t("checkMic");
    console.error(error);
  }
}

function startEvents() {
  const params = new URLSearchParams({
    room: state.room,
    client: state.clientId,
    name: state.name,
    language: state.language,
  });
  state.eventSource = new EventSource(`/api/events?${params.toString()}`);
  state.eventSource.addEventListener("ready", (event) => {
    const payload = JSON.parse(event.data);
    setStatusKey("callReady", true);
    const peers = (payload.peers || []).map(normalizePeerProfile).filter(Boolean);
    setCallStateKey(peers.length ? "peerConnecting" : "peerWaiting");
    for (const peer of peers) {
      setRemoteProfile(peer);
      connectToPeer(peer.id, true);
    }
    maybeStartCaptionCapture();
  });
  state.eventSource.addEventListener("peer-joined", (event) => {
    const payload = normalizePeerProfile(JSON.parse(event.data));
    if (!payload) return;
    setRemoteProfile(payload);
    setCallStateKey("peerJoined");
    connectToPeer(payload.id, false);
    maybeStartCaptionCapture();
  });
  state.eventSource.addEventListener("peer-left", (event) => {
    const payload = JSON.parse(event.data);
    closePeer(payload.from);
    state.peerProfiles.delete(payload.from);
    if (state.remotePeerId === payload.from) {
      state.remotePeerId = null;
      state.remoteLanguage = null;
      state.remoteDisplayName = "";
      renderRemoteIdentity();
      stopCaptionCapture();
      setLocalSpeechKey("waitingPeerLanguage");
    }
    setCallStateKey("peerLeft");
  });
  state.eventSource.addEventListener("signal", (event) => {
    handleSignal(JSON.parse(event.data)).catch(console.error);
  });
  state.eventSource.onerror = () => {
    setStatusKey("reconnecting");
  };
}

function normalizePeerProfile(peer) {
  if (!peer) return null;
  if (typeof peer === "string") {
    return { id: peer, name: t("remoteUser"), language: null };
  }
  const id = peer.id || peer.from;
  if (!id || id === state.clientId) return null;
  return {
    id,
    name: String(peer.name || t("remoteUser")).slice(0, 40),
    language: languageMeta[peer.language] ? peer.language : null,
  };
}

function setRemoteProfile(profile) {
  state.peerProfiles.set(profile.id, profile);
  state.remotePeerId = profile.id;
  state.remoteDisplayName = profile.name || state.remoteDisplayName || t("remoteUser");
  state.remoteLanguage = profile.language || state.remoteLanguage;
  renderRemoteIdentity();
  if (state.captionsEnabled && state.remoteLanguage && state.joined) {
    maybeStartCaptionCapture();
  }
}

function renderRemoteIdentity() {
  const name = state.remoteDisplayName || t("remoteUser");
  els.remoteName.textContent = name;
  els.remoteInitial.textContent = name.trim().slice(0, 1).toUpperCase() || t("remoteInitial");
}

function setRemoteAudioStream() {
  els.remoteAudio.srcObject = state.remoteStream || null;
}

function connectToPeer(peerId, shouldOffer) {
  if (state.peers.has(peerId)) return state.peers.get(peerId);
  const PeerConnection = globalThis.RTCPeerConnection || globalThis.webkitRTCPeerConnection;
  if (typeof PeerConnection !== "function") {
    setCallStateKey("disconnected");
    return null;
  }

  const peer = new PeerConnection(rtcConfig);
  state.peers.set(peerId, peer);

  for (const track of state.localStream?.getTracks() || []) peer.addTrack(track, state.localStream);

  peer.addEventListener("icecandidate", (event) => {
    if (event.candidate) sendSignal("ice", event.candidate, peerId).catch(() => {});
  });
  peer.addEventListener("track", (event) => {
    if (!state.remoteStream) state.remoteStream = createEmptyStream();
    if (!state.remoteStream) return;
    for (const track of event.streams[0].getTracks()) {
      if (!state.remoteStream.getTracks().some((item) => item.id === track.id)) {
        state.remoteStream.addTrack(track);
      }
    }
    setRemoteAudioStream();
    els.remoteAudio.play().catch(() => {});
    setCallStateKey("connected");
    animateVoice();
  });
  peer.addEventListener("connectionstatechange", () => {
    if (peer.connectionState === "connected") {
      setStatusKey("callActive", true);
      setCallStateKey("connected");
    }
    if (["failed", "disconnected", "closed"].includes(peer.connectionState)) {
      setCallStateKey("disconnected");
    }
  });

  if (shouldOffer) makeOffer(peerId, peer).catch(console.error);
  return peer;
}

async function makeOffer(peerId, peer) {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  await sendSignal("offer", offer, peerId);
}

async function handleSignal(message) {
  if (message.from === state.clientId) return;
  if (message.type === "profile") {
    setRemoteProfile(normalizePeerProfile({ id: message.from, ...message.data }));
    restartCaptionCapture();
    return;
  }
  if (message.type === "translated-caption-preview") {
    handleTranslatedCaption(message, false);
    return;
  }
  if (message.type === "translated-caption") {
    handleTranslatedCaption(message, true);
    return;
  }

  const peer = connectToPeer(message.from, false);
  if (!peer) return;
  if (message.type === "offer") {
    await peer.setRemoteDescription(message.data);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    await sendSignal("answer", answer, message.from);
  }
  if (message.type === "answer") {
    await peer.setRemoteDescription(message.data);
  }
  if (message.type === "ice") {
    await peer.addIceCandidate(message.data).catch(() => {});
  }
}

async function sendSignal(type, data, to = null) {
  await fetch("/api/signal", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      room: state.room,
      from: state.clientId,
      to,
      type,
      data,
    }),
  });
}

function maybeStartCaptionCapture() {
  if (!state.joined || !state.captionsEnabled || !state.localStream || state.muted) return;
  if (state.captionCapture) {
    state.captionCapture.audioContext.resume().catch(() => {});
    setLocalSpeechKey(state.remoteLanguage ? "captionReady" : "waitingPeerLanguage");
    return;
  }
  startCaptionCapture();
}

function restartCaptionCapture() {
  stopCaptionCapture();
  if (state.joined && state.captionsEnabled && !state.muted) maybeStartCaptionCapture();
}

function startCaptionCapture() {
  const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
  const track = state.localStream?.getAudioTracks()[0];
  if (!AudioContextClass || typeof globalThis.MediaRecorder !== "function" || !track) {
    state.captionsEnabled = false;
    setLocalSpeechKey("captionUnsupported");
    updateControls();
    return;
  }

  const audioContext = new AudioContextClass();
  const source = audioContext.createMediaStreamSource(new MediaStream([track]));
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.18;
  source.connect(analyser);

  const capture = {
    audioContext,
    source,
    analyser,
    samples: new Float32Array(analyser.fftSize),
    track,
    timer: null,
    segment: null,
    stopping: false,
    stopped: false,
    voiceFrames: 0,
    voiceDetected: false,
    noiseFloor: 0.004,
  };
  state.captionCapture = capture;
  audioContext.resume().catch(() => {});
  capture.timer = setInterval(() => sampleCaptionAudio(capture), captionConfig.sampleIntervalMs);
  setLocalSpeechKey(state.remoteLanguage ? "captionReady" : "waitingPeerLanguage");
}

function sampleCaptionAudio(capture) {
  if (capture.stopped || state.captionCapture !== capture) return;
  if (!state.joined || !state.captionsEnabled || state.muted || !capture.track.enabled) return;

  capture.analyser.getFloatTimeDomainData(capture.samples);
  let energy = 0;
  for (const sample of capture.samples) energy += sample * sample;
  const rms = Math.sqrt(energy / capture.samples.length);
  const threshold = Math.max(0.01, Math.min(0.045, capture.noiseFloor * 2.4));
  const hasVoice = rms > threshold;
  capture.voiceDetected = hasVoice;

  if (!capture.segment && !hasVoice) {
    capture.noiseFloor = Math.max(0.0025, Math.min(0.02, capture.noiseFloor * 0.96 + rms * 0.04));
  }
  capture.voiceFrames = hasVoice ? capture.voiceFrames + 1 : 0;

  const now = performance.now();
  if (!capture.segment && !capture.stopping && capture.voiceFrames >= 2 && state.remoteLanguage) {
    beginCaptionSegment(capture, now);
  }

  const segment = capture.segment;
  if (!segment) return;
  if (hasVoice) segment.lastVoiceAt = now;
  const elapsed = now - segment.startedAt;
  if (elapsed >= captionConfig.maximumSegmentMs) {
    finishCaptionSegment(capture, { restartAfterStop: hasVoice });
    return;
  }
  if (elapsed >= captionConfig.minimumSegmentMs && now - segment.lastVoiceAt >= captionConfig.silenceMs) {
    finishCaptionSegment(capture);
  }
}

function recorderMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((type) => {
    try {
      return !MediaRecorder.isTypeSupported || MediaRecorder.isTypeSupported(type);
    } catch {
      return false;
    }
  }) || "";
}

function beginCaptionSegment(capture, now = performance.now()) {
  if (capture.segment || capture.stopping || capture.stopped || !state.remoteLanguage) return;
  const mimeType = recorderMimeType();
  let recorder;
  try {
    const stream = new MediaStream([capture.track]);
    recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
  } catch (error) {
    state.captionsEnabled = false;
    setLocalSpeechText(t("captionFailed", { message: error.message || t("captionUnsupported") }));
    stopCaptionCapture();
    updateControls();
    return;
  }

  const segment = {
    recorder,
    chunks: [],
    startedAt: now,
    lastVoiceAt: now,
    durationMs: 0,
    targetLanguage: state.remoteLanguage,
    peerId: state.remotePeerId,
    discard: false,
    restartAfterStop: false,
    completed: false,
  };
  capture.segment = segment;

  recorder.addEventListener("dataavailable", (event) => {
    if (event.data?.size) segment.chunks.push(event.data);
  });
  recorder.addEventListener("stop", () => completeCaptionSegment(capture, segment));
  recorder.addEventListener("error", (event) => {
    setLocalSpeechText(t("captionFailed", { message: event.error?.message || "recording" }));
  });
  recorder.start(250);
  setLocalSpeechKey("captionListening");
}

function finishCaptionSegment(capture, { discard = false, restartAfterStop = false } = {}) {
  const segment = capture.segment;
  if (!segment) return;
  capture.segment = null;
  capture.stopping = true;
  capture.voiceFrames = 0;
  segment.discard = discard;
  segment.restartAfterStop = restartAfterStop;
  segment.durationMs = Math.max(0, performance.now() - segment.startedAt);
  try {
    if (segment.recorder.state !== "inactive") segment.recorder.stop();
    else completeCaptionSegment(capture, segment);
  } catch {
    completeCaptionSegment(capture, segment);
  }
}

function completeCaptionSegment(capture, segment) {
  if (segment.completed) return;
  segment.completed = true;
  capture.stopping = false;

  if (!segment.discard && !capture.stopped && state.captionsEnabled && segment.chunks.length) {
    const type = segment.recorder.mimeType || segment.chunks[0].type || "audio/webm";
    const blob = new Blob(segment.chunks, { type });
    enqueueCaptionSegment({
      blob,
      durationMs: Math.round(segment.durationMs),
      targetLanguage: segment.targetLanguage,
      peerId: segment.peerId,
    });
  }

  if (
    segment.restartAfterStop &&
    !capture.stopped &&
    state.captionCapture === capture &&
    state.captionsEnabled &&
    state.remoteLanguage &&
    !state.muted
  ) {
    beginCaptionSegment(capture);
  }
}

function enqueueCaptionSegment(segment) {
  if (segment.durationMs < captionConfig.minimumSegmentMs || segment.blob.size < 1200) return;
  if (state.captionSessionAudioMs + segment.durationMs > captionConfig.maximumSessionAudioMs) {
    state.captionsEnabled = false;
    stopCaptionCapture();
    setLocalSpeechKey("captionLimit");
    updateControls();
    return;
  }
  if (state.captionQueue.length >= captionConfig.maximumQueueSize) {
    setLocalSpeechKey("captionSlow");
    return;
  }
  state.captionSessionAudioMs += segment.durationMs;
  state.captionQueue.push(segment);
  processCaptionQueue();
}

async function processCaptionQueue() {
  if (state.captionProcessing || !state.captionQueue.length || !state.captionsEnabled) return;
  state.captionProcessing = true;
  const segment = state.captionQueue.shift();
  const controller = new AbortController();
  state.captionAbortController = controller;
  setLocalSpeechKey("captionProcessing");

  try {
    const params = new URLSearchParams({
      room: state.room,
      client: state.clientId,
      sourceLanguage: state.language,
      targetLanguage: segment.targetLanguage,
      durationMs: String(segment.durationMs),
    });
    const response = await fetch(`/api/caption?${params.toString()}`, {
      method: "POST",
      headers: { "content-type": segment.blob.type || "audio/webm" },
      body: segment.blob,
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.error || `HTTP ${response.status}`);
      error.code = payload.code || "caption_error";
      throw error;
    }
    if (!state.joined || !state.captionsEnabled) return;

    const original = String(payload.originalText || "").trim();
    const translation = String(payload.translatedText || original).trim();
    if (!original || !translation) return;
    const status = `${languageMeta[state.language].label} → ${languageMeta[segment.targetLanguage]?.label || ""}`;
    appendTranscript({
      speaker: state.name,
      original,
      translation,
      local: true,
      status,
    });
    setLocalSpeechText(original);
    sendSignal("translated-caption", {
      id: createCaptionId(),
      original,
      text: translation,
      sourceLanguage: state.language,
      targetLanguage: segment.targetLanguage,
      speakerName: state.name,
      at: Date.now(),
    }, segment.peerId).catch(() => {});
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error);
      if (error.code === "caption_limit") {
        state.captionsEnabled = false;
        stopCaptionCapture();
        setLocalSpeechKey("captionLimit");
        updateControls();
      } else if (error.code === "caption_busy" || error.code === "caption_rate") {
        setLocalSpeechKey("captionSlow");
      } else {
        setLocalSpeechText(t("captionFailed", { message: error.message || "network" }));
      }
    }
  } finally {
    if (state.captionAbortController === controller) state.captionAbortController = null;
    state.captionProcessing = false;
    if (state.captionQueue.length && state.captionsEnabled) processCaptionQueue();
  }
}

function stopCaptionCapture({ clearQueue = true } = {}) {
  const capture = state.captionCapture;
  state.captionCapture = null;
  if (capture) {
    capture.stopped = true;
    clearInterval(capture.timer);
    if (capture.segment) finishCaptionSegment(capture, { discard: true });
    try {
      capture.source.disconnect();
    } catch {}
    capture.audioContext.close().catch(() => {});
  }
  if (clearQueue) {
    state.captionQueue = [];
    state.captionAbortController?.abort();
  }
}

function createCaptionId() {
  return `${state.clientId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function handleTranslatedCaption(message, final) {
  const payload = message.data || {};
  if (!payload.text) return;

  const speaker = payload.speakerName || t("remoteUser");
  state.remoteDisplayName = speaker;
  renderRemoteIdentity();

  const key = payload.id || `${message.from}-${payload.at || Date.now()}`;
  let draft = state.remoteCaptionDrafts.get(key);
  const status = `${languageMeta[payload.sourceLanguage]?.label || ""} → ${languageMeta[payload.targetLanguage]?.label || languageMeta[state.language].label}`;
  if (!draft) {
    draft = {
      item: appendTranscript({
        speaker,
        original: payload.original || t("noCaption"),
        translation: payload.text,
        local: false,
        status,
      }),
    };
    state.remoteCaptionDrafts.set(key, draft);
  } else {
    draft.item.querySelector(".transcript-original").textContent = payload.original || t("noCaption");
    draft.item.querySelector(".transcript-translation").textContent = payload.text;
    draft.item.querySelector(".transcript-meta span").textContent = `${speaker} · ${status}`;
  }

  draft.item.classList.toggle("preview", !final);
  if (final) state.remoteCaptionDrafts.delete(key);
  setCaptionText(payload.original || "", payload.text);
  animateVoice();
}

function appendTranscript({ speaker, original, translation, local, status }) {
  const item = document.createElement("li");
  item.className = `transcript-item${local ? " local" : ""}`;
  item.innerHTML = `
    <div class="transcript-meta">
      <span></span>
      <time></time>
    </div>
    <p class="transcript-original"></p>
    <p class="transcript-translation"></p>
  `;
  item.querySelector(".transcript-meta span").textContent = `${speaker} · ${status}`;
  item.querySelector("time").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  item.querySelector(".transcript-original").textContent = original;
  item.querySelector(".transcript-translation").textContent = translation;
  els.transcriptList.append(item);
  item.scrollIntoView({ block: "nearest" });
  return item;
}

function animateVoice() {
  els.voiceRing.classList.add("speaking");
  clearTimeout(animateVoice.timer);
  animateVoice.timer = setTimeout(() => {
    els.voiceRing.classList.remove("speaking");
  }, 1100);
}

function toggleMute() {
  state.muted = !state.muted;
  for (const track of state.localStream?.getAudioTracks() || []) {
    track.enabled = !state.muted;
  }
  if (state.muted) {
    stopCaptionCapture();
    if (state.captionsEnabled) setLocalSpeechKey("captionsOn");
  } else if (state.captionsEnabled) {
    maybeStartCaptionCapture();
  }
  updateControls();
}

function toggleCaptions() {
  state.captionsEnabled = !state.captionsEnabled;
  if (state.captionsEnabled) {
    setLocalSpeechKey("captionsOn");
    maybeStartCaptionCapture();
  } else {
    stopCaptionCapture();
    setLocalSpeechKey("captionsOff");
  }
  updateControls();
}

function updateControls() {
  els.muteToggle.classList.toggle("active", !state.muted);
  els.captionToggle.classList.toggle("active", state.captionsEnabled);
  els.captionToggle.disabled = false;
  const micLabel = els.muteToggle.querySelector("[data-control-label='mic']");
  const captionLabel = els.captionToggle.querySelector("[data-control-label='captions']");
  micLabel.textContent = state.muted ? t("micOff") : t("micOn");
  captionLabel.textContent = state.captionsEnabled ? t("captionsOnLabel") : t("captionsOffLabel");
}

async function copyInviteLink() {
  const url = new URL(location.href);
  const room = state.room || normalizeRoom(els.roomCode.value) || randomRoomCode();
  els.roomCode.value = room;
  updateUrlRoom(room);
  url.searchParams.set("room", room);
  url.searchParams.set("language", state.language);
  const inviteUrl = url.toString();
  const shareData = {
    title: "LiveSub Call",
    text: t("inviteText"),
    url: inviteUrl,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      setStatusKey("linkShared", state.joined);
      return;
    }
    await navigator.clipboard.writeText(inviteUrl);
    setStatusKey("linkCopied", state.joined);
  } catch {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setStatusKey("linkCopied", state.joined);
    } catch {
      window.prompt("LiveSub Call", inviteUrl);
    }
  }
}

function closePeer(peerId) {
  const peer = state.peers.get(peerId);
  if (peer) peer.close();
  state.peers.delete(peerId);
  for (const track of state.remoteStream?.getTracks() || []) track.stop();
  state.remoteStream = createEmptyStream();
  setRemoteAudioStream();
}

function leaveCall() {
  state.joined = false;
  state.eventSource?.close();
  state.eventSource = null;
  stopCaptionCapture();
  for (const peer of state.peers.values()) peer.close();
  state.peers.clear();
  state.peerProfiles.clear();
  state.remoteCaptionDrafts.clear();
  for (const track of state.localStream?.getTracks() || []) track.stop();
  for (const track of state.remoteStream?.getTracks() || []) track.stop();
  state.localStream = null;
  state.remoteStream = createEmptyStream();
  state.remotePeerId = null;
  state.remoteLanguage = null;
  state.remoteDisplayName = "";
  setRemoteAudioStream();
  els.stage.hidden = true;
  els.controls.hidden = true;
  els.joinPanel.hidden = false;
  setCaptionText("", "");
  setStatusKey("waiting");
  setCallStateKey("peerWaiting");
  state.captionsEnabled = false;
  state.captionSessionAudioMs = 0;
  setLocalSpeechKey("captionsOff");
  updateControls();
  renderRemoteIdentity();
}

window.addEventListener("beforeunload", () => {
  state.eventSource?.close();
  stopCaptionCapture();
  for (const track of state.localStream?.getTracks() || []) track.stop();
});

init();
})();
