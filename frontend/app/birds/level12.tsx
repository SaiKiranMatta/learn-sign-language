import {
    Alert,
    Button,
    Image,
    ImageBackground,
    PermissionsAndroid,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Svg, Path } from "react-native-svg";
import React, { useEffect, useState } from "react";
import { Text, View } from "@/components/Themed";
import { db, useAuth } from "@/context/AuthProvider";
import { AntDesign, Entypo, FontAwesome5, Octicons } from "@expo/vector-icons";
import AlphaWordComponent from "@/components/AlphabetComponent";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ScreenOrientation from "expo-screen-orientation";
import {
    RTCPeerConnection,
    RTCView,
    mediaDevices,
    RTCIceCandidate,
    RTCSessionDescription,
    MediaStream,
} from "react-native-webrtc";
ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

export default function BirdDetectcreen() {
    const curLevel = 12;
    const { user, signOut } = useAuth(); // Get user from the AuthProvider
    const [cloudText, setCloudText] = useState<string>(
        "Sign the missing Letter!"
    );
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [border, setBorder] = useState<string>("");
    const [progressWidth, setProgressWidth] = useState<number>(0);
    const [birdLevel, setBirdLevel] = useState<number | null>();
    // Function to handle press on feature pressables
    const [userData, setUserData] = useState<any>(null);
    const [levelsFinishedToday, setLevelsFinishedToday] = useState(0);
    const [paths, setPaths] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [isClearButtonClicked, setClearButtonClicked] =
        useState<boolean>(false);
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
    const firstAnswer = "H";
    const secondAnswer = "O";
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
                                clearInterval(interval);
                                setCloudText("Good Job");
                                // setProgressWidth("48");
                                setIsComplete(true);
                                stopCall();
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
                                // setProgressWidth("48");
                                setIsComplete(true);
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

    // Function to handle press on feature pressables

    // useEffect(() => {
    //     if (!user) {
    //         router.replace("/");
    //     }
    // }, [user]);

    useEffect(() => {
        // Load the count and last update date from AsyncStorage when the component mounts
        loadLevelsFinishedToday();
    }, []);

    // useEffect(() => {
    //     console.log(levelsFinishedToday);
    // }, [levelsFinishedToday]);

    const loadLevelsFinishedToday = async () => {
        try {
            const savedData = await AsyncStorage.multiGet([
                "levelsFinishedToday",
                "lastUpdateDate",
            ]);
            if (savedData !== null) {
                const count =
                    savedData[0][1] !== null
                        ? parseInt(savedData[0][1], 10) || 0
                        : 0;
                const lastUpdateDate = savedData[1][1];
                const currentDate = new Date().toISOString().split("T")[0]; // Get current date

                if (lastUpdateDate === currentDate) {
                    // If the last update date is today, load the count
                    setLevelsFinishedToday(count);
                } else {
                    // If the last update date is not today, reset the count
                    setLevelsFinishedToday(0);
                    await AsyncStorage.setItem("levelsFinishedToday", "0");
                    await AsyncStorage.setItem("lastUpdateDate", currentDate);
                }
            }
        } catch (error) {
            console.error("Error loading levels finished:", error);
        }
    };

    const incrementLevelsFinished = async () => {
        try {
            const updatedCount = levelsFinishedToday + 1;
            await AsyncStorage.setItem(
                "levelsFinishedToday",
                updatedCount.toString()
            );
            setLevelsFinishedToday(updatedCount);
            // Alert.alert("Level finished!");
        } catch (error) {
            console.error("Error incrementing levels finished:", error);
        }
    };
    useEffect(() => {
        if (!user) {
            router.replace("/");
        }
    }, [user]);

    useEffect(() => {
        const addUserDocument = async () => {
            if (!user) {
                router.replace("/");
            } else {
                if (!birdLevel) {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (!docSnap.exists()) {
                        try {
                            const usersRef = collection(db, "users");
                            const docRef = await setDoc(
                                doc(usersRef, user.uid),
                                {
                                    birds: {
                                        cl: 1,
                                        cLArray: Array(11).fill(0),
                                        fC: 0,
                                        sC: 0,
                                    },
                                    animals: {
                                        cl: 1,
                                        cLArray: Array(11).fill(0),
                                        fC: 0,
                                        sC: 0,
                                    },
                                    bodyparts: {
                                        cl: 1,
                                        cLArray: Array(11).fill(0),
                                        fC: 0,
                                        sC: 0,
                                    },
                                    everyDayObjects: {
                                        cl: 1,
                                        cLArray: Array(11).fill(0),
                                        fC: 0,
                                        sC: 0,
                                    },
                                    shapes: {
                                        cl: 1,
                                        cLArray: Array(11).fill(0),
                                        fC: 0,
                                        sC: 0,
                                    },
                                    sports: {
                                        cl: 1,
                                        cLArray: Array(11).fill(0),
                                        fC: 0,
                                        sC: 0,
                                    },
                                }
                            );

                            console.log("Document written  ");
                        } catch (e) {
                            console.error("Error adding document: ", e);
                        }
                    } else {
                        // console.log("Document data:", docSnap.data());
                        setUserData(docSnap.data());
                    }
                }
            }
        };

        addUserDocument();
    }, [user, birdLevel, setBirdLevel]);

    useEffect(() => {
        if (userData) {
            setProgressWidth(
                userData.birds.cLArray.reduce(
                    (acc: number, cur: number) => acc + cur,
                    0
                )
            );
        }
    }, [userData, setProgressWidth]);

    const handleNextPressIn = async () => {
        // console.log(userData);
        if (levelsFinishedToday < 10 && user) {
            if (userData.birds.cLArray[curLevel - 1] === 0 && isComplete) {
                const newBirdLevel = curLevel + 1;
                const newBirdLevelArray = [...userData.birds.cLArray];
                newBirdLevelArray[curLevel - 1] = 1;
                const sC = userData.birds.sC + 1;
                const newUserData = {
                    ...userData,
                    birds: {
                        ...userData.birds,
                        cLArray: newBirdLevelArray,
                        cL: newBirdLevel,
                        sC: sC,
                    },
                };

                const docRef = doc(db, "users", user.uid);
                await setDoc(docRef, newUserData);
                setUserData(newUserData);
                incrementLevelsFinished();
                router.replace("/birds/");
            } else {
                const newBirdLevel = curLevel + 1;
                const newUserData = {
                    ...userData,
                    birds: {
                        ...userData.birds,
                        cL: newBirdLevel,
                    },
                };

                const docRef = doc(db, "users", user.uid);
                await setDoc(docRef, newUserData);
                setUserData(newUserData);
                router.replace("/birds/");
            }
        }
    };

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
                    <Text className="pt-10 pb-12 text-xl text-center text-green-600 px-7">
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
            <View className="absolute z-50 flex flex-row items-center bg-transparent top-10 left-4">
                <TouchableOpacity
                    onPress={() => router.replace("/birds/level11")}
                    className=""
                >
                    <AntDesign name="caretleft" size={30} color="#FB923C" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.replace("/")}
                    className=""
                >
                    <MaterialCommunityIcons
                        name="home-circle-outline"
                        size={45}
                        color="#FB923C"
                    />
                </TouchableOpacity>
                <View className="flex flex-row items-center p-2 ml-2 rounded-md">
                    <Image
                        source={require("@/assets/images/brain.png")}
                        className="w-6 h-6 mr-2"
                    />
                    <View className="flex flex-row w-48 h-8 overflow-hidden bg-green-300 rounded-md">
                        <View
                            className={` w-4 h-8 bg-green-600 rounded-l-md `}
                        ></View>
                        {Array.from(
                            { length: progressWidth - 1 },
                            (_, index) => (
                                <View
                                    key={index}
                                    className="w-4 h-8 bg-green-600 "
                                ></View>
                            )
                        )}
                    </View>
                </View>
            </View>

            <TouchableOpacity
                onPress={handleNextPressIn}
                className="absolute z-50 bg-transparent right-4 top-1/2 "
            >
                <AntDesign name="caretright" size={60} color="#59E659" />
            </TouchableOpacity>

            <View className="absolute flex flex-row pl-64 items-center mt-10 bg-[#FDD58D] justify-start w-full h-full">
                <View
                    className={` ml-2 mt-4 p-2  rounded-lg  bg-[#DBB780] ${
                        activeIndex === 4 ? "scale-105" : ""
                    }`}
                >
                    <View className="flex items-center justify-start h-56 rounded-lg mt w-60 bg-slate-100">
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
                    className={` ml-4  mt-2 rounded-lg flex flex-col justify-between items-center bg-[#FDD58D]`}
                >
                    <Image
                        source={require("@/assets/images/Birds/chicken.jpeg")}
                        className="w-48 h-48 rounded-lg "
                    />
                    <View className="flex flex-row items-center justify-start bg-transparent">
                        <View className=" p-2 pb-1  w-8 mr-2 mt-6 rounded-lg bg-[#FEF8EE] border-b-8 border-[#DBB780]">
                            <Text
                                className={`text-2xl text-center font-bold  ${
                                    ans[0] === "H"
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {ans[0]}
                            </Text>
                        </View>
                        <View className=" p-2 w-8 pb-1 mr-2 mt-6 rounded-lg bg-[#FEF8EE] border-b-8 border-[#DBB780]">
                            <Text className="text-2xl text-center font-bold text-[#FECE78]">
                                E
                            </Text>
                        </View>

                        <View className=" p-2 pb-1 mr-2 mt-6 rounded-lg bg-[#FEF8EE] border-b-8 border-[#DBB780]">
                            <Text className="text-2xl font-bold text-[#FECE78]">
                                N
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
