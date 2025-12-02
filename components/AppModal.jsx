import { Modal, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { useRef, useEffect } from "react";
import { AppIcon } from "./AppIcon";
import useTheme from "../hooks/useTheme";

export function AppModal({ visible, onClose, children }) {
	const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

	const styles = StyleSheet.create({
		animatedView: {
			flex: 1,
			backgroundColor: "rgba(0, 0, 0, 0.5)",
			justifyContent: "center",
			alignItems: "center",
			opacity: fadeAnim,
		},
		modalBg: {
			position: "absolute",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
		},
		modalCard: {
			backgroundColor: "white",
			borderRadius: colors.cardRadius,
			padding: colors.appPadding,
			minWidth: 400,
			maxWidth: "90%",
			transform: [{ scale: scaleAnim }],
			shadowColor: "#000",
			shadowOffset: {
				width: 0,
				height: 2,
			},
			shadowOpacity: 0.25,
			shadowRadius: 3.84,
			elevation: 5,
		},
	});

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={styles.animatedView}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={styles.modalBg}
        />
        <Animated.View
          onStartShouldSetResponder={() => true}
					style={styles.modalCard}
        >
					<TouchableOpacity onPress={onClose}>
						<AppIcon icon="arrow-back" />
					</TouchableOpacity>
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}