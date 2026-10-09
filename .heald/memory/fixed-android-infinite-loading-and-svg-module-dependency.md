---
type: decision
title: "Fixed Android Infinite Loading and SVG Module Dependency"
timestamp: 2026-10-09T05:11:16.471242063+00:00
---
Resolved infinite bundle loading on physical Android device: 1) Installed react-native-svg required by lucide-react-native; 2) Configured adb reverse for ports 8081 and 8080 over USB; 3) Made AppNavigator initial route resolution robust with default fallback to JoinScreen; 4) Updated mobile package.json android script to run adb reverse and use --localhost so Metro connects through USB without requiring devices to be on identical Wi-Fi subnets.
