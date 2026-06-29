const languageMeta = {
  ko: { label: "한국어", speechCode: "ko-KR" },
  en: { label: "English", speechCode: "en-US" },
  vi: { label: "Tiếng Việt", speechCode: "vi-VN" },
};

const els = {
  connectionStatus: document.querySelector("#connectionStatus"),
  joinPanel: document.querySelector("#joinPanel"),
  stage: document.querySelector("#stage"),
  controls: document.querySelector("#controls"),
  displayName: document.querySelector("#displayName"),
  roomCode: document.querySelector("#roomCode"),
  randomRoom: document.querySelector("#randomRoom"),
  spokenLanguage: document.querySelector("#spokenLanguage"),
  captionLanguage: document.querySelector("#captionLanguage"),
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
  copyLink: document.querySelector("#copyLink"),
  leaveCall: document.querySelector("#leaveCall"),
  clearTranscript: document.querySelector("#clearTranscript"),
  languageSummary: document.querySelector("#languageSummary"),
  transcriptList: document.querySelector("#transcriptList"),
  remoteAudio: document.querySelector("#remoteAudio"),
};

const SpeechRecognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const state = {
  clientId: createClientId(),
  room: "",
  name: "",
  spokenLanguage: "ko",
  captionLanguage: "ko",
  localStream: null,
  remoteStream: createEmptyStream(),
  eventSource: null,
  peers: new Map(),
  recognition: null,
  recognitionActive: false,
  recognitionRestartTimer: null,
  captionsEnabled: true,
  muted: false,
  joined: false,
  remoteDisplayName: "상대방",
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

function setRemoteAudioStream() {
  els.remoteAudio.srcObject = state.remoteStream || null;
}

function init() {
  const params = new URLSearchParams(location.search);
  els.roomCode.value = params.get("room") || randomRoomCode();
  els.displayName.value = localStorage.getItem("livesub-name") || "";
  els.spokenLanguage.value = localStorage.getItem("livesub-spoken") || "ko";
  els.captionLanguage.value = localStorage.getItem("livesub-caption") || "ko";
  updateLanguageSummary();

  els.randomRoom.addEventListener("click", () => {
    els.roomCode.value = randomRoomCode();
    updateUrlRoom(els.roomCode.value);
    setStatus("새 방 준비됨");
  });
  els.roomCode.addEventListener("input", () => updateUrlRoom(els.roomCode.value));
  els.spokenLanguage.addEventListener("change", updateLanguageSummary);
  els.captionLanguage.addEventListener("change", updateLanguageSummary);
  els.joinCall.addEventListener("click", joinCall);
  els.copyInviteBeforeJoin.addEventListener("click", copyInviteLink);
  els.muteToggle.addEventListener("click", toggleMute);
  els.captionToggle.addEventListener("click", toggleCaptions);
  els.copyLink.addEventListener("click", copyInviteLink);
  els.leaveCall.addEventListener("click", leaveCall);
  els.clearTranscript.addEventListener("click", () => {
    els.transcriptList.innerHTML = "";
  });
}

function randomRoomCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function normalizeRoom(value) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24);
}

function updateUrlRoom(value) {
  const room = normalizeRoom(value);
  if (!room) return;
  const url = new URL(location.href);
  url.searchParams.set("room", room);
  history.replaceState(null, "", url);
}

function setStatus(text, live = false) {
  els.connectionStatus.textContent = text;
  els.connectionStatus.classList.toggle("live", live);
}

function updateLanguageSummary() {
  const spoken = languageMeta[els.spokenLanguage.value].label;
  const caption = languageMeta[els.captionLanguage.value].label;
  els.languageSummary.textContent = `${spoken} 음성 · ${caption} 자막`;
}

async function joinCall() {
  state.room = normalizeRoom(els.roomCode.value || randomRoomCode());
  state.name = (els.displayName.value || "Guest").trim().slice(0, 32);
  state.spokenLanguage = els.spokenLanguage.value;
  state.captionLanguage = els.captionLanguage.value;
  localStorage.setItem("livesub-name", state.name);
  localStorage.setItem("livesub-spoken", state.spokenLanguage);
  localStorage.setItem("livesub-caption", state.captionLanguage);
  updateUrlRoom(state.room);
  updateLanguageSummary();

  try {
    if (!globalThis.navigator?.mediaDevices?.getUserMedia) {
      throw new Error("이 브라우저는 마이크 통화를 지원하지 않습니다. Chrome이나 Samsung Internet으로 열어주세요.");
    }
    if (typeof (globalThis.RTCPeerConnection || globalThis.webkitRTCPeerConnection) !== "function") {
      throw new Error("이 브라우저는 음성 통화를 지원하지 않습니다. Chrome이나 Samsung Internet으로 열어주세요.");
    }

    setStatus("마이크 요청");
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
    setStatus("연결 중");
    updateControls();
    startEvents();
    startSpeechRecognition();
  } catch (error) {
    setStatus("마이크 차단");
    els.callState.textContent = error.message || "마이크 권한을 확인해주세요";
    console.error(error);
  }
}

