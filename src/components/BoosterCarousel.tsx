import { useRef, useEffect } from "react";
import { FlatList, Pressable, View, useWindowDimensions } from "react-native";
import { theme } from "./theme";
import { EXTENSIONS, type Extension } from "../domain/catalog";
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
  const list = useRef<FlatList<Extension>>(null);
  useEffect(() => {
    list.current?.scrollToOffset({ offset: selected * step, animated: !reduced });
  }, [selected, reduced]);
  return (
    <View>
    <FlatList
      ref={list}
      horizontal
      data={EXTENSIONS}
      extraData={selected}
      initialNumToRender={3}
      windowSize={3}
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
    <View style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}>
      {EXTENSIONS.map((extension, index) => (
        <Pressable key={extension.id} accessibilityRole="button" accessibilityLabel={`Choisir ${extension.name}`} accessibilityState={{ selected: selected === index }} onPress={() => onSelect(index)} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: selected === index ? 24 : 6, height: 6, borderRadius: 3, backgroundColor: selected === index ? theme.gold : "#8d877966" }} />
        </Pressable>
      ))}
    </View>
    </View>
  );
}
