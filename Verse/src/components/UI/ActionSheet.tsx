import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../styles/DesignSystem';

interface ActionSheetOption {
  title: string;
  icon: string;
  onPress: () => void;
  color?: string;
  destructive?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: ActionSheetOption[];
  isDark?: boolean;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  title,
  options,
  isDark = false,
}) => {
  const slideAnim = React.useRef(new Animated.Value(300)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleOptionPress = (option: ActionSheetOption) => {
    onClose();
    setTimeout(() => option.onPress(), 150);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View
              style={[
                styles.container,
                isDark && styles.containerDark,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              {title && (
                <View style={styles.header}>
                  <Text style={[styles.title, isDark && styles.titleDark]}>
                    {title}
                  </Text>
                </View>
              )}

              <View style={styles.optionsContainer}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.option,
                      isDark && styles.optionDark,
                      index === options.length - 1 && styles.lastOption,
                    ]}
                    onPress={() => handleOptionPress(option)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={24}
                      color={
                        option.destructive
                          ? Colors.error
                          : option.color || (isDark ? Colors.white : Colors.black)
                      }
                      style={styles.optionIcon}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        isDark && styles.optionTextDark,
                        option.destructive && styles.destructiveText,
                        ...(option.color ? [{ color: option.color }] : []),
                      ]}
                    >
                      {option.title}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={isDark ? Colors.gray300 : Colors.gray500}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelText, isDark && styles.cancelTextDark]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.xl,
    ...Shadows.lg,
  },
  containerDark: {
    backgroundColor: Colors.gray800,
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.black,
  },
  titleDark: {
    color: Colors.white,
  },
  optionsContainer: {
    paddingHorizontal: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  optionDark: {
    borderBottomColor: Colors.gray700,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionIcon: {
    marginRight: Spacing.md,
  },
  optionText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.black,
  },
  optionTextDark: {
    color: Colors.white,
  },
  destructiveText: {
    color: Colors.error,
  },
  cancelButton: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  cancelButtonDark: {
    backgroundColor: Colors.gray700,
  },
  cancelText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.black,
  },
  cancelTextDark: {
    color: Colors.white,
  },
});