function startEvents() {
  const params = new URLSearchParams({
    room: state.room,
    client: state.clientId,
    name: state.name,
  });
  state.eventSource = new EventSource(`/api/events?${params.toString()}`);
  state.eventSource.addEventListener("ready", (event) => {
    const payload = JSON.parse(event.data);
    setStatus("통화 가능", true);
    els.callState.textContent = payload.peers.length ? "상대방 연결 중" : "상대방 대기 중";
    for (const peerId of payload.peers) connectToPeer(peerId, true);
  });
  state.eventSource.addEventListener("peer-joined", (event) => {
    const payload = JSON.parse(event.data);
    state.remoteDisplayName = payload.name || "상대방";
    renderRemoteIdentity();
    els.callState.textContent = "상대방 입장";
    connectToPeer(payload.from, false);
  });
  state.eventSource.addEventListener("peer-left", (event) => {
    const payload = JSON.parse(event.data);
    closePeer(payload.from);
    els.callState.textContent = "상대방 퇴장";
  });
  state.eventSource.addEventListener("signal", (event) => {
    handleSignal(JSON.parse(event.data));
  });
  state.eventSource.onerror = () => {
    setStatus("재연결 중");
  };
}

function renderRemoteIdentity() {
  els.remoteName.textContent = state.remoteDisplayName;
  els.remoteInitial.textContent = state.remoteDisplayName.trim().slice(0, 1).toUpperCase() || "?";
}

function connectToPeer(peerId, shouldOffer) {
  if (state.peers.has(peerId)) return state.peers.get(peerId);
  const PeerConnection = globalThis.RTCPeerConnection || globalThis.webkitRTCPeerConnection;
  if (typeof PeerConnection !== "function") {
    els.callState.textContent = "이 브라우저는 음성 통화를 지원하지 않습니다";
    return null;
  }
  const peer = new PeerConnection(rtcConfig);
  state.peers.set(peerId, peer);

  for (const track of state.localStream?.getTracks() || []) peer.addTrack(track, state.localStream);

  peer.addEventListener("icecandidate", (event) => {
    if (event.candidate) sendSignal("ice", event.candidate, peerId);
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
    els.callState.textContent = "연결됨";
    animateVoice();
  });
  peer.addEventListener("connectionstatechange", () => {
    if (peer.connectionState === "connected") {
      setStatus("통화 중", true);
      els.callState.textContent = "연결됨";
    }
    if (["failed", "disconnected", "closed"].includes(peer.connectionState)) {
      els.callState.textContent = "연결 끊김";
    }
  });

  if (shouldOffer) {
    makeOffer(peerId, peer);
  }
  return peer;
}

async function makeOffer(peerId, peer) {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  await sendSignal("offer", offer, peerId);
}

async function handleSignal(message) {
  if (message.from === state.clientId) return;
  if (message.type === "caption") {
    handleRemoteCaption(message);
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

function startSpeechRecognition() {
  if (!SpeechRecognition) {
    els.localSpeech.textContent = "이 브라우저는 실시간 음성 인식을 지원하지 않습니다";
    return;
  }
  stopSpeechRecognition();

  const recognition = new SpeechRecognition();
  state.recognition = recognition;
  recognition.lang = languageMeta[state.spokenLanguage].speechCode;
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.addEventListener("start", () => {
    state.recognitionActive = true;
  });
  recognition.addEventListener("result", (event) => {
    let interim = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const text = result[0].transcript.trim();
      if (!text) continue;
      if (result.isFinal) publishLocalCaption(text);
      else interim += `${text} `;
    }
    if (interim.trim()) els.localSpeech.textContent = interim.trim();
  });
  recognition.addEventListener("end", () => {
    state.recognitionActive = false;
    if (state.recognition !== recognition || !state.joined || !state.captionsEnabled || document.hidden) return;
    clearTimeout(state.recognitionRestartTimer);
    state.recognitionRestartTimer = setTimeout(startRecognitionSafely, 1200);
  });
  recognition.addEventListener("error", (event) => {
    state.recognitionActive = false;
    if (["not-allowed", "service-not-allowed"].includes(event.error)) {
      state.captionsEnabled = false;
      els.localSpeech.textContent = "브라우저 마이크 권한을 허용하면 자막이 다시 시작됩니다";
      updateControls();
      return;
    }
    if (event.error !== "no-speech") els.localSpeech.textContent = `자막 오류: ${event.error}`;
  });
  startRecognitionSafely();
}

function startRecognitionSafely() {
  if (!state.recognition || state.recognitionActive || !state.joined || !state.captionsEnabled) return;
  try {
    state.recognition.start();
  } catch (error) {
    if (error.name !== "InvalidStateError") {
      els.localSpeech.textContent = `자막 오류: ${error.message}`;
    }
  }
}

function stopSpeechRecognition() {
  clearTimeout(state.recognitionRestartTimer);
  state.recognitionRestartTimer = null;
  if (state.recognition) {
    try {
      state.recognition.stop();
    } catch {}
  }
  state.recognitionActive = false;
}

function publishLocalCaption(text) {
  if (!state.captionsEnabled) return;
  els.localSpeech.textContent = text;
  appendTranscript({
    speaker: state.name,
    original: text,
    translation: text,
    local: true,
    status: languageMeta[state.spokenLanguage].label,
  });
  sendSignal("caption", {
    text,
    sourceLanguage: state.spokenLanguage,
    speakerName: state.name,
    at: Date.now(),
  });
}

async function handleRemoteCaption(message) {
  const payload = message.data;
  const speaker = payload.speakerName || "상대방";
  state.remoteDisplayName = speaker;
  renderRemoteIdentity();
  els.captionSource.textContent = payload.text;
  els.captionMain.textContent = "번역 중...";
  animateVoice();

  const item = appendTranscript({
    speaker,
    original: payload.text,
    translation: "번역 중...",
    local: false,
    status: `${languageMeta[payload.sourceLanguage]?.label || "원문"} → ${languageMeta[state.captionLanguage].label}`,
  });

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: payload.text,
        sourceLanguage: payload.sourceLanguage,
        targetLanguage: state.captionLanguage,
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "번역 실패");
    updateTranscript(item, result.translatedText, result.mode);
    els.captionMain.textContent = result.translatedText;
  } catch (error) {
    const fallback = `번역 실패: ${error.message}`;
    updateTranscript(item, fallback, "error");
    els.captionMain.textContent = fallback;
  }
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

