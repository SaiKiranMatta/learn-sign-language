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
import React, { useState, useRef } from "react";
import { Text, View } from "@/components/Themed";
import { useAuth } from "@/context/AuthProvider";
import { AntDesign } from "@expo/vector-icons";
import { Svg, Path } from "react-native-svg";
import { Entypo } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import ViewShot from "react-native-view-shot";

export default function BirdFindScreen() {
    const { user, signOut } = useAuth(); // Get user from the AuthProvider
    const [cloudText, setCloudText] = useState<string>("Draw the Letter!");
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [border, setBorder] = useState<string>("");
    const [progressWidth, setProgressWidth] = useState<string>("6");
    const [paths, setPaths] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const [isClearButtonClicked, setClearButtonClicked] =
        useState<boolean>(false);
    const viewShotRef = useRef<any>(null);
    const [doc, setDoc] = useState<any>(null);

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
    const handleObjectPress = () => {
        setProgressWidth("8");
        setBorder("border border-2 border-green-600");
        setCloudText("Good Job, Bird Found!");
    };

    const handleSubmitButtonClick = async () => {
        onTouchEnd();
        try {
            const svgData = `<svg width="192" height="288"><rect x="0" y="0" width="100%" height="100%" fill="white" />
            <path d="${paths.join("")}" stroke="${
                isClearButtonClicked ? "transparent" : "black"
            }" fill="transparent" stroke-width="10" strokeLinejoin="round" strokeLinecap="round" /></svg>`;

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
                console.log(data);
            } else {
                console.error("Error:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        }
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
                    <Text className="pt-10 pb-12 text-xl font-semibold text-center text-green-600 px-7">
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
            <View className="absolute z-50 bg-transparent right-4 top-1/2 ">
                <AntDesign name="caretright" size={60} color="#59E659" />
            </View>

            <View className="absolute flex flex-row pl-64 items-end bg-[#FDD58D] justify-start w-full h-full">
                <View
                    className={` ml-8 p-2 rounded-lg bg-[#DBB780] ${
                        activeIndex === 4 ? "scale-105" : ""
                    }`}
                >
                    <Image
                        source={require("@/assets/images/Birds/bird-on-tree.jpg")}
                        className="w-48 rounded-lg h-72"
                    />
                    <Pressable
                        onPress={handleObjectPress}
                        className={`absolute w-12 h-12 bg-transparent ${border} left-48 top-9`}
                    ></Pressable>
                </View>

                <View
                    className={` ml-8 p-2  rounded-lg  bg-[#DBB780] ${
                        activeIndex === 4 ? "scale-105" : ""
                    }`}
                >
                    <ViewShot
                        ref={viewShotRef}
                        options={{ format: "png", quality: 1 }}
                    >
                        <View
                            className="flex items-center justify-center w-48 rounded-lg bg-slate-100 h-72"
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            <Svg className="w-full h-full">
                                <Path
                                    d={paths.join("")}
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
                    </ViewShot>
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
