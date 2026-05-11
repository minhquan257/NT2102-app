import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tinyLogo: {
    width: 100,
    height: 100,
    alignSelf: "center",
  },
  logo: {
    width: 66,
    height: 58,
  },
});

function CustomDrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        backgroundColor: "#fff",
      }}
    >
      <Image
        style={styles.tinyLogo}
        resizeMode="contain"
        source={require("@/assets/images/OIP.jpg")}
      />
      <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 10 }}></View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={CustomDrawerContent}
        screenOptions={{
          drawerStyle: {
            backgroundColor: "#ccc", // 👈 màu nền
          },
          drawerActiveBackgroundColor: "#aa18ea",
          drawerItemStyle: {
            borderRadius: 20,
          },
          drawerActiveTintColor: "#fff",
          drawerInactiveTintColor: "#333",
          drawerLabelStyle: {
            // marginLeft: -25,
            fontFamily: "Roboto-Medium",
            fontSize: 15,
          },
          drawerHideStatusBarOnOpen: true,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{ drawerItemStyle: { display: "none" } }}
        />
        <Drawer.Screen
          name="scene1"
          options={{
            drawerLabel: "Disable passcode rate limit",
            title: "Disable passcode rate limit",
            drawerIcon: ({ color, size }) => (
              <Ionicons name={"lock-open"} size={size} color={color} />
            ),
            headerTitleStyle: {
              color: "#888", // 👈 xám đậm
              fontWeight: "600",
            },
          }}
        />
        <Drawer.Screen
          name="scene2"
          options={{
            drawerLabel: "Plaintext password in SharedPreferences",
            title: "Plaintext password in SharedPreferences",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="newspaper" size={size} color={color} />
            ),
            headerTitleStyle: {
              color: "#888", // 👈 xám đậm
              fontWeight: "600",
              fontFamily: "Roboto-Medium",
              fontSize: 15,
            },
          }}
        />
        <Drawer.Screen
          name="scene3"
          options={{
            drawerLabel: "PII logged in plain text",
            title:
              "Personal Identifiable Information (PII) logged in plain text",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="newspaper" size={size} color={color} />
            ),
            headerTitleStyle: {
              color: "#888",
              fontWeight: "600",
              fontSize: 13,
            },
          }}
        />
        <Drawer.Screen
          name="scene4"
          options={{
            drawerLabel: "World-readable exportable file",
            title: "World-readable exportable file",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="folder" size={size} color={color} />
            ),
            headerTitleStyle: {
              color: "#888",
              fontWeight: "600",
              fontSize: 13,
            },
          }}
        />
        <Drawer.Screen
          name="sqlInjection"
          options={{
            drawerLabel: "SQL Injection",
            title: "SQL Injection Demo",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="newspaper" size={size} color={color} />
            ),
            headerTitleStyle: {
              color: "#888",
              fontWeight: "600",
              fontSize: 13,
            },
          }}
        />
        <Drawer.Screen
          name="insecureCommunication"
          options={{
            drawerLabel: "Insecure Communication",
            title: "Insecure Communication Demo",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="lock-open" size={size} color={color} />
            ),
            headerTitleStyle: {
              color: "#888",
              fontWeight: "600",
              fontSize: 13,
            },
          }}
        />
        <Drawer.Screen
          name="flag-secure"
          options={{
            drawerLabel: "FLAG_SECURE Demo",
            title: "FLAG_SECURE Security Demo",
          }}
        />
        <Drawer.Screen
          name="[id]"
          options={{
            drawerItemStyle: {
              display: "none",
            },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
