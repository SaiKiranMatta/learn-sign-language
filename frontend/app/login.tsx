import { Button, Pressable, StyleSheet, TextInput } from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import { Text, View } from "@/components/Themed";
import { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import { useAuth } from "@/context/AuthProvider";
import * as ScreenOrientation from "expo-screen-orientation";
ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

export default function LoginScreen() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const { user, signIn, signOut } = useAuth();

    useEffect(() => {
        if (user) {
            router.replace("/");
        }
    }, [user]);

    const handleLogin = () => {
        try {
            signIn(email, password); // Call signIn function from useAuth hook
        } catch (error) {
            alert(error);
        }
    };
    return (
        <View className="items-center justify-center flex-1 bg-[#FDD58D] ">
            <Text className="mb-4 text-2xl">Login</Text>
            <TextInput
                className="w-4/5 p-4 mb-4 bg-white border rounded-md"
                placeholder="Email"
                keyboardType="email-address"
                onChangeText={(text) => setEmail(text)}
            />
            <TextInput
                className="w-4/5 p-4 mb-4 bg-white border rounded-md"
                placeholder="Password"
                secureTextEntry
                onChangeText={(text) => setPassword(text)}
            />
            <Pressable
                onPress={handleLogin}
                className="w-2/5 px-4 py-2 bg-[#DBB780] shadow-lg border-[0.7px] rounded-md "
            >
                <Text className="text-2xl text-center text-white">Login</Text>
            </Pressable>
            <Text className="mt-4 text-lg">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-500">
                    Register
                </Link>
            </Text>
        </View>
    );
}
