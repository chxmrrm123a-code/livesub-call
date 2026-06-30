(() => {
if (globalThis.__livesubCallLoaded) {
  return;
}
globalThis.__livesubCallLoaded = true;

const languageMeta = {
  ko: { label: "한국어", short: "한", realtime: "ko" },
  en: { label: "English", short: "EN", realtime: "en" },
  vi: { label: "Tiếng Việt", short: "VI", realtime: "vi" },
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
    localCaptionReady: "Realtime 자막 대기 중",
    waitingPeerLanguage: "상대방이 들어오면 Realtime 자막이 켜집니다",
    realtimeConnecting: "Realtime 자막 연결 중",
    realtimeReady: "Realtime 자막 연결됨",
    realtimeFailed: "Realtime 자막 오류: {message}",
    realtimeUnavailable: "Realtime API 키 또는 연결을 확인해주세요",
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
    localCaptionReady: "Realtime captions ready",
    waitingPeerLanguage: "Realtime captions start when the other person joins",
    realtimeConnecting: "Connecting Realtime captions",
    realtimeReady: "Realtime captions connected",
    realtimeFailed: "Realtime caption error: {message}",
    realtimeUnavailable: "Check the Realtime API key or connection",
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
    localCaptionReady: "Phụ đề Realtime đã sẵn sàng",
    waitingPeerLanguage: "Phụ đề Realtime bắt đầu khi người kia vào",
    realtimeConnecting: "Đang kết nối phụ đề Realtime",
    realtimeReady: "Đã kết nối phụ đề Realtime",
    realtimeFailed: "Lỗi phụ đề Realtime: {message}",
    realtimeUnavailable: "Kiểm tra API key Realtime hoặc kết nối",
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
const realtimeIdleMs = 1400;
const realtimeTranslationEnabled = false;

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
  realtime: null,
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
    if (state.captionsEnabled) restartRealtimeTranslation();
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
    maybeStartRealtimeTranslation();
  });
  state.eventSource.addEventListener("peer-joined", (event) => {
    const payload = normalizePeerProfile(JSON.parse(event.data));
    if (!payload) return;
    setRemoteProfile(payload);
    setCallStateKey("peerJoined");
    connectToPeer(payload.id, false);
    maybeStartRealtimeTranslation();
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
      closeRealtimeTranslation();
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
    maybeStartRealtimeTranslation();
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
    restartRealtimeTranslation();
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

function maybeStartRealtimeTranslation() {
  if (!realtimeTranslationEnabled) {
    closeRealtimeTranslation();
    setLocalSpeechKey("captionsOff");
    return;
  }
  if (!state.joined || !state.captionsEnabled || !state.localStream) return;
  if (!state.remoteLanguage) {
    setLocalSpeechKey("waitingPeerLanguage");
    return;
  }
  if (state.realtime?.active && state.realtime.targetLanguage === state.remoteLanguage) return;
  startRealtimeTranslation().catch((error) => {
    console.error(error);
    closeRealtimeTranslation();
    setLocalSpeechText(t("realtimeFailed", { message: error.message || t("realtimeUnavailable") }));
  });
}

function restartRealtimeTranslation() {
  if (!realtimeTranslationEnabled) {
    closeRealtimeTranslation();
    setLocalSpeechKey("captionsOff");
    return;
  }
  if (!state.joined || !state.captionsEnabled) return;
  closeRealtimeTranslation();
  maybeStartRealtimeTranslation();
}

async function startRealtimeTranslation() {
  if (!realtimeTranslationEnabled) {
    throw new Error("Realtime translation is temporarily disabled");
  }
  closeRealtimeTranslation();
  const targetLanguage = state.remoteLanguage;
  if (!targetLanguage) {
    setLocalSpeechKey("waitingPeerLanguage");
    return;
  }

  setLocalSpeechKey("realtimeConnecting");
  const secretResponse = await fetch("/api/realtime/translation-token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      targetLanguage,
      clientId: state.clientId,
    }),
  });
  const secretPayload = await secretResponse.json().catch(() => ({}));
  if (!secretResponse.ok) {
    throw new Error(secretPayload.error || t("realtimeUnavailable"));
  }
  const clientSecret =
    secretPayload.value ||
    secretPayload.client_secret?.value ||
    secretPayload.client_secret ||
    secretPayload.secret?.value;
  if (!clientSecret) throw new Error(t("realtimeUnavailable"));

  const PeerConnection = globalThis.RTCPeerConnection || globalThis.webkitRTCPeerConnection;
  const pc = new PeerConnection();
  const dataChannel = pc.createDataChannel("oai-events");
  const realtime = {
    pc,
    dataChannel,
    targetLanguage,
    captionId: createCaptionId(),
    sourceText: "",
    outputText: "",
    idleTimer: null,
    localItem: null,
    active: true,
  };
  state.realtime = realtime;

  for (const track of state.localStream.getAudioTracks()) {
    pc.addTrack(track, state.localStream);
  }

  dataChannel.addEventListener("open", () => {
    if (state.realtime === realtime) setLocalSpeechKey("realtimeReady");
  });
  dataChannel.addEventListener("message", (event) => {
    if (state.realtime !== realtime) return;
    handleRealtimeEvent(JSON.parse(event.data));
  });
  dataChannel.addEventListener("close", () => {
    if (state.realtime === realtime && state.captionsEnabled) setLocalSpeechKey("realtimeConnecting");
  });
  pc.addEventListener("connectionstatechange", () => {
    if (state.realtime !== realtime) return;
    if (pc.connectionState === "connected") setLocalSpeechKey("realtimeReady");
    if (["failed", "disconnected"].includes(pc.connectionState)) {
      setLocalSpeechText(t("realtimeFailed", { message: pc.connectionState }));
    }
  });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  const answerResponse = await fetch("https://api.openai.com/v1/realtime/translations/calls", {
    method: "POST",
    body: offer.sdp,
    headers: {
      "authorization": `Bearer ${clientSecret}`,
      "content-type": "application/sdp",
    },
  });
  if (!answerResponse.ok) {
    const errorText = await answerResponse.text().catch(() => "");
    throw new Error(errorText || `OpenAI Realtime failed with ${answerResponse.status}`);
  }
  const answer = {
    type: "answer",
    sdp: await answerResponse.text(),
  };
  await pc.setRemoteDescription(answer);
}

