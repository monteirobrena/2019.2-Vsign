import React, { Component } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
// import { bindActionCreators } from 'redux';
// import { connect } from 'react-redux';
import styled from 'styled-components'
import { Container, 
         RowOnTop, 
         IntructionTextBtn, 
         InstructionBtn, 
         VideoDiv, 
         ScriptBlock, 
         ScriptBlockDiv , 
         ScriptBlockNextBtn, 
         ScriptBlockNextBtnText, 
         NextBtnDiv,
         SquareDiv
        } from "./styled_components.js"
import { ReactMic } from 'react-mic';
import 'video.js/dist/video-js.css';
import videojs from 'video.js';
import 'webrtc-adapter';
import RecordRTC from 'recordrtc';
import 'videojs-record/dist/css/videojs.record.css';
import Record from 'videojs-record/dist/videojs.record.js';
import '@mattiasbuelens/web-streams-polyfill/dist/polyfill.min.js';
import 'videojs-record/dist/plugins/videojs.record.webm-wasm.js';
import 'videojs-record/dist/plugins/videojs.record.ts-ebml.js';
import WaveSurfer from 'wavesurfer.js';
import MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.js';
// WaveSurfer.microphone = MicrophonePlugin;

const videoJsOptions = {
    controls: true,
    screen: true,
    image: true,
    width: 852,
    height: 521,
    fluid: false,
    plugins: {
        /*
        // wavesurfer section is only needed when recording audio-only
        wavesurfer: {
            src: 'live',
            waveColor: '#36393b',
            progressColor: 'black',
            debug: true,
            cursorWidth: 1,
            msDisplayMax: 20,
            hideScrollbar: true
        },
        */
        record: {
            audio: false,
            video: true,
            maxLength: 10,
            debug: true,
            // convertEngine: 'ts-ebml',
            convertEngine: 'ts-ebml',
            // convert recorded data to MP3
            convertOptions: ['-f', 'mp3', '-codec:a', 'libmp3lame', '-qscale:a', '2'],
            // specify MP3 output mime-type
            pluginLibraryOptions: {
                outputType: 'audio/mp3'
            },
            // use MP4 encoding worker (H.264 & AAC & MP3 encoders)
            // convertWorkerURL: '../../node_modules/ffmpeg.js/ffmpeg-worker-mp4.js'
            // or use WebM encoding worker (VP8 & Opus encoders)
            convertWorkerURL: '../../node_modules/ffmpeg.js/ffmpeg-worker-webm.js'
        }
        }
    }


