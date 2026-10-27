import { FlatList, View, useWindowDimensions } from "react-native";
import { EXTENSIONS } from "../domain/catalog";
import { BoosterPack } from "./BoosterPack";
export function BoosterCarousel({
  selected,
  onSelect,
  reduced,
}: {
  selected: number;
  onSelect: (n: number) => void;
  reduced: boolean;
}) {
  const { width } = useWindowDimensions();
  const step = 272;
  return (
    <FlatList
      horizontal
      data={EXTENSIONS}
      keyExtractor={(e) => e.id}
      showsHorizontalScrollIndicator={false}
      snapToInterval={step}
      decelerationRate="fast"
      contentContainerStyle={{
        paddingHorizontal: Math.max(0, (width - step) / 2),
      }}
      onMomentumScrollEnd={(e) =>
        onSelect(
          Math.max(
            0,
            Math.min(3, Math.round(e.nativeEvent.contentOffset.x / step)),
          ),
        )
      }
      renderItem={({ item, index }) => (
        <View
          style={{
            width: step,
            alignItems: "center",
            paddingVertical: 24,
            transform: [{ scale: index === selected ? 1 : 0.88 }],
            opacity: index === selected ? 1 : 0.6,
          }}
        >
          <BoosterPack
            extension={item}
            active={index === selected}
            reduced={reduced}
          />
        </View>
      )}
    />
  );
}
