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

export default function BirdFindScreen() {
    const curLevel = 3;
    const { user, signOut } = useAuth(); // Get user from the AuthProvider
    const [cloudText, setCloudText] = useState<string>(
        "Find the Bird on the Tree!"
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

    const handleObjectPress = () => {
        setIsComplete(true);
        setBorder("border border-2 border-green-600");
        setCloudText("Good Job, Bird Found!");
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
        const max_levels = process.env.EXPO_PUBLIC_MAX_LEVELS;
        if (max_levels && levelsFinishedToday < parseInt(max_levels) && user) {
            if (userData.birds.cLArray[curLevel - 1] === 0 && isComplete) {
                const newBirdLevel = curLevel + 1;
                const newBirdLevelArray = [...userData.birds.cLArray];
                newBirdLevelArray[curLevel - 1] = 1;
                const fC = userData.birds.fC + 1;
                const newUserData = {
                    ...userData,
                    birds: {
                        ...userData.birds,
                        cLArray: newBirdLevelArray,
                        cL: newBirdLevel,
                        fC: fC,
                    },
                };

                const docRef = doc(db, "users", user.uid);
                await setDoc(docRef, newUserData);
                setUserData(newUserData);
                incrementLevelsFinished();
                router.replace("/birds/level4");
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
                router.replace("/birds/level4");
            }
        } else {
            setCloudText("You have finished all levels for today");
            setTimeout(() => {
                router.replace("/birds/");
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
                    onPress={() => router.replace("/birds/level2")}
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

            <View className="absolute flex pl-48 items-center bg-[#FDD58D] justify-end w-full h-full">
                <View
                    className={`  p-2 rounded-lg bg-[#DBB780] ${
                        activeIndex === 4 ? "scale-105" : ""
                    }`}
                >
                    <Image
                        source={require("@/assets/images/Birds/bird-on-tree.jpg")}
                        className="h-56 rounded-lg w-96"
                    />
                    <Pressable
                        onPress={handleObjectPress}
                        className={`absolute w-12 h-12 bg-transparent ${border} left-48 top-2`}
                    ></Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}
