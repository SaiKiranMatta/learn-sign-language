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
import React, { useEffect, useState } from "react";
import { Text, View } from "@/components/Themed";
import { db, useAuth } from "@/context/AuthProvider";
import { AntDesign } from "@expo/vector-icons";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ScreenOrientation from "expo-screen-orientation";
ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
export default function BirdHomeScreen() {
    const [levelsFinishedToday, setLevelsFinishedToday] = useState(0);
    const { user, signOut } = useAuth(); // Get user from the AuthProvider
    const [cloudText, setCloudText] = useState<string>("Birds");
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [progressWidth, setProgressWidth] = useState<number>(0);
    const [birdLevel, setBirdLevel] = useState<number | null>();
    // Function to handle press on feature pressables
    const [userData, setUserData] = useState<any>(null);
    const handlePressIn = (text: string, index: number) => {
        setCloudText(text);
        setActiveIndex(index);
    };

    const handlePressOut = () => {
        setCloudText("");
        setActiveIndex(null);
    };

    const handleNextPressIn = () => {
        if (levelsFinishedToday < 100 && userData) {
            const birdLevel = userData.birds.cL;
            incrementLevelsFinished();
            switch (birdLevel) {
                case 1:
                    router.replace("/animals/level1");
                    break;
                case 2:
                    router.replace("/animals/level2");
                    break;
                case 3:
                    router.replace("/animals/level3");
                    break;
                case 4:
                    router.replace("/animals/level4");
                    break;
                case 5:
                    router.replace("/animals/level5");
                    break;
                case 6:
                    router.replace("/animals/level6");
                    break;
                case 7:
                    router.replace("/animals/level7");
                    break;
                case 8:
                    router.replace("/animals/level8");
                    break;
                case 9:
                    router.replace("/animals/level9");
                    break;
                case 10:
                    router.replace("/animals/level10");
                    break;
                case 11:
                    router.replace("/animals/level11");
                    break;
                case 12:
                    router.replace("/animals/level12");
                default:
                    router.replace("/animals/level1");
                    break;
            }
        } else {
            setCloudText(`Max Levels ${levelsFinishedToday} for Today Reached`);
        }
    };

    useEffect(() => {
        // Load the count and last update date from AsyncStorage when the component mounts
        loadLevelsFinishedToday();
    }, []);

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
            const updatedCount = levelsFinishedToday + 0;
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
                    <Text className="pt-10 pb-12 text-2xl text-center px-7">
                        {cloudText}
                    </Text>
                </ImageBackground>
            )}
            {!user ? (
                <TouchableOpacity
                    onPress={() => {
                        router.push("/login");
                    }}
                    className="absolute z-40 w-24 px-4 py-2 bg-orange-400 shadow-lg top-10 left-6 rounded-3xl"
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
                    className="absolute z-40 w-24 px-4 py-2 bg-orange-400 shadow-lg top-10 left-6 rounded-3xl"
                >
                    <Text className="text-lg text-center text-white">
                        Logout
                    </Text>
                </TouchableOpacity>
            )}
            <View className="flex flex-row w-full h-full bg-[#DBB780]">
                <Image
                    source={require("@/assets/images/transperant.png")}
                    className="bottom-0 left-0 z-0 h-1 w-96"
                />
                <Image
                    source={require("@/assets/images/transperant.png")}
                    className="bottom-0 left-0 z-0 h-1 w-96"
                />
                <Image
                    source={require("@/assets/images/transperant.png")}
                    className="bottom-0 left-0 z-0 w-32 h-1"
                />
            </View>
            <View className="absolute z-50 flex flex-row items-center p-2 rounded-md top-10 right-4">
                <Image
                    source={require("@/assets/images/brain.png")}
                    className="w-6 h-6 mr-2"
                />
                <View className="flex flex-row w-48 h-8 overflow-hidden bg-green-300 rounded-md">
                    <View
                        className={` w-4 h-8 bg-green-600 rounded-l-md `}
                    ></View>
                    {Array.from({ length: progressWidth - 1 }, (_, index) => (
                        <View
                            key={index}
                            className="w-4 h-8 bg-green-600 "
                        ></View>
                    ))}
                </View>
            </View>
            <TouchableOpacity
                onPress={handleNextPressIn}
                className="absolute z-50 bg-transparent right-4 top-1/2 "
            >
                <AntDesign name="caretright" size={60} color="#59E659" />
            </TouchableOpacity>

            <View className="absolute flex items-center bg-[#FDD58D] justify-center w-full h-full">
                <View
                    className={`rounded-full  p-8 bg-[#DBB780] ${
                        activeIndex === 4 ? "scale-105" : ""
                    }`}
                >
                    <Image
                        source={require("@/assets/images/bird.png")}
                        className="w-36 h-36 "
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
