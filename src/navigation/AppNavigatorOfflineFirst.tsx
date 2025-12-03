import React, { useRef } from 'react';
import { StatusBar, Dimensions, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings, accentColors } from '../contexts/SettingsContext';
import { Colors } from '../styles/DesignSystem';
import { AppProvider } from '../contexts/AppContext';
import { NavigationHelper } from '../utils/NavigationHelper';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Importações das telas principais (offline-first)
import HomeScreenMasterpiece from '../screens/HomeScreenMasterpiece';
import CreatePoemMasterpiece from '../screens/CreatePoemMasterpiece';
import MusaChatDualModeFixed from '../screens/MusaChatDualModeFixed';
import ProfileScreenEnhanced from '../screens/ProfileScreenEnhanced';
import MyObrasScreen from '../screens/MyObrasScreen';
import SettingsScreenUltimate from '../screens/SettingsScreenUltimate';
import NotificationsScreenEnhanced from '../screens/NotificationsScreenEnhanced';
import EnhancedAchievementsScreen from '../screens/EnhancedAchievementsScreen';
import AboutScreen from '../screens/AboutScreen';
import EditDraftScreen from '../screens/EditDraftScreen';
import ViewDraftScreen from '../screens/ViewDraftScreen';
import ManageCategoriesScreen from '../screens/ManageCategoriesScreen';
import TemplatesManagementScreen from '../screens/TemplatesManagementScreen';
import WriterDashboardScreen from '../screens/WriterDashboardScreen';
import PoetryEducationScreen from '../screens/PoetryEducationScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Screens para navegação offline-first
const HomeStackScreen: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeList" component={HomeScreenMasterpiece} />
    <Stack.Screen name="ViewDraft" component={ViewDraftScreen} />
    <Stack.Screen name="EditDraft" component={EditDraftScreen} />
    <Stack.Screen name="ManageCategories" component={ManageCategoriesScreen} />
  </Stack.Navigator>
);

const CreateStackScreen: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CreatePoem" component={CreatePoemMasterpiece} />
    <Stack.Screen name="ManageCategories" component={ManageCategoriesScreen} />
  </Stack.Navigator>
);

const MusaStackScreen: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MusaChat" component={MusaChatDualModeFixed} />
  </Stack.Navigator>
);

const ObrasStackScreen: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MyObras" component={MyObrasScreen} />
    <Stack.Screen name="ViewDraft" component={ViewDraftScreen} />
    <Stack.Screen name="EditDraft" component={EditDraftScreen} />
    <Stack.Screen name="ManageCategories" component={ManageCategoriesScreen} />
  </Stack.Navigator>
);

const AchievementsStackScreen: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Achievements" component={EnhancedAchievementsScreen} />
  </Stack.Navigator>
);

const ProfileStackScreen: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreenEnhanced} />
    <Stack.Screen name="Templates" component={TemplatesManagementScreen} />
    <Stack.Screen name="Settings" component={SettingsScreenUltimate} />
    <Stack.Screen name="Notifications" component={NotificationsScreenEnhanced} />
    <Stack.Screen name="Achievements" component={EnhancedAchievementsScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
    <Stack.Screen name="WriterDashboard" component={WriterDashboardScreen} />
    <Stack.Screen name="PoetryEducation" component={PoetryEducationScreen} />
    <Stack.Screen name="ManageCategories" component={ManageCategoriesScreen} />
  </Stack.Navigator>
);