function updateTranscript(item, translation, mode) {
  item.querySelector(".transcript-translation").textContent = translation;
  if (mode === "demo") {
    const meta = item.querySelector(".transcript-meta span");
    meta.textContent = `${meta.textContent} · 데모`;
  }
}

function animateVoice() {
  els.voiceRing.classList.add("speaking");
  clearTimeout(animateVoice.timer);
  animateVoice.timer = setTimeout(() => {
    els.voiceRing.classList.remove("speaking");
  }, 1200);
}

function toggleMute() {
  state.muted = !state.muted;
  for (const track of state.localStream?.getAudioTracks() || []) {
    track.enabled = !state.muted;
  }
  updateControls();
}

function toggleCaptions() {
  state.captionsEnabled = !state.captionsEnabled;
  if (state.captionsEnabled) {
    if (state.recognition) startRecognitionSafely();
    else startSpeechRecognition();
  } else {
    stopSpeechRecognition();
  }
  updateControls();
}

function updateControls() {
  els.muteToggle.classList.toggle("active", !state.muted);
  els.muteToggle.querySelector("span").textContent = state.muted ? "Muted" : "Mic";
  els.captionToggle.classList.toggle("active", state.captionsEnabled);
  els.captionToggle.querySelector("span").textContent = state.captionsEnabled ? "CC" : "No CC";
}

async function copyInviteLink() {
  const url = new URL(location.href);
  const room = state.room || normalizeRoom(els.roomCode.value) || randomRoomCode();
  els.roomCode.value = room;
  updateUrlRoom(room);
  url.searchParams.set("room", room);
  const inviteUrl = url.toString();
  const shareData = {
    title: "LiveSub Call",
    text: "번역 통화방에 들어와 주세요.",
    url: inviteUrl,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      if (state.joined) els.callState.textContent = "초대 링크 공유됨";
      else setStatus("링크 공유됨");
      return;
    }
    await navigator.clipboard.writeText(inviteUrl);
    if (state.joined) els.callState.textContent = "초대 링크 복사됨";
    else setStatus("링크 복사됨");
  } catch {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      if (state.joined) els.callState.textContent = "초대 링크 복사됨";
      else setStatus("링크 복사됨");
    } catch {
      window.prompt("초대 링크", inviteUrl);
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
  stopSpeechRecognition();
  state.recognition = null;
  for (const peer of state.peers.values()) peer.close();
  state.peers.clear();
  for (const track of state.localStream?.getTracks() || []) track.stop();
  for (const track of state.remoteStream?.getTracks() || []) track.stop();
  state.localStream = null;
  state.remoteStream = createEmptyStream();
  setRemoteAudioStream();
  els.stage.hidden = true;
  els.controls.hidden = true;
  els.joinPanel.hidden = false;
  setStatus("대기 중");
}

window.addEventListener("beforeunload", () => {
  state.eventSource?.close();
  for (const track of state.localStream?.getTracks() || []) track.stop();
});

init();
const languageMeta = {
  ko: { label: "한국어", speechCode: "ko-KR" },
  en: { label: "English", speechCode: "en-US" },
  vi: { label: "Tiếng Việt", speechCode: "vi-VN" },
};

