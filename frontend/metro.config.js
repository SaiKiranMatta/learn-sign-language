const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
    // Add this configuration to suppress console warnings
    compiler: {
        consoleWarning: {
            // Suppress all warnings
            default: "suppress",
        },
    },
    ...defaultConfig,
};
