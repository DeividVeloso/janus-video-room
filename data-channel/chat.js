//https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Simple_RTCDataChannel_sample
// (function () {

window.onload = function () {
  let localConnection = null;
  let remoteConnection = null;
  let sendChannel = null;
  let receiveChannel = null;

  let connectButton = document.getElementById("connectButton");
  let disconnectButton = document.getElementById("disconnectButton");
  let sendButton = document.getElementById("sendButton");
  let messageInputBox = document.getElementById("message");
  let receiveBox = document.getElementById("receivebox");

  // Set event listeners for user interface widgets

  connectButton.addEventListener("click", connectPeers, false);
  disconnectButton.addEventListener("click", disconnectPeers, false);
  sendButton.addEventListener("click", sendMessage, false);

  function setupLocalDataChannel() {
    localConnection = new RTCPeerConnection();

    sendChannel = localConnection.createDataChannel("sendChannel");
    sendChannel.onopen = handleSendChannelStatusChange;
    sendChannel.onclose = handleSendChannelStatusChange;
  }

  function setupRemoteDataChannel() {
    remoteConnection = new RTCPeerConnection();
    //Listen everything that comes from the data channel exchanges.
    remoteConnection.ondatachannel = receiveChannelCallback;
  }

  // they go back and forth until agreement is reached.
  function iceCandidateHandler() {
    localConnection.onicecandidate = (e) =>
      !e.candidate ||
      remoteConnection
        .addIceCandidate(e.candidate)
        .catch(handleAddCandidateError);

    remoteConnection.onicecandidate = (e) =>
      !e.candidate ||
      localConnection
        .addIceCandidate(e.candidate)
        .catch(handleAddCandidateError);
  }

  function siganalingPeers() {
    localConnection
      .createOffer()
      .then((offer) => localConnection.setLocalDescription(offer))
      .then(() =>
        remoteConnection.setRemoteDescription(localConnection.localDescription)
      )
      .then(() => remoteConnection.createAnswer())
      .then((answer) => remoteConnection.setLocalDescription(answer))
      .then(() =>
        localConnection.setRemoteDescription(remoteConnection.localDescription)
      )
      .catch(handleCreateDescriptionError);
  }

  function handleCreateDescriptionError(){
    console.log("Unable to create an offer: " + error.toString());
  }

  function handleLocalAddCandidateSuccess() {
    connectButton.disabled = true;
  }

  function handleRemoteAddCandidateSuccess() {
    disconnectButton.disabled = false;
  }

  function receiveChannelCallback(event) {
    receiveChannel = event.channel;
    //onmessage - event used to listener the incoming messages
    receiveChannel.onmessage = handleReceiveMessage;
    receiveChannel.onopen = handleReceiveChannelStatusChange;
    receiveChannel.onclose = handleReceiveChannelStatusChange;
  }

  function handleSendChannelStatusChange(event) {
    if (sendChannel) {
      var state = sendChannel.readyState;

      if (state === "open") {
        messageInputBox.disabled = false;
        messageInputBox.focus();
        sendButton.disabled = false;
        disconnectButton.disabled = false;
        connectButton.disabled = true;
      } else {
        messageInputBox.disabled = true;
        sendButton.disabled = true;
        connectButton.disabled = false;
        disconnectButton.disabled = true;
      }
    }
  }

  function handleReceiveChannelStatusChange(event) {
    if (receiveChannel) {
      console.log(
        "Receive channel's status has changed to " + receiveChannel.readyState
      );
    }
  }

  function sendMessage() {
    var message = messageInputBox.value;
    sendChannel.send(message);

    messageInputBox.value = "";
    messageInputBox.focus();
  }

  function handleReceiveMessage(event) {
    var el = document.createElement("p");
    debugger
    //THe incoming messages that comes from DataChannel
    var txtNode = document.createTextNode(event.data);

    el.appendChild(txtNode);
    receiveBox.appendChild(el);
  }

  function disconnectPeers() {
    // Close the RTCDataChannels if they're open.

    sendChannel.close();
    receiveChannel.close();

    // Close the RTCPeerConnections

    localConnection.close();
    remoteConnection.close();

    sendChannel = null;
    receiveChannel = null;
    localConnection = null;
    remoteConnection = null;

    // Update user interface elements

    connectButton.disabled = false;
    disconnectButton.disabled = true;
    sendButton.disabled = true;

    messageInputBox.value = "";
    messageInputBox.disabled = true;
  }

  // Handle an error that occurs during addition of ICE candidate.

  function handleAddCandidateError() {
    console.log("Oh noes! addICECandidate failed!");
  }

  function connectPeers() {
    setupLocalDataChannel();
    setupRemoteDataChannel();
    iceCandidateHandler();
    siganalingPeers();
  }
};
//   window.addEventListener("load", initializer, false);
// })();
