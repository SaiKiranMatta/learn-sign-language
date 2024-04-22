import { Button, Pressable, StyleSheet, TextInput } from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

import { Text, View } from "@/components/Themed";
import { useState } from "react";
import { Link, router } from "expo-router";

export default function RegisterScreen() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleRegister = () => {
        createUserWithEmailAndPassword(getAuth(), email, password)
            .then((user) => {
                if (user) router.replace("/login");
            })
            .catch((err) => {
                alert(err?.message);
            });
    };
    return (
        <View className="flex-1 items-center justify-center bg-[#FDD58D]">
            <Text className="mb-4 text-2xl">Register</Text>
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
                onPress={handleRegister}
                className="w-2/5 px-4 py-2 bg-[#DBB780] border-[0.7px] rounded-md "
            >
                <Text className="text-2xl text-center text-white">
                    Register
                </Text>
            </Pressable>
            <Text className="mt-4 text-lg">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-500">
                    Login
                </Link>
            </Text>
        </View>
    );
}
