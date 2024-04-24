import React from "react";
import { View, Image } from "react-native";
import { Text } from "./Themed";

export interface AlphabetImage {
    imgName: string;
    uri: any; // Change 'any' to the correct type if possible
}

export const ALPHABET_IMAGES: Record<string, AlphabetImage> = {
    A: {
        imgName: "A",
        uri: require("@/assets/images/alphabet/a.jpeg"),
    },
    B: {
        imgName: "B",
        uri: require("@/assets/images/alphabet/b.jpeg"),
    },
    C: {
        imgName: "C",
        uri: require("@/assets/images/alphabet/c.jpeg"),
    },
    D: {
        imgName: "D",
        uri: require("@/assets/images/alphabet/d.jpeg"),
    },
    E: {
        imgName: "E",
        uri: require("@/assets/images/alphabet/e.jpeg"),
    },
    F: {
        imgName: "F",
        uri: require("@/assets/images/alphabet/f.jpeg"),
    },
    G: {
        imgName: "G",
        uri: require("@/assets/images/alphabet/g.jpeg"),
    },
    H: {
        imgName: "H",
        uri: require("@/assets/images/alphabet/h.jpeg"),
    },
    I: {
        imgName: "I",
        uri: require("@/assets/images/alphabet/i.jpeg"),
    },
    J: {
        imgName: "J",
        uri: require("@/assets/images/alphabet/j.jpeg"),
    },
    K: {
        imgName: "K",
        uri: require("@/assets/images/alphabet/k.jpeg"),
    },
    L: {
        imgName: "L",
        uri: require("@/assets/images/alphabet/l.jpeg"),
    },
    M: {
        imgName: "M",
        uri: require("@/assets/images/alphabet/m.jpeg"),
    },
    N: {
        imgName: "N",
        uri: require("@/assets/images/alphabet/n.jpeg"),
    },
    O: {
        imgName: "O",
        uri: require("@/assets/images/alphabet/o.jpeg"),
    },
    P: {
        imgName: "P",
        uri: require("@/assets/images/alphabet/p.jpeg"),
    },
    Q: {
        imgName: "Q",
        uri: require("@/assets/images/alphabet/q.jpeg"),
    },
    R: {
        imgName: "R",
        uri: require("@/assets/images/alphabet/r.jpeg"),
    },
    S: {
        imgName: "S",
        uri: require("@/assets/images/alphabet/s.jpeg"),
    },
    T: {
        imgName: "T",
        uri: require("@/assets/images/alphabet/t.jpeg"),
    },
    U: {
        imgName: "U",
        uri: require("@/assets/images/alphabet/u.jpeg"),
    },
    V: {
        imgName: "V",
        uri: require("@/assets/images/alphabet/v.jpeg"),
    },
    W: {
        imgName: "W",
        uri: require("@/assets/images/alphabet/w.jpeg"),
    },
    X: {
        imgName: "X",
        uri: require("@/assets/images/alphabet/x.jpeg"),
    },
    Y: {
        imgName: "Y",
        uri: require("@/assets/images/alphabet/y.jpeg"),
    },
    Z: {
        imgName: "Z",
        uri: require("@/assets/images/alphabet/z.jpeg"),
    },
};

const AlphaWordComponent = ({ alphaWord }: any) => {
    return (
        <View className="flex flex-row">
            {alphaWord.split("").map((char: any, index: any) => (
                <View
                    key={index}
                    className="flex flex-col items-center bg-[#FDD58D] justify-between h-32 m-2"
                >
                    <Image
                        source={ALPHABET_IMAGES[char.toUpperCase()].uri}
                        className="w-16 h-16 rounded-lg"
                    />
                    <View className="flex flex-row items-center justify-center w-16 h-12 bg-green-300 rounded-lg border-[0.7px] border-green-900">
                        <Text
                            style={{ fontFamily: "HandleeRegular" }}
                            className="text-3xl font-bold text-center text-orange-400"
                        >
                            {char}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
};

export default AlphaWordComponent;