const els = {
  connectionStatus: document.querySelector("#connectionStatus"),
  joinPanel: document.querySelector("#joinPanel"),
  stage: document.querySelector("#stage"),
  controls: document.querySelector("#controls"),
  displayName: document.querySelector("#displayName"),
  roomCode: document.querySelector("#roomCode"),
  randomRoom: document.querySelector("#randomRoom"),
  spokenLanguage: document.querySelector("#spokenLanguage"),
  captionLanguage: document.querySelector("#captionLanguage"),
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
  copyLink: document.querySelector("#copyLink"),
  leaveCall: document.querySelector("#leaveCall"),
  clearTranscript: document.querySelector("#clearTranscript"),
  languageSummary: document.querySelector("#languageSummary"),
  transcriptList: document.querySelector("#transcriptList"),
  remoteAudio: document.querySelector("#remoteAudio"),
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const state = {
  clientId: crypto.randomUUID(),
  room: "",
  name: "",
  spokenLanguage: "ko",
  captionLanguage: "ko",
  localStream: null,
  remoteStream: new MediaStream(),
  eventSource: null,
  peers: new Map(),
  recognition: null,
  recognitionActive: false,
  recognitionRestartTimer: null,
  captionsEnabled: true,
  muted: false,
  joined: false,
  remoteDisplayName: "상대방",
};

function init() {
  const params = new URLSearchParams(location.search);
  els.roomCode.value = params.get("room") || randomRoomCode();
  els.displayName.value = localStorage.getItem("livesub-name") || "";
  els.spokenLanguage.value = localStorage.getItem("livesub-spoken") || "ko";
  els.captionLanguage.value = localStorage.getItem("livesub-caption") || "ko";
  updateLanguageSummary();

  els.randomRoom.addEventListener("click", () => {
    els.roomCode.value = randomRoomCode();
    updateUrlRoom(els.roomCode.value);
    setStatus("새 방 준비됨");
  });
  els.roomCode.addEventListener("input", () => updateUrlRoom(els.roomCode.value));
  els.spokenLanguage.addEventListener("change", updateLanguageSummary);
  els.captionLanguage.addEventListener("change", updateLanguageSummary);
  els.joinCall.addEventListener("click", joinCall);
  els.copyInviteBeforeJoin.addEventListener("click", copyInviteLink);
  els.muteToggle.addEventListener("click", toggleMute);
  els.captionToggle.addEventListener("click", toggleCaptions);
  els.copyLink.addEventListener("click", copyInviteLink);
  els.leaveCall.addEventListener("click", leaveCall);
  els.clearTranscript.addEventListener("click", () => {
    els.transcriptList.innerHTML = "";
  });
}

function randomRoomCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function normalizeRoom(value) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24);
}

function updateUrlRoom(value) {
  const room = normalizeRoom(value);
  if (!room) return;
  const url = new URL(location.href);
  url.searchParams.set("room", room);
  history.replaceState(null, "", url);
}

function setStatus(text, live = false) {
  els.connectionStatus.textContent = text;
  els.connectionStatus.classList.toggle("live", live);
}

function updateLanguageSummary() {
  const spoken = languageMeta[els.spokenLanguage.value].label;
  const caption = languageMeta[els.captionLanguage.value].label;
  els.languageSummary.textContent = `${spoken} 음성 · ${caption} 자막`;
}

async function joinCall() {
  state.room = normalizeRoom(els.roomCode.value || randomRoomCode());
  state.name = (els.displayName.value || "Guest").trim().slice(0, 32);
  state.spokenLanguage = els.spokenLanguage.value;
  state.captionLanguage = els.captionLanguage.value;
  localStorage.setItem("livesub-name", state.name);
  localStorage.setItem("livesub-spoken", state.spokenLanguage);
  localStorage.setItem("livesub-caption", state.captionLanguage);
  updateUrlRoom(state.room);
  updateLanguageSummary();

  try {
    setStatus("마이크 요청");
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
    els.remoteAudio.srcObject = state.remoteStream;
    setStatus("연결 중");
    updateControls();
    startEvents();
    startSpeechRecognition();
  } catch (error) {
    setStatus("마이크 차단");
    els.callState.textContent = "마이크 권한을 확인해주세요";
    console.error(error);
  }
}

function startEvents() {
  const params = new URLSearchParams({
    room: state.room,
    client: state.clientId,
    name: state.name,
  });
  state.eventSource = new EventSource(`/api/events?${params.toString()}`);
  state.eventSource.addEventListener("ready", (event) => {
    const payload = JSON.parse(event.data);
    setStatus("통화 가능", true);
    els.callState.textContent = payload.peers.length ? "상대방 연결 중" : "상대방 대기 중";
    for (const peerId of payload.peers) connectToPeer(peerId, true);
  });
  state.eventSource.addEventListener("peer-joined", (event) => {
    const payload = JSON.parse(event.data);
    state.remoteDisplayName = payload.name || "상대방";
    renderRemoteIdentity();
    els.callState.textContent = "상대방 입장";
    connectToPeer(payload.from, false);
  });
  state.eventSource.addEventListener("peer-left", (event) => {
    const payload = JSON.parse(event.data);
    closePeer(payload.from);
    els.callState.textContent = "상대방 퇴장";
  });
  state.eventSource.addEventListener("signal", (event) => {
    handleSignal(JSON.parse(event.data));
  });
  state.eventSource.onerror = () => {
    setStatus("재연결 중");
  };
}

function renderRemoteIdentity() {
  els.remoteName.textContent = state.remoteDisplayName;
  els.remoteInitial.textContent = state.remoteDisplayName.trim().slice(0, 1).toUpperCase() || "?";
}

function connectToPeer(peerId, shouldOffer) {
  if (state.peers.has(peerId)) return state.peers.get(peerId);
  const peer = new RTCPeerConnection(rtcConfig);
  state.peers.set(peerId, peer);

  for (const track of state.localStream.getTracks()) peer.addTrack(track, state.localStream);

  peer.addEventListener("icecandidate", (event) => {
    if (event.candidate) sendSignal("ice", event.candidate, peerId);
  });
  peer.addEventListener("track", (event) => {
    for (const track of event.streams[0].getTracks()) {
      if (!state.remoteStream.getTracks().some((item) => item.id === track.id)) {
        state.remoteStream.addTrack(track);
      }
    }
    els.callState.textContent = "연결됨";
    animateVoice();
  });
  peer.addEventListener("connectionstatechange", () => {
    if (peer.connectionState === "connected") {
      setStatus("통화 중", true);
      els.callState.textContent = "연결됨";
    }
    if (["failed", "disconnected", "closed"].includes(peer.connectionState)) {
      els.callState.textContent = "연결 끊김";
    }
  });

  if (shouldOffer) {
    makeOffer(peerId, peer);
  }
  return peer;
}

