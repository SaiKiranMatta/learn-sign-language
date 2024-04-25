import React, { useEffect, useState } from "react";
import { Text, View } from "./Themed";
import { Image, TouchableOpacity } from "react-native";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { db, useAuth } from "@/context/AuthProvider";
import { router } from "expo-router";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";

const ParentModal = ({ onClose }: any) => {
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
        setView((prevView: number) => (prevView % 6) + 1);
    };

    const setPrevView = () => {
        setView((prevView: number) => (prevView === 1 ? 6 : prevView - 1));
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
                    <>
                        <View className="w-48 h-full border-l-[0.5px]  justify-evenly bg-lime-200 border-r-[0.5px] rounded-l-3xl flex flex-col items-center">
                            <TouchableOpacity
                                onPress={() => handleChapterChange("birds")}
                                className="border-b-[0.5px] w-full h-1/6 bg-orange-200"
                            >
                                <Text className="my-auto text-xl font-semibold text-center">
                                    Birds
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="border-b-[0.5px] w-full h-1/6 bg-yellow-200"
                                onPress={() => handleChapterChange("animals")}
                            >
                                <Text className="my-auto text-xl font-semibold text-center">
                                    Animals
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="border-b-[0.5px] h-1/6 w-full bg-red-200"
                                onPress={() => handleChapterChange("sports")}
                            >
                                <Text className="my-auto text-xl font-semibold text-center">
                                    Sports
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="border-b-[0.5px] h-1/6 w-full bg-cyan-200"
                                onPress={() => handleChapterChange("bodyparts")}
                            >
                                <Text className="my-auto text-xl font-semibold text-center">
                                    BodyParts
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="border-b-[0.5px] h-1/6 w-full bg-violet-200 "
                                onPress={() =>
                                    handleChapterChange("everyDayObjects")
                                }
                            >
                                <Text className="my-auto text-xl font-semibold text-center">
                                    EveryDayObjects
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="w-full bg-teal-200 h-1/6"
                                onPress={() => handleChapterChange("shapes")}
                            >
                                <Text className="my-auto text-xl font-semibold text-center">
                                    Shapes
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View className="flex flex-col items-center justify-center w-4/6 h-full bg-green-200 rounded-3xl">
                            <Text className="text-2xl font-semibold text-center">
                                {curSelected}
                            </Text>
                            {userData && (
                                <>
                                    <View className="w-[90%] h-16 mx-3 mt-4 flex flex-row items-center justify-evenly bg-green-300 border-[0.5px] rounded-3xl">
                                        <Image
                                            source={require("@/assets/images/mag-glass.jpg")}
                                            className="w-12 h-12 rounded-full"
                                        />
                                        <Text className="text-2xl font-semibold text-center">
                                            Images
                                        </Text>
                                        <Text className="text-2xl font-semibold text-center">
                                            {userData[curSelected].fC}/3
                                        </Text>
                                    </View>
                                    <View className="w-[90%] h-16 mx-3 mt-4 flex flex-row items-center justify-evenly bg-green-300 border-[0.5px] rounded-3xl">
                                        <Image
                                            source={require("@/assets/images/signHands.png")}
                                            className="w-12 h-12 rounded-full"
                                        />
                                        <Text className="text-2xl font-semibold text-center">
                                            ASL
                                        </Text>
                                        <Text className="text-2xl font-semibold text-center">
                                            {userData[curSelected].sC}/6
                                        </Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </>
                )}
                {view === 2 && (
                    <View className="flex flex-row items-center justify-between h-full bg-transparent">
                        <View className="flex flex-col justify-center w-2/3 h-full bg-transparent">
                            <Text className="text-2xl font-bold text-start">
                                Be Patient and Supportive:
                            </Text>
                            <Text className="mt-4 text-lg font-semibold text-start ">
                                Understand that learning and communication may
                                take more time for children with hearing or
                                speaking impairments. Be patient, supportive,
                                and encouraging as they navigate the challenges
                                they face.
                            </Text>
                        </View>
                        <View className="bg-transparent ">
                            <Image
                                source={require("@/assets/images/parent/supportive.jpeg")}
                                className=" w-44 h-48 rounded-[96px]"
                            />
                        </View>
                    </View>
                )}
                {view === 3 && (
                    <View className="flex flex-row items-center justify-between h-full bg-transparent">
                        <View className="flex flex-col justify-center w-2/3 h-full bg-transparent">
                            <Text className="text-2xl font-bold text-start">
                                Learn Sign Language:
                            </Text>
                            <Text className="mt-4 text-lg font-semibold text-start ">
                                If your child is deaf or hard of hearing,
                                learning sign language can greatly enhance
                                communication and bonding. Enroll in sign
                                language classes together as a family, or seek
                                out resources and tutorials online.
                            </Text>
                        </View>
                        <View className="bg-transparent ">
                            <Image
                                source={require("@/assets/images/parent/learn-asl.jpeg")}
                                className=" w-44 h-48 rounded-[96px]"
                            />
                        </View>
                    </View>
                )}
                {view === 4 && (
                    <View className="flex flex-row items-center justify-between h-full bg-transparent">
                        <View className="flex flex-col justify-center w-2/3 h-full bg-transparent">
                            <Text className="text-2xl font-bold text-start">
                                Encourage Communication:
                            </Text>
                            <Text className="mt-4 text-lg font-semibold text-start ">
                                Create an environment where your child feels
                                comfortable expressing themselves. Encourage
                                them to communicate in whatever way works best
                                for them, whether it's through sign language,
                                gestures, or writing.
                            </Text>
                        </View>
                        <View className="bg-transparent ">
                            <Image
                                source={require("@/assets/images/parent/encourage-coms.jpeg")}
                                className=" w-44 h-48 rounded-[96px]"
                            />
                        </View>
                    </View>
                )}
                {view === 5 && (
                    <View className="flex flex-row items-center justify-between h-full bg-transparent">
                        <View className="flex flex-col justify-center w-2/3 h-full bg-transparent">
                            <Text className="text-2xl font-bold text-start">
                                Provide Visual Aids:
                            </Text>
                            <Text className="mt-4 text-lg font-semibold text-start ">
                                Use visual aids such as pictures, diagrams, and
                                videos to help convey information and concepts.
                                Visual representations can supplement verbal
                                communication and make learning more accessible.
                            </Text>
                        </View>
                        <View className="bg-transparent ">
                            <Image
                                source={require("@/assets/images/parent/visual-aid.jpeg")}
                                className=" w-44 h-48 rounded-[96px]"
                            />
                        </View>
                    </View>
                )}
                {view === 6 && (
                    <View className="flex flex-row items-center justify-between h-full bg-transparent">
                        <View className="flex flex-col justify-center w-2/3 h-full bg-transparent">
                            <Text className="text-2xl font-bold text-start">
                                Utilize Assistive Devices:
                            </Text>
                            <Text className="mt-4 text-lg font-semibold text-start ">
                                Explore the use of assistive devices such as
                                hearing aids, cochlear implants, or
                                communication apps. Work with healthcare
                                professionals to determine the most suitable
                                options for your child's needs.
                            </Text>
                        </View>
                        <View className="bg-transparent ">
                            <Image
                                source={require("@/assets/images/parent/assistive.jpeg")}
                                className=" w-44 h-48 rounded-[96px]"
                            />
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

export default ParentModal;
