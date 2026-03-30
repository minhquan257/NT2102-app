import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { usePathname, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tinyLogo: {
    width: 60,
    height: 60,
    alignSelf: "center",
  },
  logo: {
    width: 66,
    height: 58,
  },
});

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const menuItems = [
    {
      id: 42,
      title: "Item 42",
    },
    {
      id: 43,
      title: "Item 43",
    },
    {
      id: 44,
      title: "Item 44",
    },
  ];
  const router = useRouter();
  const pathName = usePathname();

  return (
    <DrawerContentScrollView {...props}>
      <Image
        style={styles.tinyLogo}
        source={require("@/assets/images/react-logo.png")}
      />
      <DrawerItemList {...props} />
      <View style={{ padding: 16, paddingTop: 40 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>Items</Text>
      </View>
      {menuItems.map((item) => {
        const isActive = pathName === `/${item.id}`;
        return (
          <DrawerItem
            focused={isActive}
            key={item.id}
            label={item.title}
            onPress={() => {
              router.push(`/${item.id}`);
            }}
          />
        );
      })}
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
          drawerActiveBackgroundColor: "#e6f7ff",
          drawerActiveTintColor: "blue",
          drawerHideStatusBarOnOpen: true,
        }}
      >
        <Drawer.Screen
          name="scene1" // This is the name of the page and must match the url from root
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
            drawerLabelStyle: {
              color: "#888", // 👈 xám đậm
              fontSize: 14,
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
            },
            drawerLabelStyle: {
              color: "#888", // 👈 xám đậm
              fontSize: 14,
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
            drawerLabelStyle: {
              color: "#888",
              fontSize: 14,
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
            drawerLabelStyle: {
              color: "#888",
              fontSize: 14,
            },
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
