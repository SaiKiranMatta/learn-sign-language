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
import { useAuth } from "@/context/AuthProvider";
import * as ScreenOrientation from "expo-screen-orientation";
ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

export default function LandingScreen() {
    const { user, signOut } = useAuth(); // Get user from the AuthProvider
    const [cloudText, setCloudText] = useState<string>("");
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // Function to handle press on feature pressables

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
                        className="bottom-0 left-0 w-32 h-1"
                    />

                    <Pressable
                        className="absolute left-52 top-32"
                        onPress={() => handlePress("/birds")}
                        onPressIn={() => handlePressIn("Birds", 1)}
                        onPressOut={() => handlePressOut()}
                    >
                        <View
                            className={`rounded-full p-8 bg-[#DBB780] ${
                                activeIndex === 1 ? "scale-105" : ""
                            }`}
                        >
                            <Image
                                source={require("@/assets/images/bird.png")}
                                className="w-24 h-24 "
                            />
                        </View>
                    </Pressable>
                    <Pressable
                        className="absolute top-0 left-28 "
                        // onPress={() => handlePress("/animals")}
                        onPressIn={() => handlePressIn("Birds", 2)}
                        onPressOut={() => handlePressOut()}
                    >
                        <View
                            className={`rounded-full p-8 bg-[#DBB780] ${
                                activeIndex === 2 ? "scale-105" : ""
                            }`}
                        >
                            <Image
                                source={require("@/assets/images/animals/animals-main.png")}
                                className="w-16 h-16 "
                            />
                        </View>
                    </Pressable>
                    <Pressable
                        className="absolute left-2 top-20 "
                        onPressIn={() => handlePressIn("Birds", 3)}
                        onPressOut={() => handlePressOut()}
                    >
                        <View
                            className={`rounded-full p-8 bg-[#DBB780] ${
                                activeIndex === 3 ? "scale-105" : ""
                            }`}
                        >
                            <Image
                                source={require("@/assets/images/bird.png")}
                                className="w-8 h-8 "
                            />
                        </View>
                    </Pressable>
                    <Pressable
                        className="absolute right-20 top-40 "
                        onPressIn={() => handlePressIn("Birds", 4)}
                        onPressOut={() => handlePressOut()}
                    >
                        <View
                            className={`rounded-full p-2 bg-[#DBB780] ${
                                activeIndex === 4 ? "scale-105" : ""
                            }`}
                        >
                            <Image
                                source={require("@/assets/images/animals/animals-main.png")}
                                className="rounded-full w-36 h-36 "
                            />
                        </View>
                    </Pressable>
                    <Pressable
                        className="absolute right-60 top-20 "
                        onPressIn={() => handlePressIn("Birds", 5)}
                        onPressOut={() => handlePressOut()}
                    >
                        <View
                            className={`rounded-full p-8 bg-[#DBB780] ${
                                activeIndex === 5 ? "scale-105" : ""
                            }`}
                        >
                            <Image
                                source={require("@/assets/images/bird.png")}
                                className="w-12 h-12 "
                            />
                        </View>
                    </Pressable>
                    <Pressable
                        className="absolute right-[-40px] top-[-40px]  "
                        onPressIn={() => handlePressIn("Birds", 6)}
                        onPressOut={() => handlePressOut()}
                    >
                        <View
                            className={`rounded-full p-8 bg-[#DBB780] ${
                                activeIndex === 6 ? "scale-105" : ""
                            }`}
                        >
                            <Image
                                source={require("@/assets/images/bird.png")}
                                className=" w-28 h-28"
                            />
                        </View>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
