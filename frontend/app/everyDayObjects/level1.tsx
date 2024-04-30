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
import AlphaWordComponent from "@/components/AlphabetComponent";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ScreenOrientation from "expo-screen-orientation";
ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

export default function EveryDayObjectAlphaScreen() {
    const curLevel = 1;
    const alphaWord = "DAILY";
    const alphaWord2 = "OBJECT";
    const { user, signOut } = useAuth(); // Get user from the AuthProvider
    const [cloudText, setCloudText] = useState<string>("Learn these signs!");
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [border, setBorder] = useState<string>("");
    const [progressWidth, setProgressWidth] = useState<number>(0);
    const [everyDayObjectLevel, setEveryDayObjectLevel] = useState<
        number | null
    >();
    // Function to handle press on feature pressables
    const [userData, setUserData] = useState<any>(null);
    const [levelsFinishedToday, setLevelsFinishedToday] = useState(0);

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
                if (!everyDayObjectLevel) {
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
                                    animal: {
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
                                    sports: {
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
    }, [user, everyDayObjectLevel, setEveryDayObjectLevel]);

    useEffect(() => {
        if (userData) {
            setProgressWidth(
                userData.everyDayObjects.cLArray.reduce(
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
            if (userData.everyDayObjects.cLArray[curLevel - 1] === 0) {
                const newEveryDayObjectLevel = curLevel + 1;
                const newEveryDayObjectLevelArray = [
                    ...userData.everyDayObjects.cLArray,
                ];
                newEveryDayObjectLevelArray[curLevel - 1] = 1;
                const newUserData = {
                    ...userData,
                    everyDayObjects: {
                        ...userData.everyDayObjects,
                        cLArray: newEveryDayObjectLevelArray,
                        cL: newEveryDayObjectLevel,
                    },
                };

                const docRef = doc(db, "users", user.uid);
                await setDoc(docRef, newUserData);
                setUserData(newUserData);
                incrementLevelsFinished();
                router.replace("/everyDayObjects/level2");
            } else {
                const newEveryDayObjectLevel = curLevel + 1;
                const newUserData = {
                    ...userData,
                    everyDayObjects: {
                        ...userData.everyDayObjects,
                        cL: newEveryDayObjectLevel,
                    },
                };

                const docRef = doc(db, "users", user.uid);
                await setDoc(docRef, newUserData);
                setUserData(newUserData);
                router.replace("/everyDayObjects/level2");
            }
        } else {
            setCloudText("You have finished all levels for today");
            setTimeout(() => {
                router.replace("/everyDayObjects/");
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
                    onPress={() => router.replace("/everyDayObjects/")}
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
                <View
                    style={styles.shadow}
                    className="flex flex-row items-center p-2 ml-2 rounded-md"
                >
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

            <View className="absolute flex pl-48 pr-4 pt-10 items-center bg-[#FDD58D] justify-center w-full h-full">
                <AlphaWordComponent alphaWord={alphaWord} />
                <AlphaWordComponent alphaWord={alphaWord2} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    shadow: {
        elevation: 10,
    },
});