async function makeOffer(peerId, peer) {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  await sendSignal("offer", offer, peerId);
}

async function handleSignal(message) {
  if (message.from === state.clientId) return;
  if (message.type === "caption") {
    handleRemoteCaption(message);
    return;
  }

  const peer = connectToPeer(message.from, false);
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

function startSpeechRecognition() {
  if (!SpeechRecognition) {
    els.localSpeech.textContent = "이 브라우저는 실시간 음성 인식을 지원하지 않습니다";
    return;
  }
  stopSpeechRecognition();

  const recognition = new SpeechRecognition();
  state.recognition = recognition;
  recognition.lang = languageMeta[state.spokenLanguage].speechCode;
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.addEventListener("start", () => {
    state.recognitionActive = true;
  });
  recognition.addEventListener("result", (event) => {
    let interim = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const text = result[0].transcript.trim();
      if (!text) continue;
      if (result.isFinal) publishLocalCaption(text);
      else interim += `${text} `;
    }
    if (interim.trim()) els.localSpeech.textContent = interim.trim();
  });
  recognition.addEventListener("end", () => {
    state.recognitionActive = false;
    if (state.recognition !== recognition || !state.joined || !state.captionsEnabled || document.hidden) return;
    clearTimeout(state.recognitionRestartTimer);
    state.recognitionRestartTimer = setTimeout(startRecognitionSafely, 1200);
  });
  recognition.addEventListener("error", (event) => {
    state.recognitionActive = false;
    if (["not-allowed", "service-not-allowed"].includes(event.error)) {
      state.captionsEnabled = false;
      els.localSpeech.textContent = "브라우저 마이크 권한을 허용하면 자막이 다시 시작됩니다";
      updateControls();
      return;
    }
    if (event.error !== "no-speech") els.localSpeech.textContent = `자막 오류: ${event.error}`;
  });
  startRecognitionSafely();
}

function startRecognitionSafely() {
  if (!state.recognition || state.recognitionActive || !state.joined || !state.captionsEnabled) return;
  try {
    state.recognition.start();
  } catch (error) {
    if (error.name !== "InvalidStateError") {
      els.localSpeech.textContent = `자막 오류: ${error.message}`;
    }
  }
}

function stopSpeechRecognition() {
  clearTimeout(state.recognitionRestartTimer);
  state.recognitionRestartTimer = null;
  if (state.recognition) {
    try {
      state.recognition.stop();
    } catch {}
  }
  state.recognitionActive = false;
}

function publishLocalCaption(text) {
  if (!state.captionsEnabled) return;
  els.localSpeech.textContent = text;
  appendTranscript({
    speaker: state.name,
    original: text,
    translation: text,
    local: true,
    status: languageMeta[state.spokenLanguage].label,
  });
  sendSignal("caption", {
    text,
    sourceLanguage: state.spokenLanguage,
    speakerName: state.name,
    at: Date.now(),
  });
}

async function handleRemoteCaption(message) {
  const payload = message.data;
  const speaker = payload.speakerName || "상대방";
  state.remoteDisplayName = speaker;
  renderRemoteIdentity();
  els.captionSource.textContent = payload.text;
  els.captionMain.textContent = "번역 중...";
  animateVoice();

  const item = appendTranscript({
    speaker,
    original: payload.text,
    translation: "번역 중...",
    local: false,
    status: `${languageMeta[payload.sourceLanguage]?.label || "원문"} → ${languageMeta[state.captionLanguage].label}`,
  });

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: payload.text,
        sourceLanguage: payload.sourceLanguage,
        targetLanguage: state.captionLanguage,
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "번역 실패");
    updateTranscript(item, result.translatedText, result.mode);
    els.captionMain.textContent = result.translatedText;
  } catch (error) {
    const fallback = `번역 실패: ${error.message}`;
    updateTranscript(item, fallback, "error");
    els.captionMain.textContent = fallback;
  }
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

function updateTranscript(item, translation, mode) {
  item.querySelector(".transcript-translation").textContent = translation;
  if (mode === "demo") {
    const meta = item.querySelector(".transcript-meta span");
    meta.textContent = `${meta.textContent} · 데모`;
  }
}

function animateVoice() {
  els.voiceRing.classList.add("speaking");
  clearTimeout(animateVoice.timer);
  animateVoice.timer = setTimeout(() => {
    els.voiceRing.classList.remove("speaking");
  }, 1200);
}

function toggleMute() {
  state.muted = !state.muted;
  for (const track of state.localStream?.getAudioTracks() || []) {
    track.enabled = !state.muted;
  }
  updateControls();
}