function handleRealtimeEvent(event) {
  if (event.type === "error") {
    setLocalSpeechText(t("realtimeFailed", { message: event.error?.message || "unknown" }));
    return;
  }

  const delta = getRealtimeText(event);
  if (delta === "") return;

  const realtime = state.realtime;
  if (!realtime) return;
  if (event.type.includes("input_transcript")) {
    realtime.sourceText += delta;
    setLocalSpeechText(realtime.sourceText.trim() || t("listening"));
    updateLocalRealtimeItem(false);
  }
  if (event.type.includes("output_transcript")) {
    realtime.outputText += delta;
    updateLocalRealtimeItem(false);
    publishRealtimeCaption(false);
  }

  if (event.type.endsWith(".done") || event.type.endsWith(".completed")) {
    finishRealtimeCaption();
    return;
  }
  scheduleRealtimeIdle();
}

function getRealtimeText(event) {
  const value = event.delta ?? event.text ?? event.transcript ?? event.output_text ?? "";
  return String(value);
}

function scheduleRealtimeIdle() {
  const realtime = state.realtime;
  if (!realtime) return;
  clearTimeout(realtime.idleTimer);
  realtime.idleTimer = setTimeout(finishRealtimeCaption, realtimeIdleMs);
}

function publishRealtimeCaption(final) {
  const realtime = state.realtime;
  if (!realtime || !realtime.outputText.trim()) return;
  sendSignal(final ? "translated-caption" : "translated-caption-preview", {
    id: realtime.captionId,
    original: realtime.sourceText.trim(),
    text: realtime.outputText.trim(),
    sourceLanguage: state.language,
    targetLanguage: realtime.targetLanguage,
    speakerName: state.name,
    at: Date.now(),
  }).catch(() => {});
}

function updateLocalRealtimeItem(final) {
  const realtime = state.realtime;
  if (!realtime) return;
  const original = realtime.sourceText.trim() || t("listening");
  const translation = realtime.outputText.trim() || t("translating");
  const status = `${languageMeta[state.language].label} → ${languageMeta[realtime.targetLanguage]?.label || ""}`;
  if (!realtime.localItem) {
    realtime.localItem = appendTranscript({
      speaker: state.name,
      original,
      translation,
      local: true,
      status,
    });
  } else {
    realtime.localItem.querySelector(".transcript-original").textContent = original;
    realtime.localItem.querySelector(".transcript-translation").textContent = translation;
    realtime.localItem.querySelector(".transcript-meta span").textContent = `${state.name} · ${status}`;
  }
  realtime.localItem.classList.toggle("preview", !final);
}

function finishRealtimeCaption() {
  const realtime = state.realtime;
  if (!realtime) return;
  clearTimeout(realtime.idleTimer);
  realtime.idleTimer = null;
  if (realtime.sourceText.trim() || realtime.outputText.trim()) {
    updateLocalRealtimeItem(true);
    publishRealtimeCaption(true);
  }
  realtime.captionId = createCaptionId();
  realtime.sourceText = "";
  realtime.outputText = "";
  realtime.localItem = null;
  if (state.captionsEnabled && state.joined) setLocalSpeechKey("realtimeReady");
}

function closeRealtimeTranslation() {
  const realtime = state.realtime;
  if (!realtime) return;
  clearTimeout(realtime.idleTimer);
  try {
    realtime.dataChannel?.close();
  } catch {}
  try {
    realtime.pc?.close();
  } catch {}
  state.realtime = null;
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
  updateControls();
}

function toggleCaptions() {
  if (!realtimeTranslationEnabled) {
    state.captionsEnabled = false;
    finishRealtimeCaption();
    closeRealtimeTranslation();
    setLocalSpeechKey("captionsOff");
    updateControls();
    return;
  }
  state.captionsEnabled = !state.captionsEnabled;
  if (state.captionsEnabled) {
    setLocalSpeechKey("captionsOn");
    maybeStartRealtimeTranslation();
  } else {
    finishRealtimeCaption();
    closeRealtimeTranslation();
    setLocalSpeechKey("captionsOff");
  }
  updateControls();
}

function updateControls() {
  els.muteToggle.classList.toggle("active", !state.muted);
  els.captionToggle.classList.toggle("active", state.captionsEnabled);
  els.captionToggle.disabled = !realtimeTranslationEnabled;
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
  closeRealtimeTranslation();
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
  setLocalSpeechKey("localCaptionReady");
  renderRemoteIdentity();
}

window.addEventListener("beforeunload", () => {
  state.eventSource?.close();
  closeRealtimeTranslation();
  for (const track of state.localStream?.getTracks() || []) track.stop();
});

init();
})();