class recordUserVideo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            scriptBlock: ["Bloco de roteiro 0", "Bloco de roteiro 1", "Bloco de roteiro 2", "Bloco de roteiro 3", "Bloco de roteiro 4"],
            scriptPosition: 1,
            signatureVideo: null,
            signatureAudio: null,
            convertedData: null,
            recordAudio: false,
        }

        this._nextScriptBlock = this._nextScriptBlock.bind(this);
    }

    
    componentDidMount() {
        // instantiate Video.js
        this.player = videojs(this.videoNode, videoJsOptions, () => {
            // print version information at startup
            var version_info = 'Using video.js ' + videojs.VERSION +
                ' with videojs-record ' + videojs.getPluginVersion('record') +
                ' and recordrtc ' + RecordRTC.version;
            videojs.log(version_info);
        });

        // device is ready
        this.player.on('deviceReady', () => {
            console.log('device is ready!');
        });

        // user clicked the record button and started recording
        this.player.on('startRecord', () => {
            console.log('started recording!');
            this.startRecording()
        });

        // user completed recording and stream is available
        this.player.on('finishRecord', () => {
            // recordedData is a blob object containing the recorded data that
            // can be downloaded by the user, stored on server etc.
            console.log(typeof(this.player.recordedData));
            console.log(this.player.recordedData);
            this.setState({signatureVideo: this.player.recordedData})
            // this.player.record().saveAs({'video': 'my-video-file-name.webm'});
            // console.log('finished converting: ', this.player.convertedData);
            // this.setState({covertedData: this.player.convertedData})
            // this._audioManipulation()
            this.stopRecording()
        });

        // error handling
        this.player.on('error', (element, error) => {
            alert("Erro")
        });

        this.player.on('deviceError', () => {
            console.error('device error:', this.player.deviceErrorCode);
        });

        // console.log(this.player.recordedData)
        this.player.record().getDevice();
        //console.log(this.state.signatureVideo)
    }

    // destroy player on unmount
    componentWillUnmount() {
        console.log(this.state.signatureVideo)
        if (this.player) {
            this.player.dispose();
        }
    }

    startRecording = () => {
        this.setState({
          record: true
        });
      }
     
      stopRecording = () => {
        this.setState({
          record: false
        });
      }
     
      onData(recordedBlob) {
        console.log('chunk of real-time data is: ', recordedBlob);
      }
      
      onStop = (recordedBlob) => {
        console.log('recordedBlob is of the audio: ', recordedBlob);
        // console.log("Signature audio is:", this.state.signatureVideo)
        this.setState({signatureAudio: recordedBlob})
      }

    _audioManipulation = () => {
        const myMediaElement = this.state.signatureVideo
        var audioCtx = new AudioContext();
        var source = audioCtx.createMediaElementSource(myMediaElement);
        this.setState({signatureAudio: source})
        console.log(myMediaElement)
        console.log(audioCtx)
        console.log(source)
    }

    _goToIntructions = () => {
       console.log("Going to intructions screen")
    }

    _record = () => {
        this.player.record().start()
        console.log("era pra dar play")
    }

    _fetchScriptBlock = () => {
        console.log("Get the script block user data")
    }

    _goToReviewVideo = () => {
        this.player.record().stop()
        console.log(this.state.signatureVideo)
        console.log("Going to review video")
    }

    _nextScriptBlock = async () => {
        const scriptBlock = this.state.scriptBlock 
         for (let i = -1; i <= scriptBlock.length; i++) {
             if (this.state.scriptPosition === i) {
                this.setState({ scriptPosition: this.state.scriptPosition+1 })
             }else if(this.state.scriptPosition === scriptBlock.length){
                this._goToReviewVideo()
             }
         }
         console.log(this.state.scriptBlock[this.state.scriptPosition])
    }
    render() {
        

        const RecordingAlert = styled.div`
            display: flex;
            background-color: red;
            height: 55px;
            width: 337px;
            border-style: solid;
            border-color: black;
            border-width: 1px;
            border-radius: 28px;
            align-items: center
            justify-content: center
        `;
        let textNext;
        if (this.state.scriptPosition === (this.state.scriptBlock.length )) {
            textNext = <ScriptBlockNextBtnText>Revisar</ScriptBlockNextBtnText>;
        }else {
            textNext = <ScriptBlockNextBtnText> Passo {this.state.scriptPosition}</ScriptBlockNextBtnText>;
        }

        let scriptText;
        if (this.state.scriptPosition > 0) {
            var index = this.state.scriptPosition -1
            scriptText = <ScriptBlock> {this.state.scriptBlock[index]}</ScriptBlock>
        }

        return (
            <div>
                <Container>
                    <RowOnTop>
                        <InstructionBtn onClick={() => { this._goToIntructions() }}>
                                <IntructionTextBtn>
                                    Ver instruções
                        </IntructionTextBtn>
                        </InstructionBtn>
                        {/* <RecordingAlert>
                            <IntructionTextBtn> Gravando </IntructionTextBtn>
                        </RecordingAlert> */}

                    </RowOnTop>
                    <VideoDiv>
                        <div data-vjs-player>
                            <video style={{backgroundColor: "#556073"}} ref={node => this.videoNode = node} className="video-js vjs-default-skin" playsInline>
                        
                            </video>
                            <ReactMic
                                record={this.state.record}
                                className="sound-wave"
                                onStop={this.onStop}
                                onData={this.onData}
                                strokeColor="#000000"
                                backgroundColor="#FF4081" />
                        <SquareDiv/>
                        </div>
                    </VideoDiv>
                    <ScriptBlockDiv>
                        {scriptText}
                    </ScriptBlockDiv>
                    <NextBtnDiv>
                        <ScriptBlockNextBtn onClick={() => this._record()}>
                            <ScriptBlockNextBtnText> Iniciar gravação</ScriptBlockNextBtnText>
                        </ScriptBlockNextBtn>
                        <ScriptBlockNextBtn onClick={() => this._nextScriptBlock()}>
                                {textNext}
                        </ScriptBlockNextBtn>
                    </NextBtnDiv>
                </Container>    
            </div>
        );
    }
}

export default withRouter(recordUserVideo);
