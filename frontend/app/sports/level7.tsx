import {
    Alert,
    Button,
    Image,
    ImageBackground,
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
import { AntDesign, Entypo, Octicons } from "@expo/vector-icons";
import AlphaWordComponent from "@/components/AlphabetComponent";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ScreenOrientation from "expo-screen-orientation";
ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

export default function SportDrawScreen() {
    const curLevel = 7;
    const answer = "B";
    const { user, signOut } = useAuth(); // Get user from the AuthProvider
    const [cloudText, setCloudText] = useState<string>(
        "Draw the alphabet of this sign!"
    );
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [border, setBorder] = useState<string>("");
    const [progressWidth, setProgressWidth] = useState<number>(0);
    const [sportLevel, setSportLevel] = useState<number | null>();
    // Function to handle press on feature pressables
    const [userData, setUserData] = useState<any>(null);
    const [levelsFinishedToday, setLevelsFinishedToday] = useState(0);
    const [paths, setPaths] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [isClearButtonClicked, setClearButtonClicked] =
        useState<boolean>(false);
    const onTouchEnd = () => {
        setPaths([...paths, currentPath.join("")]);
        setCurrentPath([]);
        setClearButtonClicked(false);
    };

    const onTouchMove = (event: any) => {
        const newPath = [...currentPath];
        const locationX = event.nativeEvent.locationX;
        const locationY = event.nativeEvent.locationY;
        const newPoint = `${newPath.length === 0 ? "M" : ""}${locationX.toFixed(
            0
        )},${locationY.toFixed(0)} `;
        newPath.push(newPoint);
        setCurrentPath(newPath);
    };

    const handleClearButtonClick = () => {
        setPaths([]);
        setCurrentPath([]);
        setClearButtonClicked(true);
    };
    // Function to handle press on feature pressables

    // useEffect(() => {
    //     if (!user) {
    //         router.replace("/");
    //     }
    // }, [user]);

    const handleSubmitButtonClick = async () => {
        onTouchEnd();
        try {
            const svgData = `<svg width="192" height="224"><rect x="0" y="0" width="100%" height="100%" fill="white" />
            <path d="${paths.join("")}" stroke="${
                isClearButtonClicked ? "transparent" : "black"
            }" fill="transparent" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" /></svg>`;

            const response = await fetch(
                "http://192.168.29.52:8000/convert-svg-to-png",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ svgData }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                // console.log(data.text[0]);
                if (data.text[0] === answer) {
                    // console.log(data.text[0]);
                    setIsComplete(true);
                    setCloudText("Great Job!");
                }
            } else {
                console.error("Error:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };
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
                if (!sportLevel) {
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
    }, [user, sportLevel, setSportLevel]);

    useEffect(() => {
        if (userData) {
            setProgressWidth(
                userData.sports.cLArray.reduce(
                    (acc: number, cur: number) => acc + cur,
                    0
                )
            );
        }
    }, [userData, setProgressWidth]);

    const handleNextPressIn = async () => {
        // console.log(userData);
        if (levelsFinishedToday < 10 && user) {
            if (userData.sports.cLArray[curLevel - 1] === 0 && isComplete) {
                const newSportLevel = curLevel + 1;
                const newSportLevelArray = [...userData.sports.cLArray];
                newSportLevelArray[curLevel - 1] = 1;
                const sC = userData.sports.sC + 1;
                const newUserData = {
                    ...userData,
                    sports: {
                        ...userData.sports,
                        cLArray: newSportLevelArray,
                        cL: newSportLevel,
                        sC: sC,
                    },
                };

                const docRef = doc(db, "users", user.uid);
                await setDoc(docRef, newUserData);
                setUserData(newUserData);
                incrementLevelsFinished();
                router.replace("/sports/level8");
            } else {
                const newSportLevel = curLevel + 1;
                const newUserData = {
                    ...userData,
                    sports: {
                        ...userData.sports,
                        cL: newSportLevel,
                    },
                };

                const docRef = doc(db, "users", user.uid);
                await setDoc(docRef, newUserData);
                setUserData(newUserData);
                router.replace("/sports/level8");
            }
        } else {
            setCloudText("You have finished all levels for today");
            setTimeout(() => {
                router.replace("/sports/");
            }, 5000);
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
                    onPress={() => router.replace("/sports/level6")}
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

            <View className="absolute flex flex-row pl-64 items-end bg-[#FDD58D] justify-start w-full h-full">
                <View
                    className={` ml-8 p-2 rounded-lg bg-[#DBB780] ${
                        activeIndex === 4 ? "scale-105" : ""
                    }`}
                >
                    <Image
                        source={require("@/assets/images/alphabet/b.jpeg")}
                        className="w-48 h-56 rounded-lg"
                    />
                </View>

                <View
                    className={` ml-8 p-2  rounded-lg  bg-[#DBB780] ${
                        activeIndex === 4 ? "scale-105" : ""
                    }`}
                >
                    <View
                        className="flex items-center justify-center w-48 h-56 rounded-lg bg-slate-100"
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <Svg className="w-full h-full">
                            <Path
                                d={paths.join("")}
                                stroke={
                                    isClearButtonClicked ? "transparent" : "red"
                                }
                                fill="transparent"
                                strokeWidth={10}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                            {paths.length > 0 &&
                                paths.map((item, index) => (
                                    <Path
                                        key={`path-${index}`}
                                        d={currentPath.join("")}
                                        stroke={
                                            isClearButtonClicked
                                                ? "transparent"
                                                : "red"
                                        }
                                        fill="transparent"
                                        strokeWidth={10}
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                    />
                                ))}
                        </Svg>
                    </View>

                    <TouchableOpacity
                        className="absolute z-10 rounded-full bg-transperant bottom-4 left-4 "
                        onPress={handleClearButtonClick}
                    >
                        <Entypo
                            name="circle-with-cross"
                            size={40}
                            color="red"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="absolute rounded-full bg-transperant bottom-4 right-4 "
                        onPress={handleSubmitButtonClick}
                    >
                        <Octicons
                            name="check-circle-fill"
                            size={35}
                            color="#59E659"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
