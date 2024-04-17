import {
    Alert,
    Button,
    Image,
    ImageBackground,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
} from "react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import { Text, View } from "@/components/Themed";
import { useAuth } from "@/context/AuthProvider";
import { AntDesign } from "@expo/vector-icons";

export default function BirdHomeScreen() {
    const { user, signOut } = useAuth(); // Get user from the AuthProvider
    const [cloudText, setCloudText] = useState<string>("Birds");
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // Function to handle press on feature pressables

    const handlePressIn = (text: string, index: number) => {
        setCloudText(text);
        setActiveIndex(index);
    };

    const handlePressOut = () => {
        setCloudText("");
        setActiveIndex(null);
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
                    <Text className="pt-10 pb-12 text-center px-7">
                        {cloudText}
                    </Text>
                </ImageBackground>
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
                <View className="flex justify-start w-48 h-8 bg-green-300 rounded-md">
                    <View className="w-4 h-8 bg-green-600 rounded-md"></View>
                </View>
            </View>
            <View className="absolute z-50 bg-transparent right-4 top-1/2 ">
                <AntDesign name="caretright" size={60} color="#59E659" />
            </View>

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
