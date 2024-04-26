import React, { useEffect, useState } from "react";
import { Text, View } from "./Themed";
import { Image, TouchableOpacity } from "react-native";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { db, useAuth } from "@/context/AuthProvider";
import { router } from "expo-router";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";

const FirstModal = ({ onClose }: any) => {
    const { user } = useAuth();
    const [userData, setUserData] = useState<any>(null);
    const [curSelected, setCurSelected] = useState<string>("birds");
    const [view, setView] = useState<any>(1);

    useEffect(() => {
        const addUserDocument = async () => {
            if (!user) {
                router.replace("/");
            } else {
                if (!userData) {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (!docSnap.exists()) {
                        try {
                            const usersRef = collection(db, "users");
                            await setDoc(doc(usersRef, user.uid), {
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
                            });

                            console.log("Document written");
                        } catch (e) {
                            console.error("Error adding document: ", e);
                        }
                    } else {
                        setUserData(docSnap.data());
                    }
                }
            }
        };

        addUserDocument();
    }, [user]);

    const handleChapterChange = (chapter: string) => {
        setCurSelected(chapter);
    };

    const setNextView = () => {
        setView((prevView: number) => (prevView % 9) + 1);
    };

    const setPrevView = () => {
        setView((prevView: number) => (prevView === 1 ? 9 : prevView - 1));
    };

    return (
        <View className="absolute flex flex-row items-center justify-center w-full h-full bg-[#00000090] z-50">
            <View className="flex flex-row justify-evenly w-[90%] px-8 bg-green-200 h-[90%] rounded-3xl">
                <TouchableOpacity
                    className="absolute z-10 bg-transparent rounded-full top-2 right-2"
                    onPress={onClose}
                >
                    <Entypo name="circle-with-cross" size={40} color="red" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={setPrevView}
                    className="absolute z-10 bg-transparent rounded-full top-1/2 left-2"
                >
                    <AntDesign name="caretleft" size={30} color="#FB923C" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={setNextView}
                    className="absolute z-10 bg-transparent rounded-full top-1/2 right-2"
                >
                    <AntDesign name="caretright" size={30} color="#FB923C" />
                </TouchableOpacity>
                {view === 1 && (
                    <View className="w-full bg-transparent over ">
                        <Image
                            source={require("@/assets/images/tutorial/chapters.png")}
                            className="z-50 h-64 mb-2 mt-4 mx-auto  w-[600px] rounded-3xl"
                        />
                        <Text className="text-xl text-center ">
                            Click on any chapter to open
                        </Text>
                    </View>
                )}
                {view === 2 && (
                    <View className="w-full bg-transparent over ">
                        <Image
                            source={require("@/assets/images/tutorial/chapterhome.png")}
                            className="z-50 h-64 mb-2 mt-4 mx-auto  w-[600px] rounded-3xl"
                        />
                        <Text className="text-xl text-center ">
                            Chapter Homepage showing progess
                        </Text>
                    </View>
                )}
                {view === 4 && (
                    <View className="w-full bg-transparent over ">
                        <Image
                            source={require("@/assets/images/tutorial/chapterLearn.png")}
                            className="z-50 h-64 mb-2 mt-4 mx-auto  w-[600px] rounded-3xl"
                        />
                        <Text className="text-xl text-center ">
                            Signs of the Alphabets
                        </Text>
                    </View>
                )}
                {view === 5 && (
                    <View className="w-full bg-transparent over ">
                        <Image
                            source={require("@/assets/images/tutorial/chapterDraw.png")}
                            className="z-50 h-64 mb-2 mt-4 mx-auto  w-[600px] rounded-3xl"
                        />
                        <Text className="text-xl text-center ">
                            Draw the alphabet of the shown sign
                        </Text>
                    </View>
                )}
                {view === 3 && (
                    <View className="w-full bg-transparent over ">
                        <Image
                            source={require("@/assets/images/tutorial/chapterScore.png")}
                            className="z-50 h-64 mb-2 mt-4 mx-auto  w-[600px] rounded-3xl"
                        />
                        <Text className="text-xl text-center ">
                            See the detailed scores
                        </Text>
                    </View>
                )}
                {view === 7 && (
                    <View className="w-full bg-transparent over ">
                        <Image
                            source={require("@/assets/images/tutorial/chapterDetect.png")}
                            className="z-50 h-64 mb-2 mt-4 mx-auto  w-[600px] rounded-3xl"
                        />
                        <Text className="text-xl text-center ">
                            Do the Signs of the missing alphabets
                        </Text>
                    </View>
                )}
                {view === 6 && (
                    <View className="w-full bg-transparent over ">
                        <Image
                            source={require("@/assets/images/tutorial/chapterFind.png")}
                            className="z-50 h-64 mb-2 mt-4 mx-auto  w-[600px] rounded-3xl"
                        />
                        <Text className="text-xl text-center ">
                            Find the object in the image
                        </Text>
                    </View>
                )}
                {view === 8 && (
                    <View className="w-full bg-transparent over ">
                        <Image
                            source={require("@/assets/images/tutorial/parentAdvice.png")}
                            className="z-50 h-64 mb-2 mt-4 mx-auto  w-[600px] rounded-3xl"
                        />
                        <Text className="text-xl text-center ">
                            Advice to Parents in to help their kids
                        </Text>
                    </View>
                )}
                {view === 9 && (
                    <View className="w-full bg-transparent over ">
                        <Image
                            source={require("@/assets/images/tutorial/parentScore.png")}
                            className="z-50 h-64 mb-2 mt-4 mx-auto  w-[600px] rounded-3xl"
                        />
                        <Text className="text-xl text-center ">
                            Parents can monitor the progress
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default FirstModal;