function toggleCaptions() {
  state.captionsEnabled = !state.captionsEnabled;
  if (state.captionsEnabled) {
    if (state.recognition) startRecognitionSafely();
    else startSpeechRecognition();
  } else {
    stopSpeechRecognition();
  }
  updateControls();
}

function updateControls() {
  els.muteToggle.classList.toggle("active", !state.muted);
  els.muteToggle.querySelector("span").textContent = state.muted ? "Muted" : "Mic";
  els.captionToggle.classList.toggle("active", state.captionsEnabled);
  els.captionToggle.querySelector("span").textContent = state.captionsEnabled ? "CC" : "No CC";
}

async function copyInviteLink() {
  const url = new URL(location.href);
  const room = state.room || normalizeRoom(els.roomCode.value) || randomRoomCode();
  els.roomCode.value = room;
  updateUrlRoom(room);
  url.searchParams.set("room", room);
  const inviteUrl = url.toString();
  const shareData = {
    title: "LiveSub Call",
    text: "번역 통화방에 들어와 주세요.",
    url: inviteUrl,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      if (state.joined) els.callState.textContent = "초대 링크 공유됨";
      else setStatus("링크 공유됨");
      return;
    }
    await navigator.clipboard.writeText(inviteUrl);
    if (state.joined) els.callState.textContent = "초대 링크 복사됨";
    else setStatus("링크 복사됨");
  } catch {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      if (state.joined) els.callState.textContent = "초대 링크 복사됨";
      else setStatus("링크 복사됨");
    } catch {
      window.prompt("초대 링크", inviteUrl);
    }
  }
}

function closePeer(peerId) {
  const peer = state.peers.get(peerId);
  if (peer) peer.close();
  state.peers.delete(peerId);
  for (const track of state.remoteStream.getTracks()) track.stop();
  state.remoteStream = new MediaStream();
  els.remoteAudio.srcObject = state.remoteStream;
}

function leaveCall() {
  state.joined = false;
  state.eventSource?.close();
  state.eventSource = null;
  stopSpeechRecognition();
  state.recognition = null;
  for (const peer of state.peers.values()) peer.close();
  state.peers.clear();
  for (const track of state.localStream?.getTracks() || []) track.stop();
  for (const track of state.remoteStream.getTracks()) track.stop();
  state.localStream = null;
  state.remoteStream = new MediaStream();
  els.remoteAudio.srcObject = state.remoteStream;
  els.stage.hidden = true;
  els.controls.hidden = true;
  els.joinPanel.hidden = false;
  setStatus("대기 중");
}

window.addEventListener("beforeunload", () => {
  state.eventSource?.close();
  for (const track of state.localStream?.getTracks() || []) track.stop();
});

init();
const languageMeta = {
  ko: { label: "한국어", speechCode: "ko-KR" },
  en: { label: "English", speechCode: "en-US" },
  vi: { label: "Tiếng Việt", speechCode: "vi-VN" },
};

const els = {
  connectionStatus: document.querySelector("#connectionStatus"),
  joinPanel: document.querySelector("#joinPanel"),
  stage: document.querySelector("#stage"),
  controls: document.querySelector("#controls"),
  displayName: document.querySelector("#displayName"),
  roomCode: document.querySelector("#roomCode"),
  randomRoom: document.querySelector("#randomRoom"),
  spokenLanguage: document.querySelector("#spokenLanguage"),
  captionLanguage: document.querySelector("#captionLanguage"),
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
  copyLink: document.querySelector("#copyLink"),
  leaveCall: document.querySelector("#leaveCall"),
  clearTranscript: document.querySelector("#clearTranscript"),
  languageSummary: document.querySelector("#languageSummary"),
  transcriptList: document.querySelector("#transcriptList"),
  remoteAudio: document.querySelector("#remoteAudio"),
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const state = {
  clientId: crypto.randomUUID(),
  room: "",
  name: "",
  spokenLanguage: "ko",
  captionLanguage: "ko",
  localStream: null,
  remoteStream: new MediaStream(),
  eventSource: null,
  peers: new Map(),
  recognition: null,
  captionsEnabled: true,
  muted: false,
  joined: false,
  remoteDisplayName: "상대방",
};

function init() {
  const params = new URLSearchParams(location.search);
  els.roomCode.value = params.get("room") || randomRoomCode();
  els.displayName.value = localStorage.getItem("livesub-name") || "";
  els.spokenLanguage.value = localStorage.getItem("livesub-spoken") || "ko";
  els.captionLanguage.value = localStorage.getItem("livesub-caption") || "ko";
  updateLanguageSummary();

  els.randomRoom.addEventListener("click", () => {
    els.roomCode.value = randomRoomCode();
    updateUrlRoom(els.roomCode.value);
    setStatus("새 방 준비됨");
  });
  els.roomCode.addEventListener("input", () => updateUrlRoom(els.roomCode.value));
  els.spokenLanguage.addEventListener("change", updateLanguageSummary);
  els.captionLanguage.addEventListener("change", updateLanguageSummary);
  els.joinCall.addEventListener("click", joinCall);
  els.copyInviteBeforeJoin.addEventListener("click", copyInviteLink);
  els.muteToggle.addEventListener("click", toggleMute);
  els.captionToggle.addEventListener("click", toggleCaptions);
  els.copyLink.addEventListener("click", copyInviteLink);
  els.leaveCall.addEventListener("click", leaveCall);
  els.clearTranscript.addEventListener("click", () => {
    els.transcriptList.innerHTML = "";
  });
}

function randomRoomCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function normalizeRoom(value) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24);
}

