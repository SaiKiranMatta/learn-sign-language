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

export default function BirdHomeScreen() {
    const { user, signOut } = useAuth(); // Get user from the AuthProvider
    const [cloudText, setCloudText] = useState<string>("Birds");
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [progressWidth, setProgressWidth] = useState<number>(6);
    const [birdLevel, setBirdLevel] = useState<string | null>();
    // Function to handle press on feature pressables

    const handlePressIn = (text: string, index: number) => {
        setCloudText(text);
        setActiveIndex(index);
    };

    const handlePressOut = () => {
        setCloudText("");
        setActiveIndex(null);
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
                                    birds: 1,
                                    animals: 1,
                                    bodyparts: 1,
                                    everyDayObjects: 1,
                                    shapes: 1,
                                    sports: 1,
                                }
                            );

                            console.log("Document written  ");
                        } catch (e) {
                            console.error("Error adding document: ", e);
                        }
                    } else {
                        // console.log("Document data:", docSnap.data());
                        setBirdLevel(docSnap.data().birds);
                        // console.log(birdLevel);
                    }
                }
            }
        };

        addUserDocument();
    }, [user, birdLevel, setBirdLevel]);

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
                <View className="flex justify-start w-48 h-8 bg-green-300 rounded-md">
                    <View
                        className={`w-${progressWidth} h-8 bg-green-600 rounded-md`}
                    ></View>
                </View>
            </View>
            <Pressable
                onPress={() => router.replace("/birds/find")}
                className="absolute z-50 bg-transparent right-4 top-1/2 "
            >
                <AntDesign name="caretright" size={60} color="#59E659" />
            </Pressable>

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
