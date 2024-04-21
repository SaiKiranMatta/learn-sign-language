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

export default function BirdFindScreen() {
    const { user, signOut } = useAuth(); // Get user from the AuthProvider
    const [cloudText, setCloudText] = useState<string>(
        "Find the Birds on the Tree!"
    );
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [border, setBorder] = useState<string>("");
    const [progressWidth, setProgressWidth] = useState<string>("12");
    // Function to handle press on feature pressables
    const handleObjectPress = () => {
        setProgressWidth("24");
        setBorder("border border-2 border-green-600");
        setCloudText("Good Job, Bird Found!");
    };
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
                    <Text className="pt-10 pb-12 text-xl text-center text-green-600 px-7">
                        {cloudText}
                    </Text>
                </ImageBackground>
            )}

            <View className="absolute z-50 flex flex-row items-center p-2 rounded-md top-10 left-4">
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
            <Pressable
                onPress={() => router.replace("/birds/draw")}
                className="absolute z-50 bg-transparent right-4 top-1/2 "
            >
                <AntDesign name="caretright" size={60} color="#59E659" />
            </Pressable>

            <View className="absolute flex pl-48 items-center bg-[#FDD58D] justify-end w-full h-full">
                <View
                    className={`  p-2 rounded-lg bg-[#DBB780] ${
                        activeIndex === 4 ? "scale-105" : ""
                    }`}
                >
                    <Image
                        source={require("@/assets/images/Birds/bird-on-tree.jpg")}
                        className="rounded-lg h-72 w-96"
                    />
                    <Pressable
                        onPress={handleObjectPress}
                        className={`absolute w-12 h-12 bg-transparent ${border} left-48 top-9`}
                    ></Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}