function updateUrlRoom(value) {
  const room = normalizeRoom(value);
  if (!room) return;
  const url = new URL(location.href);
  url.searchParams.set("room", room);
  history.replaceState(null, "", url);
}

function setStatus(text, live = false) {
  els.connectionStatus.textContent = text;
  els.connectionStatus.classList.toggle("live", live);
}

function updateLanguageSummary() {
  const spoken = languageMeta[els.spokenLanguage.value].label;
  const caption = languageMeta[els.captionLanguage.value].label;
  els.languageSummary.textContent = `${spoken} 음성 · ${caption} 자막`;
}

async function joinCall() {
  state.room = normalizeRoom(els.roomCode.value || randomRoomCode());
  state.name = (els.displayName.value || "Guest").trim().slice(0, 32);
  state.spokenLanguage = els.spokenLanguage.value;
  state.captionLanguage = els.captionLanguage.value;
  localStorage.setItem("livesub-name", state.name);
  localStorage.setItem("livesub-spoken", state.spokenLanguage);
  localStorage.setItem("livesub-caption", state.captionLanguage);
  updateUrlRoom(state.room);
  updateLanguageSummary();

  try {
    setStatus("마이크 요청");
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
    els.remoteAudio.srcObject = state.remoteStream;
    setStatus("연결 중");
    updateControls();
    startEvents();
    startSpeechRecognition();
  } catch (error) {
    setStatus("마이크 차단");
    els.callState.textContent = "마이크 권한을 확인해주세요";
    console.error(error);
  }
}

function startEvents() {
  const params = new URLSearchParams({
    room: state.room,
    client: state.clientId,
    name: state.name,
  });
  state.eventSource = new EventSource(`/api/events?${params.toString()}`);
  state.eventSource.addEventListener("ready", (event) => {
    const payload = JSON.parse(event.data);
    setStatus("통화 가능", true);
    els.callState.textContent = payload.peers.length ? "상대방 연결 중" : "상대방 대기 중";
    for (const peerId of payload.peers) connectToPeer(peerId, true);
  });
  state.eventSource.addEventListener("peer-joined", (event) => {
    const payload = JSON.parse(event.data);
    state.remoteDisplayName = payload.name || "상대방";
    renderRemoteIdentity();
    els.callState.textContent = "상대방 입장";
    connectToPeer(payload.from, false);
  });
  state.eventSource.addEventListener("peer-left", (event) => {
    const payload = JSON.parse(event.data);
    closePeer(payload.from);
    els.callState.textContent = "상대방 퇴장";
  });
  state.eventSource.addEventListener("signal", (event) => {
    handleSignal(JSON.parse(event.data));
  });
  state.eventSource.onerror = () => {
    setStatus("재연결 중");
  };
}

function renderRemoteIdentity() {
  els.remoteName.textContent = state.remoteDisplayName;
  els.remoteInitial.textContent = state.remoteDisplayName.trim().slice(0, 1).toUpperCase() || "?";
}

function connectToPeer(peerId, shouldOffer) {
  if (state.peers.has(peerId)) return state.peers.get(peerId);
  const peer = new RTCPeerConnection(rtcConfig);
  state.peers.set(peerId, peer);

  for (const track of state.localStream.getTracks()) peer.addTrack(track, state.localStream);

  peer.addEventListener("icecandidate", (event) => {
    if (event.candidate) sendSignal("ice", event.candidate, peerId);
  });
  peer.addEventListener("track", (event) => {
    for (const track of event.streams[0].getTracks()) {
      if (!state.remoteStream.getTracks().some((item) => item.id === track.id)) {
        state.remoteStream.addTrack(track);
      }
    }
    els.callState.textContent = "연결됨";
    animateVoice();
  });
  peer.addEventListener("connectionstatechange", () => {
    if (peer.connectionState === "connected") {
      setStatus("통화 중", true);
      els.callState.textContent = "연결됨";
    }
    if (["failed", "disconnected", "closed"].includes(peer.connectionState)) {
      els.callState.textContent = "연결 끊김";
    }
  });

  if (shouldOffer) {
    makeOffer(peerId, peer);
  }
  return peer;
}

async function makeOffer(peerId, peer) {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  await sendSignal("offer", offer, peerId);
}

async function handleSignal(message) {
  if (message.from === state.clientId) return;
  if (message.type === "caption") {
    handleRemoteCaption(message);
    return;
  }

  const peer = connectToPeer(message.from, false);
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

function startSpeechRecognition() {
  if (!SpeechRecognition) {
    els.localSpeech.textContent = "이 브라우저는 실시간 음성 인식을 지원하지 않습니다";
    return;
  }
  state.recognition = new SpeechRecognition();
  state.recognition.lang = languageMeta[state.spokenLanguage].speechCode;
  state.recognition.continuous = true;
  state.recognition.interimResults = true;

  state.recognition.addEventListener("result", (event) => {
    let interim = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const text = result[0].transcript.trim();
      if (!text) continue;
      if (result.isFinal) publishLocalCaption(text);
      else interim += `${text} `;
    }
    if (interim.trim()) els.localSpeech.textContent = interim.trim();
  });
  state.recognition.addEventListener("end", () => {
    if (state.joined && state.captionsEnabled) state.recognition.start();
  });
  state.recognition.addEventListener("error", (event) => {
    if (event.error !== "no-speech") els.localSpeech.textContent = `자막 오류: ${event.error}`;
  });
  state.recognition.start();
}

