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
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "@/components/Themed";
import { db, useAuth } from "@/context/AuthProvider";
import * as ScreenOrientation from "expo-screen-orientation";
import { FontAwesome6 } from "@expo/vector-icons";
import ParentModal from "@/components/ParentModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FirstModal from "@/components/FirstModal";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
import { LogBox } from "react-native";

// Ignore log notification by message
LogBox.ignoreLogs(["Warning: ..."]);

//Ignore all log notifications
LogBox.ignoreAllLogs();

export default function LandingScreen() {
    const { user, signOut } = useAuth(); // Get user from the AuthProvider
    const [cloudText, setCloudText] = useState<string>("");
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isParentModal, setIsParentModal] = useState<boolean>(false);
    // Function to handle press on feature pressables
    const [firstLogin, setFirstLogin] = useState<boolean | null>(null);
    // const [firstModal, setFirstModal] = useState<boolean>(false);
    // const isFirstRun = useRef(true);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const addUserDocument = async () => {
            if (!user) {
                router.replace("/");
            } else {
                if (!userData) {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (!docSnap.exists()) {
                        setFirstLogin(true);
                        try {
                            const usersRef = collection(db, "users");
                            const docRef = await setDoc(
                                doc(usersRef, user.uid),
                                {
                                    birds: {
                                        cl: 1,
                                        cLArray: Array(12).fill(0),
                                        fC: 0,
                                        sC: 0,
                                    },
                                    animals: {
                                        cl: 1,
                                        cLArray: Array(12).fill(0),
                                        fC: 0,
                                        sC: 0,
                                    },
                                    bodyparts: {
                                        cl: 1,
                                        cLArray: Array(12).fill(0),
                                        fC: 0,
                                        sC: 0,
                                    },
                                    everyDayObjects: {
                                        cl: 1,
                                        cLArray: Array(12).fill(0),
                                        fC: 0,
                                        sC: 0,
                                    },
                                    shapes: {
                                        cl: 1,
                                        cLArray: Array(12).fill(0),
                                        fC: 0,
                                        sC: 0,
                                    },
                                    sports: {
                                        cl: 1,
                                        cLArray: Array(12).fill(0),
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
    }, []);

    const handlePressIn = (text: string, index: number) => {
        if (user) {
            // router.push(location);
            setCloudText(text);
            setActiveIndex(index);
        } else {
            setCloudText("Please Login");
            setTimeout(() => {
                setCloudText("");
            }, 2000);
        }
    };

    const closeModal = () => {
        setIsParentModal(false);
    };

    const closeFirstModal = () => {
        setFirstLogin(false);
    };
    const handlePressOut = () => {
        setCloudText("");
        setActiveIndex(null);
    };

    const handlePress = (location: any) => {
        if (user) {
            router.push(location);
        } else {
            setCloudText("Please Login");
            setTimeout(() => {
                setCloudText("");
            }, 2000);
        }
    };

    return (
        <SafeAreaView className=" bg-[#FDD58D] pt-6 h-full ">
            <Image
                source={require("@/assets/images/old-woman.png")}
                className="absolute bottom-0 left-0 z-50 w-36 h-36"
            />
            {user && (
                <TouchableOpacity
                    onPress={() => setIsParentModal(true)}
                    className="absolute z-50 bg-transparent left-4 top-8"
                >
                    <FontAwesome6
                        style={styles.shadow}
                        name="person-circle-check"
                        size={40}
                        color="#FB923C"
                    />
                </TouchableOpacity>
            )}
            {!user ? (
                <TouchableOpacity
                    style={styles.shadow}
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
                    style={styles.shadow}
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
            <ScrollView horizontal={true} className="relative flex flex-1 ">
                <View className="flex flex-row w-full h-full bg-[#FDD58D]">
                    <Image
                        source={require("@/assets/images/transperant.png")}
                        className="bottom-0 left-0 h-1 w-96"
                    />
                    <Image
                        source={require("@/assets/images/transperant.png")}
                        className="bottom-0 left-0 h-1 w-96"
                    />
                    <Image
                        source={require("@/assets/images/transperant.png")}
                        className="bottom-0 left-0 w-48 h-1"
                    />

                    <Pressable
                        className="absolute left-56 top-28"
                        onPress={() => handlePress("/birds")}
                        onPressIn={() => handlePressIn("Birds", 1)}
                        onPressOut={() => handlePressOut()}
                    >
                        <View
                            style={styles.shadow}
                            className={`rounded-full p-4 bg-[#c8fdff] overflow-hidden ${
                                activeIndex === 1 ? "scale-105" : ""
                            }`}
                        >
                            <Image
                                source={require("@/assets/images/Birds/swan.jpeg")}
                                className="rounded-full w-36 h-36 "
                            />
                        </View>
                    </Pressable>
                    <Pressable
                        className="absolute top-0 left-28 "
                        onPress={() => handlePress("/bodyparts")}
                        onPressIn={() => handlePressIn("Body parts", 2)}
                        onPressOut={() => handlePressOut()}
                    >
                        <View
                            style={styles.shadow}
                            className={`rounded-full p-2 bg-pink-200 ${
                                activeIndex === 2 ? "scale-105" : ""
                            }`}
                        >
                            <Image
                                source={require("@/assets/images/bodyparts/body-parts-main.jpg")}
                                className="rounded-full w-28 h-28"
                            />
                        </View>
                    </Pressable>

                    <Pressable
                        className="absolute right-48 top-36 "
                        onPress={() => handlePress("/animals")}
                        onPressIn={() => handlePressIn("Animals", 4)}
                        onPressOut={() => handlePressOut()}
                    >
                        <View
                            style={styles.shadow}
                            className={`rounded-full p-2 bg-[#c8fdff] ${
                                activeIndex === 4 ? "scale-105" : ""
                            }`}
                        >
                            <Image
                                source={require("@/assets/images/animals/animals-main.png")}
                                className="rounded-full w-44 h-44 "
                            />
                        </View>
                    </Pressable>
                    <Pressable
                        className="absolute right-96 top-8 "
                        onPress={() => handlePress("/sports")}
                        onPressIn={() => handlePressIn("Sports", 5)}
                        onPressOut={() => handlePressOut()}
                    >
                        <View
                            style={styles.shadow}
                            className={`rounded-full p-2 bg-[#deffc8] overflow-hidden ${
                                activeIndex === 5 ? "scale-105" : ""
                            }`}
                        >
                            <Image
                                source={require("@/assets/images/sports/sports-main.jpg")}
                                className="w-32 h-32 rounded-full"
                            />
                        </View>
                    </Pressable>
                    <Pressable
                        className="absolute right-16 top-[-40px]  "
                        onPress={() => handlePress("/shapes")}
                        onPressIn={() => handlePressIn("Shapes", 6)}
                        onPressOut={() => handlePressOut()}
                    >
                        <View
                            style={styles.shadow}
                            className={`rounded-full p-2 overflow-hidden  bg-amber-200 ${
                                activeIndex === 6 ? "scale-105" : ""
                            }`}
                        >
                            <Image
                                source={require("@/assets/images/shapes/findshapes.jpeg")}
                                className="w-40 h-40 rounded-full"
                            />
                        </View>
                    </Pressable>
                    <Pressable
                        className="absolute right-[-40px] bottom-16  "
                        onPress={() => handlePress("/everyDayObjects")}
                        onPressIn={() => handlePressIn("Every Day Objects", 3)}
                        onPressOut={() => handlePressOut()}
                    >
                        <View
                            style={styles.shadow}
                            className={`rounded-full p-2 overflow-hidden bg-red-200 ${
                                activeIndex === 3 ? "scale-105" : ""
                            }`}
                        >
                            <Image
                                source={require("@/assets/images/everyDayObjects/findeverydayobjects.jpg")}
                                className="w-32 h-32 rounded-full"
                            />
                        </View>
                    </Pressable>
                </View>
            </ScrollView>
            {isParentModal && <ParentModal onClose={closeModal} />}
            {firstLogin && <FirstModal onClose={closeFirstModal} />}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    shadow: {
        elevation: 10,
    },
});
