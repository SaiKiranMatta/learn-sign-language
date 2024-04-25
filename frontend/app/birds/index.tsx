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
import { AntDesign, Entypo, FontAwesome6 } from "@expo/vector-icons";
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
    const [isModalOpen, setIsModalOpen] = useState(false);
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
                    router.replace("/birds/level1");
                    break;
                case 2:
                    router.replace("/birds/level2");
                    break;
                case 3:
                    router.replace("/birds/level3");
                    break;
                case 4:
                    router.replace("/birds/level4");
                    break;
                case 5:
                    router.replace("/birds/level5");
                    break;
                case 6:
                    router.replace("/birds/level6");
                    break;
                case 7:
                    router.replace("/birds/level7");
                    break;
                case 8:
                    router.replace("/birds/level8");
                    break;
                case 9:
                    router.replace("/birds/level9");
                    break;
                case 10:
                    router.replace("/birds/level10");
                    break;
                case 11:
                    router.replace("/birds/level11");
                    break;
                case 12:
                    router.replace("/birds/level12");
                default:
                    router.replace("/birds/level1");
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
            <FontAwesome6
                className="absolute left-0 z-50 top-4"
                name="person-circle-check"
                size={24}
                color="black"
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
                <View className="absolute z-40 flex flex-row items-center bg-transparent top-10 left-6">
                    <TouchableOpacity
                        onPress={() => {
                            signOut();
                        }}
                        className="w-24 px-4 py-2 bg-orange-400 shadow-lg rounded-3xl"
                    >
                        <Text className="text-lg text-center text-white">
                            Logout
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="ml-2"
                        onPress={() => {
                            setIsModalOpen(true);
                        }}
                    >
                        <Entypo
                            name="graduation-cap"
                            size={36}
                            color="#16A34A"
                        />
                    </TouchableOpacity>
                </View>
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
            {isModalOpen && (
                <View className=" absolute flex flex-row items-center justify-center w-full h-full bg-[#00000090] z-50">
                    <View className="flex flex-col items-center justify-center w-4/6 bg-green-200 border border-green-800 h-4/6 rounded-3xl">
                        <TouchableOpacity
                            className="absolute z-10 rounded-full bg-transperant top-2 right-2 "
                            onPress={() => setIsModalOpen(false)}
                        >
                            <Entypo
                                name="circle-with-cross"
                                size={40}
                                color="red"
                            />
                        </TouchableOpacity>
                        <Text className="text-2xl font-semibold ">Birds</Text>
                        <View className="w-[90%] h-16 mx-3 mt-4 flex flex-row items-center justify-evenly bg-green-300 border-[0.5px] rounded-3xl ">
                            <Image
                                source={require("@/assets/images/mag-glass.jpg")}
                                className="w-12 h-12 rounded-full"
                            />
                            <Text className="text-2xl font-semibold ">
                                Images
                            </Text>
                            <Text className="text-2xl font-semibold ">
                                {userData.birds.fC}/3
                            </Text>
                        </View>
                        <View className="w-[90%] h-16 mx-3 mt-4 flex flex-row items-center justify-evenly bg-green-300 border-[0.5px] rounded-3xl ">
                            <Image
                                source={require("@/assets/images/signHands.png")}
                                className="w-12 h-12 rounded-full"
                            />
                            <Text className="text-2xl font-semibold ">ASL</Text>
                            <Text className="text-2xl font-semibold ">
                                {userData.birds.sC}/6
                            </Text>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
