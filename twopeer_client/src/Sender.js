import React, { useState, useRef } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";

const Sender = () => {
  const [username, setUsername] = useState("");
  // const client = new W3CWebSocket("ws://twopeer.onrender.com");
  const client = new W3CWebSocket("ws://localhost:5000");
  const localFrame = useRef();
  const remoteFrame = useRef();
  const [stream, setStream] = useState();
//   const [peerConn, setPeerConnection] = useState();
  let peerConn

  client.onmessage = (event) => {
    handleSingallingData(JSON.parse(event.data));
  };

  const handleSingallingData = (data) => {
    switch (data.type) {
      case "answer":
        console.log("RECEIVED ANSWER")
        console.log(data)
        peerConn.setRemoteDescription(data.answer);
        break;
      case "candidate":
        peerConn.addIceCandidate(data.candidate);
    }
  };

  const startCall = async () => {
    sendData({
      type: "store_user",
    });

    navigator.mediaDevices.getUserMedia({ video: true , audio:true}).then((mediaStream) => {
      setStream(mediaStream);
      console.log(mediaStream);
      localFrame.current.srcObject = mediaStream;

      let configuration = {
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
            ],
          },
        ],
      };

      const peerConnection = new RTCPeerConnection(configuration);
    //   setPeerConnection(peerConnection);
    peerConn = peerConnection
      console.log(peerConnection);

      peerConnection.addStream(mediaStream);

      peerConnection.onaddstream = (e) => {
        console.log("FOUND", e);
        remoteFrame.current.srcObject = e.stream;
      };

      peerConnection.onicecandidate = (e) => {
        if (e.candidate == null) return;
        sendData({
          type: "store_candidate",
          candidate: e.candidate,
        });
      };
      

      //sending offer
      peerConnection.createOffer(
          (offer) => {
              console.log("OFFER CREATED")
              sendData({
            type: "store_offer",
            offer,
          });
          peerConnection.setLocalDescription(offer);
        },
        (error) => {
          console.log(error);
        }
      );


    });
  };

//   const sendOffer = async () => {
//     console.log("PEERCON",peerConn)
//     peerConn.createOffer(
//       (offer) => {
//         sendData({
//           type: "store_offer",
//           offer,
//         });
//         peerConn.setLocalDescripton(offer);
//       },
//       (error) => {
//         console.log(error);
//       }
//     );
//   };

  const [audio, setAudio] = useState(true);
  const toggleAudio = () => {
    setAudio(!audio);
    stream.getAudioTracks()[0].enabled = audio;
  };
  const [video, setVideo] = useState(true);
  const toggleVideo = () => {
    setVideo(!video);
    stream.getVideoTracks()[0].enabled = video;
  };

  const sendData = (data) => {
    data.username = username;
    client.send(JSON.stringify(data));
  };

  return (
    <>
      <div className="">
        <div className="h-96 bg-black  flex">
          <div
            className={`text-white w-1/2 h-80 ${
              !stream ? "bg-white" : ""
            } m-4 rounded`}
          >
            <video
              className="w-full h-full rounded"
              ref={localFrame}
              autoPlay
            ></video>
          </div>
          <div className={`text-white w-1/2 h-80 ${
              !stream ? "bg-white" : ""
            } m-4 rounded`}>
            <video
              ref={remoteFrame}
              className="w-full h-full rounded"
              autoPlay
            ></video>
          </div>
        </div>
        <div className="m-6">
          <input
            type="text"
            placeholder="Enter Username"
            onChange={(e) => setUsername(e.target.value)}
            className="border-1 p-2"
          />
          <button
            className="mx-4 p-2 bg-black rounded text-white font-bold w-28"
            onClick={() => startCall()}
          >
            Start Call
          </button>

          <button            
          className={`mx-4 p-2 ${video?'bg-blue-500':'bg-black'} rounded text-white font-bold w-28`}
            onClick={() => toggleVideo()}
          >
            {" "}
            Video
          </button>
          <button
            className={`mx-4 p-2 ${audio?'bg-blue-500':'bg-black'} rounded text-white font-bold w-28`}
            onClick={() => toggleAudio()}
          >
            {" "}
            Audio
          </button>
        </div>
      </div>
    </>
  );
};

export default Sender;
