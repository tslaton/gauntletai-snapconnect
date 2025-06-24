import { Button, Text, View } from "react-native";
import { useStore } from "../stores/demo";

function BearCounter() {
  const bears = useStore((state) => state.bears);
  return <Text className="text-lg mb-2">{bears} bears around here...</Text>;
}

function Controls() {
  const increasePopulation = useStore((state) => state.increasePopulation);
  return <Button onPress={increasePopulation} title="one up" />;
}

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-red-500 mb-4">
        Zustand + Nativewind
      </Text>
      <BearCounter />
      <Controls />
    </View>
  );
}