const AppNavigatorOfflineFirst: React.FC = () => {
  const { settings, activeTheme, loading } = useSettings();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const insets = useSafeAreaInsets();

  const onNavigationReady = () => {
    if (navigationRef.current) {
      NavigationHelper.setNavigationRef(navigationRef.current);
      console.log('✅ NavigationHelper configurado no AppNavigatorOfflineFirst');
    }
  };

  if (loading) {
    return null;
  }

  const isDark = activeTheme === 'dark';
  const accent = accentColors[settings.accentColor] || Colors.primary;

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: accent,
      background: isDark ? Colors.backgroundDark : Colors.background,
      card: isDark ? Colors.surfaceDark : Colors.surface,
      text: isDark ? Colors.textPrimaryDark : Colors.textPrimary,
      border: isDark ? Colors.borderDark : Colors.border,
    },
  };

  // Responsividade baseada no tamanho da tela
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
  const isLargeScreen = screenWidth >= 414;
  const isTablet = screenWidth >= 768;

  // Configurações responsivas do tab bar
  const getTabBarConfig = () => {
    if (isTablet) {
      return {
        height: 85,
        iconSize: 26,
        fontSize: 11,
        paddingTop: 10,
        paddingBottom: Math.max(12, insets.bottom),
      };
    } else if (isLargeScreen) {
      return {
        height: 80,
        iconSize: 24,
        fontSize: 10,
        paddingTop: 8,
        paddingBottom: Math.max(10, insets.bottom),
      };
    } else if (isMediumScreen) {
      return {
        height: 75,
        iconSize: 22,
        fontSize: 9,
        paddingTop: 6,
        paddingBottom: Math.max(8, insets.bottom),
      };
    } else {
      return {
        height: 70,
        iconSize: 20,
        fontSize: 8,
        paddingTop: 4,
        paddingBottom: Math.max(6, insets.bottom),
      };
    }
  };

  const tabBarConfig = getTabBarConfig();

  return (
    <AppProvider>
      <NavigationContainer 
        ref={navigationRef}
        theme={navigationTheme}
        onReady={onNavigationReady}
      >
        <StatusBar 
          barStyle={isDark ? 'light-content' : 'dark-content'} 
          backgroundColor={navigationTheme.colors.background} 
        />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;
              
              switch (route.name) {
                case 'HomeTab':
                  iconName = focused ? 'home' : 'home-outline';
                  break;
                case 'CreateTab':
                  iconName = focused ? 'add-circle' : 'add-circle-outline';
                  break;
                case 'MusaTab':
                  iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
                  break;
                case 'ObrasTab':
                  iconName = focused ? 'library' : 'library-outline';
                  break;
                case 'AchievementsTab':
                  iconName = focused ? 'trophy' : 'trophy-outline';
                  break;
                case 'ProfileTab':
                  iconName = focused ? 'person' : 'person-outline';
                  break;
                default:
                  iconName = 'help-circle-outline';
              }
              
              return (
                <Ionicons 
                  name={iconName} 
                  size={tabBarConfig.iconSize} 
                  color={color} 
                  style={{
                    textAlign: 'center',
                    includeFontPadding: false,
                  }}
                />
              );
            },
            tabBarActiveTintColor: accent || Colors.primary,
            tabBarInactiveTintColor: isDark ? Colors.gray300 : Colors.gray800, // Cores mais contrastantes
            tabBarStyle: {
              backgroundColor: navigationTheme.colors.card,
              borderTopColor: navigationTheme.colors.border,
              borderTopWidth: isSmallScreen ? 0.5 : 1,
              paddingBottom: tabBarConfig.paddingBottom,
              paddingTop: tabBarConfig.paddingTop,
              height: tabBarConfig.height,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              elevation: isTablet ? 12 : 8,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: isTablet ? -4 : -3,
              },
              shadowOpacity: isDark ? 0.25 : 0.15,
              shadowRadius: isTablet ? 6 : 4,
              borderTopLeftRadius: isTablet ? 20 : 0,
              borderTopRightRadius: isTablet ? 20 : 0,
            },
            tabBarLabelStyle: {
              fontSize: tabBarConfig.fontSize,
              fontWeight: '600',
              marginTop: isSmallScreen ? 2 : 4,
              marginBottom: isSmallScreen ? 1 : 2,
              includeFontPadding: false,
            },
            tabBarIconStyle: {
              marginTop: 2,
              marginBottom: 0,
            },
          })}
        >
          <Tab.Screen 
            name="HomeTab" 
            component={HomeStackScreen} 
            options={{ title: 'Início' }} 
          />
          <Tab.Screen 
            name="CreateTab" 
            component={CreateStackScreen} 
            options={{ title: 'Criar' }} 
          />
          {settings.showMusa && (
            <Tab.Screen 
              name="MusaTab" 
              component={MusaStackScreen} 
              options={{ title: 'Musa' }} 
            />
          )}
          <Tab.Screen 
            name="ObrasTab" 
            component={ObrasStackScreen} 
            options={{ title: 'Obras' }} 
          />
          <Tab.Screen 
            name="ProfileTab" 
            component={ProfileStackScreen} 
            options={{ title: 'Perfil' }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
};

export default AppNavigatorOfflineFirst;
