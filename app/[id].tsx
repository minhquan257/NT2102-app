import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

const Page = () => {
  const { id } = useLocalSearchParams();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack.Screen options={{ title: `Page ${id}` }} />
      <Text>You are on page {id}</Text>
    </View>
  );
};

export default Page;