function publishLocalCaption(text) {
  if (!state.captionsEnabled) return;
  els.localSpeech.textContent = text;
  appendTranscript({
    speaker: state.name,
    original: text,
    translation: text,
    local: true,
    status: languageMeta[state.spokenLanguage].label,
  });
  sendSignal("caption", {
    text,
    sourceLanguage: state.spokenLanguage,
    speakerName: state.name,
    at: Date.now(),
  });
}

async function handleRemoteCaption(message) {
  const payload = message.data;
  const speaker = payload.speakerName || "상대방";
  state.remoteDisplayName = speaker;
  renderRemoteIdentity();
  els.captionSource.textContent = payload.text;
  els.captionMain.textContent = "번역 중...";
  animateVoice();

  const item = appendTranscript({
    speaker,
    original: payload.text,
    translation: "번역 중...",
    local: false,
    status: `${languageMeta[payload.sourceLanguage]?.label || "원문"} → ${languageMeta[state.captionLanguage].label}`,
  });

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: payload.text,
        sourceLanguage: payload.sourceLanguage,
        targetLanguage: state.captionLanguage,
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "번역 실패");
    updateTranscript(item, result.translatedText, result.mode);
    els.captionMain.textContent = result.translatedText;
  } catch (error) {
    const fallback = `번역 실패: ${error.message}`;
    updateTranscript(item, fallback, "error");
    els.captionMain.textContent = fallback;
  }
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

function updateTranscript(item, translation, mode) {
  item.querySelector(".transcript-translation").textContent = translation;
  if (mode === "demo") {
    const meta = item.querySelector(".transcript-meta span");
    meta.textContent = `${meta.textContent} · 데모`;
  }
}

function animateVoice() {
  els.voiceRing.classList.add("speaking");
  clearTimeout(animateVoice.timer);
  animateVoice.timer = setTimeout(() => {
    els.voiceRing.classList.remove("speaking");
  }, 1200);
}

function toggleMute() {
  state.muted = !state.muted;
  for (const track of state.localStream?.getAudioTracks() || []) {
    track.enabled = !state.muted;
  }
  updateControls();
}

function toggleCaptions() {
  state.captionsEnabled = !state.captionsEnabled;
  if (state.recognition) {
    if (state.captionsEnabled) state.recognition.start();
    else state.recognition.stop();
  }
  updateControls();
}

function updateControls() {
  els.muteToggle.classList.toggle("active", !state.muted);
  els.muteToggle.querySelector("span").textContent = state.muted ? "Muted" : "Mic";
  els.captionToggle.classList.toggle("active", state.captionsEnabled);
  els.captionToggle.querySelector("span").textContent = state.captionsEnabled ? "CC" : "No CC";
}

async function copyInviteLink() {
  const url = new URL(location.href);
  const room = state.room || normalizeRoom(els.roomCode.value) || randomRoomCode();
  els.roomCode.value = room;
  updateUrlRoom(room);
  url.searchParams.set("room", room);
  const inviteUrl = url.toString();
  const shareData = {
    title: "LiveSub Call",
    text: "번역 통화방에 들어와 주세요.",
    url: inviteUrl,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      if (state.joined) els.callState.textContent = "초대 링크 공유됨";
      else setStatus("링크 공유됨");
      return;
    }
    await navigator.clipboard.writeText(inviteUrl);
    if (state.joined) els.callState.textContent = "초대 링크 복사됨";
    else setStatus("링크 복사됨");
  } catch {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      if (state.joined) els.callState.textContent = "초대 링크 복사됨";
      else setStatus("링크 복사됨");
    } catch {
      window.prompt("초대 링크", inviteUrl);
    }
  }
}

function closePeer(peerId) {
  const peer = state.peers.get(peerId);
  if (peer) peer.close();
  state.peers.delete(peerId);
  for (const track of state.remoteStream.getTracks()) track.stop();
  state.remoteStream = new MediaStream();
  els.remoteAudio.srcObject = state.remoteStream;
}

function leaveCall() {
  state.joined = false;
  state.eventSource?.close();
  state.eventSource = null;
  state.recognition?.stop();
  state.recognition = null;
  for (const peer of state.peers.values()) peer.close();
  state.peers.clear();
  for (const track of state.localStream?.getTracks() || []) track.stop();
  for (const track of state.remoteStream.getTracks()) track.stop();
  state.localStream = null;
  state.remoteStream = new MediaStream();
  els.remoteAudio.srcObject = state.remoteStream;
  els.stage.hidden = true;
  els.controls.hidden = true;
  els.joinPanel.hidden = false;
  setStatus("대기 중");
}

window.addEventListener("beforeunload", () => {
  state.eventSource?.close();
  for (const track of state.localStream?.getTracks() || []) track.stop();
});

init();
