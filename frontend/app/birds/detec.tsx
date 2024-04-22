import {
    Image,
    PermissionsAndroid,
    Platform,
    Pressable,
    ScrollView,
    View,
    TouchableOpacity,
    SafeAreaView,
    ImageBackground,
} from "react-native";
import {
    RTCPeerConnection,
    RTCView,
    mediaDevices,
    RTCIceCandidate,
    RTCSessionDescription,
    MediaStream,
} from "react-native-webrtc";
import { router } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import { Text } from "@/components/Themed";
import { useAuth } from "@/context/AuthProvider";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { Svg, Path } from "react-native-svg";
import { Entypo } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

export default function SignDetectScreen() {
    const { user, signOut } = useAuth(); // Get user from the AuthProvider
    const [cloudText, setCloudText] = useState<string>(
        "Sign the missing Letters!"
    );
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [progressWidth, setProgressWidth] = useState<string>("36");

    const [localStream, setLocalStream] = useState<MediaStream>();
    const [remoteStream, setRemoteStream] = useState<any>(null);
    const [cachedLocalPC, setCachedLocalPC] = useState<any>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isOffCam, setIsOffCam] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [ws, setWs] = useState<WebSocket | null>(null); // WebSocket connection state
    const [recSdp, setRecSdp] = useState("");
    const [ansSdp, setAnsSdp] = useState();
    const [isRemoteDescSet, setIsRemoteDescSet] = useState<boolean>(false);
    const [ans, setAns] = useState<String[]>(["", ""]);
    const firstAnswer = "B";
    const secondAnswer = "S";
    const [firstAnsFound, setFirstAnsFound] = useState<boolean>(false);
    const [translatedText, setTranslatedText] = useState<string>("loading...");
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
    const configuration = {
        iceServers: [
            {
                urls: [
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                ],
            },
        ],
        iceCandidatePoolSize: 10,
    };

    useEffect(() => {
        requestPermissions();
    }, []);

    useEffect(() => {
        if (!user) {
            router.replace("/");
        }
    }, [user]);

    const requestPermissions = async () => {
        let cameraPermission;
        let audioPermission;
        if (Platform.OS === "android") {
            cameraPermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA
            );
            audioPermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
            );
        } else {
            // Implement permissions logic for iOS if needed
            // For iOS, camera and microphone access is typically handled through Info.plist
            // You might not need to explicitly request permissions here
        }

        if (
            cameraPermission === PermissionsAndroid.RESULTS.GRANTED &&
            audioPermission === PermissionsAndroid.RESULTS.GRANTED
        ) {
            startLocalStream();
        } else {
            console.log("Camera or microphone permission denied");
        }
    };

    const startLocalStream = async () => {
        const isFront = true;

        const devices: any = await mediaDevices.enumerateDevices();
        const videoSourceId = devices.find(
            (device: MediaDeviceInfo) => device.kind === "videoinput"
        );
        const facingMode = isFront ? "user" : "environment";
        const constraints = {
            audio: false,
            video: {
                mandatory: {
                    minWidth: 500,
                    minHeight: 300,
                    frameRate: 16,
                },
                facingMode,
                optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
            },
        };
        try {
            const stream = await mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);
        } catch (error) {
            console.error("Error accessing media devices: ", error);
        }
    };

    const startCall = async () => {
        if (!localStream) return;
        connectWebSocket();
        const localPC = new RTCPeerConnection(configuration);
        localStream.getTracks().forEach((track) => {
            localPC.addTrack(track, localStream);
            // console.log("Added track: ", track);
        });

        localPC.addEventListener("icecandidate", async (event) => {
            if (event.candidate) {
                // Send ICE candidate to backend over WebSocket
                ws?.send(
                    JSON.stringify({
                        type: "candidate",
                        candidate: event.candidate,
                    })
                );
            }
        });

        localPC.addEventListener("track", (event) => {
            const newStream = new MediaStream();
            event.streams[0].getTracks().forEach((track) => {
                newStream.addTrack(track);
            });
            setRemoteStream(newStream);
        });

        try {
            const offerOptions = {
                offerToReceiveAudio: false,
                offerToReceiveVideo: false,
            };

            const offer = await localPC.createOffer(offerOptions);
            await localPC.setLocalDescription(offer);

            // Send offer SDP to backend over WebSocket
            ws?.send(
                JSON.stringify({
                    type: "offer",
                    offer: localPC.localDescription,
                })
            );
            setCachedLocalPC(localPC);

            // console.log("Offer: ", localPC.localDescription);
        } catch (error) {
            console.error("Error starting call: ", error);
        }
    };

    const stopCall = () => {
        if (cachedLocalPC) {
            cachedLocalPC.getSenders().forEach((sender: RTCRtpSender) => {
                console.log("Removed track: ", sender.track);
                cachedLocalPC.removeTrack(sender);
            });
            cachedLocalPC.close();
            setCachedLocalPC(null);
            setRemoteStream(null);
            setIsRemoteDescSet(false);
            setIsLive(false);
            ws?.send(JSON.stringify({ type: "end_track" }));
        }
    };

    const switchCamera = () => {
        localStream?.getVideoTracks().forEach((track) => track._switchCamera());
    };

    // Mutes the local's outgoing audio
    const toggleMute = () => {
        if (!remoteStream) {
            return;
        }
        localStream?.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled;
            setIsMuted(!track.enabled);
        });
    };

    const toggleLive = () => {
        if (!isLive) {
            startCall();
            setIsLive(true);
        } else {
            setIsLive(false);
            stopCall();
        }
    };

    const toggleCamera = () => {
        localStream?.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;
            setIsOffCam(!isOffCam);
        });
    };

    useEffect(() => {
        if (!cachedLocalPC || !ansSdp || isRemoteDescSet) return;
        cachedLocalPC
            ?.setRemoteDescription(new RTCSessionDescription(ansSdp))
            .then(() => {
                console.log("SDP offer set as remote description");
                setIsRemoteDescSet(true);
            })
            .catch((error: any) => {
                console.error("Error setting remote description:", error);
            });
    }, [cachedLocalPC, ansSdp]);

    const connectWebSocket = () => {
        const newWs = new WebSocket("ws://192.168.29.52:8000/ws/client1");
        newWs.onopen = () => {
            console.log("WebSocket connected");
            setWs(newWs);
        };
        newWs.onmessage = (event: any) => {
            // Receive SDP or ICE candidate from backend over WebSocket

            const message = JSON.parse(event.data);
            console.log(message.answer);

            if (message.type === "answer") {
                // Set remote answer SDP
                setAnsSdp(message.answer);
            } else if (message.type === "candidate") {
                // Add received ICE candidate
                cachedLocalPC?.addIceCandidate(
                    new RTCIceCandidate(message.candidate)
                );
            }
        };

        newWs.onclose = () => {
            console.log("WebSocket disconnected");
            setWs(null);
        };
    };

    useEffect(() => {
        connectWebSocket();
    }, []);

    useEffect(() => {
        const url = `${API_BASE_URL}/live_labels`;

        if (isRemoteDescSet) {
            const fetchData = () => {
                fetch(url)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Network response was not ok");
                        }
                        return response.json();
                    })
                    .then((data) => {
                        const labels = data.labels;
                        console.log(firstAnsFound);
                        // Check if the first answer is found
                        if (!firstAnsFound) {
                            if (labels.includes(firstAnswer)) {
                                console.log(
                                    "First answer matched:",
                                    firstAnswer
                                );
                                setFirstAnsFound(true);
                                setAns([firstAnswer, ""]);
                            }
                        } else {
                            // Check if the second answer is found
                            if (labels.includes(secondAnswer)) {
                                console.log(
                                    "Second answer matched:",
                                    secondAnswer
                                );
                                setAns([firstAnswer, secondAnswer]);
                                // Clear the interval to exit the loop
                                clearInterval(interval);
                                setCloudText("Good Job");
                                setProgressWidth("48");
                                stopCall();
                            }
                        }
                    })
                    .catch((error) => console.error("Error:", error));
            };

            const interval = setInterval(fetchData, 1000);

            return () => clearInterval(interval);
        }
    }, [isRemoteDescSet, firstAnswer, secondAnswer, firstAnsFound]);

    return (
        <SafeAreaView className=" bg-[#FDD58D] pt-6 h-full ">
            <Image
                source={require("@/assets/images/old-woman.png")}
                className="absolute bottom-0 left-0 z-50 w-36 h-36"
            />
            {cloudText !== "" && (
                <ImageBackground
                    source={require("@/assets/images/talkingcloud.png")}
                    className="absolute left-0 z-50 w-56 bottom-28 h-36"
                >
                    <Text className="pt-10 pb-12 text-xl font-semibold text-center text-green-600 px-7">
                        {cloudText}
                    </Text>
                </ImageBackground>
            )}
            {!user ? (
                <TouchableOpacity
                    onPress={() => {
                        router.push("/login");
                    }}
                    className="absolute z-40 w-24 px-4 py-2 bg-orange-400 shadow-lg top-7 right-6 rounded-3xl"
                >
                    <Text className="text-lg text-center text-white">
                        Login
                    </Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    onPress={() => {
                        signOut();
                    }}
                    className="absolute z-40 w-24 px-4 py-2 bg-orange-400 shadow-lg top-7 right-6 rounded-3xl"
                >
                    <Text className="text-lg text-center text-white">
                        Logout
                    </Text>
                </TouchableOpacity>
            )}

            <View className="absolute z-50 flex flex-row items-center p-2 bg-white rounded-md top-10 left-4">
                <Image
                    source={require("@/assets/images/brain.png")}
                    className="w-6 h-6 mr-2"
                />
                <View className="flex justify-start w-48 h-8 bg-green-300 rounded-md">
                    <View
                        className={`w-${progressWidth} h-8 bg-green-600 rounded-md`}
                    ></View>
                </View>
            </View>
            <View className="absolute z-50 bg-transparent right-2 top-1/2 ">
                <AntDesign name="caretright" size={60} color="#59E659" />
            </View>

            <View className="absolute flex flex-row pl-64 items-start mt-10 bg-[#FDD58D] justify-start w-full h-full">
                <View
                    className={` ml-2 p-2  rounded-lg  bg-[#DBB780] ${
                        activeIndex === 4 ? "scale-105" : ""
                    }`}
                >
                    <View className="flex items-center justify-start rounded-lg w-60 bg-slate-100 h-72">
                        {localStream && (
                            <View className="w-full h-full overflow-hidden border-b rounded-lg shadow-lg ">
                                {!isOffCam ? (
                                    <RTCView
                                        streamURL={localStream.toURL()}
                                        objectFit="cover"
                                        className="w-full h-full "
                                    />
                                ) : (
                                    <View className="flex flex-col items-center justify-center w-full h-full bg-[#DBB780] ">
                                        <Image
                                            source={require("@/assets/images/disabled-cam.png")}
                                        />
                                    </View>
                                )}
                                <View className="absolute bottom-0 z-50 w-full bg-[#00000090] flex flex-row items-center justify-evenly h-16">
                                    <Pressable onPress={switchCamera}>
                                        <MaterialCommunityIcons
                                            name="camera-retake"
                                            size={32}
                                            color="white"
                                        />
                                    </Pressable>
                                    <Pressable onPress={toggleLive}>
                                        {!isLive ? (
                                            <FontAwesome5
                                                name="play-circle"
                                                size={32}
                                                color="white"
                                            />
                                        ) : (
                                            <FontAwesome5
                                                name="pause-circle"
                                                size={32}
                                                color="white"
                                            />
                                        )}
                                    </Pressable>
                                    <Pressable onPress={toggleCamera}>
                                        {isOffCam ? (
                                            <MaterialCommunityIcons
                                                name="camera"
                                                size={32}
                                                color="white"
                                            />
                                        ) : (
                                            <MaterialCommunityIcons
                                                name="camera-off"
                                                size={32}
                                                color="white"
                                            />
                                        )}
                                    </Pressable>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
                <View
                    className={` ml-4  mt-2 rounded-lg flex flex-col justify-between  bg-[#FDD58D]`}
                >
                    <Image
                        source={require("@/assets/images/Birds/birds-in-sky.jpg")}
                        className="w-48 h-48 rounded-lg "
                    />
                    <View className="flex flex-row items-center justify-start ">
                        <View className=" p-2 pb-1  w-8 mr-2 mt-6 rounded-lg bg-[#FEF8EE] border-b-8 border-[#DBB780]">
                            <Text
                                className={`text-2xl text-center font-bold  ${
                                    ans[0] === "B"
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {ans[0]}
                            </Text>
                        </View>
                        <View className=" p-2 w-8 pb-1 mr-2 mt-6 rounded-lg bg-[#FEF8EE] border-b-8 border-[#DBB780]">
                            <Text className="text-2xl text-center font-bold text-[#FECE78]">
                                I
                            </Text>
                        </View>
                        <View className=" p-2 pb-1 mr-2 mt-6 rounded-lg bg-[#FEF8EE] border-b-8 border-[#DBB780]">
                            <Text className="text-2xl font-bold text-[#FECE78]">
                                R
                            </Text>
                        </View>
                        <View className=" p-2 pb-1 mr-2 mt-6 rounded-lg bg-[#FEF8EE] border-b-8 border-[#DBB780]">
                            <Text className="text-2xl font-bold text-[#FECE78]">
                                D
                            </Text>
                        </View>
                        <View className=" p-2 w-8  pb-1 mr-2 mt-6 rounded-lg bg-[#FEF8EE] border-b-8 border-[#DBB780]">
                            <Text
                                className={`text-2xl text-center font-bold  ${
                                    ans[1] === "S"
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {ans[1]}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
